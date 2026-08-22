import { z } from 'zod';
export const profileUpdate = z.object({ full_name: z.string().trim().min(2).max(100).optional(), phone_number: z.string().trim().max(20).nullable().optional(), room_number: z.string().trim().min(1).max(20).optional() }).strict();
export const serviceRequest = z.object({ title: z.string().trim().min(1).max(150), description: z.string().trim().min(1), category_id: z.coerce.number().int().positive(), room_number: z.string().trim().min(1).max(20) });
export const complaint = z.object({ title: z.string().trim().min(1).max(150), description: z.string().trim().min(1), category_id: z.coerce.number().int().positive(), priority: z.enum(['LOW', 'NORMAL', 'HIGH']).default('NORMAL') });
export const feedback = z.object({ request_id: z.coerce.number().int().positive(), rating: z.coerce.number().int().min(1).max(5), comments: z.string().max(1000).optional() });
