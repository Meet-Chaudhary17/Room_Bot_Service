import { z } from 'zod';

export const studentStatusUpdate = z.object({
  status: z.enum(['Active', 'Blocked']).optional(),
  isBlocked: z.boolean().optional()
}).refine(data => data.status !== undefined || data.isBlocked !== undefined, {
  message: "Either 'status' or 'isBlocked' must be provided."
});

export const staffStatusUpdate = z.object({
  status: z.enum(['Active', 'Blocked']).optional(),
  isActive: z.boolean().optional(),
  floor: z.coerce.number().int().positive().optional().nullable()
}).refine(data => data.status !== undefined || data.isActive !== undefined, {
  message: "Either 'status' or 'isActive' must be provided."
});

export const complaintResolve = z.object({
  status: z.enum(['Under Review', 'Resolved', 'Closed']),
  resolutionNotes: z.string().trim().max(500).optional()
});
