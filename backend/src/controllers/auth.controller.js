import {
    registerStudent,
    registerStaff,
    verifyUserOtp,
    loginUser,
    forgotUserPassword,
    resetUserPassword
} from "../services/auth.service.js";

import {
    studentRegisterSchema,
    staffRegisterSchema,
    loginSchema,
    verifyOtpSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} from "../validations/auth.validation.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const studentRegister = asyncHandler(async (req, res) => {
    const data = studentRegisterSchema.parse(req.body);
    const student = await registerStudent(data);

    // Sanitize student object to prevent exposing passwordHash
    const { passwordHash, ...sanitizedStudent } = student;

    res.status(201).json(
        new ApiResponse(201, sanitizedStudent, "Student registered successfully. Please verify OTP sent to email.")
    );
});

export const staffRegister = asyncHandler(async (req, res) => {
    const data = staffRegisterSchema.parse(req.body);
    const staff = await registerStaff(data);

    // Sanitize staff object to prevent exposing passwordHash
    const { passwordHash, ...sanitizedStaff } = staff;

    res.status(201).json(
        new ApiResponse(201, sanitizedStaff, "Staff registered successfully. Please verify OTP sent to email.")
    );
});

export const verifyOtp = asyncHandler(async (req, res) => {
    const data = verifyOtpSchema.parse(req.body);
    const result = await verifyUserOtp(data.email, data.otp);

    const role = result?.role;
    let message = "Email verified successfully. You can now login.";
    if (role === "STAFF") {
        message = "Email verified successfully. Please wait for an administrator to approve your account.";
    }

    res.status(200).json(
        new ApiResponse(200, { role }, message)
    );
});

export const login = asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const { user, role, token } = await loginUser(data.email, data.password);

    // Sanitize user object to prevent exposing passwordHash
    const { passwordHash, ...sanitizedUser } = user;

    // Set JWT token in an HTTP-only, secure cookie
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days (matching sign expiration)
    };

    res.cookie("token", token, cookieOptions);

    res.status(200).json(
        new ApiResponse(200, { user: sanitizedUser, role, token }, "Login successful")
    );
});

export const forgotPassword = asyncHandler(async (req, res) => {
    const data = forgotPasswordSchema.parse(req.body);
    await forgotUserPassword(data.email);

    res.status(200).json(
        new ApiResponse(200, null, "Password reset OTP sent successfully to your email.")
    );
});

export const resetPassword = asyncHandler(async (req, res) => {
    const data = resetPasswordSchema.parse(req.body);
    await resetUserPassword(data.email, data.otp, data.newPassword);

    res.status(200).json(
        new ApiResponse(200, null, "Password has been reset successfully. You can now login with your new password.")
    );
});

export const logout = asyncHandler(async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });

    res.status(200).json(
        new ApiResponse(200, null, "Logged out successfully")
    );
});