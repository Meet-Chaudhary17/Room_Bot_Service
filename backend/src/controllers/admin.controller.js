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
    const floor = req.body.floor !== undefined ? Number(req.body.floor) : undefined;
    await adminService.updateStaffStatus(staffId, statusStr, floor, getAdminId(req), getIpAddress(req));
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

  requestsForFrontend: asyncHandler(async (req, res) => {
    const { status, block, serviceType, staffId, search, page, limit } = req.query;
    const data = await adminService.listRequestsForAdmin({
      status,
      block,
      serviceType,
      staffId,
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined
    });
    res.json({ success: true, data });
  }),

  reassignRequest: asyncHandler(async (req, res) => {
    const requestId = Number(req.params.requestId);
    const staffId = Number(req.body.staffId);
    await adminService.reassignRequest(requestId, staffId);
    res.json({ success: true, message: 'Request reassigned successfully.' });
  }),

  blocks: asyncHandler(async (req, res) => {
    const blocks = await adminService.listBlocks();
    res.json({ success: true, data: { blocks } });
  }),

  createBlock: asyncHandler(async (req, res) => {
    const block = await adminService.createBlock(req.body);
    res.status(201).json({ success: true, message: 'Block created successfully.', data: { block } });
  }),

  deleteBlock: asyncHandler(async (req, res) => {
    const blockId = Number(req.params.blockId);
    await adminService.deleteBlock(blockId);
    res.json({ success: true, message: 'Block deleted successfully.' });
  }),

  serviceTypes: asyncHandler(async (req, res) => {
    const serviceTypes = await adminService.listServiceTypes();
    res.json({ success: true, data: { serviceTypes } });
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
