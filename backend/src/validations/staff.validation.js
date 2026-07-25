import { z } from "zod";

export const verifyCompletionSchema = z.object({
    otp: z.string().length(6, "OTP must be exactly 6 digits")
});

export const getStaffRequestsQuerySchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default("10"),
    status: z.enum(["PENDING", "ASSIGNED", "IN_PROGRESS", "OTP_PENDING", "COMPLETED", "CANCELLED", "REJECTED"]).optional(),
    sort: z.enum(["asc", "desc"]).optional().default("desc")
});
