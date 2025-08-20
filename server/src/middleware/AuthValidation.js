const jwt = require("jsonwebtoken");
const config = require("../config/config");

exports.AuthValidationMiddleware = (req, res, next) => {
  try {
    const auth_token = req.headers["authorization"] || "";
    if (!auth_token || !auth_token.startsWith("Bearer ")) {
      throw new Error("Please Login First");
    }

    const token = auth_token.split(" ")[1];
    if (!token) {
      throw new Error("Enter Valid Token");
    }
    const payload = jwt.verify(token, config.jwt_auth_secret);
    
    // Add user info to request object
    req.user = payload.userId;
    req.userType = payload.userType;
    req.role = payload.role;
    
    // If it's an employee, also add the manager ID
    if (payload.userType === config.userTypes.EMPLOYEE) {
      req.managerId = payload.managerId;
    }
    
    next();
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};
