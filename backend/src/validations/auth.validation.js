import { z } from "zod";

export const studentRegisterSchema = z.object({
    registrationNo: z.string().min(1, "Registration number is required"),
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10).max(15).optional().nullable(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    roomNumber: z.string().min(1, "Room number is required"),
    gender: z.enum(["MALE", "FEMALE", "OTHER"], {
        errorMap: () => ({ message: "Gender must be MALE, FEMALE, or OTHER" })
    }),
    blockId: z.string().min(1, "Block ID is required")
});

export const staffRegisterSchema = z.object({
    employeeId: z.string().min(1, "Employee ID is required"),
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10).max(15).optional().nullable(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["CLEANING", "ELECTRICIAN", "PLUMBER", "CARPENTER", "GENERAL"], {
        errorMap: () => ({ message: "Role must be CLEANING, ELECTRICIAN, PLUMBER, CARPENTER, or GENERAL" })
    }),
    blockId: z.string().min(1, "Block ID is required")
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required")
});

export const verifyOtpSchema = z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be exactly 6 digits")
});

export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address")
});

export const resetPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
    newPassword: z.string().min(8, "Password must be at least 8 characters")
});