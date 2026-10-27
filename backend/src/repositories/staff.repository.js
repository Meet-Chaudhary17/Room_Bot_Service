import { BaseRepository } from './base.repository.js';

function getDefaultTime(role) {
  if (role === 'CLEANING') return 420;
  if (role === 'ELECTRICAL_MAINTENANCE') return 1200;
  if (role === 'PLUMBING') return 1800;
  if (role === 'FURNITURE_REPAIR') return 1500;
  return 900;
}

async function updateStaffWorkload(tx, staffId) {
  const assigned = await tx.serviceRequest.findMany({
    where: {
      assignedStaffId: staffId,
      requestStatus: { in: ['ASSIGNED', 'IN_PROGRESS'] }
    },
    include: { category: true }
  });

  const categoryIds = [...new Set(assigned.map(r => r.categoryId))];
  const statsList = categoryIds.length > 0
    ? await tx.staffCategoryStats.findMany({
        where: { staffId, categoryId: { in: categoryIds } }
      })
    : [];
  const statsMap = new Map(statsList.map(s => [s.categoryId, s]));

  let workload = 0;
  for (const req of assigned) {
    const stats = statsMap.get(req.categoryId);
    const avg = stats && stats.completedCount > 0 ? stats.averageTime : 0;
    if (avg > 0) {
      workload += avg;
    } else {
      workload += getDefaultTime(req.category.serviceRole);
    }
  }

  await tx.staff.update({
    where: { id: staffId },
    data: { currentWorkload: workload }
  });
}

export class StaffRepository extends BaseRepository {
  profile(id) {
    return this.prisma.staff.findUnique({
      where: { id },
      include: { block: true }
    });
  }

  updateProfile(id, data) {
    return this.prisma.staff.update({
      where: { id },
      data
    });
  }

  async assignedRequests(staffId, { status, priority, search, page = 1, limit = 10 } = {}) {
    const where = {
      assignedStaffId: staffId,
      requestStatus: { in: ['ASSIGNED', 'IN_PROGRESS'] }
    };

    if (status) {
      const normalizedStatus = status === 'In Progress' ? 'IN_PROGRESS' : status === 'Assigned' ? 'ASSIGNED' : status.toUpperCase();
      if (['ASSIGNED', 'IN_PROGRESS'].includes(normalizedStatus)) {
        where.requestStatus = normalizedStatus;
      }
    }

    if (priority) {
      where.priority = priority.toUpperCase();
    }

    if (search) {
      where.OR = [
        { roomNumber: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        {
          student: {
            fullName: { contains: search, mode: 'insensitive' }
          }
        }
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.serviceRequest.findMany({
        where,
        include: {
          student: {
            include: {
              block: true
            }
          },
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

  requestDetails(requestId, staffId) {
    return this.prisma.serviceRequest.findFirst({
      where: {
        id: requestId,
        assignedStaffId: staffId
      },
      include: {
        student: {
          include: {
            block: true
          }
        },
        category: true
      }
    });
  }

  updateRequestStatus(requestId, staffId, status, startedAt = null) {
    const data = { requestStatus: status };
    if (startedAt) {
      data.startedAt = startedAt;
    }
    return this.prisma.serviceRequest.updateMany({
      where: {
        id: requestId,
        assignedStaffId: staffId,
        requestStatus: 'ASSIGNED'
      },
      data
    });
  }

  createOtp(data) {
    return this.prisma.otpVerification.create({
      data
    });
  }

  findRoomOccupants(blockId, roomNumber) {
    return this.prisma.student.findMany({
      where: {
        blockId,
        roomNumber,
        isBlocked: false
      },
      select: {
        id: true,
        fullName: true,
        email: true
      }
    });
  }

  findLatestOtp(studentId) {
    return this.prisma.otpVerification.findFirst({
      where: {
        userType: 'STUDENT',
        userId: studentId,
        purpose: 'COMPLETION',
        verifiedAt: null
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  updateOtp(otpId, data) {
    return this.prisma.otpVerification.update({
      where: { id: otpId },
      data
    });
  }

  completeRequest(requestId, staffId, otpId, completedAt) {
    return this.prisma.$transaction(async (tx) => {
      await tx.otpVerification.update({
        where: { id: otpId },
        data: { verifiedAt: completedAt }
      });

      const req = await tx.serviceRequest.findUnique({
        where: { id: requestId }
      });
      if (!req) throw new Error('Request not found.');

      await tx.serviceRequest.updateMany({
        where: {
          id: requestId,
          assignedStaffId: staffId,
          requestStatus: 'IN_PROGRESS'
        },
        data: {
          requestStatus: 'COMPLETED',
          completedAt
        }
      });

      const T = req.pausedDuration !== null ? req.pausedDuration : 0;
      const stats = await tx.staffCategoryStats.findUnique({
        where: {
          staffId_categoryId: {
            staffId,
            categoryId: req.categoryId
          }
        }
      });

      let X_new = 1;
      let Y_new = T;

      if (stats) {
        const X = stats.completedCount;
        const Y = stats.averageTime;
        X_new = X + 1;
        Y_new = (X * Y + T) / (X + 1);

        await tx.staffCategoryStats.update({
          where: { id: stats.id },
          data: {
            completedCount: X_new,
            averageTime: Y_new
          }
        });
      } else {
        await tx.staffCategoryStats.create({
          data: {
            staffId,
            categoryId: req.categoryId,
            completedCount: X_new,
            averageTime: Y_new
          }
        });
      }

      await updateStaffWorkload(tx, staffId);
    }, { timeout: 20000 });
  }

  async serviceHistory(staffId, { page = 1, limit = 10 } = {}) {
    const where = {
      assignedStaffId: staffId,
      requestStatus: 'COMPLETED'
    };

    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.serviceRequest.findMany({
        where,
        include: {
          category: true,
          feedback: true
        },
        orderBy: { completedAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.serviceRequest.count({ where })
    ]);

    return { items, total };
  }

  async dashboardStats(staffId) {
    // Find assigned (Assigned or In Progress)
    const assignedRequests = await this.prisma.serviceRequest.count({
      where: {
        assignedStaffId: staffId,
        requestStatus: { in: ['ASSIGNED', 'IN_PROGRESS'] }
      }
    });

    // Find pending (Assigned but not started)
    const pendingRequests = await this.prisma.serviceRequest.count({
      where: {
        assignedStaffId: staffId,
        requestStatus: 'ASSIGNED'
      }
    });

    // Find completed today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const completedToday = await this.prisma.serviceRequest.count({
      where: {
        assignedStaffId: staffId,
        requestStatus: 'COMPLETED',
        completedAt: { gte: todayStart }
      }
    });

    // Average rating
    const ratingAggregate = await this.prisma.feedback.aggregate({
      _avg: { rating: true },
      where: { staffId }
    });

    const averageRating = ratingAggregate._avg.rating ? parseFloat(ratingAggregate._avg.rating.toFixed(1)) : 0;

    return {
      assignedRequests,
      pendingRequests,
      completedToday,
      averageRating
    };
  }
}
