const jwt = require("jsonwebtoken");
const config = require("../config/config");

exports.AuthValidationMiddleware = (req, res, next) => {
  try {
    console.log('=== AUTH VALIDATION MIDDLEWARE ===');
    console.log('Headers:', req.headers);
    
    const auth_token = req.headers["authorization"] || "";
    if (!auth_token || !auth_token.startsWith("Bearer ")) {
      throw new Error("Please Login First");
    }

    const token = auth_token.split(" ")[1];
    if (!token) {
      throw new Error("Enter Valid Token");
    }
    
    console.log('Token found, verifying...');
    const payload = jwt.verify(token, config.jwt_auth_secret);
    console.log('JWT Payload:', payload);
    
    // Set user information on the request object
    // This is critical for all role-based middleware
    req.user = {
      id: payload.userId || payload.id,
      role: payload.role,
      email: payload.email,
      userType: payload.userType
    };
    
    // For backward compatibility with existing code
    req.userId = payload.userId || payload.id;
    req.userType = payload.userType;
    req.role = payload.role;
    
    // If it's an employee, also add the manager ID
    if (payload.userType === config.userTypes.EMPLOYEE) {
      req.managerId = payload.managerId;
    }
    
    console.log('User authenticated:', {
      id: req.user.id,
      role: req.user.role,
      userType: req.user.userType,
      email: req.user.email
    });
    console.log('=== END AUTH VALIDATION ===');
    
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).send({ error: error.message });
  }
};
