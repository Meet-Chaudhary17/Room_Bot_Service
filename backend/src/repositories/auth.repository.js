import prisma from "../config/prisma.js";

export async function findBlockById(id, tx = prisma) {
    return await tx.block.findUnique({
        where: { id }
    });
}

export async function findStudentByEmail(email, tx = prisma) {
    return await tx.student.findUnique({
        where: { email }
    });
}

export async function findStudentByRegistrationNo(registrationNo, tx = prisma) {
    return await tx.student.findUnique({
        where: { registrationNo }
    });
}

export async function createStudent(data, tx = prisma) {
    return await tx.student.create({
        data
    });
}

export async function findStaffByEmail(email, tx = prisma) {
    return await tx.staff.findUnique({
        where: { email }
    });
}

export async function findStaffByEmployeeId(employeeId, tx = prisma) {
    return await tx.staff.findUnique({
        where: { employeeId }
    });
}

export async function createStaff(data, tx = prisma) {
    return await tx.staff.create({
        data
    });
}

export async function createOtpRecord(email, otp, expiresAt, studentId = null, tx = prisma) {
    return await tx.otpVerification.create({
        data: {
            email,
            otp,
            expiresAt,
            studentId
        }
    });
}

export async function findLatestOtpRecord(email, tx = prisma) {
    return await tx.otpVerification.findFirst({
        where: {
            email,
            verified: false
        },
        orderBy: {
            createdAt: "desc"
        }
    });
}

export async function updateOtpRecordVerified(id, tx = prisma) {
    return await tx.otpVerification.update({
        where: { id },
        data: { verified: true }
    });
}

export async function verifyUserAccount(email, role, tx = prisma) {
    if (role === "STUDENT") {
        return await tx.student.update({
            where: { email },
            data: { isVerified: true }
        });
    } else if (role === "STAFF") {
        return await tx.staff.update({
            where: { email },
            data: { isVerified: true }
        });
    }
}

export async function updateUserPassword(email, role, passwordHash, tx = prisma) {
    if (role === "STUDENT") {
        return await tx.student.update({
            where: { email },
            data: { passwordHash }
        });
    } else if (role === "STAFF") {
        return await tx.staff.update({
            where: { email },
            data: { passwordHash }
        });
    }
}

export async function invalidatePreviousOtps(email, tx = prisma) {
    return await tx.otpVerification.updateMany({
        where: {
            email,
            verified: false
        },
        data: {
            verified: true
        }
    });
}