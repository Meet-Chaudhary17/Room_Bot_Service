import { randomInt } from 'node:crypto';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';
import { StaffRepository } from '../repositories/staff.repository.js';
import { emailService } from './email.service.js';

const repository = new StaffRepository(prisma);

export const staffService = {
  async getDashboard(staffId) {
    const stats = await repository.dashboardStats(staffId);
    const { items: recentRequests } = await repository.assignedRequests(staffId, { limit: 5 });

    const formattedRecent = recentRequests.map(req => ({
      requestId: req.id,
      studentRoom: req.roomNumber,
      serviceCategory: req.category.categoryName,
      status: req.requestStatus === 'ASSIGNED' ? 'Assigned' : req.requestStatus === 'IN_PROGRESS' ? 'In Progress' : req.requestStatus,
      assignedDate: req.assignedAt ? req.assignedAt.toISOString().split('T')[0] : null
    }));

    return {
      ...stats,
      recentRequests: formattedRecent
    };
  },

  async listAssignedRequests(staffId, filters) {
    const { items, total } = await repository.assignedRequests(staffId, filters);

    const formatted = items.map(req => ({
      requestId: req.id,
      studentName: req.student.fullName,
      serviceType: req.category.categoryName,
      status: req.requestStatus === 'ASSIGNED' ? 'Assigned' : req.requestStatus === 'IN_PROGRESS' ? 'In Progress' : req.requestStatus,
      block: req.student.block.blockName,
      roomNumber: req.roomNumber,
      priority: req.priority
    }));

    return formatted;
  },

  async getRequestDetails(requestId, staffId) {
    const req = await repository.requestDetails(requestId, staffId);
    if (!req) {
      throw new AppError(404, 'REQUEST_NOT_FOUND', 'Service request not found or not assigned to you.');
    }

    return {
      requestId: req.id,
      studentName: req.student.fullName,
      email: req.student.email,
      block: req.student.block.blockName,
      roomNumber: req.roomNumber,
      serviceType: req.category.categoryName,
      problemTitle: req.title,
      description: req.description,
      priority: req.priority,
      status: req.requestStatus === 'ASSIGNED' ? 'Assigned' : req.requestStatus === 'IN_PROGRESS' ? 'In Progress' : req.requestStatus,
      createdAt: req.createdAt,
      assignedAt: req.assignedAt,
      startedAt: req.startedAt,
      completedAt: req.completedAt
    };
  },

  async startWork(requestId, staffId) {
    const req = await repository.requestDetails(requestId, staffId);
    if (!req) {
      throw new AppError(404, 'REQUEST_NOT_FOUND', 'Service request not found or not assigned to you.');
    }

    if (req.requestStatus !== 'ASSIGNED') {
      throw new AppError(409, 'INVALID_STATUS_TRANSITION', 'Only requests with Assigned status can be started.');
    }

    await repository.updateRequestStatus(requestId, staffId, 'IN_PROGRESS', new Date());
  },

  async getRequestOccupants(requestId, staffId) {
    const req = await repository.requestDetails(requestId, staffId);
    if (!req) {
      throw new AppError(404, 'REQUEST_NOT_FOUND', 'Service request not found or not assigned to you.');
    }
    return repository.findRoomOccupants(req.student.blockId, req.roomNumber);
  },

  async generateCompletionOtp(requestId, staffId, studentId) {
    const req = await repository.requestDetails(requestId, staffId);
    if (!req) {
      throw new AppError(404, 'REQUEST_NOT_FOUND', 'Service request not found or not assigned to you.');
    }

    if (req.requestStatus !== 'IN_PROGRESS') {
      throw new AppError(409, 'INVALID_STATUS_TRANSITION', 'OTP can only be generated for requests that are In Progress.');
    }

    const targetStudentId = studentId || req.studentId;

    // Verify that the student exists and belongs to the exact same block and room as the request
    const targetStudent = await prisma.student.findFirst({
      where: {
        id: targetStudentId,
        blockId: req.student.blockId,
        roomNumber: req.roomNumber
      }
    });

    if (!targetStudent) {
      throw new AppError(400, 'INVALID_RECIPIENT', 'Selected student is not an authorized occupant of this room.');
    }

    const otpCode = String(randomInt(100000, 1000000));
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60_000);

    const otpRecord = await repository.createOtp({
      userType: 'STUDENT',
      userId: targetStudentId,
      otpCode,
      purpose: 'COMPLETION',
      attempts: 0,
      expiresAt
    });

    await emailService.sendOtp({
      to: targetStudent.email,
      purpose: 'COMPLETION',
      otp: otpCode
    });
  },

  async verifyCompletionOtp(requestId, staffId, studentId, otp) {
    const req = await repository.requestDetails(requestId, staffId);
    if (!req) {
      throw new AppError(404, 'REQUEST_NOT_FOUND', 'Service request not found or not assigned to you.');
    }

    if (req.requestStatus !== 'IN_PROGRESS') {
      throw new AppError(409, 'INVALID_STATUS_TRANSITION', 'Requests can only be completed from In Progress status.');
    }

    const targetStudentId = studentId || req.studentId;

    // Verify that the student exists and belongs to the exact same block and room as the request
    const targetStudent = await prisma.student.findFirst({
      where: {
        id: targetStudentId,
        blockId: req.student.blockId,
        roomNumber: req.roomNumber
      }
    });

    if (!targetStudent) {
      throw new AppError(400, 'INVALID_RECIPIENT', 'Selected student is not an authorized occupant of this room.');
    }

    const latestOtp = await repository.findLatestOtp(targetStudentId);
    if (!latestOtp || latestOtp.expiresAt < new Date() || latestOtp.attempts >= 5) {
      throw new AppError(410, 'OTP_EXPIRED', 'OTP is expired or invalid.');
    }

    if (latestOtp.otpCode !== otp) {
      await repository.updateOtp(latestOtp.id, { attempts: { increment: 1 } });
      throw new AppError(400, 'INVALID_OTP', 'Invalid OTP.');
    }

    await repository.completeRequest(requestId, staffId, latestOtp.id, new Date());
  },

  async getHistory(staffId, filters) {
    const { items, total } = await repository.serviceHistory(staffId, filters);

    const formatted = items.map(req => ({
      requestId: req.id,
      serviceType: req.category.categoryName,
      completedOn: req.completedAt ? req.completedAt.toISOString().split('T')[0] : null,
      rating: req.feedback ? req.feedback.rating : null
    }));

    return formatted;
  },

  async getProfile(staffId) {
    const staff = await repository.profile(staffId);
    if (!staff) {
      throw new AppError(404, 'STAFF_NOT_FOUND', 'Staff member not found.');
    }

    return {
      name: staff.fullName,
      email: staff.email,
      role: staff.serviceRole === 'CLEANING' ? 'Cleaning' : staff.serviceRole === 'ELECTRICAL_MAINTENANCE' ? 'Electrical Maintenance' : staff.serviceRole === 'PLUMBING' ? 'Plumbing' : staff.serviceRole === 'AC_MAINTENANCE' ? 'AC Maintenance' : staff.serviceRole === 'FURNITURE_REPAIR' ? 'Furniture Repair' : staff.serviceRole,
      block: staff.block.blockName,
      phoneNumber: staff.phoneNumber
    };
  },

  async updateProfile(staffId, data) {
    const updateData = {};
    if (data.name !== undefined) {
      updateData.fullName = data.name;
    }
    if (data.phoneNumber !== undefined) {
      updateData.phoneNumber = data.phoneNumber;
    }

    await repository.updateProfile(staffId, updateData);
  }
};
