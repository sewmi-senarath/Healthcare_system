import { Router } from "express";
import { checkIn, checkOut, getAttendance } from "../controllers/attendance.controller.js";

const router = Router();

router.post("/checkin", checkIn);
router.post("/checkout", checkOut);
router.get("/", getAttendance);

export default router;
