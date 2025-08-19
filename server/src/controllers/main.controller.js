const { UserModel } = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwt_auth_scret = "@#$%^&()(^^&*()";
const { EmpModel } = require("../models/emp.model");
const { default: randomInt } = require("random-int");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

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
    });

    const token = jwt.sign({ userId: user._id }, jwt_auth_scret, {
      expiresIn: "3d",
    });

    res.send({ message: "User registered successfully", token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

exports.UserProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user).select("name email -_id");
    const employees = await EmpModel.countDocuments({ user: req.user });
    return res.status(200).send({ ...user.toObject(), total_emp: employees });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // exist user based on email
    const existUser = await UserModel.findOne({ email });
    if (!existUser) {
      throw new Error("User not Registered");
    }

    //password hash
    const isMatch = await bcrypt.compare(password, existUser.password);

    if (!isMatch) {
      throw new Error("Invalid Password");
    }

    const token = jwt.sign({ userId: existUser._id }, jwt_auth_scret, {
      expiresIn: "3d",
    });

    res.send({ message: "Login Successful", token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

exports.addEmployee = async (req, res) => {
  try {
    await EmpModel.create({
      ...req.body,
      user: req.user,
      empId: "EMP" + randomInt(111, 999) + "ID",
    });
    res.status(200).send({ message: "Employee Created" });
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
    
    // Check if employee exists and belongs to the current user
    const employee = await EmpModel.findOne({ _id: id, user: req.user });
    
    if (!employee) {
      throw new Error("Employee not found or you don't have permission to update it");
    }

    // Update the employee with the new data
    const updatedEmployee = await EmpModel.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.status(200).send({ message: "Employee Updated Successfully", employee: updatedEmployee });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};
