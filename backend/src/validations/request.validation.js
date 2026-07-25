import { z } from "zod";

export const createRequestSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title cannot exceed 100 characters"),
    description: z.string().min(5, "Description must be at least 5 characters").max(500, "Description cannot exceed 500 characters"),
    serviceTypeId: z.string().min(1, "Service Type ID is required"),
    priority: z.number().int().min(1).max(5).optional()
});

export const getRequestHistorySchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default("10"),
    status: z.enum(["PENDING", "ASSIGNED", "IN_PROGRESS", "OTP_PENDING", "COMPLETED", "CANCELLED", "REJECTED"]).optional(),
    priority: z.string().regex(/^\d+$/).transform(Number).optional()
});
