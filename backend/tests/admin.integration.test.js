import 'dotenv/config';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

process.env.NODE_ENV = 'test';
process.env.PORT = '5002';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://roombot:change_this_database_password@127.0.0.1:5432/roombot?schema=test';
process.env.JWT_SECRET = 'test-only-secret-that-is-at-least-thirty-two-characters';
process.env.JWT_EXPIRES_IN = '24h';
process.env.OTP_EXPIRY_MINUTES = '10';
process.env.CLIENT_URL = 'http://localhost:5173';

const { app } = await import('../src/app.js');
const { prisma } = await import('../src/config/prisma.js');

async function cleanDb() {
  const tableNames = ['feedback', 'service_request', 'otp_verification', 'audit_log', 'account_credentials', 'student', 'staff', 'administrator', 'hostel_block', 'service_category', 'complaint', 'complaint_category'];
  for (const tableName of tableNames) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`);
  }
}

async function seedRequired() {
  await prisma.serviceCategory.createMany({
    data: [
      { id: 1, categoryName: 'Cleaning', serviceRole: 'CLEANING' },
      { id: 2, categoryName: 'Electrical Maintenance', serviceRole: 'ELECTRICAL_MAINTENANCE' }
    ]
  });
  await prisma.complaintCategory.createMany({
    data: [
      { id: 1, categoryName: 'Electricity', description: 'Power cuts' },
      { id: 2, categoryName: 'Water Supply', description: 'Tap issue' }
    ]
  });
  await prisma.hostelBlock.create({
    data: { id: 1, blockName: 'A Block' }
  });
}

describe('Administrator Module Integration Tests', () => {
  let adminToken, studentToken, adminUser, studentUser, staffUser, testRequest, testComplaint;

  beforeAll(async () => {
    const execSync = (await import('child_process')).execSync;
    execSync('npx prisma db push --accept-data-loss', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
    });
  }, 30000);

  beforeEach(async () => {
    await cleanDb();
    await seedRequired();

    const passwordHash = await bcrypt.hash('Password123!', 12);

    // Create administrator
    adminUser = await prisma.administrator.create({
      data: {
        fullName: 'Admin User',
        username: 'Meetu_17',
        email: 'admin@roombot.local'
      }
    });

    await prisma.accountCredential.create({
      data: {
        userType: 'ADMINISTRATOR',
        userId: adminUser.id,
        email: 'admin@roombot.local',
        passwordHash,
        emailVerified: true
      }
    });

    // Create staff
    staffUser = await prisma.staff.create({
      data: {
        fullName: 'Rahul Kumar',
        email: 'rahul@roombot.local',
        serviceRole: 'CLEANING',
        blockId: 1,
        isActive: true
      }
    });

    // Create student
    studentUser = await prisma.student.create({
      data: {
        registrationNumber: 'REG123',
        fullName: 'Meet Chaudhary',
        email: 'meet@roombot.local',
        phoneNumber: '9876543210',
        roomNumber: 'A-203',
        blockId: 1
      }
    });

    // Tokens
    adminToken = jwt.sign({ userId: adminUser.id, role: 'ADMINISTRATOR', email: adminUser.email }, process.env.JWT_SECRET);
    studentToken = jwt.sign({ userId: studentUser.id, role: 'STUDENT', email: studentUser.email }, process.env.JWT_SECRET);

    // Request
    testRequest = await prisma.serviceRequest.create({
      data: {
        studentId: studentUser.id,
        categoryId: 1,
        assignedStaffId: staffUser.id,
        title: 'Room cleaning needed',
        description: 'Sweep and clean',
        roomNumber: 'A-203',
        requestStatus: 'ASSIGNED',
        assignedAt: new Date()
      }
    });

    // Complaint
    testComplaint = await prisma.complaint.create({
      data: {
        studentId: studentUser.id,
        categoryId: 1,
        title: 'Fan not working',
        description: 'Fan stops regularly',
        complaintStatus: 'SUBMITTED'
      }
    });
  });

  afterAll(async () => {
    await cleanDb();
    await prisma.$disconnect();
  });

  describe('Access Control', () => {
    it('returns 401 for unauthenticated requests', async () => {
      await request(app)
        .get('/api/v1/admin/dashboard')
        .expect(401);
    });

    it('returns 403 for non-admin requests', async () => {
      await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('allows access to administrators', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /admin/dashboard', () => {
    it('returns correct counts', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data).toMatchObject({
        totalStudents: 1,
        totalStaff: 1,
        activeRequests: 1,
        completedRequests: 0,
        activeComplaints: 1
      });
    });
  });

  describe('GET /admin/students', () => {
    it('returns registered students list', async () => {
      const response = await request(app)
        .get('/api/v1/admin/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.students.length).toBe(1);
      expect(response.body.data.students[0]).toMatchObject({
        name: 'Meet Chaudhary',
        block: { name: 'A Block' },
        status: 'Active'
      });
    });
  });

  describe('GET /admin/staff', () => {
    it('returns staff list with relations', async () => {
      const response = await request(app)
        .get('/api/v1/admin/staff')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.staff.length).toBe(1);
      expect(response.body.data.staff[0]).toMatchObject({
        name: 'Rahul Kumar',
        role: 'Cleaning',
        block: { name: 'A Block' },
        status: 'Active'
      });
    });
  });

  describe('PATCH /admin/students/:studentId/status', () => {
    it('blocks student and records audit log', async () => {
      await request(app)
        .patch(`/api/v1/admin/students/${studentUser.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Blocked' })
        .expect(200);

      const student = await prisma.student.findUnique({ where: { id: studentUser.id } });
      expect(student.isBlocked).toBe(true);

      const log = await prisma.auditLog.findFirst({ where: { action: 'BLOCK_STUDENT' } });
      expect(log).toBeTruthy();
      expect(log.targetRecordId).toBe(studentUser.id);
    });
  });

  describe('PATCH /admin/staff/:staffId/status', () => {
    it('blocks staff and records audit log', async () => {
      await request(app)
        .patch(`/api/v1/admin/staff/${staffUser.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Blocked' })
        .expect(200);

      const staff = await prisma.staff.findUnique({ where: { id: staffUser.id } });
      expect(staff.isActive).toBe(false);

      const log = await prisma.auditLog.findFirst({ where: { action: 'BLOCK_STAFF' } });
      expect(log).toBeTruthy();
    });
  });

  describe('GET /admin/service-requests', () => {
    it('returns service requests', async () => {
      const response = await request(app)
        .get('/api/v1/admin/service-requests')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].student).toBe('Meet Chaudhary');
      expect(response.body.data[0].status).toBe('Assigned');
    });
  });

  describe('GET /admin/complaints', () => {
    it('returns complaints list', async () => {
      const response = await request(app)
        .get('/api/v1/admin/complaints')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].student).toBe('Meet Chaudhary');
      expect(response.body.data[0].status).toBe('Submitted');
    });
  });

  describe('PATCH /admin/complaints/:complaintId/status', () => {
    it('resolves complaint and logs action', async () => {
      await request(app)
        .patch(`/api/v1/admin/complaints/${testComplaint.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Resolved', resolutionNotes: 'Fan capacitors replaced.' })
        .expect(200);

      const complaint = await prisma.complaint.findUnique({ where: { id: testComplaint.id } });
      expect(complaint.complaintStatus).toBe('RESOLVED');
      expect(complaint.resolutionNotes).toBe('Fan capacitors replaced.');
      expect(complaint.resolvedAt).toBeTruthy();

      const log = await prisma.auditLog.findFirst({ where: { action: 'UPDATE_COMPLAINT_STATUS' } });
      expect(log).toBeTruthy();
    });
  });

  describe('GET /admin/feedback', () => {
    it('returns feedback list', async () => {
      await prisma.feedback.create({
        data: {
          requestId: testRequest.id,
          studentId: studentUser.id,
          staffId: staffUser.id,
          rating: 5,
          comments: 'Perfect!'
        }
      });

      const response = await request(app)
        .get('/api/v1/admin/feedback')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].staffName).toBe('Rahul Kumar');
      expect(response.body.data[0].rating).toBe(5);
    });
  });

  describe('GET /admin/analytics', () => {
    it('returns operational report metrics', async () => {
      const response = await request(app)
        .get('/api/v1/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data).toMatchObject({
        totalStudents: 1,
        totalStaff: 1,
        totalRequests: 1,
        completedRequests: 0,
        cancelledRequests: 0,
        activeRequests: 1,
        totalComplaints: 1
      });
    });
  });

  describe('GET /admin/profile', () => {
    it('returns admin profile details', async () => {
      const response = await request(app)
        .get('/api/v1/admin/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data).toMatchObject({
        name: 'Admin User',
        username: 'Meetu_17',
        email: 'admin@roombot.local'
      });
    });
  });

  describe('GET /admin/audit-logs', () => {
    it('returns logs ordered by date desc', async () => {
      await request(app)
        .patch(`/api/v1/admin/students/${studentUser.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Blocked' });

      const response = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].action).toBe('BLOCK_STUDENT');
      expect(response.body.data[0].administrator).toBe('Admin User');
    });
  });
});
