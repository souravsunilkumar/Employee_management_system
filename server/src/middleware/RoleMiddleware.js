const config = require("../config/config");

// Middleware to check if user is a manager or admin
exports.isManagerOrAdmin = (req, res, next) => {
  try {
    if (req.userType !== "manager") {
      return res.status(403).send({ error: "Access denied. Managers only." });
    }
    next();
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// Middleware to check if user is an admin
exports.isAdmin = (req, res, next) => {
  try {
    if (req.userType !== "manager" || req.role !== config.userTypes.ADMIN) {
      return res.status(403).send({ error: "Access denied. Admins only." });
    }
    next();
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// Middleware to check if user is an employee
exports.isEmployee = (req, res, next) => {
  try {
    if (req.userType !== config.userTypes.EMPLOYEE) {
      return res.status(403).send({ error: "Access denied. Employees only." });
    }
    next();
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// Middleware to check if user is authorized to access employee data
// Managers can access their employees, employees can access only their own data
exports.canAccessEmployeeData = (req, res, next) => {
  try {
    const employeeId = req.params.id;
    
    // If user is an employee, they can only access their own data
    if (req.userType === config.userTypes.EMPLOYEE) {
      if (req.user !== employeeId) {
        return res.status(403).send({ 
          error: "Access denied. You can only access your own data." 
        });
      }
    }
    
    next();
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};
