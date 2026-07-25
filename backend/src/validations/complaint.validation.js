import { z } from "zod";

export const createComplaintSchema = z.object({
    subject: z.string().min(3, "Subject must be at least 3 characters").max(100, "Subject cannot exceed 100 characters"),
    description: z.string().min(5, "Description must be at least 5 characters").max(500, "Description cannot exceed 500 characters")
});
