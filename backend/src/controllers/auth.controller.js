import { authService } from '../services/auth.service.js';
import { emailService } from '../services/email.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { AppError } from '../utils/app-error.js';
import { prisma } from '../config/prisma.js';

const created = (method) => asyncHandler(async (req, res) => { const data = await method(req.body); emailService.sendOtp({ to: data.email, purpose: 'REGISTRATION' }).catch(err => console.error('Failed to send registration OTP:', err)); res.status(201).json({ success: true, message: 'OTP sent successfully.', data }); });
export const authController = {
  registerStudent: created(authService.registerStudent),
  registerStaff: created(authService.registerStaff),
  loginStudent: asyncHandler(async (req,res)=>res.json({success:true,data:await authService.loginStudent(req.body)})),
  loginStaff: asyncHandler(async (req,res)=>res.json({success:true,data:await authService.loginStaff(req.body)})),
  loginAdmin: asyncHandler(async (req,res)=>res.json({success:true,data:await authService.loginAdmin(req.body)})),
  loginUnified: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const credential = await prisma.accountCredential.findUnique({
      where: { email }
    });

    if (!credential) {
      const adminProfile = await prisma.administrator.findUnique({
        where: { username: email }
      });
      if (adminProfile) {
        const data = await authService.loginAdmin({ username: email, password });
        return res.json({ success: true, data });
      }
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid credentials.');
    }

    let data;
    if (credential.userType === 'STUDENT') {
      data = await authService.loginStudent({ email, password }, credential);
    } else if (credential.userType === 'STAFF') {
      data = await authService.loginStaff({ email, password }, credential);
    } else if (credential.userType === 'ADMINISTRATOR') {
      const admin = await prisma.administrator.findFirst({
        where: { email }
      });
      data = await authService.loginAdmin({ username: admin.username, password }, credential);
    } else {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid credentials.');
    }

    res.json({ success: true, data });
  }),
  sendOtp: asyncHandler(async (req,res)=>{
    const data = await authService.sendOtp(req.body);
    emailService.sendOtp({ to: data.email, purpose: req.body.purpose }).catch(err => {
      console.error('Background OTP email dispatch failed:', err);
    });
    res.json({ success: true, message: 'OTP sent successfully.' });
  }),
  verifyOtp: asyncHandler(async (req,res)=>{const data = await authService.verifyOtp(req.body);res.json({success:true,message:'OTP verified successfully.',userType:data?.userType});}),
  logout: asyncHandler(async (_req,res)=>res.json({success:true,message:'Logged out successfully.'}))
};
