import { staffService } from '../services/staff.service.js';
import { asyncHandler } from '../utils/async-handler.js';

const getStaffId = (req) => Number(req.user.userId);

export const staffController = {
  dashboard: asyncHandler(async (req, res) => {
    const data = await staffService.getDashboard(getStaffId(req));
    res.json({ success: true, data });
  }),

  requests: asyncHandler(async (req, res) => {
    const { status, priority, search, page, limit } = req.query;
    const filters = {
      status,
      priority,
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined
    };
    const data = await staffService.listAssignedRequests(getStaffId(req), filters);
    res.json({ success: true, data });
  }),

  requestDetails: asyncHandler(async (req, res) => {
    const requestId = Number(req.params.requestId);
    const data = await staffService.getRequestDetails(requestId, getStaffId(req));
    res.json({ success: true, data });
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const requestId = Number(req.params.requestId);
    await staffService.startWork(requestId, getStaffId(req));
    res.json({ success: true, message: 'Request status updated successfully.' });
  }),

  generateOtp: asyncHandler(async (req, res) => {
    const requestId = Number(req.params.requestId);
    const { studentId } = req.body;
    await staffService.generateCompletionOtp(requestId, getStaffId(req), studentId ? Number(studentId) : undefined);
    res.json({ success: true, message: 'Completion OTP generated successfully.' });
  }),

  verifyOtp: asyncHandler(async (req, res) => {
    const requestId = Number(req.params.requestId);
    const { otp, studentId } = req.body;
    await staffService.verifyCompletionOtp(requestId, getStaffId(req), studentId ? Number(studentId) : undefined, otp);
    res.json({ success: true, message: 'Service request completed successfully.' });
  }),

  requestOccupants: asyncHandler(async (req, res) => {
    const requestId = Number(req.params.requestId);
    const data = await staffService.getRequestOccupants(requestId, getStaffId(req));
    res.json({ success: true, data });
  }),

  history: asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const filters = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined
    };
    const data = await staffService.getHistory(getStaffId(req), filters);
    res.json({ success: true, data });
  }),

  profile: asyncHandler(async (req, res) => {
    const data = await staffService.getProfile(getStaffId(req));
    res.json({ success: true, data });
  }),

  updateProfile: asyncHandler(async (req, res) => {
    await staffService.updateProfile(getStaffId(req), req.body);
    res.json({ success: true, message: 'Profile updated successfully.' });
  })
};
