import { Server } from "socket.io";
import { verifyToken } from "../utils/jwt.js";

let io = null;

export function initSocketServer(server) {
    io = new Server(server, {
        cors: {
            origin: true,
            credentials: true
        }
    });

    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || 
                      socket.handshake.headers?.authorization?.split(" ")[1] ||
                      socket.handshake.headers?.cookie?.split("token=")[1]?.split(";")[0]; // Also check cookie token fallback

        if (!token) {
            return next(new Error("Authentication required"));
        }

        try {
            const decoded = verifyToken(token);
            socket.user = decoded; // decoded contains id, email, role
            next();
        } catch (err) {
            return next(new Error("Invalid or expired session token"));
        }
    });

    // Connection handler
    io.on("connection", (socket) => {
        const userId = socket.user.id;
        const role = socket.user.role;

        console.log(`🔌 Client connected: ${socket.id} (User: ${userId}, Role: ${role})`);

        // Join personal user room
        socket.join(`user_${userId}`);

        // Join role-based room
        socket.join(`role_${role}`);

        socket.on("disconnect", () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });

    return io;
}

export function getIO() {
    if (!io) {
        // Return a mock or null if called during test setup before server binds
        return null;
    }
    return io;
}
