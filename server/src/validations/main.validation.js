const { param, body } = require("express-validator");

exports.registerUserValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Enter valid Email")
    .toLowerCase(),
  body("password").notEmpty().withMessage("Password is required"),
];

exports.loginUserValidation = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Enter valid Email")
    .toLowerCase(),
  body("password").notEmpty().withMessage("Password is required"),
];

exports.addEmpValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("salary").notEmpty().withMessage("Salary is required"),
  body("role").notEmpty().withMessage("Role is required"),
  body("mobile").notEmpty().withMessage("Mobile No. is required"),
  body("address").notEmpty().withMessage("Address is required"),
  body("image").notEmpty().withMessage("Image URL is required"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Enter valid Email")
    .toLowerCase(),
];

exports.empId = [
  param("id")
    .notEmpty()
    .withMessage("ID is required")
    .isMongoId()
    .withMessage("Enter valid Mongo ID"),
];
