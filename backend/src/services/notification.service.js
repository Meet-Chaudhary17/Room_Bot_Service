import prisma from "../config/prisma.js";
import { getIO } from "../config/socket.js";

/**
 * Persists a notification to the database and dispatches it in real-time via Socket.IO
 */
export async function sendNotification({ userId, role, title, message, type = "INFO" }) {
    let savedNotification = null;

    // 1. Persist notification in database for Student or Staff
    if (role === "STUDENT") {
        savedNotification = await prisma.notification.create({
            data: {
                title,
                message,
                type,
                studentId: userId
            }
        });
    } else if (role === "STAFF") {
        savedNotification = await prisma.notification.create({
            data: {
                title,
                message,
                type,
                staffId: userId
            }
        });
    }

    // 2. Dispatch real-time notification via Socket.IO
    const io = getIO();
    if (io) {
        const payload = savedNotification || {
            title,
            message,
            type,
            createdAt: new Date(),
            isRead: false
        };

        if (userId) {
            // Send to personal user room
            io.to(`user_${userId}`).emit("notification", payload);
        }

        // If it is an admin update or targeted at admin role
        if (role === "ADMIN") {
            io.to("role_ADMIN").emit("notification", payload);
        }
    }

    return savedNotification;
}

/**
 * Retrieves persisted notification logs for Students or Staff members
 */
export async function getUserNotifications(userId, role, limit = 20, page = 1) {
    const skip = (page - 1) * limit;

    const where = {};
    if (role === "STUDENT") {
        where.studentId = userId;
    } else if (role === "STAFF") {
        where.staffId = userId;
    } else {
        return []; // Admin does not have DB persisted notifications in current schema
    }

    return await prisma.notification.findMany({
        where,
        orderBy: {
            createdAt: "desc"
        },
        skip,
        take: limit
    });
}
