// routes/employee.routes.js
import { Router } from "express";
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} from "../controllers/employee.controller.js";

const router = Router();

// /api/employees
router.get("/", getEmployees);
router.post("/", createEmployee);

// /api/employees/:id
router.get("/:id", getEmployeeById);
router.patch("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

export default router;
