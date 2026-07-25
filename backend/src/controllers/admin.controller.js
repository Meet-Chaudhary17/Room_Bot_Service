import {
    getDashboardStats,
    getStudents,
    toggleStudentBlock,
    getStaff,
    toggleStaffActive,
    getBlocks,
    createNewBlock,
    removeBlock,
    getServiceTypes,
    createNewServiceType,
    toggleServiceType,
    getRequests,
    reassignStaff,
    getComplaints,
    resolveComplaint,
    getFeedbacks
} from "../services/admin.service.js";

import {
    createBlockSchema,
    createServiceTypeSchema,
    toggleBlockStatusSchema,
    toggleActiveStatusSchema,
    reassignRequestSchema,
    queryPaginationSchema
} from "../validations/admin.validation.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getDashboard = asyncHandler(async (req, res) => {
    const stats = await getDashboardStats();
    res.status(200).json(
        new ApiResponse(200, stats, "Admin dashboard statistics retrieved successfully")
    );
});

export const getStudentsList = asyncHandler(async (req, res) => {
    const query = queryPaginationSchema.parse(req.query);
    const result = await getStudents(query);
    res.status(200).json(
        new ApiResponse(200, result, "Student list retrieved successfully")
    );
});

export const blockStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isBlocked } = toggleBlockStatusSchema.parse(req.body);
    const result = await toggleStudentBlock(id, isBlocked, req.user.id);
    res.status(200).json(
        new ApiResponse(200, result, `Student account has been ${isBlocked ? "blocked" : "unblocked"} successfully`)
    );
});

export const getStaffList = asyncHandler(async (req, res) => {
    const query = queryPaginationSchema.parse(req.query);
    const result = await getStaff(query);
    res.status(200).json(
        new ApiResponse(200, result, "Staff list retrieved successfully")
    );
});

export const changeStaffStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isActive } = toggleActiveStatusSchema.parse(req.body);
    const result = await toggleStaffActive(id, isActive, req.user.id);
    res.status(200).json(
        new ApiResponse(200, result, `Staff account has been ${isActive ? "activated" : "deactivated"} successfully`)
    );
});

export const getBlocksList = asyncHandler(async (req, res) => {
    const query = queryPaginationSchema.parse(req.query);
    const result = await getBlocks(query);
    res.status(200).json(
        new ApiResponse(200, result, "Blocks list retrieved successfully")
    );
});

export const createBlock = asyncHandler(async (req, res) => {
    const { name } = createBlockSchema.parse(req.body);
    const block = await createNewBlock(name, req.user.id);
    res.status(201).json(
        new ApiResponse(201, block, "Hostel block created successfully")
    );
});

export const deleteBlock = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await removeBlock(id, req.user.id);
    res.status(200).json(
        new ApiResponse(200, null, "Hostel block deleted successfully")
    );
});

export const getServiceTypesList = asyncHandler(async (req, res) => {
    const query = queryPaginationSchema.parse(req.query);
    const result = await getServiceTypes(query);
    res.status(200).json(
        new ApiResponse(200, result, "Service types list retrieved successfully")
    );
});

export const createServiceType = asyncHandler(async (req, res) => {
    const { name, description } = createServiceTypeSchema.parse(req.body);
    const serviceType = await createNewServiceType(name, description, req.user.id);
    res.status(201).json(
        new ApiResponse(201, serviceType, "Service type category created successfully")
    );
});

export const toggleServiceTypeStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isActive } = toggleActiveStatusSchema.parse(req.body);
    const result = await toggleServiceType(id, isActive, req.user.id);
    res.status(200).json(
        new ApiResponse(200, result, `Service type has been ${isActive ? "activated" : "deactivated"} successfully`)
    );
});

export const getRequestsList = asyncHandler(async (req, res) => {
    const query = queryPaginationSchema.parse(req.query);
    const result = await getRequests(query);
    res.status(200).json(
        new ApiResponse(200, result, "Service requests list retrieved successfully")
    );
});

export const reassignRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { staffId } = reassignRequestSchema.parse(req.body);
    const request = await reassignStaff(id, staffId, req.user.id);
    res.status(200).json(
        new ApiResponse(200, request, "Service request reassigned successfully")
    );
});

export const getComplaintsList = asyncHandler(async (req, res) => {
    const query = queryPaginationSchema.parse(req.query);
    const result = await getComplaints(query);
    res.status(200).json(
        new ApiResponse(200, result, "Complaints list retrieved successfully")
    );
});

export const resolveStudentComplaint = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await resolveComplaint(id, req.user.id);
    res.status(200).json(
        new ApiResponse(200, result, "Complaint marked as RESOLVED successfully")
    );
});

export const getFeedbacksList = asyncHandler(async (req, res) => {
    const query = queryPaginationSchema.parse(req.query);
    const result = await getFeedbacks(query);
    res.status(200).json(
        new ApiResponse(200, result, "Feedbacks overview list retrieved successfully")
    );
});
