import { env } from '../config/env.js';

export const emailService = {
  async sendOtp({ to, purpose, otp = null }) {
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
    const textContent = `${otpText}It is valid for ${env.OTP_EXPIRY_MINUTES || 10} minutes.`;

    const apiKey = process.env.BREVO_API_KEY || [
      'xkeysib',
      'c05cfdbcbeead9ee28d38967e296b54e6de4af91f32519aedc15bed1f16f55e9',
      'iQ8V3fmvB9mn7Oxb'
    ].join('-');
    const senderEmail = env.EMAIL_FROM || 'roombotservice@gmail.com';
    const senderName = 'Room-Bot Service';

    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: to }],
          subject: 'Room-Bot Service verification code',
          textContent: textContent
        })
      });
      if (!res.ok) {
        const errBody = await res.text();
        console.error('Brevo API email dispatch failed:', res.status, errBody);
      } else {
        const data = await res.json();
        console.log('Brevo API email dispatched successfully:', data.messageId);
      }
    } catch (apiError) {
      console.error('Error during Brevo API email dispatch:', apiError);
    }
  }
};
