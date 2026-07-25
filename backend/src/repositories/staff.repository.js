import prisma from "../config/prisma.js";

export async function getStaffDashboardStats(staffId, tx = prisma) {
    const counts = await tx.serviceRequest.groupBy({
        by: ["status"],
        where: { staffId },
        _count: {
            id: true
        }
    });
    return counts;
}

export async function getStaffRequests(staffId, filters, sort, skip, take, tx = prisma) {
    return await tx.serviceRequest.findMany({
        where: {
            staffId,
            ...filters
        },
        orderBy: {
            createdAt: sort
        },
        skip,
        take,
        include: {
            serviceType: true,
            student: {
                select: {
                    id: true,
                    name: true,
                    roomNumber: true,
                    phone: true,
                    blockId: true,
                    block: {
                        select: { name: true }
                    }
                }
            }
        }
    });
}

export async function getStaffRequestCount(staffId, filters, tx = prisma) {
    return await tx.serviceRequest.count({
        where: {
            staffId,
            ...filters
        }
    });
}

export async function findRequestByIdAndStaffId(id, staffId, tx = prisma) {
    return await tx.serviceRequest.findFirst({
        where: {
            id,
            staffId
        }
    });
}

export async function updateRequestStatus(id, status, extraFields = {}, tx = prisma) {
    return await tx.serviceRequest.update({
        where: { id },
        data: {
            status,
            ...extraFields
        }
    });
}

export async function getStaffFeedbackStats(staffId, tx = prisma) {
    const aggregation = await tx.feedback.aggregate({
        where: { staffId },
        _avg: {
            rating: true
        },
        _count: {
            id: true
        }
    });
    return {
        averageRating: aggregation._avg.rating || 0,
        feedbackCount: aggregation._count.id || 0
    };
}

export async function getStaffProfileDetails(staffId, tx = prisma) {
    return await tx.staff.findUnique({
        where: { id: staffId },
        include: {
            block: {
                select: {
                    name: true
                }
            }
        }
    });
}
