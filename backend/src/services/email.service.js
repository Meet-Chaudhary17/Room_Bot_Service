import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const createTransporter = () => {
  const host = env.SMTP_HOST || 'smtp.gmail.com';
  const port = env.SMTP_PORT || 465;
  const secure = env.SMTP_SECURE !== undefined ? (env.SMTP_SECURE === 'true') : true;
  const user = env.SMTP_USER || 'roombotservice@gmail.com';
  const pass = env.SMTP_PASS || 'oroa gppj ndaw zajj';

  if (user.includes('@gmail.com') && !env.SMTP_HOST) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 10000
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 10000
  });
};

const transporter = createTransporter();

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
      from: env.EMAIL_FROM || env.SMTP_USER || 'roombotservice@gmail.com',
      to,
      subject: 'Room-Bot Service verification code',
      text: `${otpText}It is valid for ${env.OTP_EXPIRY_MINUTES} minutes.`
    });
  }
};
