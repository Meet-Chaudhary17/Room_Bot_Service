import { z } from 'zod';
const password = z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
export const studentRegistration = z.object({ full_name: z.string().trim().min(2).max(100), registration_number: z.string().trim().min(1).max(30), email: z.string().email(), phone_number: z.string().trim().max(20).optional(), room_number: z.string().trim().min(1).max(20), block_id: z.coerce.number().int().positive(), password, confirm_password: z.string() }).refine((v) => v.password === v.confirm_password, { path: ['confirm_password'], message: 'Passwords do not match.' });
export const staffRegistration = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: z.string().email(),
  block_id: z.coerce.number().int().positive(),
  service_role: z.enum(['CLEANING', 'ELECTRICAL_MAINTENANCE', 'PLUMBING', 'AC_MAINTENANCE', 'FURNITURE_REPAIR']).optional(),
  primary_role: z.enum(['CLEANING', 'ELECTRICAL_MAINTENANCE', 'PLUMBING', 'AC_MAINTENANCE', 'FURNITURE_REPAIR']).optional(),
  secondary_role: z.enum(['CLEANING', 'ELECTRICAL_MAINTENANCE', 'PLUMBING', 'AC_MAINTENANCE', 'FURNITURE_REPAIR']).optional().nullable().or(z.literal('')),
  password,
  confirm_password: z.string()
}).refine((v) => v.password === v.confirm_password, { path: ['confirm_password'], message: 'Passwords do not match.' })
  .refine((v) => {
    const p = v.primary_role || v.service_role;
    return !!p;
  }, { path: ['primary_role'], message: 'Primary role is required.' })
  .refine((v) => {
    const p = v.primary_role || v.service_role;
    const s = v.secondary_role;
    return !s || p !== s;
  }, { path: ['secondary_role'], message: 'Secondary role cannot be the same as primary role.' });
export const emailOtp = z.object({ email: z.string().email(), otp: z.string().regex(/^\d{6}$/), purpose: z.enum(['REGISTRATION', 'PASSWORD_RESET', 'COMPLETION']).default('REGISTRATION') });
export const sendOtp = z.object({ email: z.string().email(), purpose: z.enum(['REGISTRATION', 'PASSWORD_RESET', 'COMPLETION']).default('REGISTRATION') });
export const credentials = z.object({ email: z.string().email(), password: z.string().min(1) });
export const adminCredentials = z.object({ username: z.string().trim().min(1).max(50), password: z.string().min(1) });
