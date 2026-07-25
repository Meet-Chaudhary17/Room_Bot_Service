import { Router } from "express";
import {
    getDashboard,
    getRequests,
    startWork,
    requestCompletion,
    verifyCompletion,
    getProfile,
    getNotificationsController
} from "../controllers/staff.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = Router();

// Enforce JWT protect and STAFF authorization on all staff routes
router.use(protect);
router.use(authorize("STAFF"));

router.get("/dashboard", getDashboard);
router.get("/requests", getRequests);
router.patch("/requests/:id/start", startWork);
router.post("/requests/:id/request-completion", requestCompletion);
router.post("/requests/:id/verify-completion", verifyCompletion);
router.get("/profile", getProfile);
router.get("/notifications", getNotificationsController);

export default router;
