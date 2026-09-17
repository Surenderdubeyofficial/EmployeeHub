import express from "express";
import {
  createEmployee,
  deleteEmployee,
  deleteEmployeeDocument,
  getEmployeeById,
  getEmployees,
  updateEmployee,
  updateEmployeeRole,
  updateEmployeeStatus,
  uploadEmployeeDocument,
} from "../controllers/employeeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { profileUpload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);
router.route("/")
  .get(requireRole("admin", "hr", "ceo", "manager", "employee"), getEmployees)
  .post(requireRole("admin", "hr"), createEmployee);

router.route("/:id")
  .get(requireRole("admin", "hr", "ceo", "manager", "employee"), getEmployeeById)
  .put(requireRole("admin", "hr"), updateEmployee)
  .delete(requireRole("admin"), deleteEmployee);

router.patch("/:id/status", requireRole("admin", "hr"), updateEmployeeStatus);
router.patch("/:id/role", requireRole("admin"), updateEmployeeRole);
router.post("/:id/documents", requireRole("admin", "hr"), profileUpload, uploadEmployeeDocument);
router.delete("/:id/documents/:index", requireRole("admin", "hr"), deleteEmployeeDocument);

export default router;
