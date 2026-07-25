import prisma from "../config/prisma.js";
import {
    findBlockById,
    findStudentByEmail,
    findStudentByRegistrationNo,
    createStudent,
    findStaffByEmail,
    findStaffByEmployeeId,
    createStaff,
    createOtpRecord,
    findLatestOtpRecord,
    updateOtpRecordVerified,
    verifyUserAccount,
    updateUserPassword,
    invalidatePreviousOtps
} from "../repositories/auth.repository.js";

import { hashPassword, comparePassword } from "../utils/password.js";
import { generateOtp, sendOtpEmail } from "../utils/otp.js";
import { generateToken } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";

const registrationCache = new Map();

export async function registerStudent(data) {
    // 1. Verify block exists
    const block = await findBlockById(data.blockId);
    if (!block) {
        throw new ApiError(400, "The specified Block does not exist");
    }

    // 2. Check if email is already registered (in student or staff)
    const emailInStudent = await findStudentByEmail(data.email);
    const emailInStaff = await findStaffByEmail(data.email);
    if (emailInStudent || emailInStaff) {
        throw new ApiError(409, "Email is already registered");
    }

    // 3. Check if registration number is already registered
    const regExists = await findStudentByRegistrationNo(data.registrationNo);
    if (regExists) {
        throw new ApiError(409, "Registration number is already registered");
    }

    // 4. Hash password
    const hashedPassword = await hashPassword(data.password);

    // 5. Generate OTP and Expiry
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // 6. Invalidate previous OTP records in DB
    await invalidatePreviousOtps(data.email);

    // 7. Store student details in memory cache
    registrationCache.set(data.email.toLowerCase(), {
        role: "STUDENT",
        data: {
            registrationNo: data.registrationNo,
            name: data.name,
            email: data.email,
            phone: data.phone,
            passwordHash: hashedPassword,
            roomNumber: data.roomNumber,
            gender: data.gender,
            blockId: data.blockId
        },
        otp,
        expiresAt
    });

    // 8. Create OTP record in DB
    await createOtpRecord(data.email, otp, expiresAt, null);

    // 9. Send verification email
    await sendOtpEmail(data.email, otp);

    return {
        name: data.name,
        email: data.email,
        registrationNo: data.registrationNo
    };
}

export async function registerStaff(data) {
    // 1. Verify block exists
    const block = await findBlockById(data.blockId);
    if (!block) {
        throw new ApiError(400, "The specified Block does not exist");
    }

    // 2. Check if email is already registered
    const emailInStudent = await findStudentByEmail(data.email);
    const emailInStaff = await findStaffByEmail(data.email);
    if (emailInStudent || emailInStaff) {
        throw new ApiError(409, "Email is already registered");
    }

    // 3. Check if employee ID is already registered
    const empExists = await findStaffByEmployeeId(data.employeeId);
    if (empExists) {
        throw new ApiError(409, "Employee ID is already registered");
    }

    // 4. Hash password
    const hashedPassword = await hashPassword(data.password);

    // 5. Generate OTP and Expiry
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // 6. Invalidate previous OTP records in DB
    await invalidatePreviousOtps(data.email);

    // 7. Store staff details in memory cache
    registrationCache.set(data.email.toLowerCase(), {
        role: "STAFF",
        data: {
            employeeId: data.employeeId,
            name: data.name,
            email: data.email,
            phone: data.phone,
            passwordHash: hashedPassword,
            role: data.role,
            blockId: data.blockId
        },
        otp,
        expiresAt
    });

    // 8. Create OTP record in DB
    await createOtpRecord(data.email, otp, expiresAt, null);

    // 9. Send verification email
    await sendOtpEmail(data.email, otp);

    return {
        name: data.name,
        email: data.email,
        employeeId: data.employeeId
    };
}

