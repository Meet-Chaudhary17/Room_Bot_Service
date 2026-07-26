import dotenv from "dotenv";
dotenv.config();

import test from "node:test";
import assert from "node:assert";
import app from "../src/app.js";
import prisma from "../src/config/prisma.js";
import { generateToken } from "../src/utils/jwt.js";

const PORT = 5088;
const BASE_URL = `http://127.0.0.1:${PORT}/api/v1`;

let server;
let blockId;
let serviceTypeId;
let studentToken;
let studentId;
let staff1Id;
let staff2Id;
let request1Id;
let request2Id;

test.describe("Student Workflows & Auth Security Integration Tests", () => {

    test.before(async () => {
        await new Promise((resolve) => {
            server = app.listen(PORT, () => {
                resolve();
            });
        });

        // Clean database tables
        await prisma.feedback.deleteMany({});
        await prisma.complaint.deleteMany({});
        await prisma.serviceRequest.deleteMany({});
        await prisma.otpVerification.deleteMany({});
        await prisma.student.deleteMany({});
        await prisma.staff.deleteMany({});
        await prisma.block.deleteMany({});
        await prisma.serviceType.deleteMany({});

        // Create a Block
        const block = await prisma.block.create({
            data: { name: "Block A" }
        });
        blockId = block.id;

        // Create an active Service Type
        const serviceType = await prisma.serviceType.create({
            data: {
                name: "Cleaning Service",
                description: "Hostel room vacuum and wash"
            }
        });
        serviceTypeId = serviceType.id;

        // Register Student
        const studentRes = await prisma.student.create({
            data: {
                registrationNo: "22BCE1111",
                name: "Student Alpha",
                email: "alpha@vitstudent.ac.in",
                passwordHash: "dummyhash", // bcrypt not required for mock protect tests
                roomNumber: "A-101",
                gender: "MALE",
                blockId: blockId,
                isVerified: true // Already verified for testing workflows
            }
        });
        studentId = studentRes.id;

        // Register 2 Cleaning Staff Members in Block A
        const staff1 = await prisma.staff.create({
            data: {
                employeeId: "STAFF001",
                name: "Staff John",
                email: "john@roombot.com",
                passwordHash: "dummyhash",
                role: "CLEANING",
                blockId: blockId,
                isVerified: true,
                isActive: true
            }
        });
        staff1Id = staff1.id;

        const staff2 = await prisma.staff.create({
            data: {
                employeeId: "STAFF002",
                name: "Staff Mary",
                email: "mary@roombot.com",
                passwordHash: "dummyhash",
                role: "CLEANING",
                blockId: blockId,
                isVerified: true,
                isActive: true
            }
        });
        staff2Id = staff2.id;

        // Register a General/Warden Staff in Block A so complaints can be submitted
        await prisma.staff.create({
            data: {
                employeeId: "STAFF003",
                name: "Warden Dave",
                email: "dave@roombot.com",
                passwordHash: "dummyhash",
                role: "GENERAL",
                blockId: blockId,
                isVerified: true,
                isActive: true
            }
        });

        // Log in student by generating JWT directly (simulating successful login)
        studentToken = generateToken({ id: studentId, email: "alpha@vitstudent.ac.in", role: "STUDENT" });
    });

    test.after(async () => {
        // Clean database tables and close server
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

    test("1. Authorization Failure (Missing Token)", async () => {
        const res = await fetch(`${BASE_URL}/students/requests`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: "Vacuum Room",
                description: "Please vacuum room A-101",
                serviceTypeId: serviceTypeId
            })
        });
        const body = await res.json();
        assert.strictEqual(res.status, 401);
        assert.strictEqual(body.success, false);
        assert.match(body.message, /Authentication required/i);
    });

    test("2. Authorization Failure (Invalid Role)", async () => {
        const staffToken = generateToken({ id: staff1Id, email: "john@roombot.com", role: "STAFF" });

        const res = await fetch(`${BASE_URL}/students/requests`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${staffToken}`
            },
            body: JSON.stringify({
                title: "Vacuum Room",
                description: "Please vacuum room A-101",
                serviceTypeId: serviceTypeId
            })
        });
        const body = await res.json();
        assert.strictEqual(res.status, 403);
        assert.strictEqual(body.success, false);
        assert.match(body.message, /not authorized/i);
    });

    test("3. Staff Assignment (First Request - Tie Break)", async () => {
        const res = await fetch(`${BASE_URL}/students/requests`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${studentToken}`
            },
            body: JSON.stringify({
                title: "Vacuum Room A-101",
                description: "Please vacuum my room A-101",
                serviceTypeId: serviceTypeId,
                priority: 2
            })
        });
        const body = await res.json();
        assert.strictEqual(res.status, 201);
        assert.strictEqual(body.success, true);
        assert.ok(body.data.staffId === staff1Id || body.data.staffId === staff2Id);
        assert.strictEqual(body.data.status, "ASSIGNED");
        request1Id = body.data.id;
    });

    test("4. Staff Assignment (Second Request - Deterministic Workload Selection)", async () => {
        // Fetch Request 1 details to see who was assigned
        const req1 = await prisma.serviceRequest.findUnique({
            where: { id: request1Id }
        });
        const assignedStaffId = req1.staffId;
        const otherStaffId = assignedStaffId === staff1Id ? staff2Id : staff1Id;

        // Create Request 2: since the assigned staff member has workload 1,
        // it must deterministically assign the other staff member (workload 0)
        const res = await fetch(`${BASE_URL}/students/requests`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${studentToken}`
            },
            body: JSON.stringify({
                title: "Clean Window",
                description: "Clean window in room A-101",
                serviceTypeId: serviceTypeId
            })
        });
        const body = await res.json();
        assert.strictEqual(res.status, 201);
        assert.strictEqual(body.success, true);
        assert.strictEqual(body.data.staffId, otherStaffId); // Must be the idle staff member
        assert.strictEqual(body.data.status, "ASSIGNED");
        request2Id = body.data.id;
    });

    test("5. Pagination & Metadata Verification", async () => {
        // Insert 10 more requests to test paginated results (total 12 requests)
        for (let i = 1; i <= 10; i++) {
            await prisma.serviceRequest.create({
                data: {
                    title: `Test Request ${i}`,
                    description: `Description ${i}`,
                    status: "PENDING",
                    studentId: studentId,
                    serviceTypeId: serviceTypeId
                }
            });
        }

        // Fetch Page 1 (limit 5)
        const res1 = await fetch(`${BASE_URL}/students/requests?page=1&limit=5`, {
            headers: { "Authorization": `Bearer ${studentToken}` }
        });
        const body1 = await res1.json();
        assert.strictEqual(res1.status, 200);
        assert.strictEqual(body1.data.requests.length, 5);
        assert.strictEqual(body1.data.pagination.page, 1);
        assert.strictEqual(body1.data.pagination.limit, 5);
        assert.strictEqual(body1.data.pagination.totalItems, 12);
        assert.strictEqual(body1.data.pagination.totalPages, 3);
        assert.strictEqual(body1.data.pagination.hasNextPage, true);
        assert.strictEqual(body1.data.pagination.hasPreviousPage, false);

        // Fetch Page 3 (limit 5)
        const res2 = await fetch(`${BASE_URL}/students/requests?page=3&limit=5`, {
            headers: { "Authorization": `Bearer ${studentToken}` }
        });
        const body2 = await res2.json();
        assert.strictEqual(res2.status, 200);
        assert.strictEqual(body2.data.requests.length, 2); // 12 total, page 3 has remaining 2
        assert.strictEqual(body2.data.pagination.hasNextPage, false);
        assert.strictEqual(body2.data.pagination.hasPreviousPage, true);
    });

    test("6. Complaint Creation & Retrieval", async () => {
        const res1 = await fetch(`${BASE_URL}/students/complaints`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${studentToken}`
            },
            body: JSON.stringify({
                subject: "Water Outage",
                description: "No water supply in Block A bathrooms since morning."
            })
        });
        const body1 = await res1.json();
        assert.strictEqual(res1.status, 201);
        assert.strictEqual(body1.success, true);
        assert.strictEqual(body1.data.status, "OPEN");

        const res2 = await fetch(`${BASE_URL}/students/complaints`, {
            headers: { "Authorization": `Bearer ${studentToken}` }
        });
        const body2 = await res2.json();
        assert.strictEqual(res2.status, 200);
        assert.strictEqual(body2.data.length, 1);
        assert.strictEqual(body2.data[0].subject, "Water Outage");
    });

    test("6a. Request Creation Blocked when Category Staff is Missing", async () => {
        // Create an active Plumbing service type
        const serviceType = await prisma.serviceType.create({
            data: {
                name: "Plumbing Repair",
                description: "Fixing pipe leaks"
            }
        });

        const res = await fetch(`${BASE_URL}/students/requests`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${studentToken}`
            },
            body: JSON.stringify({
                title: "Pipe Leak",
                description: "Water leaking in room A-101",
                serviceTypeId: serviceType.id
            })
        });

        const body = await res.json();
        assert.strictEqual(res.status, 400);
        assert.strictEqual(body.success, false);
        assert.match(body.message, /No Plumber staff is currently available/);

        // Cleanup service type
        await prisma.serviceType.delete({ where: { id: serviceType.id } });
    });

    test("6b. Complaint Creation Blocked when Warden Staff is Inactive/Missing", async () => {
        // Find and deactivate the general staff (Warden Dave)
        const warden = await prisma.staff.findFirst({
            where: { role: "GENERAL" }
        });
        await prisma.staff.update({
            where: { id: warden.id },
            data: { isActive: false }
        });

        const res = await fetch(`${BASE_URL}/students/complaints`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${studentToken}`
            },
            body: JSON.stringify({
                subject: "WiFi Outage",
                description: "WiFi is down"
            })
        });

        const body = await res.json();
        assert.strictEqual(res.status, 400);
        assert.strictEqual(body.success, false);
        assert.match(body.message, /No Complaint\/Warden staff is currently available/);

        // Restore warden
        await prisma.staff.update({
            where: { id: warden.id },
            data: { isActive: true }
        });
    });

    test("7. Feedback Submission Restrictions (Status Constraint)", async () => {
        // Request 1 is ASSIGNED, not COMPLETED. Feedback should fail.
        const res = await fetch(`${BASE_URL}/students/requests/${request1Id}/feedback`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${studentToken}`
            },
            body: JSON.stringify({
                rating: 5,
                comment: "Excellent vaccuming!"
            })
        });
        const body = await res.json();
        assert.strictEqual(res.status, 400);
        assert.strictEqual(body.success, false);
        assert.match(body.message, /only be submitted for completed requests/i);
    });

    test("8. Feedback Submission (Success & Single-Use Enforcement)", async () => {
        // Manually complete Request 1
        await prisma.serviceRequest.update({
            where: { id: request1Id },
            data: { status: "COMPLETED" }
        });

        // Submit feedback successfully
        const res1 = await fetch(`${BASE_URL}/students/requests/${request1Id}/feedback`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${studentToken}`
            },
            body: JSON.stringify({
                rating: 5,
                comment: "Super clean vacuumer!"
            })
        });
        const body1 = await res1.json();
        assert.strictEqual(res1.status, 201);
        assert.strictEqual(body1.success, true);
        assert.strictEqual(body1.data.rating, 5);

        // Submit feedback again (Should Conflict)
        const res2 = await fetch(`${BASE_URL}/students/requests/${request1Id}/feedback`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${studentToken}`
            },
            body: JSON.stringify({
                rating: 4,
                comment: "Changed my mind, 4 stars."
            })
        });
        const body2 = await res2.json();
        assert.strictEqual(res2.status, 409);
        assert.strictEqual(body2.success, false);
        assert.match(body2.message, /already been submitted/i);
    });

    test("9. Feedback Submission Ownership Violation", async () => {
        // Register Student Beta in Block A
        const studentBeta = await prisma.student.create({
            data: {
                registrationNo: "22BCE2222",
                name: "Student Beta",
                email: "beta@vitstudent.ac.in",
                passwordHash: "dummyhash",
                roomNumber: "A-102",
                gender: "FEMALE",
                blockId: blockId,
                isVerified: true
            }
        });
        const betaToken = generateToken({ id: studentBeta.id, email: "beta@vitstudent.ac.in", role: "STUDENT" });

        // Manually complete Request 2 (owned by Student Alpha)
        await prisma.serviceRequest.update({
            where: { id: request2Id },
            data: { status: "COMPLETED" }
        });

        // Try to submit feedback on Request 2 from Student Beta
        const res = await fetch(`${BASE_URL}/students/requests/${request2Id}/feedback`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${betaToken}`
            },
            body: JSON.stringify({
                rating: 3,
                comment: "Sneaky feedback."
            })
        });
        const body = await res.json();
        assert.strictEqual(res.status, 403);
        assert.strictEqual(body.success, false);
        assert.match(body.message, /not authorized/i);
    });

});
