import prisma from "../config/prisma.js";
import {
    getStaffDashboardStats,
    getStaffRequests,
    getStaffRequestCount,
    findRequestByIdAndStaffId,
    updateRequestStatus,
    getStaffFeedbackStats,
    getStaffProfileDetails
} from "../repositories/staff.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { generateOtp, sendOtpEmail } from "../utils/otp.js";
import { sendNotification } from "./notification.service.js";

// Notification hook helper
async function triggerNotificationHook(userId, role, type, message) {
    await sendNotification({ userId, role, title: type, message });
}

export async function getDashboardSummary(staffId) {
    const stats = await getStaffDashboardStats(staffId);
    
    // Process count array
    let totalAssigned = 0;
    let inProgress = 0;
    let otpPending = 0;
    let completed = 0;

    stats.forEach(s => {
        if (s.status === "ASSIGNED") totalAssigned = s._count.id;
        else if (s.status === "IN_PROGRESS") inProgress = s._count.id;
        else if (s.status === "OTP_PENDING") otpPending = s._count.id;
        else if (s.status === "COMPLETED") completed = s._count.id;
    });

    const feedbackStats = await getStaffFeedbackStats(staffId);

    return {
        totalAssigned,
        inProgress,
        otpPending,
        completed,
        totalAssignedRequests: totalAssigned + inProgress + otpPending + completed,
        averageRating: feedbackStats.averageRating,
        totalFeedbackCount: feedbackStats.feedbackCount
    };
}

export async function getAssignedRequests(staffId, query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = query.sort || "desc";

    const filters = {};
    if (query.status) {
        filters.status = query.status;
    }

    const requests = await getStaffRequests(staffId, filters, sort, skip, limit);
    const totalItems = await getStaffRequestCount(staffId, filters);
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

export async function startRequestWork(staffId, requestId) {
    const request = await findRequestByIdAndStaffId(requestId, staffId);
    if (!request) {
        throw new ApiError(404, "Service request not found or not assigned to you");
    }

    // Strict transition: ASSIGNED -> IN_PROGRESS
    if (request.status !== "ASSIGNED") {
        throw new ApiError(409, `Cannot start work. Request status is '${request.status}' but must be 'ASSIGNED'`);
    }

    const updatedRequest = await prisma.$transaction(async (tx) => {
        return await updateRequestStatus(requestId, "IN_PROGRESS", {
            startedAt: new Date()
        }, tx);
    });

    await triggerNotificationHook(request.studentId, "STUDENT", "WORK_STARTED", `Staff has started work on request: ${request.title}`);

    return updatedRequest;
}

export async function triggerRequestCompletionOtp(staffId, requestId) {
    const request = await prisma.serviceRequest.findUnique({
        where: { id: requestId },
        include: {
            student: {
                select: {
                    email: true,
                    id: true
                }
            }
        }
    });

    if (!request || request.staffId !== staffId) {
        throw new ApiError(404, "Service request not found or not assigned to you");
    }

    // Strict transition: IN_PROGRESS -> OTP_PENDING
    if (request.status !== "IN_PROGRESS") {
        throw new ApiError(409, `Cannot request completion. Request status is '${request.status}' but must be 'IN_PROGRESS'`);
    }

    const otp = generateOtp();

    const updatedRequest = await prisma.$transaction(async (tx) => {
        return await updateRequestStatus(requestId, "OTP_PENDING", {
            otpCode: otp
        }, tx);
    });

    await sendOtpEmail(request.student.email, otp);
    await triggerNotificationHook(request.student.id, "STUDENT", "OTP_DISPATCHED", `Completion OTP has been sent to your email for request: ${request.title}`);

    return updatedRequest;
}

export async function verifyRequestCompletion(staffId, requestId, otp) {
    const request = await prisma.serviceRequest.findUnique({
        where: { id: requestId }
    });

    if (!request || request.staffId !== staffId) {
        throw new ApiError(404, "Service request not found or not assigned to you");
    }

    // Strict transition: OTP_PENDING -> COMPLETED
    if (request.status !== "OTP_PENDING") {
        throw new ApiError(409, `Cannot complete request. Request status is '${request.status}' but must be 'OTP_PENDING'`);
    }

    if (!request.otpCode) {
        throw new ApiError(400, "No active completion OTP found for this request. Please request a new OTP");
    }

    // Check OTP Expiration (5 minutes)
    const otpAgeInMs = Date.now() - new Date(request.updatedAt).getTime();
    if (otpAgeInMs > 5 * 60 * 1000) {
        // Rollback state back to IN_PROGRESS if expired
        await prisma.$transaction(async (tx) => {
            await updateRequestStatus(requestId, "IN_PROGRESS", {
                otpCode: null
            }, tx);
        });
        throw new ApiError(400, "OTP has expired. Please request a new completion OTP");
    }

    if (request.otpCode !== otp) {
        throw new ApiError(400, "Invalid OTP code");
    }

    const completedRequest = await prisma.$transaction(async (tx) => {
        return await updateRequestStatus(requestId, "COMPLETED", {
            otpCode: null, // Clear immediately on success
            completedAt: new Date(),
            otpVerifiedAt: new Date()
        }, tx);
    });

    await triggerNotificationHook(request.studentId, "STUDENT", "REQUEST_COMPLETED", `Your service request has been successfully completed: ${request.title}`);

    return completedRequest;
}

export async function getStaffProfile(staffId) {
    const staff = await getStaffProfileDetails(staffId);
    if (!staff) {
        throw new ApiError(404, "Staff profile not found");
    }

    const feedbackStats = await getStaffFeedbackStats(staffId);

    // Sanitize output (exclude passwordHash)
    const { passwordHash, ...sanitizedStaff } = staff;

    return {
        ...sanitizedStaff,
        averageRating: feedbackStats.averageRating,
        totalFeedbackCount: feedbackStats.feedbackCount
    };
}
