import { Router } from 'express';
import { healthController } from '../controllers/health.controller.js';
import { authController } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { studentRegistration, staffRegistration, credentials, adminCredentials, sendOtp, emailOtp } from '../validators/auth.validator.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authenticate.js';
import { studentController } from '../controllers/student.controller.js';
import { profileUpdate as studentProfileUpdate, serviceRequest, complaint, feedback } from '../validators/student.validator.js';
import { staffController } from '../controllers/staff.controller.js';
import { profileUpdate as staffProfileUpdate, statusUpdate as staffStatusUpdate, verifyOtp as staffVerifyOtp, generateOtp as staffGenerateOtp } from '../validators/staff.validator.js';
import { adminController } from '../controllers/admin.controller.js';
import { studentStatusUpdate as adminStudentStatus, staffStatusUpdate as adminStaffStatus, complaintResolve as adminComplaintResolve } from '../validators/admin.validator.js';

export const apiRouter = Router();

apiRouter.get('/health', healthController.getLiveness);
apiRouter.post('/auth/register/student', validate(studentRegistration), authController.registerStudent);
apiRouter.post('/auth/register/staff', validate(staffRegistration), authController.registerStaff);
apiRouter.post('/auth/login/student', validate(credentials), authController.loginStudent);
apiRouter.post('/auth/login/staff', validate(credentials), authController.loginStaff);
apiRouter.post('/auth/login/admin', validate(adminCredentials), authController.loginAdmin);
apiRouter.post('/auth/login', authController.loginUnified);
apiRouter.post('/auth/send-otp', validate(sendOtp), authController.sendOtp);
apiRouter.post('/auth/verify-otp', validate(emailOtp), authController.verifyOtp);
apiRouter.post('/auth/logout', authenticate, authController.logout);

const studentOnly = [authenticate, authorize('STUDENT')];
apiRouter.get('/students/dashboard', ...studentOnly, studentController.dashboard);
apiRouter.get('/students/profile', ...studentOnly, studentController.profile);
apiRouter.put('/students/profile', ...studentOnly, validate(studentProfileUpdate), studentController.updateProfile);
apiRouter.post('/students/service-requests', ...studentOnly, validate(serviceRequest), studentController.createRequest);
apiRouter.get('/students/service-requests', ...studentOnly, studentController.requests);
apiRouter.patch('/students/service-requests/:requestId/cancel', ...studentOnly, studentController.cancelRequest);
apiRouter.post('/students/complaints', ...studentOnly, validate(complaint), studentController.createComplaint);
apiRouter.get('/students/complaints', ...studentOnly, studentController.complaints);
apiRouter.post('/students/feedback', ...studentOnly, validate(feedback), studentController.feedback);

const staffOnly = [authenticate, authorize('STAFF')];
apiRouter.get('/staff/dashboard', ...staffOnly, staffController.dashboard);
apiRouter.get('/staff/service-requests', ...staffOnly, staffController.requests);
apiRouter.get('/staff/service-requests/:requestId', ...staffOnly, staffController.requestDetails);
apiRouter.patch('/staff/service-requests/:requestId/status', ...staffOnly, validate(staffStatusUpdate), staffController.updateStatus);
apiRouter.get('/staff/service-requests/:requestId/occupants', ...staffOnly, staffController.requestOccupants);
apiRouter.post('/staff/service-requests/:requestId/generate-otp', ...staffOnly, validate(staffGenerateOtp), staffController.generateOtp);
apiRouter.post('/staff/service-requests/:requestId/verify-otp', ...staffOnly, validate(staffVerifyOtp), staffController.verifyOtp);
apiRouter.get('/staff/history', ...staffOnly, staffController.history);
apiRouter.get('/staff/profile', ...staffOnly, staffController.profile);
apiRouter.put('/staff/profile', ...staffOnly, validate(staffProfileUpdate), staffController.updateProfile);

const adminOnly = [authenticate, authorize('ADMINISTRATOR')];
apiRouter.get('/admin/dashboard', ...adminOnly, adminController.dashboard);
apiRouter.get('/admin/students', ...adminOnly, adminController.students);
apiRouter.get('/admin/staff', ...adminOnly, adminController.staff);
apiRouter.patch('/admin/students/:studentId/status', ...adminOnly, validate(adminStudentStatus), adminController.updateStudentStatus);
apiRouter.patch('/admin/staff/:staffId/status', ...adminOnly, validate(adminStaffStatus), adminController.updateStaffStatus);
apiRouter.get('/admin/service-requests', ...adminOnly, adminController.requests);
apiRouter.get('/admin/complaints', ...adminOnly, adminController.complaints);
apiRouter.patch('/admin/complaints/:complaintId/status', ...adminOnly, validate(adminComplaintResolve), adminController.resolveComplaint);
apiRouter.get('/admin/feedback', ...adminOnly, adminController.feedback);
apiRouter.get('/admin/analytics', ...adminOnly, adminController.analytics);
apiRouter.get('/admin/profile', ...adminOnly, adminController.profile);
apiRouter.get('/admin/audit-logs', ...adminOnly, adminController.auditLogs);


