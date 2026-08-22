import { z } from 'zod';

export const studentStatusUpdate = z.object({
  status: z.enum(['Active', 'Blocked'])
});

export const staffStatusUpdate = z.object({
  status: z.enum(['Active', 'Blocked'])
});

export const complaintResolve = z.object({
  status: z.enum(['Under Review', 'Resolved', 'Closed']),
  resolutionNotes: z.string().trim().max(500).optional()
});
