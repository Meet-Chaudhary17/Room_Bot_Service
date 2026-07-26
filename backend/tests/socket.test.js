import dotenv from "dotenv";
dotenv.config();

import test from "node:test";
import assert from "node:assert";
import http from "http";
import { io } from "socket.io-client";
import app from "../src/app.js";
import prisma from "../src/config/prisma.js";
import { initSocketServer, getIO } from "../src/config/socket.js";
import { generateToken } from "../src/utils/jwt.js";

// Add global handlers to intercept any asynchronous error that would trigger test runner serialization crash
process.on("uncaughtException", (err) => {
    console.error("🔥 GLOBAL UNCAUGHT EXCEPTION IN TEST RUNNER:", err.message, err.stack);
    process.exit(1);
});
process.on("unhandledRejection", (reason) => {
    console.error("🔥 GLOBAL UNHANDLED REJECTION IN TEST RUNNER:", reason);
    if (reason && reason.stack) {
        console.error(reason.stack);
    }
    process.exit(1);
});

const PORT = 5095;
const BASE_URL = `http://127.0.0.1:${PORT}/api/v1`;

let server;
let blockId;
let serviceTypeId;
let studentToken;
let studentId;
let staffToken;
let staffId;

function wrapTest(fn) {
    return async () => {
        try {
            await fn();
        } catch (err) {
            console.error("❌ TEST FAILURE DETAILS:", err);
            // Throw a clean, serializable Error with stack
            const cleanErr = new Error(err.message || String(err));
            cleanErr.stack = err.stack;
            throw cleanErr;
        }
    };
}

