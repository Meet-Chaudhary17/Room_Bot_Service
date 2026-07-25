import dotenv from "dotenv";
dotenv.config();

import test from "node:test";
import assert from "node:assert";
import app from "../src/app.js";
import prisma from "../src/config/prisma.js";
import { generateToken } from "../src/utils/jwt.js";

const PORT = 5089;
const BASE_URL = `http://127.0.0.1:${PORT}/api/v1`;

let server;
let blockId;
let serviceTypeId;
let studentToken;
let studentId;
let staff1Token;
let staff1Id;
let staff2Token;
let staff2Id;
let requestId;

test.describe("Staff Workflows Integration Tests", () => {

    test.before(async () => {
        // Start test server
        await new Promise((resolve) => {
            server = app.listen(PORT, () => {
                resolve();
            });
        });

        // Clean tables
        await prisma.feedback.deleteMany({});
        await prisma.complaint.deleteMany({});
        await prisma.serviceRequest.deleteMany({});
        await prisma.student.deleteMany({});
        await prisma.staff.deleteMany({});
        await prisma.block.deleteMany({});
        await prisma.serviceType.deleteMany({});

        // Create Block
        const block = await prisma.block.create({
            data: { name: "Block B" }
        });
        blockId = block.id;

        // Create ServiceType
        const serviceType = await prisma.serviceType.create({
            data: {
                name: "Plumbing Service",
                description: "Fix tap leaks and pipes"
            }
        });
        serviceTypeId = serviceType.id;

        // Create Student
        const student = await prisma.student.create({
            data: {
                registrationNo: "22BCE9999",
                name: "Student Omega",
                email: "omega@vitstudent.ac.in",
                passwordHash: "dummyhash",
                roomNumber: "B-202",
                gender: "FEMALE",
                blockId: blockId,
                isVerified: true
            }
        });
        studentId = student.id;
        studentToken = generateToken({ id: studentId, email: student.email, role: "STUDENT" });

        // Create Staff 1 (Plumber)
        const staff1 = await prisma.staff.create({
            data: {
                employeeId: "PLUMBER01",
                name: "Plumber Bob",
                email: "bob@roombot.com",
                passwordHash: "dummyhash",
                role: "PLUMBER",
                blockId: blockId,
                isVerified: true,
                isActive: true
            }
        });
        staff1Id = staff1.id;
        staff1Token = generateToken({ id: staff1Id, email: staff1.email, role: "STAFF" });

        // Create Staff 2 (Plumber)
        const staff2 = await prisma.staff.create({
            data: {
                employeeId: "PLUMBER02",
                name: "Plumber Alice",
                email: "alice@roombot.com",
                passwordHash: "dummyhash",
                role: "PLUMBER",
                blockId: blockId,
                isVerified: true,
                isActive: true
            }
        });
        staff2Id = staff2.id;
        staff2Token = generateToken({ id: staff2Id, email: staff2.email, role: "STAFF" });
    });

    test.after(async () => {
        // Clean tables and stop server
        await prisma.feedback.deleteMany({});
        await prisma.complaint.deleteMany({});
        await prisma.serviceRequest.deleteMany({});
        await prisma.student.deleteMany({});
        await prisma.staff.deleteMany({});
        await prisma.block.deleteMany({});
        await prisma.serviceType.deleteMany({});

        await prisma.$disconnect();
        server.close();
    });

    test("1. Pre-requisite: Create Service Request (Assigned to Staff 1)", async () => {
        const res = await fetch(`${BASE_URL}/students/requests`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${studentToken}`
            },
            body: JSON.stringify({
                title: "Leaking Pipe in Bath B",
                description: "The tap leaks constantly.",
                serviceTypeId: serviceTypeId
            })
        });
        const body = await res.json();
        assert.strictEqual(res.status, 201);
        assert.strictEqual(body.success, true);
        assert.strictEqual(body.data.status, "ASSIGNED");
        requestId = body.data.id;
        // Verify it was assigned to one of the Plumbers
        assert.ok(body.data.staffId === staff1Id || body.data.staffId === staff2Id);
        
        // Force assignment to staff1 for consistent tests
        if (body.data.staffId !== staff1Id) {
            await prisma.serviceRequest.update({
                where: { id: requestId },
                data: { staffId: staff1Id }
            });
        }
    });

    test("2. Invalid State Transition: Trigger completion directly from ASSIGNED", async () => {
        const res = await fetch(`${BASE_URL}/staff/requests/${requestId}/request-completion`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${staff1Token}` }
        });
        const body = await res.json();
        assert.strictEqual(res.status, 409);
        assert.strictEqual(body.success, false);
        assert.match(body.message, /must be 'IN_PROGRESS'/i);
    });

    test("3. Unauthorized Access: Staff 2 attempts to start Staff 1's work", async () => {
        const res = await fetch(`${BASE_URL}/staff/requests/${requestId}/start`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${staff2Token}` }
        });
        const body = await res.json();
        assert.strictEqual(res.status, 404);
        assert.strictEqual(body.success, false);
        assert.match(body.message, /not found or not assigned/i);
    });

    test("4. Start Work: Staff 1 transitions status ASSIGNED -> IN_PROGRESS", async () => {
        const res = await fetch(`${BASE_URL}/staff/requests/${requestId}/start`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${staff1Token}` }
        });
        const body = await res.json();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(body.success, true);
        assert.strictEqual(body.data.status, "IN_PROGRESS");
        assert.ok(body.data.startedAt !== null);
    });

    test("5. Re-trigger Start Work: Expect Conflict 409", async () => {
        const res = await fetch(`${BASE_URL}/staff/requests/${requestId}/start`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${staff1Token}` }
        });
        const body = await res.json();
        assert.strictEqual(res.status, 409);
        assert.strictEqual(body.success, false);
        assert.match(body.message, /must be 'ASSIGNED'/i);
    });

    test("6. Request Completion: Transitions IN_PROGRESS -> OTP_PENDING & dispatches OTP", async () => {
        const res = await fetch(`${BASE_URL}/staff/requests/${requestId}/request-completion`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${staff1Token}` }
        });
        const body = await res.json();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(body.success, true);
        assert.strictEqual(body.data.status, "OTP_PENDING");
        assert.ok(body.data.otpCode !== null);
    });

    test("7. OTP Expiration: Invalidation after 10 minutes", async () => {
        // Fetch current OTP code
        const reqBefore = await prisma.serviceRequest.findUnique({
            where: { id: requestId }
        });
        const correctOtp = reqBefore.otpCode;

        // Manually manipulate updatedAt to be 11 minutes ago (expiring the OTP)
        await prisma.serviceRequest.update({
            where: { id: requestId },
            data: {
                updatedAt: new Date(Date.now() - 11 * 60 * 1000)
            }
        });

        // Try to verify correct OTP
        const res = await fetch(`${BASE_URL}/staff/requests/${requestId}/verify-completion`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${staff1Token}`
            },
            body: JSON.stringify({ otp: correctOtp })
        });
        const body = await res.json();
        assert.strictEqual(res.status, 400);
        assert.strictEqual(body.success, false);
        assert.match(body.message, /expired/i);

        // Verify status rolled back to IN_PROGRESS and otpCode cleared
        const reqAfter = await prisma.serviceRequest.findUnique({
            where: { id: requestId }
        });
        assert.strictEqual(reqAfter.status, "IN_PROGRESS");
        assert.strictEqual(reqAfter.otpCode, null);
    });

    test("8. Complete Work: Verify Completion OTP successfully", async () => {
        // Trigger completion again
        const triggerRes = await fetch(`${BASE_URL}/staff/requests/${requestId}/request-completion`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${staff1Token}` }
        });
        const triggerBody = await triggerRes.json();
        assert.strictEqual(triggerRes.status, 200);
        
        // Fetch new OTP
        const reqInfo = await prisma.serviceRequest.findUnique({
            where: { id: requestId }
        });
        const newOtp = reqInfo.otpCode;

        // Try verification with wrong OTP
        const wrongRes = await fetch(`${BASE_URL}/staff/requests/${requestId}/verify-completion`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${staff1Token}`
            },
            body: JSON.stringify({ otp: "000000" })
        });
        assert.strictEqual(wrongRes.status, 400);

        // Verify with correct OTP
        const correctRes = await fetch(`${BASE_URL}/staff/requests/${requestId}/verify-completion`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${staff1Token}`
            },
            body: JSON.stringify({ otp: newOtp })
        });
        const correctBody = await correctRes.json();
        assert.strictEqual(correctRes.status, 200);
        assert.strictEqual(correctBody.success, true);
        assert.strictEqual(correctBody.data.status, "COMPLETED");
        assert.strictEqual(correctBody.data.otpCode, null); // Wiped on success
        assert.ok(correctBody.data.completedAt !== null);
        assert.ok(correctBody.data.otpVerifiedAt !== null);
    });

    test("9. Dashboard & Profile Rating Aggregation", async () => {
        // Add a completed feedback rating = 5
        await prisma.feedback.create({
            data: {
                rating: 5,
                comment: "BOB fixed it instantly!",
                studentId: studentId,
                staffId: staff1Id,
                requestId: requestId
            }
        });

        // Add a second COMPLETED request with a 3-star rating
        const request2 = await prisma.serviceRequest.create({
            data: {
                title: "Leaking Tap 2",
                description: "Second leak",
                status: "COMPLETED",
                studentId: studentId,
                staffId: staff1Id,
                serviceTypeId: serviceTypeId,
                completedAt: new Date()
            }
        });
        await prisma.feedback.create({
            data: {
                rating: 3,
                comment: "Took a bit of time",
                studentId: studentId,
                staffId: staff1Id,
                requestId: request2.id
            }
        });

        // Fetch dashboard stats
        const dbRes = await fetch(`${BASE_URL}/staff/dashboard`, {
            headers: { "Authorization": `Bearer ${staff1Token}` }
        });
        const dbBody = await dbRes.json();
        assert.strictEqual(dbRes.status, 200);
        assert.strictEqual(dbBody.data.completed, 2);
        assert.strictEqual(dbBody.data.averageRating, 4.0); // (5 + 3) / 2
        assert.strictEqual(dbBody.data.totalFeedbackCount, 2);

        // Fetch staff profile
        const profRes = await fetch(`${BASE_URL}/staff/profile`, {
            headers: { "Authorization": `Bearer ${staff1Token}` }
        });
        const profBody = await profRes.json();
        assert.strictEqual(profRes.status, 200);
        assert.strictEqual(profBody.data.employeeId, "PLUMBER01");
        assert.strictEqual(profBody.data.averageRating, 4.0);
        assert.strictEqual(profBody.data.totalFeedbackCount, 2);
        assert.strictEqual(profBody.data.passwordHash, undefined); // Ensure passwordHash is sanitized out
    });

    test("10. Pagination and Query List Filters", async () => {
        const listRes = await fetch(`${BASE_URL}/staff/requests?status=COMPLETED&limit=1&page=1`, {
            headers: { "Authorization": `Bearer ${staff1Token}` }
        });
        const listBody = await listRes.json();
        assert.strictEqual(listRes.status, 200);
        assert.strictEqual(listBody.data.requests.length, 1);
        assert.strictEqual(listBody.data.pagination.totalItems, 2);
        assert.strictEqual(listBody.data.pagination.totalPages, 2);
        assert.strictEqual(listBody.data.pagination.hasNextPage, true);
    });

});
