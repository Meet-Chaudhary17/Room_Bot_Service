import { Router } from "express";
import {
    createRequestController,
    getRequestHistoryController,
    createComplaintController,
    getComplaintsController,
    submitFeedbackController,
    getNotificationsController
} from "../controllers/student.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = Router();

// Enforce JWT protect and STUDENT authorization on all student routes
router.use(protect);
router.use(authorize("STUDENT"));

router.post("/requests", createRequestController);
router.get("/requests", getRequestHistoryController);
router.post("/complaints", createComplaintController);
router.get("/complaints", getComplaintsController);
router.post("/requests/:id/feedback", submitFeedbackController);
router.get("/notifications", getNotificationsController);

export default router;
