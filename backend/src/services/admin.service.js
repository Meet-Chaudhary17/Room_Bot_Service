import { prisma } from '../config/prisma.js';
import { AdminRepository } from '../repositories/admin.repository.js';
import { AppError } from '../utils/app-error.js';

const repository = new AdminRepository(prisma);

export const adminService = {
  async getDashboard() {
    return repository.dashboardStats();
  },

  async listStudents(filters) {
    const { items, total } = await repository.students(filters);
    const limit = filters.limit || 20;
    const page = filters.page || 1;
    const totalPages = Math.ceil(total / limit);

    const formatted = items.map(item => ({
      id: item.id,
      studentId: item.id,
      name: item.fullName,
      fullName: item.fullName,
      registrationNo: item.registrationNumber,
      email: item.email,
      phone: item.phoneNumber,
      roomNumber: item.roomNumber,
      block: { id: item.block.id, name: item.block.blockName },
      isBlocked: item.isBlocked,
      status: item.isBlocked ? 'Blocked' : 'Active'
    }));

    return {
      students: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
  },

  async listStaff(filters) {
    const { items, total } = await repository.staff(filters);
    const limit = filters.limit || 20;
    const page = filters.page || 1;
    const totalPages = Math.ceil(total / limit);

    const formatted = items.map(item => {
      const activeRequests = item.assignedRequests.filter(req => ['ASSIGNED', 'IN_PROGRESS'].includes(req.requestStatus)).length;
      const completedRequests = item.assignedRequests.filter(req => req.requestStatus === 'COMPLETED').length;
      const averageRating = item.feedback.length > 0 ? parseFloat((item.feedback.reduce((sum, fb) => sum + fb.rating, 0) / item.feedback.length).toFixed(1)) : 0;

      return {
        id: item.id,
        staffId: item.id,
        name: item.fullName,
        fullName: item.fullName,
        email: item.email,
        phone: item.phoneNumber,
        serviceRole: item.serviceRole,
        primaryRole: item.primaryRole,
        secondaryRole: item.secondaryRole,
        floor: item.floor,
        role: item.serviceRole === 'CLEANING' ? 'Cleaning' : item.serviceRole === 'ELECTRICAL_MAINTENANCE' ? 'Electrical Maintenance' : item.serviceRole === 'PLUMBING' ? 'Plumbing' : item.serviceRole === 'AC_MAINTENANCE' ? 'AC Maintenance' : item.serviceRole === 'FURNITURE_REPAIR' ? 'Furniture Repair' : item.serviceRole,
        block: { id: item.block.id, name: item.block.blockName },
        activeRequests,
        completedRequests,
        averageRating,
        isActive: item.isActive,
        status: item.isActive ? 'Active' : 'Blocked'
      };
    });

    return {
      staff: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
  },

  async updateStudentStatus(studentId, status, adminId, ipAddress) {
    if (!['Active', 'Blocked'].includes(status)) {
      throw new AppError(400, 'INVALID_STATUS', 'Status must be Active or Blocked.');
    }
    const isBlocked = status === 'Blocked';
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      throw new AppError(404, 'STUDENT_NOT_FOUND', 'Student not found.');
    }
    await repository.updateStudentStatus(studentId, isBlocked, adminId, ipAddress);
  },

  async updateStaffStatus(staffId, status, floor, adminId, ipAddress) {
    if (!['Active', 'Blocked'].includes(status)) {
      throw new AppError(400, 'INVALID_STATUS', 'Status must be Active or Blocked.');
    }
    const isActive = status === 'Active';
    const staff = await prisma.staff.findUnique({ where: { id: staffId } });
    if (!staff) {
      throw new AppError(404, 'STAFF_NOT_FOUND', 'Staff member not found.');
    }
    if (isActive && floor === undefined) {
      throw new AppError(400, 'FLOOR_REQUIRED', 'Staff floor assignment is required when activating/approving.');
    }
    await repository.updateStaffStatus(staffId, isActive, floor, adminId, ipAddress);
  },

  async listServiceRequests(filters) {
    const { items } = await repository.serviceRequests(filters);

    const statusMap = { PENDING: 'Pending', ASSIGNED: 'Assigned', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed', CANCELLED: 'Cancelled' };

    return items.map(req => ({
      requestId: req.id,
      student: req.student.fullName,
      staff: req.assignedStaff ? req.assignedStaff.fullName : null,
      serviceType: req.category.categoryName,
      status: statusMap[req.requestStatus] || req.requestStatus,
      priority: req.priority,
      createdAt: req.createdAt,
      completedDate: req.completedAt ? req.completedAt.toISOString().split('T')[0] : null
    }));
  },

  async listRequestsForAdmin(filters) {
    const { items, total } = await repository.serviceRequests(filters);
    const limit = filters.limit || 10;
    const page = filters.page || 1;
    const totalPages = Math.ceil(total / limit) || 1;

    const formatted = items.map(req => ({
      id: String(req.id),
      requestId: req.id,
      title: req.title,
      description: req.description,
      status: req.requestStatus,
      requestStatus: req.requestStatus,
      priority: req.priority,
      createdAt: req.createdAt,
      assignedAt: req.assignedAt,
      completedAt: req.completedAt,
      serviceType: {
        id: req.category?.id,
        name: req.category?.categoryName || 'Service'
      },
      student: {
        id: req.student?.id,
        name: req.student?.fullName || 'Student',
        fullName: req.student?.fullName || 'Student',
        roomNumber: req.roomNumber || req.student?.roomNumber,
        block: {
          id: req.student?.block?.id,
          name: req.student?.block?.blockName || 'N/A'
        }
      },
      staff: req.assignedStaff ? {
        id: req.assignedStaff.id,
        name: req.assignedStaff.fullName,
        fullName: req.assignedStaff.fullName
      } : null
    }));

    return {
      requests: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
  },

  async reassignRequest(requestId, staffId) {
    const staff = await prisma.staff.findUnique({ where: { id: staffId } });
    if (!staff) {
      throw new AppError(404, 'STAFF_NOT_FOUND', 'Staff member not found.');
    }
    const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
    if (!request) {
      throw new AppError(404, 'REQUEST_NOT_FOUND', 'Service request not found.');
    }
    await prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        assignedStaffId: staffId,
        requestStatus: 'ASSIGNED',
        assignedAt: new Date()
      }
    });
  },

  async listBlocks() {
    const blocks = await prisma.hostelBlock.findMany({
      orderBy: { id: 'asc' }
    });
    return blocks.map(b => ({
      id: b.id,
      name: b.blockName,
      blockName: b.blockName,
      description: b.description
    }));
  },

  async createBlock(data) {
    const name = data.name?.trim() || data.blockName?.trim();
    if (!name) {
      throw new AppError(400, 'BLOCK_NAME_REQUIRED', 'Block name is required.');
    }
    const existing = await prisma.hostelBlock.findFirst({
      where: { blockName: { equals: name, mode: 'insensitive' } }
    });
    if (existing) {
      throw new AppError(409, 'BLOCK_EXISTS', 'A block with this name already exists.');
    }
    const block = await prisma.hostelBlock.create({
      data: { blockName: name, description: data.description || null }
    });
    return {
      id: block.id,
      name: block.blockName,
      blockName: block.blockName
    };
  },

  async deleteBlock(blockId) {
    const studentCount = await prisma.student.count({ where: { blockId } });
    const staffCount = await prisma.staff.count({ where: { blockId } });
    if (studentCount > 0 || staffCount > 0) {
      throw new AppError(400, 'BLOCK_IN_USE', 'Cannot delete block with linked students or staff members.');
    }
    await prisma.hostelBlock.delete({ where: { id: blockId } });
  },

  async listServiceTypes() {
    const types = await prisma.serviceCategory.findMany({
      orderBy: { id: 'asc' }
    });
    return types.map(t => ({
      id: t.id,
      name: t.categoryName,
      categoryName: t.categoryName,
      description: t.description,
      serviceRole: t.serviceRole,
      isActive: t.isActive
    }));
  },

  async listComplaints(filters) {
    const { items } = await repository.complaints(filters);

    const statusMap = { SUBMITTED: 'Submitted', UNDER_REVIEW: 'Under Review', RESOLVED: 'Resolved', CLOSED: 'Closed' };

    return items.map(comp => ({
      complaintId: comp.id,
      student: comp.student.fullName,
      category: comp.category.categoryName,
      assignedWarden: comp.resolver ? comp.resolver.fullName : 'Unassigned',
      status: statusMap[comp.complaintStatus] || comp.complaintStatus,
      submittedDate: comp.createdAt.toISOString().split('T')[0]
    }));
  },

  async resolveComplaint(complaintId, status, resolutionNotes, adminId, ipAddress) {
    const allowed = ['Under Review', 'Resolved', 'Closed'];
    if (!allowed.includes(status)) {
      throw new AppError(400, 'INVALID_STATUS', 'Status must be Under Review, Resolved, or Closed.');
    }

    const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
    if (!complaint) {
      throw new AppError(404, 'COMPLAINT_NOT_FOUND', 'Complaint not found.');
    }

    await repository.resolveComplaint(complaintId, status, resolutionNotes, adminId, ipAddress);
  },

  async listFeedback(filters) {
    const { items } = await repository.feedback(filters);

    return items.map(fb => ({
      staffName: fb.staff.fullName,
      rating: fb.rating,
      comments: fb.comments
    }));
  },

  async getAnalytics() {
    return repository.analytics();
  },

  async getProfile(adminId) {
    const profile = await repository.profile(adminId);
    if (!profile) {
      throw new AppError(404, 'ADMIN_NOT_FOUND', 'Administrator not found.');
    }
    return {
      name: profile.fullName,
      username: profile.username,
      email: profile.email
    };
  },

  async listAuditLogs(filters) {
    const { items } = await repository.auditLogs(filters);

    return items.map(log => ({
      logId: log.id,
      administrator: log.administrator.fullName,
      action: log.action,
      targetTable: log.targetTable,
      targetRecordId: log.targetRecordId,
      description: log.description,
      ipAddress: log.ipAddress,
      timestamp: log.createdAt
    }));
  }
};
