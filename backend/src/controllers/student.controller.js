import {
    createRequest,
    getRequestHistory,
    createStudentComplaint,
    getStudentComplaintsHistory,
    submitRequestFeedback
} from "../services/student.service.js";

import {
    createRequestSchema,
    getRequestHistorySchema
} from "../validations/request.validation.js";

import { createComplaintSchema } from "../validations/complaint.validation.js";
import { submitFeedbackSchema } from "../validations/feedback.validation.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getUserNotifications } from "../services/notification.service.js";

export const createRequestController = asyncHandler(async (req, res) => {
    const data = createRequestSchema.parse(req.body);
    const request = await createRequest(req.user.id, req.user.blockId, data);

    res.status(201).json(
        new ApiResponse(201, request, "Service request created successfully")
    );
});

export const getRequestHistoryController = asyncHandler(async (req, res) => {
    const query = getRequestHistorySchema.parse(req.query);
    const result = await getRequestHistory(req.user.id, query);

    res.status(200).json(
        new ApiResponse(200, result, "Request history retrieved successfully")
    );
});

export const createComplaintController = asyncHandler(async (req, res) => {
    const data = createComplaintSchema.parse(req.body);
    const complaint = await createStudentComplaint(req.user.id, data);

    res.status(201).json(
        new ApiResponse(201, complaint, "Complaint submitted successfully")
    );
});

export const getComplaintsController = asyncHandler(async (req, res) => {
    const complaints = await getStudentComplaintsHistory(req.user.id);

    res.status(200).json(
        new ApiResponse(200, complaints, "Complaints history retrieved successfully")
    );
});

export const submitFeedbackController = asyncHandler(async (req, res) => {
    const data = submitFeedbackSchema.parse(req.body);
    const { id } = req.params;
    const feedback = await submitRequestFeedback(req.user.id, id, data);

    res.status(201).json(
        new ApiResponse(201, feedback, "Feedback submitted successfully")
    );
});

export const getNotificationsController = asyncHandler(async (req, res) => {
    const notifications = await getUserNotifications(req.user.id, "STUDENT");
    res.status(200).json(
        new ApiResponse(200, notifications, "Notifications history retrieved successfully")
    );
});
