import prisma from "../config/prisma.js";

export async function findServiceTypeById(id, tx = prisma) {
    return await tx.serviceType.findUnique({
        where: { id }
    });
}

export async function findActiveStaffWithWorkload(blockId, role, tx = prisma) {
    return await tx.staff.findMany({
        where: {
            blockId,
            role,
            isVerified: true,
            isActive: true
        },
        include: {
            assignedRequests: {
                where: {
                    status: {
                        in: ["ASSIGNED", "IN_PROGRESS"]
                    }
                }
            }
        }
    });
}

export async function createServiceRequest(data, tx = prisma) {
    return await tx.serviceRequest.create({
        data
    });
}

export async function getStudentRequestHistory(studentId, filters, skip, take, tx = prisma) {
    const whereClause = {
        studentId,
        ...filters
    };

    return await tx.serviceRequest.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: {
            createdAt: "desc"
        },
        include: {
            serviceType: true,
            staff: {
                select: {
                    id: true,
                    name: true,
                    role: true,
                    phone: true
                }
            },
            feedback: true
        }
    });
}

export async function getStudentRequestCount(studentId, filters, tx = prisma) {
    return await tx.serviceRequest.count({
        where: {
            studentId,
            ...filters
        }
    });
}

export async function createComplaint(data, tx = prisma) {
    return await tx.complaint.create({
        data
    });
}

export async function getStudentComplaints(studentId, tx = prisma) {
    return await tx.complaint.findMany({
        where: { studentId },
        orderBy: {
            createdAt: "desc"
        }
    });
}

export async function findServiceRequestById(id, tx = prisma) {
    return await tx.serviceRequest.findUnique({
        where: { id },
        include: {
            feedback: true
        }
    });
}

export async function createFeedback(data, tx = prisma) {
    return await tx.feedback.create({
        data
    });
}
