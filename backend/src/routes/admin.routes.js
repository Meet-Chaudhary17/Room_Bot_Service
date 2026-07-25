import { Router } from "express";
import {
    getDashboard,
    getStudentsList,
    blockStudent,
    getStaffList,
    changeStaffStatus,
    getBlocksList,
    createBlock,
    deleteBlock,
    getServiceTypesList,
    createServiceType,
    toggleServiceTypeStatus,
    getRequestsList,
    reassignRequest,
    getComplaintsList,
    resolveStudentComplaint,
    getFeedbacksList
} from "../controllers/admin.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);
router.use(authorize("ADMIN"));

router.get("/dashboard", getDashboard);

router.get("/students", getStudentsList);
router.patch("/students/:id/block", blockStudent);

router.get("/staff", getStaffList);
router.patch("/staff/:id/status", changeStaffStatus);

router.get("/blocks", getBlocksList);
router.post("/blocks", createBlock);
router.delete("/blocks/:id", deleteBlock);

router.get("/service-types", getServiceTypesList);
router.post("/service-types", createServiceType);
router.patch("/service-types/:id/toggle", toggleServiceTypeStatus);

router.get("/requests", getRequestsList);
router.patch("/requests/:id/reassign", reassignRequest);

router.get("/complaints", getComplaintsList);
router.patch("/complaints/:id/resolve", resolveStudentComplaint);

router.get("/feedbacks", getFeedbacksList);

export default router;
