import { BaseRepository } from './base.repository.js';

export class AuthRepository extends BaseRepository {
  findCredential(email) { return this.prisma.accountCredential.findUnique({ where: { email } }); }
  findAdmin(username) { return this.prisma.administrator.findUnique({ where: { username } }); }
  findProfile(role, id) { return this.prisma[role === 'STUDENT' ? 'student' : role === 'STAFF' ? 'staff' : 'administrator'].findUnique({ where: { id } }); }
  createStudent(data, credential, otp) { return this.prisma.$transaction(async (tx) => { const user = await tx.student.create({ data }); await tx.accountCredential.create({ data: { ...credential, userId: user.id, userType: 'STUDENT' } }); await tx.otpVerification.create({ data: { ...otp, userId: user.id, userType: 'STUDENT' } }); return user; }); }
  createStaff(data, credential, otp) { return this.prisma.$transaction(async (tx) => { const user = await tx.staff.create({ data }); await tx.accountCredential.create({ data: { ...credential, userId: user.id, userType: 'STAFF' } }); await tx.otpVerification.create({ data: { ...otp, userId: user.id, userType: 'STAFF' } }); return user; }); }
  replaceOtp(otp) { return this.prisma.$transaction([this.prisma.otpVerification.updateMany({ where: { userType: otp.userType, userId: otp.userId, purpose: otp.purpose, verifiedAt: null }, data: { expiresAt: new Date() } }), this.prisma.otpVerification.create({ data: otp })]); }
  findLatestOtp(userType, userId, purpose) { return this.prisma.otpVerification.findFirst({ where: { userType, userId, purpose, verifiedAt: null }, orderBy: { createdAt: 'desc' } }); }
  updateOtp(id, data) { return this.prisma.otpVerification.update({ where: { id }, data }); }
  deleteUnverifiedUser(email) { return this.prisma.$transaction(async (tx) => { const credential = await tx.accountCredential.findUnique({ where: { email } }); if (!credential || credential.emailVerified) return; await tx.otpVerification.deleteMany({ where: { userType: credential.userType, userId: credential.userId } }); await tx.accountCredential.deleteMany({ where: { id: credential.id } }); if (credential.userType === 'STUDENT') { await tx.student.deleteMany({ where: { id: credential.userId } }); } else if (credential.userType === 'STAFF') { await tx.staff.deleteMany({ where: { id: credential.userId } }); } }); }
  verifyCredential(id) { return this.prisma.accountCredential.update({ where: { id }, data: { emailVerified: true } }); }
}
