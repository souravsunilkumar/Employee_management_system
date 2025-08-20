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
    // Handle different user types
    if (req.userType === config.userTypes.EMPLOYEE) {
      // For employees, return their own profile
      const employee = await EmpModel.findById(req.user)
        .select("name email empId role mobile address image salary -_id");
      
      if (!employee) {
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
      // For managers/admins, return their profile and employee count
      const user = await UserModel.findById(req.user).select("name email role -_id");
      const employees = await EmpModel.countDocuments({ user: req.user });
      
      if (!user) {
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
    const employees = await EmpModel.find({ user: req.user });
    res.status(200).send(employees);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

exports.DeleteEmployee = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Check if employee exists and belongs to the current user
    const doc = await EmpModel.findOne({ _id: id, user: req.user });
    
    if (!doc) {
      throw new Error("Employee not found or you don't have permission to delete it");
    }

    await EmpModel.findByIdAndDelete(id);
    res.status(200).send({ message: "Employee Deleted" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

exports.GetEmployee = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Find employee by ID and ensure it belongs to the current user
    const employee = await EmpModel.findOne({ _id: id, user: req.user });
    
    if (!employee) {
      throw new Error("Employee not found or you don't have permission to view it");
    }

    res.status(200).send(employee);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

exports.UpdateEmployee = async (req, res) => {
  try {
    const id = req.params.id;
    const { hasLoginAccess, password, ...employeeData } = req.body;
    
    // Check if employee exists
    let employee;
    
    if (req.userType === config.userTypes.EMPLOYEE) {
      // Employees can only update their own profile
      if (req.user !== id) {
        throw new Error("You can only update your own profile");
      }
      employee = await EmpModel.findById(id);
    } else {
      // Managers can update their employees
      employee = await EmpModel.findOne({ _id: id, user: req.user });
    }
    
    if (!employee) {
      throw new Error("Employee not found or you don't have permission to update it");
    }

    // Prepare update data
    const updateData = { ...employeeData };
    
    // Handle login access changes (only managers can change this)
    if (req.userType === "manager" && hasLoginAccess !== undefined) {
      updateData.hasLoginAccess = hasLoginAccess;
      
      // If enabling login access and password is provided, update password
      if (hasLoginAccess && password) {
        updateData.password = password;
      } else if (hasLoginAccess && !employee.password && !password) {
        // If enabling login but no password exists or provided
        throw new Error("Password is required when enabling login access");
      }
    } else if (req.userType === config.userTypes.EMPLOYEE && password) {
      // Employees can update their own password
      updateData.password = password;
    }

    // Update the employee with the new data
    const updatedEmployee = await EmpModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // Remove sensitive data before sending response
    const responseEmployee = updatedEmployee.toObject();
    delete responseEmployee.password;

    res.status(200).send({ 
      message: "Employee Updated Successfully", 
      employee: responseEmployee 
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};
