import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';
import { StudentRepository } from '../repositories/student.repository.js';
import { allocationEngine } from './allocation-engine.service.js';

const repository = new StudentRepository(prisma);
export const studentService = {
  async profile(id) { const user = await repository.profile(id); if (!user) throw new AppError(404, 'STUDENT_NOT_FOUND', 'Student not found.'); return user; },
  updateProfile: (id, data) => repository.updateProfile(id, { ...(data.full_name !== undefined && { fullName: data.full_name }), ...(data.phone_number !== undefined && { phoneNumber: data.phone_number }), ...(data.room_number !== undefined && { roomNumber: data.room_number }) }),
  async createRequest(studentId, data) {
    return allocationEngine.createRequestFast(studentId, data);
  },
  listRequests: (id) => repository.requests(id),
  async cancelRequest(id, studentId) { const result = await repository.cancelRequest(id, studentId); if (!result.count) throw new AppError(409, 'REQUEST_NOT_CANCELLABLE', 'Only pending or assigned requests can be cancelled.'); },
  createComplaint: (studentId, data) => repository.createComplaint({ studentId, title: data.title, description: data.description, categoryId: data.category_id, priority: data.priority }),
  listComplaints: (id) => repository.complaints(id),
  async createFeedback(studentId, data) { const request = await repository.request(data.request_id, studentId); if (!request || request.requestStatus !== 'COMPLETED' || !request.assignedStaffId) throw new AppError(409, 'FEEDBACK_NOT_ELIGIBLE', 'Feedback is allowed only for completed assigned requests.'); if (request.feedback) throw new AppError(409, 'FEEDBACK_EXISTS', 'Feedback has already been submitted.'); return repository.createFeedback({ requestId: request.id, studentId, staffId: request.assignedStaffId, rating: data.rating, comments: data.comments }); },
  async dashboard(id) { return { profile: await this.profile(id), requestStats: await repository.stats(id), recentRequests: await repository.requests(id, {}) }; },
};
