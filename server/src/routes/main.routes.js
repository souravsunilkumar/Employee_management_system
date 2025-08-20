const express = require("express");
const {
  registerUser,
  UserProfile,
  loginUser,
  addEmployee,
  AllEmployees,
  DeleteEmployee,
  GetEmployee,
  UpdateEmployee,
} = require("../controllers/main.controller");
const { updateEmployeeProfile, changeEmployeePassword } = require("../controllers/employee.controller");
const {
  registerUserValidation,
  loginUserValidation,
  addEmpValidation,
  empId,
} = require("../validations/main.validation");
const { ValidationMiddleware } = require("../middleware/ValidationMiddleware");
const { AuthValidationMiddleware } = require("../middleware/AuthValidation");
const { isManagerOrAdmin, isAdmin, isEmployee, canAccessEmployeeData } = require("../middleware/RoleMiddleware");
const router = express.Router();

// Public routes (no authentication required)
router
  .route("/register")
  .post(registerUserValidation, ValidationMiddleware, registerUser);

router
  .route("/login")
  .post(loginUserValidation, ValidationMiddleware, loginUser);

// All routes below require authentication
router.use(AuthValidationMiddleware);

// Common routes for all authenticated users
router.route("/profile").get(UserProfile);

// Manager/Admin only routes
router
  .route("/add-emp")
  .post(isManagerOrAdmin, addEmpValidation, ValidationMiddleware, addEmployee);

router.route("/all-emp")
  .get(isManagerOrAdmin, AllEmployees);

// Routes with role-based access control
router.route("/emp/:id")
  .delete(isManagerOrAdmin, empId, ValidationMiddleware, DeleteEmployee)
  .get(canAccessEmployeeData, empId, ValidationMiddleware, GetEmployee)
  .put(canAccessEmployeeData, empId, ValidationMiddleware, addEmpValidation, ValidationMiddleware, UpdateEmployee);

// Employee-specific routes (protected by employee role)
router.route("/update-employee-profile")
  .put(isEmployee, updateEmployeeProfile);

router.route("/change-employee-password")
  .post(isEmployee, changeEmployeePassword);

module.exports = router;
