import { studentService } from '../services/student.service.js';
import { asyncHandler } from '../utils/async-handler.js';
const id = (req) => Number(req.user.userId);
export const studentController = {
  dashboard: asyncHandler(async (req,res) => res.json({ success: true, data: await studentService.dashboard(id(req)) })),
  profile: asyncHandler(async (req,res) => res.json({ success: true, data: await studentService.profile(id(req)) })),
  updateProfile: asyncHandler(async (req,res) => res.json({ success: true, data: await studentService.updateProfile(id(req), req.body) })),
  createRequest: asyncHandler(async (req,res) => res.status(201).json({ success: true, data: await studentService.createRequest(id(req), req.body) })),
  requests: asyncHandler(async (req,res) => res.json({ success: true, data: await studentService.listRequests(id(req)) })),
  cancelRequest: asyncHandler(async (req,res) => { await studentService.cancelRequest(Number(req.params.requestId), id(req)); res.json({ success: true, message: 'Service request cancelled successfully.' }); }),
  createComplaint: asyncHandler(async (req,res) => res.status(201).json({ success: true, data: await studentService.createComplaint(id(req), req.body) })),
  complaints: asyncHandler(async (req,res) => res.json({ success: true, data: await studentService.listComplaints(id(req)) })),
  feedback: asyncHandler(async (req,res) => res.status(201).json({ success: true, data: await studentService.createFeedback(id(req), req.body) })),
};
