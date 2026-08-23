import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomInt } from 'node:crypto';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';
import { AuthRepository } from '../repositories/auth.repository.js';

const repository = new AuthRepository(prisma);
const roles = Object.freeze({ STUDENT: 'STUDENT', STAFF: 'STAFF', ADMINISTRATOR: 'ADMINISTRATOR' });
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const otpCode = () => String(randomInt(100000, 1000000));
const expiresAt = () => new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60_000);

function validatePassword(password, confirmPassword) { if (!passwordPattern.test(password)) throw new AppError(400, 'WEAK_PASSWORD', 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'); if (password !== confirmPassword) throw new AppError(400, 'PASSWORD_MISMATCH', 'Password confirmation does not match.'); }
async function register(role, payload) {
  validatePassword(payload.password, payload.confirm_password);
  const existing = await repository.findCredential(payload.email);
  if (existing) {
    if (existing.emailVerified) {
      throw new AppError(409, 'EMAIL_EXISTS', 'Email is already registered.');
    }
    await repository.deleteUnverifiedUser(payload.email);
  }
  const passwordHash = await bcrypt.hash(payload.password, 12);
  const code = otpCode();
  const registrationPayload = {
    registration_number: payload.registration_number,
    full_name: payload.full_name,
    email: payload.email,
    phone_number: payload.phone_number,
    passwordHash,
    room_number: payload.room_number,
    block_id: payload.block_id,
    service_role: payload.primary_role || payload.service_role,
    primary_role: payload.primary_role || payload.service_role,
    secondary_role: payload.secondary_role || null
  };
  const otp = {
    userType: role,
    otpCode: code,
    purpose: 'REGISTRATION',
    attempts: 0,
    expiresAt: expiresAt(),
    payload: JSON.stringify(registrationPayload)
  };
  await repository.createPendingOtp(otp);
  return { email: payload.email };
}
const cleanBlockName = (blockName) => {
  if (!blockName) return '';
  return blockName.replace(/block/gi, '').trim();
};

async function login(role, identifier, password) {
  const profile = role === roles.ADMINISTRATOR ? await repository.findAdmin(identifier) : null;
  const credential = await repository.findCredential(role === roles.ADMINISTRATOR ? profile?.email : identifier);
  if (!credential || credential.userType !== role || !(await bcrypt.compare(password, credential.passwordHash)))
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid credentials.');
  if (!credential.emailVerified)
    throw new AppError(403, 'EMAIL_NOT_VERIFIED', 'Email verification is required.');
  const user = profile ?? await repository.findProfile(role, credential.userId);
  if (user.isBlocked || user.isActive === false)
    throw new AppError(403, 'ACCOUNT_INACTIVE', 'Account is inactive.');
  const token = jwt.sign({ userId: user.id, role, email: credential.email }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
  const userObj = { id: user.id, name: user.fullName, role };
  if (role === roles.STUDENT) {
    userObj.roomNumber = user.roomNumber;
    userObj.blockId = user.blockId;
    userObj.block = user.block ? { id: user.block.id, name: cleanBlockName(user.block.blockName) } : null;
  } else if (role === roles.STAFF) {
    userObj.serviceRole = user.serviceRole;
    userObj.blockId = user.blockId;
    userObj.block = user.block ? { id: user.block.id, name: cleanBlockName(user.block.blockName) } : null;
  }
  return { token, user: userObj };
}
export const authService = {
  registerStudent: (p) => register(roles.STUDENT, p),
  registerStaff: (p) => register(roles.STAFF, p),
  loginStudent: (p) => login(roles.STUDENT, p.email, p.password),
  loginStaff: (p) => login(roles.STAFF, p.email, p.password),
  loginAdmin: (p) => login(roles.ADMINISTRATOR, p.username, p.password),
  async sendOtp({ email, purpose = 'REGISTRATION' }) {
    if (purpose === 'REGISTRATION') {
      const record = await repository.findLatestRegistrationOtp(email);
      if (!record) throw new AppError(404, 'USER_NOT_FOUND', 'User registration not found.');
      const code = otpCode();
      const payloadObj = JSON.parse(record.payload);
      const otp = {
        userType: record.userType,
        otpCode: code,
        purpose,
        attempts: 0,
        expiresAt: expiresAt(),
        payload: record.payload
      };
      await repository.createPendingOtp(otp);
      return { email };
    }
    const credential = await repository.findCredential(email);
    if (!credential) throw new AppError(404, 'USER_NOT_FOUND', 'User not found.');
    const otp = { userType: credential.userType, userId: credential.userId, purpose, otpCode: otpCode(), attempts: 0, expiresAt: expiresAt() };
    await repository.replaceOtp(otp);
    return { email };
  },
  async verifyOtp({ email, otp, purpose = 'REGISTRATION' }) {
    if (purpose === 'REGISTRATION') {
      const record = await repository.findLatestRegistrationOtp(email);
      if (!record || record.expiresAt < new Date() || record.attempts >= 5)
        throw new AppError(410, 'OTP_EXPIRED', 'OTP is expired or invalid.');
      if (record.otpCode !== otp) {
        await repository.updateOtp(record.id, { attempts: { increment: 1 } });
        throw new AppError(400, 'INVALID_OTP', 'Invalid OTP.');
      }
      const payload = JSON.parse(record.payload);
      await repository.createVerifiedUser(record.id, record.userType, payload);
      return { userType: record.userType };
    }
    const credential = await repository.findCredential(email);
    if (!credential) throw new AppError(404, 'USER_NOT_FOUND', 'User not found.');
    const record = await repository.findLatestOtp(credential.userType, credential.userId, purpose);
    if (!record || record.expiresAt < new Date() || record.attempts >= 5)
      throw new AppError(410, 'OTP_EXPIRED', 'OTP is expired or invalid.');
    if (record.otpCode !== otp) {
      await repository.updateOtp(record.id, { attempts: { increment: 1 } });
      throw new AppError(400, 'INVALID_OTP', 'Invalid OTP.');
    }
    await repository.updateOtp(record.id, { verifiedAt: new Date() });
    if (purpose === 'REGISTRATION') await repository.verifyCredential(credential.id);
  },
  logout: () => undefined
};
