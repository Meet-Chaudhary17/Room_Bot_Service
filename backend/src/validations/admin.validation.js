import { z } from "zod";

export const createBlockSchema = z.object({
    name: z.string().min(1, "Block name must not be empty").max(100, "Block name must be less than 100 characters")
});

export const createServiceTypeSchema = z.object({
    name: z.string().min(1, "Service type name must not be empty").max(100, "Service type name must be less than 100 characters"),
    description: z.string().min(1, "Description must not be empty").max(500, "Description must be less than 500 characters")
});

export const toggleBlockStatusSchema = z.object({
    isBlocked: z.boolean({ required_error: "isBlocked is required" })
});

export const toggleActiveStatusSchema = z.object({
    isActive: z.boolean({ required_error: "isActive is required" })
});

export const reassignRequestSchema = z.object({
    staffId: z.string().min(1, "Staff ID is required")
});

export const queryPaginationSchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default("10"),
    status: z.string().optional(),
    role: z.string().optional(),
    blockId: z.string().optional(),
    staffId: z.string().optional(),
    serviceTypeId: z.string().optional(),
    search: z.string().optional(),
    sort: z.enum(["asc", "desc"]).optional().default("desc")
});
