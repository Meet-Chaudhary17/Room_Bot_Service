import dotenv from "dotenv";
dotenv.config();

import test from "node:test";
import assert from "node:assert";
import app from "../src/app.js";
import prisma from "../src/config/prisma.js";
import { generateToken } from "../src/utils/jwt.js";

const PORT = 5090;
const BASE_URL = `http://127.0.0.1:${PORT}/api/v1`;

let server;
let adminId;
let adminToken;
let studentToken;
let studentId;
let staff1Id; // Cleaning, active, verified
let staff2Id; // Plumber, active, verified
let blockAId;
let serviceTypeCleaningId;
let requestId;
let complaintId;

test.describe("Admin Module Integration Tests", () => {

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
        await prisma.admin.deleteMany({});

        // Create Admin
        const admin = await prisma.admin.create({
            data: {
                username: "adminboss",
                email: "admin@roombot.com",
                passwordHash: "dummyhash"
            }
        });
        adminId = admin.id;
        adminToken = generateToken({ id: adminId, email: admin.email, role: "ADMIN" });

        // Create Block A
        const blockA = await prisma.block.create({
            data: { name: "Block A" }
        });
        blockAId = blockA.id;

        // Create ServiceType
        const serviceType = await prisma.serviceType.create({
            data: {
                name: "Cleaning Service",
                description: "Vaccum and wash"
            }
        });
        serviceTypeCleaningId = serviceType.id;

        // Create Student
        const student = await prisma.student.create({
            data: {
                registrationNo: "22BCE8888",
                name: "Student Student",
                email: "student@vitstudent.ac.in",
                passwordHash: "dummyhash",
                roomNumber: "A-303",
                gender: "MALE",
                blockId: blockAId,
                isVerified: true
            }
        });
        studentId = student.id;
        studentToken = generateToken({ id: studentId, email: student.email, role: "STUDENT" });

        // Create Staff 1 (Cleaning, active, verified)
        const staff1 = await prisma.staff.create({
            data: {
                employeeId: "CLEAN01",
                name: "Staff Cleaner",
                email: "cleaner@roombot.com",
                passwordHash: "dummyhash",
                role: "CLEANING",
                blockId: blockAId,
                isVerified: true,
                isActive: true
            }
        });
        staff1Id = staff1.id;

        // Create Staff 2 (Plumber, active, verified)
        const staff2 = await prisma.staff.create({
            data: {
                employeeId: "PLUMB01",
                name: "Staff Plumber",
                email: "plumber@roombot.com",
                passwordHash: "dummyhash",
                role: "PLUMBER",
                blockId: blockAId,
                isVerified: true,
                isActive: true
            }
        });
        staff2Id = staff2.id;
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
        await prisma.admin.deleteMany({});

        await prisma.$disconnect();
        server.close();
    });

    test("1. Unauthorized Role Access Check: Non-Admin access to admin dashboard", async () => {
        const res = await fetch(`${BASE_URL}/admin/dashboard`, {
            headers: { "Authorization": `Bearer ${studentToken}` }
        });
        const body = await res.json();
        assert.strictEqual(res.status, 403);
        assert.strictEqual(body.success, false);
        assert.match(body.message, /not authorized/i);
    });

    test("2. Admin Dashboard Stats Aggregation Verification", async () => {
        const res = await fetch(`${BASE_URL}/admin/dashboard`, {
            headers: { "Authorization": `Bearer ${adminToken}` }
        });
        const body = await res.json();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(body.success, true);
        assert.strictEqual(body.data.totalStudents, 1);
        assert.strictEqual(body.data.totalStaff, 2);
        assert.strictEqual(body.data.activeStaff, 2);
        assert.strictEqual(body.data.blockedStudents, 0);
        assert.strictEqual(body.data.pendingRequests, 0);
    });

    test("3. Duplicate Block Creation check: Reject duplicate names", async () => {
        const res = await fetch(`${BASE_URL}/admin/blocks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({ name: "Block A" })
        });
        const body = await res.json();
        assert.strictEqual(res.status, 409);
        assert.strictEqual(body.success, false);
        assert.match(body.message, /Block name already exists/i);
    });

    test("4. Block Deletion Dependency Guard: Prevent deleting Block A (active relations)", async () => {
        const res = await fetch(`${BASE_URL}/admin/blocks/${blockAId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${adminToken}` }
        });
        const body = await res.json();
        assert.strictEqual(res.status, 400);
        assert.strictEqual(body.success, false);
        assert.match(body.message, /Cannot delete block/i);
    });

    test("5. Delete Non-existent Block: Return 404", async () => {
        const res = await fetch(`${BASE_URL}/admin/blocks/nonexistentid`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${adminToken}` }
        });
        const body = await res.json();
        assert.strictEqual(res.status, 404);
    });

    test("6. Delete Block without dependencies: Success", async () => {
        const createRes = await prisma.block.create({
            data: { name: "Block Z" }
        });
        const deleteRes = await fetch(`${BASE_URL}/admin/blocks/${createRes.id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${adminToken}` }
        });
        assert.strictEqual(deleteRes.status, 200);
    });

    test("7. Duplicate Service Type Creation check: Reject duplicate names", async () => {
        const res = await fetch(`${BASE_URL}/admin/service-types`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                name: "cleaning service",
                description: "Another duplicate check"
            })
        });
        const body = await res.json();
        assert.strictEqual(res.status, 409);
        assert.strictEqual(body.success, false);
        assert.match(body.message, /already exists/i);
    });

    test("8. Student Blocking and Unblocking", async () => {
        // Block Student
        const resBlock = await fetch(`${BASE_URL}/admin/students/${studentId}/block`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({ isBlocked: true })
        });
        const bodyBlock = await resBlock.json();
        assert.strictEqual(resBlock.status, 200);
        assert.strictEqual(bodyBlock.data.isBlocked, true);

        // Verify Student cannot log in or make request while blocked
        const testRes = await fetch(`${BASE_URL}/students/requests`, {
            headers: { "Authorization": `Bearer ${studentToken}` }
        });
        assert.strictEqual(testRes.status, 403); // Blocked

        // Unblock Student
        const resUnblock = await fetch(`${BASE_URL}/admin/students/${studentId}/block`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({ isBlocked: false })
        });
        const bodyUnblock = await resUnblock.json();
        assert.strictEqual(resUnblock.status, 200);
        assert.strictEqual(bodyUnblock.data.isBlocked, false);
    });

    test("9. Staff Deactivation and Activation", async () => {
        // Deactivate Staff
        const resDeact = await fetch(`${BASE_URL}/admin/staff/${staff1Id}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({ isActive: false })
        });
        const bodyDeact = await resDeact.json();
        assert.strictEqual(resDeact.status, 200);
        assert.strictEqual(bodyDeact.data.isActive, false);

        // Reactivate Staff
        const resAct = await fetch(`${BASE_URL}/admin/staff/${staff1Id}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({ isActive: true })
        });
        const bodyAct = await resAct.json();
        assert.strictEqual(resAct.status, 200);
        assert.strictEqual(bodyAct.data.isActive, true);
    });

    test("10. Request Reassignment Guards: Invalid Reassignment (Role Mismatch)", async () => {
        // Create request (assigned to Staff 1 - cleaner)
        const reqRes = await fetch(`${BASE_URL}/students/requests`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${studentToken}`
            },
            body: JSON.stringify({
                title: "Vaccum Room A-303",
                description: "Please vaccum my room A-303",
                serviceTypeId: serviceTypeCleaningId
            })
        });
        const reqBody = await reqRes.json();
        assert.strictEqual(reqRes.status, 201);
        requestId = reqBody.data.id;

        // Try to reassign to Staff 2 (who is a Plumber, mismatch for Cleaning Service request)
        const reassignRes = await fetch(`${BASE_URL}/admin/requests/${requestId}/reassign`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({ staffId: staff2Id })
        });
        const reassignBody = await reassignRes.json();
        assert.strictEqual(reassignRes.status, 400);
        assert.match(reassignBody.message, /must have 'CLEANING'/i);
    });

    test("11. Request Reassignment Guards: Inactive Staff Rejection", async () => {
        // Deactivate Staff 1
        await prisma.staff.update({
            where: { id: staff1Id },
            data: { isActive: false }
        });

        // Try to reassign to Staff 1 (who is now inactive)
        const res = await fetch(`${BASE_URL}/admin/requests/${requestId}/reassign`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({ staffId: staff1Id })
        });
        const body = await res.json();
        assert.strictEqual(res.status, 400);
        assert.match(body.message, /inactive or unverified/i);

        // Reactivate Staff 1
        await prisma.staff.update({
            where: { id: staff1Id },
            data: { isActive: true }
        });
    });

    test("12. Successful Reassignment: Reset workflow status and timestamps", async () => {
        // Staff 1 starts work on request, transitions to IN_PROGRESS
        await prisma.serviceRequest.update({
            where: { id: requestId },
            data: {
                status: "IN_PROGRESS",
                startedAt: new Date(),
                otpCode: "123456"
            }
        });

        // Reassign to Staff 1 (resetting status)
        const res = await fetch(`${BASE_URL}/admin/requests/${requestId}/reassign`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({ staffId: staff1Id })
        });
        const body = await res.json();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(body.data.status, "ASSIGNED");
        assert.strictEqual(body.data.otpCode, null);
        assert.strictEqual(body.data.startedAt, null);
    });

    test("13. Complaint Resolution", async () => {
        // Create complaint
        const comp = await prisma.complaint.create({
            data: {
                subject: "Water Outage A",
                description: "Water shortage A",
                studentId: studentId,
                status: "OPEN"
            }
        });
        complaintId = comp.id;

        // Resolve complaint
        const res = await fetch(`${BASE_URL}/admin/complaints/${complaintId}/resolve`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${adminToken}` }
        });
        const body = await res.json();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(body.data.status, "RESOLVED");
    });

    test("14. Pagination and Search Filtering Edge Cases", async () => {
        // Search student by name segment
        const listRes = await fetch(`${BASE_URL}/admin/students?search=Student&limit=1&page=1`, {
            headers: { "Authorization": `Bearer ${adminToken}` }
        });
        const listBody = await listRes.json();
        assert.strictEqual(listRes.status, 200);
        assert.strictEqual(listBody.data.students.length, 1);
        assert.strictEqual(listBody.data.pagination.totalItems, 1);
        assert.strictEqual(listBody.data.pagination.totalPages, 1);
        assert.strictEqual(listBody.data.pagination.hasNextPage, false);
    });

});
