import { z } from 'zod';

export const profileUpdate = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phoneNumber: z.string().trim().max(20).optional()
});

export const statusUpdate = z.object({
  status: z.enum(['In Progress', 'IN_PROGRESS'])
});

export const verifyOtp = z.object({
  otp: z.string().regex(/^\d{6}$/),
  studentId: z.coerce.number().int().min(1).optional()
});

export const generateOtp = z.object({
  studentId: z.coerce.number().int().min(1).optional()
});

