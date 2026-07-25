import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";

export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Max 20 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        next(new ApiError(429, "Too many login or OTP requests from this IP, please try again after 15 minutes"));
    }
});