test.describe("Real-Time & WebSockets Integration Tests", () => {

    test.before(async () => {
        // Start HTTP Server and attach Socket.IO
        server = http.createServer(app);
        initSocketServer(server);
        await new Promise((resolve) => {
            server.listen(PORT, () => {
                resolve();
            });
        });

        // Clean tables
        await prisma.feedback.deleteMany({});
        await prisma.complaint.deleteMany({});
        await prisma.serviceRequest.deleteMany({});
        await prisma.otpVerification.deleteMany({});
        await prisma.student.deleteMany({});
        await prisma.staff.deleteMany({});
        await prisma.block.deleteMany({});
        await prisma.serviceType.deleteMany({});

        // Create Block
        const block = await prisma.block.create({
            data: { name: "Block S" }
        });
        blockId = block.id;

        // Create ServiceType
        const serviceType = await prisma.serviceType.create({
            data: {
                name: "Cleaning Service",
                description: "Clean the room"
            }
        });
        serviceTypeId = serviceType.id;

        // Create Student
        const student = await prisma.student.create({
            data: {
                registrationNo: "22BCE7777",
                name: "Student Realtime",
                email: "realtime@vitstudent.ac.in",
                passwordHash: "dummyhash",
                roomNumber: "S-505",
                gender: "MALE",
                blockId: blockId,
                isVerified: true
            }
        });
        studentId = student.id;
        studentToken = generateToken({ id: studentId, email: student.email, role: "STUDENT" });

        // Create Staff
        const staff = await prisma.staff.create({
            data: {
                employeeId: "CLEAN99",
                name: "Staff Realtime",
                email: "realtime_cleaner@roombot.com",
                passwordHash: "dummyhash",
                role: "CLEANING",
                blockId: blockId,
                isVerified: true,
                isActive: true
            }
        });
        staffId = staff.id;
        staffToken = generateToken({ id: staffId, email: staff.email, role: "STAFF" });
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

        const ioInstance = getIO();
        if (ioInstance) {
            ioInstance.close();
        }

        await prisma.$disconnect();
        await new Promise((resolve) => server.close(resolve));
    });

    test("1. Authentication: Connection reject on invalid token", wrapTest(async () => {
        const clientSocket = io(`http://127.0.0.1:${PORT}`, {
            auth: { token: "invalidtoken" },
            forceNew: true,
            transports: ["websocket"]
        });

        const error = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("Timeout waiting for connect_error")), 2000);
            clientSocket.on("connect_error", (err) => {
                clearTimeout(timeout);
                resolve(err);
            });
        });

        assert.strictEqual(error.message, "Invalid or expired session token");
        clientSocket.close();
    }));

    test("2. Authentication: Connection success on correct token", wrapTest(async () => {
        const clientSocket = io(`http://127.0.0.1:${PORT}`, {
            auth: { token: studentToken },
            forceNew: true,
            transports: ["websocket"]
        });

        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("Timeout waiting for connect")), 2000);
            clientSocket.on("connect", () => {
                clearTimeout(timeout);
                resolve();
            });
            clientSocket.on("connect_error", (err) => {
                clearTimeout(timeout);
                reject(err);
            });
        });

        assert.strictEqual(clientSocket.connected, true);
        clientSocket.close();
    }));

    test("3. Real-time Notification: Receive REQUEST_CREATED update on request creation", wrapTest(async () => {
        // Connect Student Socket
        const studentSocket = io(`http://127.0.0.1:${PORT}`, {
            auth: { token: studentToken },
            forceNew: true,
            transports: ["websocket"]
        });

        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("Timeout waiting for studentSocket connect")), 2000);
            studentSocket.on("connect", () => {
                clearTimeout(timeout);
                resolve();
            });
            studentSocket.on("connect_error", (err) => {
                clearTimeout(timeout);
                reject(err);
            });
        });

        // Setup notification event listener promise
        const notificationPromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("Timeout waiting for notification")), 4000);
            studentSocket.on("notification", (data) => {
                clearTimeout(timeout);
                resolve(data);
            });
        });

        // Trigger request creation via HTTP POST
        const res = await fetch(`${BASE_URL}/students/requests`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${studentToken}`
            },
            body: JSON.stringify({
                title: "Realtime Vacuum Request",
                description: "Room needs vacuuming now.",
                serviceTypeId: serviceTypeId
            })
        });
        assert.strictEqual(res.status, 201);

        // Await notification event
        const notification = await notificationPromise;
        assert.strictEqual(notification.title, "REQUEST_CREATED");
        assert.match(notification.message, /created successfully/i);

        studentSocket.close();
    }));

    test("4. Real-time Notification: Receive ASSIGNED update on staff socket", wrapTest(async () => {
        // Connect Staff Socket
        const staffSocket = io(`http://127.0.0.1:${PORT}`, {
            auth: { token: staffToken },
            forceNew: true,
            transports: ["websocket"]
        });

        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("Timeout waiting for staffSocket connect")), 2000);
            staffSocket.on("connect", () => {
                clearTimeout(timeout);
                resolve();
            });
            staffSocket.on("connect_error", (err) => {
                clearTimeout(timeout);
                reject(err);
            });
        });

        const staffNotificationPromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("Timeout waiting for staff notification")), 4000);
            staffSocket.on("notification", (data) => {
                clearTimeout(timeout);
                resolve(data);
            });
        });

        // Student creates request which maps to this Plumber/Cleaner
        await fetch(`${BASE_URL}/students/requests`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${studentToken}`
            },
            body: JSON.stringify({
                title: "Realtime Wash Room",
                description: "Wash floor",
                serviceTypeId: serviceTypeId
            })
        });

        const notification = await staffNotificationPromise;
        assert.strictEqual(notification.title, "ASSIGNED");
        assert.match(notification.message, /assigned/i);

        staffSocket.close();
    }));

    test("5. Notification History: Retrieve persisted notifications from DB via HTTP GET", wrapTest(async () => {
        // Fetch student notification history
        const res = await fetch(`${BASE_URL}/students/notifications`, {
            headers: { "Authorization": `Bearer ${studentToken}` }
        });
        const body = await res.json();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(body.success, true);
        assert.ok(body.data.length >= 2); // 2 requests created in earlier tests
        assert.strictEqual(body.data[0].title, "REQUEST_CREATED");
    }));

});
