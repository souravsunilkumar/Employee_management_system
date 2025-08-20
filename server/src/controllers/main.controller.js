const { UserModel } = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { EmpModel } = require("../models/emp.model");
const { default: randomInt } = require("random-int");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // exist user based on email
    const existUser = await UserModel.findOne({ email });
    if (existUser) {
      throw new Error("User already exists");
    }

    //password hash
    const hash_pass = await bcrypt.hash(password, 10);

    //create user
    const user = await UserModel.create({
      name,
      email,
      password: hash_pass,
      role: role || config.userTypes.MANAGER,
    });

    const token = jwt.sign({ 
      userId: user._id, 
      role: user.role,
      userType: "manager" 
    }, config.jwt_auth_secret, {
      expiresIn: config.jwt_expiry,
    });

    res.send({ message: "User registered successfully", token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

exports.UserProfile = async (req, res) => {
  try {
    console.log('=== USER PROFILE REQUEST ===');
    console.log('User object:', req.user);
    console.log('UserType:', req.userType);
    console.log('UserId:', req.user?.id || req.userId);
    
    // Get the user ID from either the new or old structure
    const userId = req.user?.id || req.userId;
    if (!userId) {
      console.log('User ID not found in request');
      return res.status(401).json({ error: 'Authentication failed. Please log in again.' });
    }
    
    // Handle different user types
    const userType = req.user?.userType || req.userType;
    
    if (userType === config.userTypes.EMPLOYEE) {
      console.log('Fetching employee profile for ID:', userId);
      // For employees, return their own profile
      const employee = await EmpModel.findById(userId)
        .select("name email empId role mobile address image salary -_id");
      
      if (!employee) {
        console.log('Employee profile not found');
        throw new Error("Employee profile not found");
      }
      
      // Convert to plain object and ensure salary is included
      const employeeData = employee.toObject();
      
      // Log the employee data to verify salary is present
      console.log('Employee data from DB:', employeeData);
      
      return res.status(200).send({ 
        ...employeeData,
        salary: employee.salary, // Explicitly include salary
        userType: config.userTypes.EMPLOYEE 
      });
    } else {
      console.log('Fetching manager profile for ID:', userId);
      // For managers/admins, return their profile and employee count
      const user = await UserModel.findById(userId).select("name email role -_id");
      const employees = await EmpModel.countDocuments({ user: userId });
      
      if (!user) {
        console.log('Manager profile not found');
        throw new Error("User profile not found");
      }
      
      return res.status(200).send({ 
        ...user.toObject(), 
        total_emp: employees,
        userType: "manager",
        role: user.role
      });
    }
  } catch (error) {
    console.error('Profile error:', error.message);
    res.status(400).send({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password, userType } = req.body;
    let existUser;
    let isMatch = false;
    let token;

    // Check if it's an employee or manager login
    if (userType === config.userTypes.EMPLOYEE) {
      // Employee login
      existUser = await EmpModel.findOne({ email, hasLoginAccess: true });
      if (!existUser) {
        throw new Error("Employee not found or doesn't have login access");
      }

      // Check password
      isMatch = await existUser.comparePassword(password);
      if (!isMatch) {
        throw new Error("Invalid Password");
      }

      // Generate token for employee
      token = jwt.sign({
        userId: existUser._id,
        userType: config.userTypes.EMPLOYEE,
        managerId: existUser.user
      }, config.jwt_auth_secret, {
        expiresIn: config.jwt_expiry,
      });
    } else {
      // Manager/Admin login
      existUser = await UserModel.findOne({ email });
      if (!existUser) {
        throw new Error("User not Registered");
      }

      // Check password
      isMatch = await bcrypt.compare(password, existUser.password);
      if (!isMatch) {
        throw new Error("Invalid Password");
      }

      // Generate token for manager/admin
      token = jwt.sign({
        userId: existUser._id,
        role: existUser.role,
        userType: "manager"
      }, config.jwt_auth_secret, {
        expiresIn: config.jwt_expiry,
      });
    }

    res.send({ 
      message: "Login Successful", 
      token,
      userType: userType || "manager",
      role: existUser.role || "employee"
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

exports.addEmployee = async (req, res) => {
  try {
    const { hasLoginAccess, password, ...employeeData } = req.body;
    
    // Check if user is a manager or admin
    if (req.userType !== "manager") {
      throw new Error("Only managers can add employees");
    }
    
    // If employee has login access, password is required
    if (hasLoginAccess && !password) {
      throw new Error("Password is required for employees with login access");
    }
    
    // Create the employee
    const employee = await EmpModel.create({
      ...employeeData,
      hasLoginAccess: hasLoginAccess || false,
      password: hasLoginAccess ? password : undefined,
      user: req.user,
      empId: "EMP" + randomInt(111, 999) + "ID",
    });
    
    res.status(200).send({ 
      message: "Employee Created",
      employee: {
        _id: employee._id,
        name: employee.name,
        empId: employee.empId,
        hasLoginAccess: employee.hasLoginAccess
      }
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

exports.AllEmployees = async (req, res) => {
  try {
    console.log('=== FETCHING ALL EMPLOYEES ===');
    // Get the user ID from either the new or old structure
    const userId = req.user?.id || req.userId;
    if (!userId) {
      console.log('User ID not found in request');
      return res.status(401).json({ error: 'Authentication failed. Please log in again.' });
    }
    
    console.log('Fetching employees for manager ID:', userId);
    const employees = await EmpModel.find({ user: userId });
    console.log('Found', employees.length, 'employees');
    
    res.status(200).send(employees);
  } catch (error) {
    console.error('Error fetching employees:', error.message);
    res.status(400).send({ error: error.message });
  }
};

exports.DeleteEmployee = async (req, res) => {
  try {
    console.log('=== DELETE EMPLOYEE REQUEST ===');
    const id = req.params.id;
    console.log('Employee ID to delete:', id);
    
    // Get the user ID from either the new or old structure
    const userId = req.user?.id || req.userId;
    if (!userId) {
      console.log('User ID not found in request');
      return res.status(401).json({ error: 'Authentication failed. Please log in again.' });
    }
    
    // Check if employee exists and belongs to the current user
    console.log('Checking if employee belongs to manager:', userId);
    const doc = await EmpModel.findOne({ _id: id, user: userId });
    
    if (!doc) {
      console.log('Employee not found or permission denied');
      throw new Error("Employee not found or you don't have permission to delete it");
    }

    console.log('Deleting employee...');
    await EmpModel.findByIdAndDelete(id);
    console.log('Employee deleted successfully');
    
    res.status(200).send({ message: "Employee Deleted" });
  } catch (error) {
    console.error('Error deleting employee:', error.message);
    res.status(400).send({ error: error.message });
  }
};

exports.GetEmployee = async (req, res) => {
  try {
    console.log('=== GET EMPLOYEE REQUEST ===');
    const id = req.params.id;
    console.log('Employee ID requested:', id);
    
    // Get the user ID from either the new or old structure
    const userId = req.user?.id || req.userId;
    if (!userId) {
      console.log('User ID not found in request');
      return res.status(401).json({ error: 'Authentication failed. Please log in again.' });
    }
    
    // Check if this is an employee accessing their own data or a manager
    const userType = req.user?.userType || req.userType;
    
    let employee;
    if (userType === config.userTypes.EMPLOYEE) {
      console.log('Employee accessing their own profile');
      // Employees can only access their own profile
      if (id !== userId) {
        console.log('Access denied: Employee can only view their own profile');
        return res.status(403).json({ error: 'Access denied. You can only view your own profile.' });
      }
      employee = await EmpModel.findById(id);
    } else {
      console.log('Manager accessing employee profile');
      // Find employee by ID and ensure it belongs to the current user (manager)
      employee = await EmpModel.findOne({ _id: id, user: userId });
    }
    
    if (!employee) {
      console.log('Employee not found');
      throw new Error("Employee not found or you don't have permission to view it");
    }

    console.log('Employee found, returning data');
    res.status(200).send(employee);
  } catch (error) {
    console.error('Error fetching employee:', error.message);
    res.status(400).send({ error: error.message });
  }
};

exports.UpdateEmployee = async (req, res) => {
  try {
    console.log('=== UPDATE EMPLOYEE REQUEST ===');
    const id = req.params.id;
    const { hasLoginAccess, password, ...employeeData } = req.body;
    console.log('Employee ID to update:', id);
    
    // Get the user ID and type from either the new or old structure
    const userId = req.user?.id || req.userId;
    const userType = req.user?.userType || req.userType;
    
    if (!userId) {
      console.log('User ID not found in request');
      return res.status(401).json({ error: 'Authentication failed. Please log in again.' });
    }
    
    console.log('User type:', userType);
    console.log('User ID:', userId);
    
    // Check if employee exists
    let employee;
    
    if (userType === config.userTypes.EMPLOYEE) {
      console.log('Employee updating their own profile');
      // Employees can only update their own profile
      if (userId !== id) {
        console.log('Access denied: Employee can only update their own profile');
        throw new Error("You can only update your own profile");
      }
      employee = await EmpModel.findById(id);
    } else {
      console.log('Manager updating employee profile');
      // Managers can update their employees
      employee = await EmpModel.findOne({ _id: id, user: userId });
    }
    
    if (!employee) {
      console.log('Employee not found or permission denied');
      throw new Error("Employee not found or you don't have permission to update it");
    }

    console.log('Employee found, preparing update data');
    // Prepare update data
    const updateData = { ...employeeData };
    
    // Handle login access changes (only managers can change this)
    if (userType === "manager" && hasLoginAccess !== undefined) {
      console.log('Manager updating login access:', hasLoginAccess);
      updateData.hasLoginAccess = hasLoginAccess;
      
      // If enabling login access and password is provided, update password
      if (hasLoginAccess && password) {
        console.log('Setting new password for employee');
        updateData.password = password;
      } else if (hasLoginAccess && !employee.password && !password) {
        // If enabling login but no password exists or provided
        console.log('Error: Password required for login access');
        throw new Error("Password is required when enabling login access");
      }
    } else if (userType === config.userTypes.EMPLOYEE && password) {
      console.log('Employee updating their password');
      // Employees can update their own password
      updateData.password = password;
    }

    console.log('Updating employee with new data');
    // Update the employee with the new data
    const updatedEmployee = await EmpModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // Remove sensitive data before sending response
    const responseEmployee = updatedEmployee.toObject();
    delete responseEmployee.password;

    console.log('Employee updated successfully');
    res.status(200).send({ 
      message: "Employee Updated Successfully", 
      employee: responseEmployee 
    });
  } catch (error) {
    console.error('Error updating employee:', error.message);
    res.status(400).send({ error: error.message });
  }
};
