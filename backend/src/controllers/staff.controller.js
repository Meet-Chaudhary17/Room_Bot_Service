import {
    getDashboardSummary,
    getAssignedRequests,
    startRequestWork,
    triggerRequestCompletionOtp,
    verifyRequestCompletion,
    getStaffProfile
} from "../services/staff.service.js";

import {
    verifyCompletionSchema,
    getStaffRequestsQuerySchema
} from "../validations/staff.validation.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getUserNotifications } from "../services/notification.service.js";

export const getDashboard = asyncHandler(async (req, res) => {
    const summary = await getDashboardSummary(req.user.id);
    res.status(200).json(
        new ApiResponse(200, summary, "Staff dashboard summary retrieved successfully")
    );
});

export const getRequests = asyncHandler(async (req, res) => {
    const query = getStaffRequestsQuerySchema.parse(req.query);
    const result = await getAssignedRequests(req.user.id, query);
    res.status(200).json(
        new ApiResponse(200, result, "Assigned requests retrieved successfully")
    );
});

export const startWork = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const request = await startRequestWork(req.user.id, id);
    res.status(200).json(
        new ApiResponse(200, request, "Work started on request successfully")
    );
});

export const requestCompletion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const request = await triggerRequestCompletionOtp(req.user.id, id);
    res.status(200).json(
        new ApiResponse(200, request, "Completion OTP generated and sent to student email successfully")
    );
});

export const verifyCompletion = asyncHandler(async (req, res) => {
    const { otp } = verifyCompletionSchema.parse(req.body);
    const { id } = req.params;
    const request = await verifyRequestCompletion(req.user.id, id, otp);
    res.status(200).json(
        new ApiResponse(200, request, "OTP verified. Request completed successfully")
    );
});

export const getProfile = asyncHandler(async (req, res) => {
    const profile = await getStaffProfile(req.user.id);
    res.status(200).json(
        new ApiResponse(200, profile, "Staff profile details retrieved successfully")
    );
});

export const getNotificationsController = asyncHandler(async (req, res) => {
    const notifications = await getUserNotifications(req.user.id, "STAFF");
    res.status(200).json(
        new ApiResponse(200, notifications, "Notifications history retrieved successfully")
    );
});
