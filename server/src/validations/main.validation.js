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
  body("role").optional().isIn(["admin", "manager"]).withMessage("Role must be either admin or manager"),
];

exports.loginUserValidation = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Enter valid Email")
    .toLowerCase(),
  body("password").notEmpty().withMessage("Password is required"),
  body("userType").optional().isIn(["employee", "manager"]).withMessage("User type must be either employee or manager"),
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
  body("hasLoginAccess").optional().isBoolean().withMessage("hasLoginAccess must be a boolean"),
  body("password").optional().custom((value, { req }) => {
    if (req.body.hasLoginAccess && !value) {
      throw new Error("Password is required when hasLoginAccess is true");
    }
    return true;
  }),
  body("userType").optional().isIn(["employee", "manager"]).withMessage("User type must be either employee or manager"),
];

exports.empId = [
  param("id")
    .notEmpty()
    .withMessage("ID is required")
    .isMongoId()
    .withMessage("Enter valid Mongo ID"),
];
