// Configuration file for the application
module.exports = {
  jwt_auth_secret: process.env.JWT_SECRET || "@#$%^&()(^^&*()",
  jwt_expiry: process.env.JWT_EXPIRY || "3d",
  userTypes: {
    ADMIN: "admin",
    MANAGER: "manager",
    EMPLOYEE: "employee"
  }
};
