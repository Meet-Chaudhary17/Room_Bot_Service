import { BaseRepository } from './base.repository.js';

export class AdminRepository extends BaseRepository {
  profile(id) {
    return this.prisma.administrator.findUnique({
      where: { id },
      select: { id: true, fullName: true, username: true, email: true }
    });
  }

  async dashboardStats() {
    const totalStudents = await this.prisma.student.count();
    const totalStaff = await this.prisma.staff.count();

    const activeRequests = await this.prisma.serviceRequest.count({
      where: { requestStatus: { in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'] } }
    });

    const completedRequests = await this.prisma.serviceRequest.count({
      where: { requestStatus: 'COMPLETED' }
    });

    const activeComplaints = await this.prisma.complaint.count({
      where: { complaintStatus: { in: ['SUBMITTED', 'UNDER_REVIEW'] } }
    });

    const ratingAggregate = await this.prisma.feedback.aggregate({
      _avg: { rating: true }
    });
    const averageRating = ratingAggregate._avg.rating ? parseFloat(ratingAggregate._avg.rating.toFixed(1)) : 0;

    return {
      totalStudents,
      totalStaff,
      activeRequests,
      completedRequests,
      activeComplaints,
      averageRating
    };
  }

  async students({ block, search, page = 1, limit = 20 } = {}) {
    const where = {};

    if (block) {
      where.block = { blockName: block };
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { registrationNumber: { contains: search, mode: 'insensitive' } },
        { roomNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.student.findMany({
        where,
        include: { block: true },
        orderBy: { fullName: 'asc' },
        skip,
        take: limit
      }),
      this.prisma.student.count({ where })
    ]);

    return { items, total };
  }

  async staff({ block, search, page = 1, limit = 20 } = {}) {
    const where = {};

    if (block) {
      where.block = { blockName: block };
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.staff.findMany({
        where,
        include: {
          block: true,
          assignedRequests: true,
          feedback: true
        },
        orderBy: { fullName: 'asc' },
        skip,
        take: limit
      }),
      this.prisma.staff.count({ where })
    ]);

    return { items, total };
  }

  updateStudentStatus(studentId, isBlocked, adminId, ipAddress) {
    return this.prisma.$transaction(async (tx) => {
      const student = await tx.student.update({
        where: { id: studentId },
        data: { isBlocked }
      });

      await tx.auditLog.create({
        data: {
          administratorId: adminId,
          action: isBlocked ? 'BLOCK_STUDENT' : 'UNBLOCK_STUDENT',
          targetTable: 'student',
          targetRecordId: studentId,
          description: `Student ${student.fullName} (${student.registrationNumber}) status changed to ${isBlocked ? 'Blocked' : 'Active'}`,
          ipAddress
        }
      });

      return student;
    });
  }

  updateStaffStatus(staffId, isActive, adminId, ipAddress) {
    return this.prisma.$transaction(async (tx) => {
      const staff = await tx.staff.update({
        where: { id: staffId },
        data: { isActive }
      });

      await tx.auditLog.create({
        data: {
          administratorId: adminId,
          action: isActive ? 'UNBLOCK_STAFF' : 'BLOCK_STAFF',
          targetTable: 'staff',
          targetRecordId: staffId,
          description: `Staff ${staff.fullName} status changed to ${isActive ? 'Active' : 'Blocked'}`,
          ipAddress
        }
      });

      return staff;
    });
  }

  async serviceRequests({ status, block, serviceType, staffId, page = 1, limit = 10 } = {}) {
    const where = {};

    if (status) {
      const normalizedStatus = status === 'In Progress' ? 'IN_PROGRESS' : status === 'Pending' ? 'PENDING' : status === 'Assigned' ? 'ASSIGNED' : status === 'Completed' ? 'COMPLETED' : status === 'Cancelled' ? 'CANCELLED' : status.toUpperCase();
      where.requestStatus = normalizedStatus;
    }

    if (block) {
      where.student = { block: { blockName: block } };
    }

    if (serviceType) {
      where.category = { categoryName: serviceType };
    }

    if (staffId) {
      where.assignedStaffId = Number(staffId);
    }

    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.serviceRequest.findMany({
        where,
        include: {
          student: { include: { block: true } },
          assignedStaff: true,
          category: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.serviceRequest.count({ where })
    ]);

    return { items, total };
  }

  async complaints({ status, category, block, page = 1, limit = 10 } = {}) {
    const where = {};

    if (status) {
      const normalized = status === 'Under Review' ? 'UNDER_REVIEW' : status.toUpperCase();
      where.complaintStatus = normalized;
    }

    if (category) {
      where.categoryId = Number(category);
    }

    if (block) {
      where.student = { block: { blockName: block } };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.complaint.findMany({
        where,
        include: {
          student: { include: { block: true } },
          category: true,
          resolver: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.complaint.count({ where })
    ]);

    return { items, total };
  }

  resolveComplaint(complaintId, status, resolutionNotes, adminId, ipAddress) {
    return this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const normalizedStatus = status === 'Under Review' ? 'UNDER_REVIEW' : status.toUpperCase();

      const updateData = {
        complaintStatus: normalizedStatus,
        resolvedBy: adminId,
        resolutionNotes
      };

      if (normalizedStatus === 'RESOLVED') {
        updateData.resolvedAt = now;
      } else if (normalizedStatus === 'CLOSED') {
        updateData.closedAt = now;
      }

      const complaint = await tx.complaint.update({
        where: { id: complaintId },
        data: updateData
      });

      await tx.auditLog.create({
        data: {
          administratorId: adminId,
          action: 'UPDATE_COMPLAINT_STATUS',
          targetTable: 'complaint',
          targetRecordId: complaintId,
          description: `Complaint status updated to ${status}. Notes: ${resolutionNotes || 'None'}`,
          ipAddress
        }
      });

      return complaint;
    });
  }

  async feedback({ page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.feedback.findMany({
        include: {
          staff: true,
          student: true,
          request: true
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.feedback.count()
    ]);

    return { items, total };
  }

  async analytics() {
    const totalStudents = await this.prisma.student.count();
    const totalStaff = await this.prisma.staff.count();
    const totalRequests = await this.prisma.serviceRequest.count();

    const completedRequests = await this.prisma.serviceRequest.count({
      where: { requestStatus: 'COMPLETED' }
    });

    const cancelledRequests = await this.prisma.serviceRequest.count({
      where: { requestStatus: 'CANCELLED' }
    });

    const activeRequests = await this.prisma.serviceRequest.count({
      where: { requestStatus: { in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'] } }
    });

    const totalComplaints = await this.prisma.complaint.count();

    const ratingAggregate = await this.prisma.feedback.aggregate({
      _avg: { rating: true }
    });
    const averageStaffRating = ratingAggregate._avg.rating ? parseFloat(ratingAggregate._avg.rating.toFixed(1)) : 0;

    // Calculate Average Resolution Time in hours
    // (assignedAt to completedAt)
    const completedList = await this.prisma.serviceRequest.findMany({
      where: {
        requestStatus: 'COMPLETED',
        assignedAt: { not: null },
        completedAt: { not: null }
      },
      select: { assignedAt: true, completedAt: true }
    });

    let averageResolutionTime = '0.0 Hours';
    if (completedList.length > 0) {
      const totalMs = completedList.reduce((sum, req) => {
        return sum + (req.completedAt.getTime() - req.assignedAt.getTime());
      }, 0);
      const avgHours = totalMs / completedList.length / (1000 * 60 * 60);
      averageResolutionTime = `${avgHours.toFixed(1)} Hours`;
    }

    return {
      totalStudents,
      totalStaff,
      totalRequests,
      completedRequests,
      cancelledRequests,
      activeRequests,
      totalComplaints,
      averageResolutionTime,
      averageStaffRating
    };
  }

  async auditLogs({ page = 1, limit = 50 } = {}) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        include: {
          administrator: { select: { fullName: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.auditLog.count()
    ]);

    return { items, total };
  }
}