export async function verifyUserOtp(email, otp) {
    const cachedRecord = registrationCache.get(email.toLowerCase());
    
    if (cachedRecord) {
        if (new Date() > cachedRecord.expiresAt) {
            registrationCache.delete(email.toLowerCase());
            throw new ApiError(400, "OTP has expired");
        }

        if (cachedRecord.otp !== otp) {
            throw new ApiError(400, "Invalid OTP code");
        }

        // OTP verified successfully. Now create the account!
        await prisma.$transaction(async (tx) => {
            if (cachedRecord.role === "STUDENT") {
                await createStudent({
                    ...cachedRecord.data,
                    isVerified: true
                }, tx);
            } else {
                await createStaff({
                    ...cachedRecord.data,
                    isVerified: true,
                    isActive: false // Staff starts inactive until Admin approves/activates
                }, tx);
            }

            // Create verified record in DB
            const dbOtp = await tx.otpVerification.create({
                data: {
                    email,
                    otp,
                    expiresAt: cachedRecord.expiresAt,
                    verified: true
                }
            });
        });

        // Invalidate cache
        registrationCache.delete(email.toLowerCase());
        return { role: cachedRecord.role };
    }

    // Fallback: Check DB for password reset or existing user verification
    const record = await findLatestOtpRecord(email);
    if (!record) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    if (record.otp !== otp) {
        throw new ApiError(400, "Invalid OTP code");
    }

    if (new Date() > record.expiresAt) {
        throw new ApiError(400, "OTP has expired");
    }

    // Determine if student or staff
    const student = await findStudentByEmail(email);
    const staff = await findStaffByEmail(email);

    if (!student && !staff) {
        throw new ApiError(404, "User account not found");
    }

    const role = student ? "STUDENT" : "STAFF";

    await prisma.$transaction(async (tx) => {
        await updateOtpRecordVerified(record.id, tx);
        await verifyUserAccount(email, role, tx);
    });

    return { role };
}

export async function loginUser(email, password) {
    // 1. Check Student
    const student = await findStudentByEmail(email);
    if (student) {
        const isMatch = await comparePassword(password, student.passwordHash);
        if (!isMatch) {
            throw new ApiError(401, "Invalid email or password");
        }

        if (!student.isVerified) {
            throw new ApiError(401, "Please verify your email address before logging in");
        }

        if (student.isBlocked) {
            throw new ApiError(403, "Your account has been blocked by the administrator");
        }

        const token = generateToken({ id: student.id, email: student.email, role: "STUDENT" });
        return { user: student, role: "STUDENT", token };
    }

    // 2. Check Staff
    const staff = await findStaffByEmail(email);
    if (staff) {
        const isMatch = await comparePassword(password, staff.passwordHash);
        if (!isMatch) {
            throw new ApiError(401, "Invalid email or password");
        }

        if (!staff.isVerified) {
            throw new ApiError(401, "Please verify your email address before logging in");
        }

        if (!staff.isActive) {
            throw new ApiError(403, "Your staff account is not active yet. Please wait for an administrator to approve it.");
        }

        const token = generateToken({ id: staff.id, email: staff.email, role: "STAFF" });
        return { user: staff, role: "STAFF", token };
    }

    // 3. Check Admin (Strict empty DB: fails if no admin in DB)
    const admin = await prisma.admin.findUnique({
        where: { email }
    });
    if (admin) {
        const isMatch = await comparePassword(password, admin.passwordHash);
        if (!isMatch) {
            throw new ApiError(401, "Invalid email or password");
        }

        const token = generateToken({ id: admin.id, email: admin.email, role: "ADMIN" });
        return { user: admin, role: "ADMIN", token };
    }

    throw new ApiError(401, "Invalid email or password");
}

export async function forgotUserPassword(email) {
    const student = await findStudentByEmail(email);
    const staff = await findStaffByEmail(email);

    if (!student && !staff) {
        throw new ApiError(404, "Email is not registered");
    }

    const user = student || staff;
    if (!user.isVerified) {
        throw new ApiError(400, "Account has not been verified yet");
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.$transaction(async (tx) => {
        // Invalidate previous active password-reset OTPs
        await invalidatePreviousOtps(email, tx);
        // Create new OTP
        await createOtpRecord(email, otp, expiresAt, student ? student.id : null, tx);
    });

    await sendOtpEmail(email, otp);
    return true;
}

export async function resetUserPassword(email, otp, newPassword) {
    const record = await findLatestOtpRecord(email);
    if (!record) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    if (record.otp !== otp) {
        throw new ApiError(400, "Invalid OTP code");
    }

    if (new Date() > record.expiresAt) {
        throw new ApiError(400, "OTP has expired");
    }

    const student = await findStudentByEmail(email);
    const staff = await findStaffByEmail(email);

    if (!student && !staff) {
        throw new ApiError(404, "User account not found");
    }

    const role = student ? "STUDENT" : "STAFF";
    const hashedPassword = await hashPassword(newPassword);

    await prisma.$transaction(async (tx) => {
        await updateOtpRecordVerified(record.id, tx);
        await updateUserPassword(email, role, hashedPassword, tx);
    });

    return true;
}