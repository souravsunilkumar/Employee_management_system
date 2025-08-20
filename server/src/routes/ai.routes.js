const express = require("express");
const {
  generateTaskSummary,
  suggestPriority,
  checkDeadline,
  generateTaskFeedback,
  getPerformanceReport,
  getDeadlineRisk,
  analyzeBottlenecks,
  simulateWorkloadChange,
  explainTask,
  suggestResources,
  getChatbotResponse,
} = require("../controllers/ai.controller");
const { AuthValidationMiddleware } = require("../middleware/AuthValidation");
const {
  isManagerOrAdmin,
  isEmployee,
} = require("../middleware/RoleMiddleware");
const { body, param } = require("express-validator");
const { ValidationMiddleware } = require("../middleware/ValidationMiddleware");

const router = express.Router();

// All routes require authentication
router.use(AuthValidationMiddleware);

// Validation schemas
const taskSummaryValidation = [
  body("description")
    .notEmpty()
    .withMessage("Task description is required")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters long")
    .trim(),
];

const prioritySuggestionValidation = [
  body("description")
    .notEmpty()
    .withMessage("Task description is required")
    .trim(),
  body("deadline").isISO8601().withMessage("Valid deadline is required"),
];

const deadlineCheckValidation = [
  body("description")
    .notEmpty()
    .withMessage("Task description is required")
    .trim(),
  body("deadline").isISO8601().withMessage("Valid deadline is required"),
  body("complexity")
    .optional()
    .isIn(["Simple", "Moderate", "Complex", "Very Complex"])
    .withMessage("Invalid complexity level"),
];

const taskFeedbackValidation = [
  body("taskId").isMongoId().withMessage("Invalid task ID"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
];

const workloadSimulationValidation = [
  body("employeeId").isMongoId().withMessage("Invalid employee ID"),
  body("taskData").isObject().withMessage("Task data is required"),
  body("taskData.title")
    .notEmpty()
    .withMessage("Task title is required")
    .trim(),
  body("taskData.priority")
    .isIn(["Low", "Medium", "High", "Critical"])
    .withMessage("Invalid priority level"),
  body("taskData.deadline")
    .isISO8601()
    .withMessage("Valid deadline is required"),
];

const chatbotValidation = [
  body("query")
    .notEmpty()
    .withMessage("Query is required")
    .isLength({ min: 3, max: 500 })
    .withMessage("Query must be between 3 and 500 characters")
    .trim(),
];

const employeeIdValidation = [
  param("employeeId").isMongoId().withMessage("Invalid employee ID"),
];

const taskIdValidation = [
  param("taskId").isMongoId().withMessage("Invalid task ID"),
];

const managerIdValidation = [
  param("managerId").isMongoId().withMessage("Invalid manager ID"),
];

// AI Routes

// Task Summary Generation (Manager/Admin only)
router
  .route("/task-summary")
  .post(
    isManagerOrAdmin,
    taskSummaryValidation,
    ValidationMiddleware,
    generateTaskSummary
  );

// Priority Suggestion (Manager/Admin only)
router
  .route("/suggest-priority")
  .post(
    isManagerOrAdmin,
    prioritySuggestionValidation,
    ValidationMiddleware,
    suggestPriority
  );

// Deadline Feasibility Check (Manager/Admin only)
router
  .route("/check-deadline")
  .post(
    isManagerOrAdmin,
    deadlineCheckValidation,
    ValidationMiddleware,
    checkDeadline
  );

// Task Feedback Generation (Manager/Admin only)
router
  .route("/task-feedback")
  .post(
    isManagerOrAdmin,
    taskFeedbackValidation,
    ValidationMiddleware,
    generateTaskFeedback
  );

// Performance Report (Role-based access handled in controller)
router
  .route("/performance-report/:employeeId")
  .get(employeeIdValidation, ValidationMiddleware, getPerformanceReport);

// Deadline Risk Prediction (Role-based access handled in controller)
router
  .route("/deadline-risk/:employeeId")
  .get(employeeIdValidation, ValidationMiddleware, getDeadlineRisk);

// Bottleneck Analysis with ID (Manager/Admin only)
router.route("/bottlenecks/:managerId").get(
  isManagerOrAdmin,
  managerIdValidation,
  ValidationMiddleware,
  analyzeBottlenecks
);

// Bottleneck Analysis with email (Manager/Admin only)
router.route("/bottlenecks").get(
  isManagerOrAdmin,
  ValidationMiddleware,
  analyzeBottlenecks
);

// Workload Simulation (Manager/Admin only)
router
  .route("/what-if")
  .post(
    isManagerOrAdmin,
    workloadSimulationValidation,
    ValidationMiddleware,
    simulateWorkloadChange
  );

// Task Explanation (Role-based access handled in controller)
router
  .route("/explain-task/:taskId")
  .get(taskIdValidation, ValidationMiddleware, explainTask);

// Resource Suggestions (Role-based access handled in controller)
router
  .route("/suggest-resources/:taskId")
  .get(taskIdValidation, ValidationMiddleware, suggestResources);

// Chatbot (Employee only)
router
  .route("/chatbot")
  .post(
    isEmployee,
    chatbotValidation,
    ValidationMiddleware,
    getChatbotResponse
  );

module.exports = router;
