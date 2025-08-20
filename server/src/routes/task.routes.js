const express = require("express");
const {
  createTask,
  getTasksByManager,
  getTasksByEmployee,
  updateTaskStatus,
  reviewTask,
  getTaskStats,
  getEmployeesForAssignment,
  updateTask,
  deleteTask,
} = require("../controllers/task.controller");
const { AuthValidationMiddleware } = require("../middleware/AuthValidation");
const { isManagerOrAdmin, isEmployee } = require("../middleware/RoleMiddleware");
const { body, param } = require("express-validator");
const { ValidationMiddleware } = require("../middleware/ValidationMiddleware");

const router = express.Router();

// All routes require authentication
router.use(AuthValidationMiddleware);

// Task creation validation
const createTaskValidation = [
  body("title").notEmpty().withMessage("Title is required").trim(),
  body("assignedTo").notEmpty().withMessage("Employee assignment is required"),
  body("deadline").isISO8601().withMessage("Valid deadline is required"),
  body("priority").optional().isIn(["Low", "Medium", "High"]).withMessage("Invalid priority"),
];

// Task status update validation
const updateStatusValidation = [
  param("id").isMongoId().withMessage("Invalid task ID"),
  body("status").isIn(["Pending", "In Progress", "Completed"]).withMessage("Invalid status"),
];

// Task review validation
const reviewTaskValidation = [
  param("id").isMongoId().withMessage("Invalid task ID"),
  body("feedback").optional().trim(),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
];

// Manager/Admin only routes
router
  .route("/")
  .post(isManagerOrAdmin, createTaskValidation, ValidationMiddleware, createTask);

router
  .route("/manager")
  .get(isManagerOrAdmin, getTasksByManager);

router
  .route("/employees-for-assignment")
  .get(isManagerOrAdmin, getEmployeesForAssignment);

router
  .route("/:id/review")
  .patch(isManagerOrAdmin, reviewTaskValidation, ValidationMiddleware, reviewTask);

router
  .route("/:id")
  .put(isManagerOrAdmin, createTaskValidation, ValidationMiddleware, updateTask)
  .delete(isManagerOrAdmin, deleteTask);

// Employee only routes
router
  .route("/employee")
  .get(isEmployee, getTasksByEmployee);

router
  .route("/:id/status")
  .patch(isEmployee, updateStatusValidation, ValidationMiddleware, updateTaskStatus);

// Common routes (role-based access handled in controller)
router
  .route("/stats")
  .get(getTaskStats);

module.exports = router;
