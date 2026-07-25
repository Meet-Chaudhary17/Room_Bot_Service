import { verifyToken } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";
import prisma from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        throw new ApiError(401, "Authentication required. Please log in.");
    }

    try {
        const decoded = verifyToken(token);
        let user = null;

        if (decoded.role === "STUDENT") {
            user = await prisma.student.findUnique({
                where: { id: decoded.id }
            });
            if (user && user.isBlocked) {
                throw new ApiError(403, "Your account has been blocked by the administrator");
            }
        } else if (decoded.role === "STAFF") {
            user = await prisma.staff.findUnique({
                where: { id: decoded.id }
            });
            if (user && !user.isActive) {
                throw new ApiError(403, "Your staff account is currently inactive");
            }
        } else if (decoded.role === "ADMIN") {
            user = await prisma.admin.findUnique({
                where: { id: decoded.id }
            });
        }

        if (!user) {
            throw new ApiError(401, "User session not found. Please log in again.");
        }

        req.user = {
            id: user.id,
            email: user.email,
            role: decoded.role,
            blockId: user.blockId || null
        };

        next();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(401, "Invalid or expired session token. Please log in again.");
    }
});

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new ApiError(403, `User role '${req.user?.role || "UNKNOWN"}' is not authorized to access this resource`));
        }
        next();
    };
};
