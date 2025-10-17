import { Router } from "express";
import { applyLeave, updateLeaveStatus, getAllLeaves } from "../controllers/leave.controller.js";

const router = Router();

router.post("/", applyLeave);
router.patch("/:id", updateLeaveStatus);
router.get("/", getAllLeaves);

export default router;
