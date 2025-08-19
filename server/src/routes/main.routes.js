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
const {
  registerUserValidation,
  loginUserValidation,
  addEmpValidation,
  empId,
} = require("../validations/main.validation");
const { ValidationMiddleware } = require("../middleware/ValidationMiddleware");
const { AuthValidationMiddleware } = require("../middleware/AuthValidation");
const router = express.Router();

router
  .route("/register")
  .post(registerUserValidation, ValidationMiddleware, registerUser);

router
  .route("/login")
  .post(loginUserValidation, ValidationMiddleware, loginUser);

router.use(AuthValidationMiddleware);

router.route("/profile").get(UserProfile);

router
  .route("/add-emp")
  .post(addEmpValidation, ValidationMiddleware, addEmployee);

router.route("/emp/:id")
  .delete(empId, ValidationMiddleware, DeleteEmployee)
  .get(empId, ValidationMiddleware, GetEmployee)
  .put(empId, ValidationMiddleware, addEmpValidation, ValidationMiddleware, UpdateEmployee);

router.route("/all-emp").get(AllEmployees);

module.exports = router;
