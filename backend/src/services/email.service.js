import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const transporter = env.SMTP_HOST ? nodemailer.createTransport({ host: env.SMTP_HOST, port: env.SMTP_PORT, secure: env.SMTP_SECURE === 'true', auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined }) : null;
export const emailService = {
  async sendOtp({ to, purpose, otp = null }) {
    if (!transporter) return;

    let otpCode = otp;
    if (!otpCode) {
      const { prisma } = await import('../config/prisma.js');
      const credential = await prisma.accountCredential.findUnique({ where: { email: to } });
      if (credential) {
        const record = await prisma.otpVerification.findFirst({
          where: {
            userType: credential.userType,
            userId: credential.userId,
            purpose,
            verifiedAt: null
          },
          orderBy: { createdAt: 'desc' }
        });
        if (record) {
          otpCode = record.otpCode;
        }
      }
    }

    const otpText = otpCode ? `Your ${purpose.toLowerCase().replace('_', ' ')} OTP is ${otpCode}. ` : '';

    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject: 'Room-Bot Service verification code',
      text: `${otpText}It is valid for ${env.OTP_EXPIRY_MINUTES} minutes.`
    });
  }
};
