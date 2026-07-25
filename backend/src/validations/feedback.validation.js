import { z } from "zod";

export const submitFeedbackSchema = z.object({
    rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot be more than 5"),
    comment: z.string().max(200, "Comment cannot exceed 200 characters").optional().nullable()
});
