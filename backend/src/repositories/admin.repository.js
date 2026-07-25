import prisma from "../config/prisma.js";

export async function getDashboardAnalytics(tx = prisma) {
    const totalStudents = await tx.student.count();
    const blockedStudents = await tx.student.count({ where: { isBlocked: true } });
    const totalStaff = await tx.staff.count();
    const activeStaff = await tx.staff.count({ where: { isActive: true, isVerified: true } });

    // Request counts
    const pendingRequests = await tx.serviceRequest.count({ where: { status: "PENDING" } });
    const assignedRequests = await tx.serviceRequest.count({ where: { status: "ASSIGNED" } });
    const inProgressRequests = await tx.serviceRequest.count({ where: { status: "IN_PROGRESS" } });
    const otpPendingRequests = await tx.serviceRequest.count({ where: { status: "OTP_PENDING" } });
    const completedRequests = await tx.serviceRequest.count({ where: { status: "COMPLETED" } });

    // Complaints counts
    const openComplaints = await tx.complaint.count({ where: { status: "OPEN" } });
    const resolvedComplaints = await tx.complaint.count({ where: { status: "RESOLVED" } });

    // Feedback average
    const feedbackAgg = await tx.feedback.aggregate({
        _avg: {
            rating: true
        }
    });

    return {
        totalStudents,
        blockedStudents,
        totalStaff,
        activeStaff,
        pendingRequests,
        assignedRequests,
        inProgressRequests,
        otpPendingRequests,
        completedRequests,
        openComplaints,
        resolvedComplaints,
        averageFeedbackRating: feedbackAgg._avg.rating || 0
    };
}

export async function getStudentsList(filters, skip, take, tx = prisma) {
    return await tx.student.findMany({
        where: filters,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
            block: {
                select: { name: true }
            }
        }
    });
}

export async function getStudentsCount(filters, tx = prisma) {
    return await tx.student.count({ where: filters });
}

export async function updateStudentBlocked(id, isBlocked, tx = prisma) {
    return await tx.student.update({
        where: { id },
        data: { isBlocked }
    });
}

export async function getStaffList(filters, skip, take, tx = prisma) {
    return await tx.staff.findMany({
        where: filters,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
            block: {
                select: { name: true }
            }
        }
    });
}

export async function getStaffCount(filters, tx = prisma) {
    return await tx.staff.count({ where: filters });
}

export async function updateStaffActive(id, isActive, tx = prisma) {
    return await tx.staff.update({
        where: { id },
        data: { isActive }
    });
}

export async function getBlocksList(skip, take, tx = prisma) {
    return await tx.block.findMany({
        skip,
        take,
        orderBy: { name: "asc" },
        include: {
            _count: {
                select: {
                    students: true,
                    staff: true
                }
            }
        }
    });
}

export async function getBlocksCount(tx = prisma) {
    return await tx.block.count();
}

export async function createBlock(name, tx = prisma) {
    return await tx.block.create({
        data: { name }
    });
}

export async function findBlockWithRelations(id, tx = prisma) {
    return await tx.block.findUnique({
        where: { id },
        include: {
            students: { take: 1 },
            staff: { take: 1 }
        }
    });
}

export async function deleteBlock(id, tx = prisma) {
    return await tx.block.delete({
        where: { id }
    });
}

export async function getServiceTypesList(skip, take, tx = prisma) {
    return await tx.serviceType.findMany({
        skip,
        take,
        orderBy: { name: "asc" }
    });
}

export async function getServiceTypesCount(tx = prisma) {
    return await tx.serviceType.count();
}

export async function createServiceType(name, description, tx = prisma) {
    return await tx.serviceType.create({
        data: { name, description }
    });
}

export async function updateServiceTypeActive(id, isActive, tx = prisma) {
    return await tx.serviceType.update({
        where: { id },
        data: { isActive }
    });
}

export async function getRequestsList(filters, sort, skip, take, tx = prisma) {
    return await tx.serviceRequest.findMany({
        where: filters,
        orderBy: { createdAt: sort },
        skip,
        take,
        include: {
            serviceType: true,
            student: {
                select: {
                    id: true,
                    name: true,
                    roomNumber: true,
                    block: {
                        select: { id: true, name: true }
                    }
                }
            },
            staff: {
                select: { id: true, name: true, role: true }
            }
        }
    });
}

export async function getRequestsCount(filters, tx = prisma) {
    return await tx.serviceRequest.count({ where: filters });
}

export async function getComplaintsList(filters, sort, skip, take, tx = prisma) {
    return await tx.complaint.findMany({
        where: filters,
        orderBy: { createdAt: sort },
        skip,
        take,
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    roomNumber: true,
                    block: {
                        select: { id: true, name: true }
                    }
                }
            }
        }
    });
}

export async function getComplaintsCount(filters, tx = prisma) {
    return await tx.complaint.count({ where: filters });
}

export async function updateComplaintStatus(id, status, tx = prisma) {
    return await tx.complaint.update({
        where: { id },
        data: { status }
    });
}

export async function getFeedbacksList(filters, sort, skip, take, tx = prisma) {
    return await tx.feedback.findMany({
        where: filters,
        orderBy: { createdAt: sort },
        skip,
        take,
        include: {
            student: {
                select: { id: true, name: true }
            },
            staff: {
                select: { id: true, name: true, role: true }
            },
            request: {
                select: { id: true, title: true }
            }
        }
    });
}

export async function getFeedbacksCount(filters, tx = prisma) {
    return await tx.feedback.count({ where: filters });
}
