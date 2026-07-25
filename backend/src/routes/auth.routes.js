import { Router } from "express";
import {
    studentRegister,
    staffRegister,
    verifyOtp,
    login,
    forgotPassword,
    resetPassword,
    logout
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register/student", studentRegister);
router.post("/register/staff", staffRegister);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);

export default router;