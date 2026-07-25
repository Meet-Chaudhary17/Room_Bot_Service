import prisma from "../config/prisma.js";
import {
    findServiceTypeById,
    findActiveStaffWithWorkload,
    createServiceRequest,
    getStudentRequestHistory,
    getStudentRequestCount,
    createComplaint,
    getStudentComplaints,
    findServiceRequestById,
    createFeedback
} from "../repositories/student.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { sendNotification } from "./notification.service.js";

// Helper function to map service name to staff roles
function mapServiceTypeToStaffRole(serviceTypeName) {
    const name = serviceTypeName.toUpperCase();
    if (name.includes("CLEANING") || name.includes("HOUSEKEEPING")) {
        return "CLEANING";
    }
    if (name.includes("ELECTRIC") || name.includes("POWER") || name.includes("LIGHT")) {
        return "ELECTRICIAN";
    }
    if (name.includes("PLUMB") || name.includes("WATER") || name.includes("LEAK")) {
        return "PLUMBER";
    }
    if (name.includes("FURNITURE") || name.includes("CARPENTER") || name.includes("WOOD") || name.includes("DOOR")) {
        return "CARPENTER";
    }
    return "GENERAL";
}

// Redefine helper hook to route notifications with roles
async function triggerNotificationHook(userId, role, type, message) {
    await sendNotification({ userId, role, title: type, message });
}

export async function createRequest(studentId, studentBlockId, data) {
    const serviceType = await findServiceTypeById(data.serviceTypeId);
    if (!serviceType || !serviceType.isActive) {
        throw new ApiError(404, "Service type not found or is currently inactive");
    }

    const staffRole = mapServiceTypeToStaffRole(serviceType.name);

    // Find all matching staff members in the student's block
    const staffList = await findActiveStaffWithWorkload(studentBlockId, staffRole);

    let assignedStaffId = null;
    let status = "PENDING";
    let assignedAt = null;

    if (staffList.length > 0) {
        // Calculate workloads (active requests: ASSIGNED or IN_PROGRESS)
        const workloads = staffList.map(s => s.assignedRequests.length);
        const minWorkload = Math.min(...workloads);

        // Filter all staff with the minimum workload
        const eligibleStaff = staffList.filter(s => s.assignedRequests.length === minWorkload);

        // Randomly select one staff member to balance work
        const selectedStaff = eligibleStaff[Math.floor(Math.random() * eligibleStaff.length)];
        
        assignedStaffId = selectedStaff.id;
        status = "ASSIGNED";
        assignedAt = new Date();
    }

    // Run creation inside transaction
    const request = await prisma.$transaction(async (tx) => {
        return await createServiceRequest({
            title: data.title,
            description: data.description,
            priority: data.priority || 1,
            status,
            studentId,
            staffId: assignedStaffId,
            serviceTypeId: data.serviceTypeId,
            assignedAt
        }, tx);
    });

    // Fire notification hooks
    if (assignedStaffId) {
        await triggerNotificationHook(assignedStaffId, "STAFF", "ASSIGNED", `New request assigned: ${request.title}`);
    }
    await triggerNotificationHook(studentId, "STUDENT", "REQUEST_CREATED", `Your service request was created successfully: Status ${status}`);

    return request;
}

export async function getRequestHistory(studentId, query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filters = {};
    if (query.status) {
        filters.status = query.status;
    }
    if (query.priority) {
        filters.priority = parseInt(query.priority);
    }

    const requests = await getStudentRequestHistory(studentId, filters, skip, limit);
    const totalItems = await getStudentRequestCount(studentId, filters);
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

export async function createStudentComplaint(studentId, data) {
    const complaint = await prisma.$transaction(async (tx) => {
        return await createComplaint({
            subject: data.subject,
            description: data.description,
            status: "OPEN",
            studentId
        }, tx);
    });

    await triggerNotificationHook(studentId, "STUDENT", "COMPLAINT_FILED", `Your complaint has been submitted: Subject: ${complaint.subject}`);
    return complaint;
}

export async function getStudentComplaintsHistory(studentId) {
    return await getStudentComplaints(studentId);
}

export async function submitRequestFeedback(studentId, requestId, data) {
    const request = await findServiceRequestById(requestId);
    if (!request) {
        throw new ApiError(404, "Service request not found");
    }

    // Verify ownership
    if (request.studentId !== studentId) {
        throw new ApiError(403, "You are not authorized to submit feedback for this request");
    }

    // Feedback validation rules
    if (request.status !== "COMPLETED") {
        throw new ApiError(400, "Feedback can only be submitted for completed requests");
    }

    if (request.feedback) {
        throw new ApiError(409, "Feedback has already been submitted for this request");
    }

    if (!request.staffId) {
        throw new ApiError(400, "This request does not have an assigned staff member to rate");
    }

    const feedback = await prisma.$transaction(async (tx) => {
        return await createFeedback({
            rating: data.rating,
            comment: data.comment || null,
            studentId,
            staffId: request.staffId,
            requestId
        }, tx);
    });

    await triggerNotificationHook(request.staffId, "STAFF", "FEEDBACK_RECEIVED", `You received a ${feedback.rating}-star rating for request: ${request.title}`);

    return feedback;
}
