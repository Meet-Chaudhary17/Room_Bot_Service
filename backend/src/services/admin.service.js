import prisma from "../config/prisma.js";
import { sendNotification } from "./notification.service.js";
import {
    getDashboardAnalytics,
    getStudentsList,
    getStudentsCount,
    updateStudentBlocked,
    getStaffList,
    getStaffCount,
    updateStaffActive,
    getBlocksList,
    getBlocksCount,
    createBlock,
    findBlockWithRelations,
    deleteBlock,
    getServiceTypesList,
    getServiceTypesCount,
    createServiceType,
    updateServiceTypeActive,
    getRequestsList,
    getRequestsCount,
    getComplaintsList,
    getComplaintsCount,
    updateComplaintStatus,
    getFeedbacksList,
    getFeedbacksCount
} from "../repositories/admin.repository.js";
import { ApiError } from "../utils/ApiError.js";

// Audit logging hook placeholder
async function logAdminAction(adminId, action, target, details = {}) {
    console.log(`📋 [AUDIT LOG] Admin: ${adminId} | Action: ${action} | Target: ${target} | Details: ${JSON.stringify(details)}`);
}

// Notification hook helper
async function triggerNotificationHook(userId, role, type, message) {
    await sendNotification({ userId, role, title: type, message });
}

function mapServiceTypeToStaffRole(serviceTypeName) {
    const name = serviceTypeName.toUpperCase();
    if (name.includes("CLEANING") || name.includes("HOUSEKEEPING")) {
        return "CLEANING";
    }
    if (name.includes("ELECTRIC") || name.includes("FAN") || name.includes("LIGHT")) {
        return "ELECTRICIAN";
    }
    if (name.includes("PLUMB") || name.includes("WATER") || name.includes("TAP") || name.includes("LEAK")) {
        return "PLUMBER";
    }
    if (name.includes("CARPENTER") || name.includes("WOOD") || name.includes("DOOR") || name.includes("FURNITURE")) {
        return "CARPENTER";
    }
    return "GENERAL";
}

export async function getDashboardStats() {
    return await getDashboardAnalytics();
}

export async function getStudents(query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filters = {};
    if (query.search) {
        filters.OR = [
            { name: { contains: query.search, mode: "insensitive" } },
            { registrationNo: { contains: query.search, mode: "insensitive" } },
            { email: { contains: query.search, mode: "insensitive" } }
        ];
    }
    if (query.blockId) {
        filters.blockId = query.blockId;
    }
    if (query.status) {
        if (query.status === "blocked") filters.isBlocked = true;
        else if (query.status === "verified") filters.isVerified = true;
        else if (query.status === "unverified") filters.isVerified = false;
    }

    const students = await getStudentsList(filters, skip, limit);
    const totalItems = await getStudentsCount(filters);
    const totalPages = Math.ceil(totalItems / limit);

    return {
        students,
        pagination: {
            page,
            limit,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        }
    };
}

export async function toggleStudentBlock(studentId, isBlocked, adminId) {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    const updatedStudent = await updateStudentBlocked(studentId, isBlocked);

    await logAdminAction(adminId, isBlocked ? "STUDENT_BLOCKED" : "STUDENT_UNBLOCKED", studentId, {
        studentEmail: student.email,
        registrationNo: student.registrationNo
    });

    return updatedStudent;
}

export async function getStaff(query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filters = {};
    if (query.search) {
        filters.OR = [
            { name: { contains: query.search, mode: "insensitive" } },
            { employeeId: { contains: query.search, mode: "insensitive" } },
            { email: { contains: query.search, mode: "insensitive" } }
        ];
    }
    if (query.blockId) {
        filters.blockId = query.blockId;
    }
    if (query.role) {
        filters.role = query.role;
    }
    if (query.status) {
        if (query.status === "active") filters.isActive = true;
        else if (query.status === "inactive") filters.isActive = false;
        else if (query.status === "unverified") filters.isVerified = false;
    }

    const staffList = await getStaffList(filters, skip, limit);
    const totalItems = await getStaffCount(filters);
    const totalPages = Math.ceil(totalItems / limit);

    return {
        staff: staffList,
        pagination: {
            page,
            limit,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        }
    };
}

export async function toggleStaffActive(staffId, isActive, adminId) {
    const staff = await prisma.staff.findUnique({ where: { id: staffId } });
    if (!staff) {
        throw new ApiError(404, "Staff member not found");
    }

    const updatedStaff = await updateStaffActive(staffId, isActive);

    await logAdminAction(adminId, isActive ? "STAFF_ACTIVATED" : "STAFF_DEACTIVATED", staffId, {
        staffEmail: staff.email,
        employeeId: staff.employeeId
    });

    return updatedStaff;
}

export async function getBlocks(query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const blocks = await getBlocksList(skip, limit);
    const totalItems = await getBlocksCount();
    const totalPages = Math.ceil(totalItems / limit);

    return {
        blocks,
        pagination: {
            page,
            limit,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        }
    };
}

export async function createNewBlock(name, adminId) {
    const existing = await prisma.block.findUnique({ where: { name } });
    if (existing) {
        throw new ApiError(409, "Block name already exists");
    }

    const block = await createBlock(name);

    await logAdminAction(adminId, "BLOCK_CREATED", block.id, { name });

    return block;
}

