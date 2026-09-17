import express from "express";
import {
  createTask,
  deleteTask,
  getMyTasks,
  getTaskById,
  getTasks,
  updateTask,
  updateTaskStatus,
} from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getTasks);
router.get("/my", getMyTasks);
router.get("/:id", getTaskById);
router.post("/", requireRole("admin", "manager", "ceo", "hr"), createTask);
router.put("/:id", requireRole("admin", "manager", "ceo", "hr"), updateTask);
router.delete("/:id", requireRole("admin", "manager", "ceo", "hr"), deleteTask);
router.patch("/:id/status", updateTaskStatus);

export default router;
