const config = require("../config/config");

// Middleware to check if user is a manager or admin
exports.isManagerOrAdmin = (req, res, next) => {
  try {
    console.log('=== CHECKING MANAGER/ADMIN ROLE ===');
    console.log('User:', req.user);
    console.log('UserType:', req.userType);
    console.log('Role:', req.role);
    
    if (!req.user || (req.user.userType !== config.userTypes.MANAGER && req.userType !== config.userTypes.MANAGER)) {
      console.log('Access denied: Not a manager');
      return res.status(403).send({ error: "Access denied. Managers only." });
    }
    
    console.log('Access granted: User is a manager');
    next();
  } catch (error) {
    console.error('Role middleware error:', error);
    res.status(400).send({ error: error.message });
  }
};

// Middleware to check if user is an admin
exports.isAdmin = (req, res, next) => {
  try {
    console.log('=== CHECKING ADMIN ROLE ===');
    console.log('User:', req.user);
    console.log('UserType:', req.userType);
    console.log('Role:', req.role);
    
    if (!req.user || req.user.userType !== config.userTypes.MANAGER || 
        (req.user.role !== config.userTypes.ADMIN && req.role !== config.userTypes.ADMIN)) {
      console.log('Access denied: Not an admin');
      return res.status(403).send({ error: "Access denied. Admins only." });
    }
    
    console.log('Access granted: User is an admin');
    next();
  } catch (error) {
    console.error('Role middleware error:', error);
    res.status(400).send({ error: error.message });
  }
};

// Middleware to check if user is an employee
exports.isEmployee = (req, res, next) => {
  try {
    console.log('=== CHECKING EMPLOYEE ROLE ===');
    console.log('User:', req.user);
    console.log('UserType:', req.userType);
    console.log('Role:', req.role);
    
    if (!req.user || (req.user.userType !== config.userTypes.EMPLOYEE && req.userType !== config.userTypes.EMPLOYEE)) {
      console.log('Access denied: Not an employee');
      return res.status(403).send({ error: "Access denied. Employees only." });
    }
    
    console.log('Access granted: User is an employee');
    next();
  } catch (error) {
    console.error('Role middleware error:', error);
    res.status(400).send({ error: error.message });
  }
};

// Middleware to check if user is authorized to access employee data
// Managers can access their employees, employees can access only their own data
exports.canAccessEmployeeData = (req, res, next) => {
  try {
    console.log('=== CHECKING DATA ACCESS PERMISSIONS ===');
    const employeeId = req.params.id;
    console.log('Requested employee ID:', employeeId);
    console.log('User:', req.user);
    
    // If user is an employee, they can only access their own data
    if (req.user && req.user.userType === config.userTypes.EMPLOYEE || req.userType === config.userTypes.EMPLOYEE) {
      const userId = req.user?.id || req.userId;
      console.log('Employee accessing data, comparing IDs:', userId, 'vs', employeeId);
      
      if (userId !== employeeId) {
        console.log('Access denied: Employee can only access their own data');
        return res.status(403).send({ 
          error: "Access denied. You can only access your own data." 
        });
      }
    }
    
    console.log('Access granted to employee data');
    next();
  } catch (error) {
    console.error('Data access middleware error:', error);
    res.status(400).send({ error: error.message });
  }
};
