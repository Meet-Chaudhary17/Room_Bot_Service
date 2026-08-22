import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.DATABASE_URL = 'postgresql://roombot:change_this_database_password@127.0.0.1:5432/roombot?schema=test';
process.env.JWT_SECRET = 'test-only-secret-that-is-at-least-thirty-two-characters';
process.env.JWT_EXPIRES_IN = '24h';
process.env.OTP_EXPIRY_MINUTES = '10';
process.env.CLIENT_URL = 'http://localhost:5173';

const { app } = await import('../src/app.js');
const { prisma } = await import('../src/config/prisma.js');

async function cleanDb() {
  const tableNames = ['feedback', 'service_request', 'otp_verification', 'account_credentials', 'student', 'staff', 'administrator', 'hostel_block', 'service_category'];
  for (const tableName of tableNames) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`);
  }
}

async function seedRequired() {
  await prisma.serviceCategory.createMany({
    data: [
      { id: 1, categoryName: 'Cleaning', serviceRole: 'CLEANING' },
      { id: 2, categoryName: 'Electrical Maintenance', serviceRole: 'ELECTRICAL_MAINTENANCE' },
      { id: 3, categoryName: 'Plumbing', serviceRole: 'PLUMBING' }
    ]
  });
  await prisma.hostelBlock.create({
    data: { id: 1, blockName: 'A Block' }
  });
}

describe('Staff Module Integration Tests', () => {
  let studentToken, staffToken, staffUser, studentUser, testRequest;

  beforeAll(async () => {
    // Mock emailService.sendOtp to avoid SMTP errors during tests
    const { emailService } = await import('../src/services/email.service.js');
    vi.spyOn(emailService, 'sendOtp').mockImplementation(() => Promise.resolve());

    // Run migrations on the test schema to ensure schema exists
    const execSync = (await import('child_process')).execSync;
    execSync('npx prisma db push --accept-data-loss', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
    });
  });

  beforeEach(async () => {
    await cleanDb();
    await seedRequired();

    const passwordHash = await bcrypt.hash('Password123!', 12);

    // Create staff member
    staffUser = await prisma.staff.create({
      data: {
        fullName: 'John Maintenance',
        email: 'john@roombot.local',
        serviceRole: 'CLEANING',
        blockId: 1,
        isActive: true,
        phoneNumber: '1234567890'
      }
    });

    await prisma.accountCredential.create({
      data: {
        userType: 'STAFF',
        userId: staffUser.id,
        email: 'john@roombot.local',
        passwordHash,
        emailVerified: true
      }
    });

    // Create student
    studentUser = await prisma.student.create({
      data: {
        registrationNumber: 'REG123',
        fullName: 'Student Doe',
        email: 'student@roombot.local',
        phoneNumber: '0987654321',
        roomNumber: 'A-101',
        blockId: 1
      }
    });

    await prisma.accountCredential.create({
      data: {
        userType: 'STUDENT',
        userId: studentUser.id,
        email: 'student@roombot.local',
        passwordHash,
        emailVerified: true
      }
    });

    // Generate JWT tokens
    staffToken = jwt.sign({ userId: staffUser.id, role: 'STAFF', email: staffUser.email }, process.env.JWT_SECRET);
    studentToken = jwt.sign({ userId: studentUser.id, role: 'STUDENT', email: studentUser.email }, process.env.JWT_SECRET);

    // Create a service request and assign it to staff
    testRequest = await prisma.serviceRequest.create({
      data: {
        studentId: studentUser.id,
        categoryId: 1, // Cleaning
        assignedStaffId: staffUser.id,
        title: 'Clean room 101',
        description: 'Need cleanup after party',
        roomNumber: 'A-101',
        requestStatus: 'ASSIGNED',
        priority: 'NORMAL',
        assignedAt: new Date()
      }
    });
  });

  afterAll(async () => {
    await cleanDb();
    await prisma.$disconnect();
  });

  describe('Access Control', () => {
    it('returns 401 if request is unauthenticated', async () => {
      await request(app)
        .get('/api/v1/staff/dashboard')
        .expect(401);
    });

    it('returns 403 if user role is not STAFF', async () => {
      await request(app)
        .get('/api/v1/staff/dashboard')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('allows access to staff members with STAFF role', async () => {
      const response = await request(app)
        .get('/api/v1/staff/dashboard')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /staff/dashboard', () => {
    it('returns correct dashboard stats and recent requests', async () => {
      const response = await request(app)
        .get('/api/v1/staff/dashboard')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      expect(response.body.data).toMatchObject({
        assignedRequests: 1,
        pendingRequests: 1,
        completedToday: 0,
        averageRating: 0
      });
      expect(response.body.data.recentRequests.length).toBe(1);
      expect(response.body.data.recentRequests[0].requestId).toBe(testRequest.id);
    });
  });

  describe('GET /staff/service-requests', () => {
    it('returns list of pending requests assigned to the staff', async () => {
      const response = await request(app)
        .get('/api/v1/staff/service-requests')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].requestId).toBe(testRequest.id);
      expect(response.body.data[0].studentName).toBe(studentUser.fullName);
    });

    it('supports status filtering', async () => {
      const response = await request(app)
        .get('/api/v1/staff/service-requests?status=In Progress')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      expect(response.body.data.length).toBe(0);
    });
  });

  describe('GET /staff/service-requests/:requestId', () => {
    it('returns request details', async () => {
      const response = await request(app)
        .get(`/api/v1/staff/service-requests/${testRequest.id}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      expect(response.body.data.requestId).toBe(testRequest.id);
      expect(response.body.data.problemTitle).toBe(testRequest.title);
      expect(response.body.data.studentName).toBe(studentUser.fullName);
    });

    it('returns 404 if request is not assigned to the staff', async () => {
      const otherStaff = await prisma.staff.create({
        data: {
          fullName: 'Other Staff',
          email: 'other@roombot.local',
          serviceRole: 'PLUMBING',
          blockId: 1
        }
      });
      const otherToken = jwt.sign({ userId: otherStaff.id, role: 'STAFF', email: otherStaff.email }, process.env.JWT_SECRET);

      await request(app)
        .get(`/api/v1/staff/service-requests/${testRequest.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);
    });
  });

  describe('PATCH /staff/service-requests/:requestId/status', () => {
    it('transitions status from ASSIGNED to IN_PROGRESS', async () => {
      await request(app)
        .patch(`/api/v1/staff/service-requests/${testRequest.id}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: 'In Progress' })
        .expect(200);

      const updated = await prisma.serviceRequest.findUnique({ where: { id: testRequest.id } });
      expect(updated.requestStatus).toBe('IN_PROGRESS');
      expect(updated.startedAt).toBeTruthy();
    });

    it('returns 400 for invalid status transitions', async () => {
      await request(app)
        .patch(`/api/v1/staff/service-requests/${testRequest.id}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: 'Completed' })
        .expect(400);
    });
  });

  describe('Completion Verification Workflow (OTP)', () => {
    beforeEach(async () => {
      // Transition request to IN_PROGRESS first
      await prisma.serviceRequest.update({
        where: { id: testRequest.id },
        data: { requestStatus: 'IN_PROGRESS', startedAt: new Date() }
      });
    });

    it('generates an OTP and sends it to the student', async () => {
      await request(app)
        .post(`/api/v1/staff/service-requests/${testRequest.id}/generate-otp`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      const latestOtp = await prisma.otpVerification.findFirst({
        where: { userId: studentUser.id, userType: 'STUDENT', purpose: 'COMPLETION' }
      });

      expect(latestOtp).toBeTruthy();
      expect(latestOtp.otpCode.length).toBe(6);
      expect(latestOtp.verifiedAt).toBeNull();
    });

    it('verifies the OTP and completes the request', async () => {
      // Generate OTP first
      await request(app)
        .post(`/api/v1/staff/service-requests/${testRequest.id}/generate-otp`)
        .set('Authorization', `Bearer ${staffToken}`);

      const latestOtp = await prisma.otpVerification.findFirst({
        where: { userId: studentUser.id, userType: 'STUDENT', purpose: 'COMPLETION' }
      });

      // Verify OTP
      await request(app)
        .post(`/api/v1/staff/service-requests/${testRequest.id}/verify-otp`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ otp: latestOtp.otpCode })
        .expect(200);

      const updatedRequest = await prisma.serviceRequest.findUnique({ where: { id: testRequest.id } });
      expect(updatedRequest.requestStatus).toBe('COMPLETED');
      expect(updatedRequest.completedAt).toBeTruthy();

      const verifiedOtp = await prisma.otpVerification.findUnique({ where: { id: latestOtp.id } });
      expect(verifiedOtp.verifiedAt).toBeTruthy();
    });

    it('returns 400 for incorrect OTP and increments attempts', async () => {
      await request(app)
        .post(`/api/v1/staff/service-requests/${testRequest.id}/generate-otp`)
        .set('Authorization', `Bearer ${staffToken}`);

      await request(app)
        .post(`/api/v1/staff/service-requests/${testRequest.id}/verify-otp`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ otp: '000000' })
        .expect(400);

      const latestOtp = await prisma.otpVerification.findFirst({
        where: { userId: studentUser.id, userType: 'STUDENT', purpose: 'COMPLETION' }
      });
      expect(latestOtp.attempts).toBe(1);
    });

    it('manages the complete multi-occupant OTP verification workflow', async () => {
      // 1. Create a roommate in the exact same room and block (Block A, Room A-101)
      const roommateUser = await prisma.student.create({
        data: {
          registrationNumber: 'REG456',
          fullName: 'Roommate Doe',
          email: 'roommate@roombot.local',
          phoneNumber: '1112223333',
          roomNumber: 'A-101',
          blockId: 1
        }
      });

      // 2. Create another student in the same room but different block (Block 2, Room A-101)
      await prisma.hostelBlock.create({
        data: { id: 2, blockName: 'B Block' }
      });
      const wrongBlockUser = await prisma.student.create({
        data: {
          registrationNumber: 'REG789',
          fullName: 'Wrong Block User',
          email: 'wrongblock@roombot.local',
          phoneNumber: '4445556666',
          roomNumber: 'A-101',
          blockId: 2
        }
      });

      // 3. Retrieve list of occupants
      const occupantsResponse = await request(app)
        .get(`/api/v1/staff/service-requests/${testRequest.id}/occupants`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      // Should contain original requester and roommate, but NOT wrong block student
      const occupantIds = occupantsResponse.body.data.map(o => o.id);
      expect(occupantIds).toContain(studentUser.id);
      expect(occupantIds).toContain(roommateUser.id);
      expect(occupantIds).not.toContain(wrongBlockUser.id);

      // 4. Try generating OTP for wrong block student (should fail with 400)
      await request(app)
        .post(`/api/v1/staff/service-requests/${testRequest.id}/generate-otp`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ studentId: wrongBlockUser.id })
        .expect(400);

      // 5. Generate OTP for selected roommate
      await request(app)
        .post(`/api/v1/staff/service-requests/${testRequest.id}/generate-otp`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ studentId: roommateUser.id })
        .expect(200);

      const latestRoommateOtp = await prisma.otpVerification.findFirst({
        where: { userId: roommateUser.id, userType: 'STUDENT', purpose: 'COMPLETION' }
      });
      expect(latestRoommateOtp).toBeTruthy();

      // 6. Verify roommate OTP and complete request
      await request(app)
        .post(`/api/v1/staff/service-requests/${testRequest.id}/verify-otp`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ otp: latestRoommateOtp.otpCode, studentId: roommateUser.id })
        .expect(200);

      const updatedRequest = await prisma.serviceRequest.findUnique({ where: { id: testRequest.id } });
      expect(updatedRequest.requestStatus).toBe('COMPLETED');
    });
  });

  describe('GET /staff/history', () => {
    it('returns completed requests', async () => {
      // Complete the request
      await prisma.serviceRequest.update({
        where: { id: testRequest.id },
        data: { requestStatus: 'COMPLETED', completedAt: new Date() }
      });

      const response = await request(app)
        .get('/api/v1/staff/history')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].requestId).toBe(testRequest.id);
      expect(response.body.data[0].completedOn).toBeTruthy();
    });
  });

  describe('Profile Endpoints', () => {
    it('returns staff profile', async () => {
      const response = await request(app)
        .get('/api/v1/staff/profile')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      expect(response.body.data).toMatchObject({
        name: staffUser.fullName,
        email: staffUser.email,
        role: 'Cleaning',
        block: 'A Block',
        phoneNumber: '1234567890'
      });
    });

    it('updates staff profile', async () => {
      await request(app)
        .put('/api/v1/staff/profile')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ name: 'John Doe New', phoneNumber: '9999999999' })
        .expect(200);

      const updated = await prisma.staff.findUnique({ where: { id: staffUser.id } });
      expect(updated.fullName).toBe('John Doe New');
      expect(updated.phoneNumber).toBe('9999999999');
    });
  });
});
