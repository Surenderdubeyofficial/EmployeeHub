import express from "express";
import {
  checkIn,
  checkOut,
  getAttendance,
  getTodayAttendance,
  markAttendance,
  updateAttendance,
} from "../controllers/attendanceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getAttendance);
router.get("/today", getTodayAttendance);
router.post("/check-in", checkIn);
router.post("/check-out", checkOut);

router.post("/", requireRole("admin", "hr", "manager"), markAttendance);
router.put("/:id", requireRole("admin", "hr", "manager"), updateAttendance);

export default router;
