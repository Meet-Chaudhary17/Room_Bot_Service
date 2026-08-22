import { adminService } from '../services/admin.service.js';
import { asyncHandler } from '../utils/async-handler.js';

const getAdminId = (req) => Number(req.user.userId);
const getIpAddress = (req) => req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

export const adminController = {
  dashboard: asyncHandler(async (req, res) => {
    const data = await adminService.getDashboard();
    res.json({ success: true, data });
  }),

  students: asyncHandler(async (req, res) => {
    const { block, search, page, limit } = req.query;
    const data = await adminService.listStudents({
      block,
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined
    });
    res.json({ success: true, data });
  }),

  staff: asyncHandler(async (req, res) => {
    const { block, search, page, limit } = req.query;
    const data = await adminService.listStaff({
      block,
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined
    });
    res.json({ success: true, data });
  }),

  updateStudentStatus: asyncHandler(async (req, res) => {
    const studentId = Number(req.params.studentId);
    let isBlocked = req.body.isBlocked;
    if (isBlocked === undefined && req.body.status !== undefined) {
      isBlocked = req.body.status === 'Blocked';
    }
    const statusStr = isBlocked ? 'Blocked' : 'Active';
    await adminService.updateStudentStatus(studentId, statusStr, getAdminId(req), getIpAddress(req));
    res.json({ success: true, message: 'Student status updated successfully.' });
  }),

  updateStaffStatus: asyncHandler(async (req, res) => {
    const staffId = Number(req.params.staffId);
    let isActive = req.body.isActive;
    if (isActive === undefined && req.body.status !== undefined) {
      isActive = req.body.status === 'Active';
    }
    const statusStr = isActive ? 'Active' : 'Blocked';
    await adminService.updateStaffStatus(staffId, statusStr, getAdminId(req), getIpAddress(req));
    res.json({ success: true, message: 'Staff status updated successfully.' });
  }),

  requests: asyncHandler(async (req, res) => {
    const { status, block, serviceType, staffId, page, limit } = req.query;
    const data = await adminService.listServiceRequests({
      status,
      block,
      serviceType,
      staffId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined
    });
    res.json({ success: true, data });
  }),

  complaints: asyncHandler(async (req, res) => {
    const { status, category, block, page, limit } = req.query;
    const data = await adminService.listComplaints({
      status,
      category,
      block,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined
    });
    res.json({ success: true, data });
  }),

  resolveComplaint: asyncHandler(async (req, res) => {
    const complaintId = Number(req.params.complaintId);
    const { status, resolutionNotes } = req.body;
    await adminService.resolveComplaint(complaintId, status, resolutionNotes, getAdminId(req), getIpAddress(req));
    res.json({ success: true, message: 'Complaint resolved successfully.' });
  }),

  feedback: asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const data = await adminService.listFeedback({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined
    });
    res.json({ success: true, data });
  }),

  analytics: asyncHandler(async (req, res) => {
    const data = await adminService.getAnalytics();
    res.json({ success: true, data });
  }),

  profile: asyncHandler(async (req, res) => {
    const data = await adminService.getProfile(getAdminId(req));
    res.json({ success: true, data });
  }),

  auditLogs: asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const data = await adminService.listAuditLogs({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined
    });
    res.json({ success: true, data });
  })
};