export async function removeBlock(blockId, adminId) {
    const block = await findBlockWithRelations(blockId);
    if (!block) {
        throw new ApiError(404, "Block not found");
    }

    if (block.students.length > 0 || block.staff.length > 0) {
        throw new ApiError(400, "Cannot delete block because there are students or staff assigned to it");
    }

    await deleteBlock(blockId);

    await logAdminAction(adminId, "BLOCK_DELETED", blockId, { name: block.name });

    return true;
}

export async function getServiceTypes(query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const serviceTypes = await getServiceTypesList(skip, limit);
    const totalItems = await getServiceTypesCount();
    const totalPages = Math.ceil(totalItems / limit);

    return {
        serviceTypes,
        pagination: {
            page,
            limit,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        }
    };
}

export async function createNewServiceType(name, description, adminId) {
    const existing = await prisma.serviceType.findFirst({
        where: { name: { equals: name, mode: "insensitive" } }
    });
    if (existing) {
        throw new ApiError(409, "Service type name already exists");
    }

    const serviceType = await createServiceType(name, description);

    await logAdminAction(adminId, "SERVICE_TYPE_CREATED", serviceType.id, { name });

    return serviceType;
}

export async function toggleServiceType(id, isActive, adminId) {
    const serviceType = await prisma.serviceType.findUnique({ where: { id } });
    if (!serviceType) {
        throw new ApiError(404, "Service type not found");
    }

    const updated = await updateServiceTypeActive(id, isActive);

    await logAdminAction(adminId, "SERVICE_TYPE_MODIFIED", id, { name: serviceType.name, isActive });

    return updated;
}

export async function getRequests(query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = query.sort || "desc";

    const filters = {};
    if (query.status) filters.status = query.status;
    if (query.serviceTypeId) filters.serviceTypeId = query.serviceTypeId;
    if (query.staffId) filters.staffId = query.staffId;
    if (query.blockId) {
        filters.student = { blockId: query.blockId };
    }

    const requests = await getRequestsList(filters, sort, skip, limit);
    const totalItems = await getRequestsCount(filters);
    const totalPages = Math.ceil(totalItems / limit);

    return {
        requests,
        pagination: {
            page,
            limit,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        }
    };
}

export async function reassignStaff(requestId, staffId, adminId) {
    const request = await prisma.serviceRequest.findUnique({
        where: { id: requestId },
        include: {
            student: true,
            serviceType: true
        }
    });

    if (!request) {
        throw new ApiError(404, "Service request not found");
    }

    const staff = await prisma.staff.findUnique({ where: { id: staffId } });
    if (!staff) {
        throw new ApiError(404, "Selected staff member not found");
    }

    // Guard 1: Must be active and verified
    if (!staff.isActive || !staff.isVerified) {
        throw new ApiError(400, "Selected staff member is inactive or unverified");
    }

    // Guard 2: Must belong to the same block
    if (staff.blockId !== request.student.blockId) {
        throw new ApiError(400, "Selected staff member does not belong to the student's block");
    }

    // Guard 3: Must have correct role
    const requiredRole = mapServiceTypeToStaffRole(request.serviceType.name);
    if (staff.role !== requiredRole) {
        throw new ApiError(400, `Selected staff member has role '${staff.role}' but must have '${requiredRole}' for this service`);
    }

    const updatedRequest = await prisma.$transaction(async (tx) => {
        return await tx.serviceRequest.update({
            where: { id: requestId },
            data: {
                staffId,
                status: "ASSIGNED",
                otpCode: null,
                startedAt: null,
                completedAt: null,
                otpVerifiedAt: null
            }
        });
    });

    await triggerNotificationHook(request.studentId, "STUDENT", "REQUEST_REASSIGNED", `Your request '${request.title}' has been reassigned to staff: ${staff.name}`);
    await triggerNotificationHook(staffId, "STAFF", "REQUEST_ASSIGNED", `A service request has been reassigned to you: ${request.title}`);
    await logAdminAction(adminId, "REQUEST_REASSIGNED", requestId, { staffId, previousStaffId: request.staffId });

    return updatedRequest;
}

export async function getComplaints(query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = query.sort || "desc";

    const filters = {};
    if (query.status) filters.status = query.status;

    const complaints = await getComplaintsList(filters, sort, skip, limit);
    const totalItems = await getComplaintsCount(filters);
    const totalPages = Math.ceil(totalItems / limit);

    return {
        complaints,
        pagination: {
            page,
            limit,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        }
    };
}

export async function resolveComplaint(complaintId, adminId) {
    const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
    if (!complaint) {
        throw new ApiError(404, "Complaint not found");
    }

    const resolved = await prisma.$transaction(async (tx) => {
        return await updateComplaintStatus(complaintId, "RESOLVED", tx);
    });

    await triggerNotificationHook(complaint.studentId, "STUDENT", "COMPLAINT_RESOLVED", `Your complaint about '${complaint.subject}' has been marked as RESOLVED.`);
    await logAdminAction(adminId, "COMPLAINT_RESOLVED", complaintId);

    return resolved;
}

export async function getFeedbacks(query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = query.sort || "desc";

    const filters = {};
    if (query.rating) {
        filters.rating = parseInt(query.rating);
    }
    if (query.staffId) {
        filters.staffId = query.staffId;
    }

    const feedbacks = await getFeedbacksList(filters, sort, skip, limit);
    const totalItems = await getFeedbacksCount(filters);
    const totalPages = Math.ceil(totalItems / limit);

    return {
        feedbacks,
        pagination: {
            page,
            limit,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        }
    };
}
