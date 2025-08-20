const aiService = require('../services/ai.service');
const { TaskModel } = require('../models/task.model');
const { EmpModel } = require('../models/emp.model');
const { validationResult } = require('express-validator');
const config = require('../config/config');

// Generate task summary
const generateTaskSummary = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { description } = req.body;
    const userId = req.user.id;

    const summary = await aiService.generateTaskSummary(description, userId);

    res.status(200).json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    console.error('Error generating task summary:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate task summary' 
    });
  }
};

// Suggest task priority
const suggestPriority = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { description, deadline } = req.body;
    const userId = req.user.id;

    const suggestion = await aiService.suggestPriority(description, deadline, userId);

    res.status(200).json({
      success: true,
      data: { suggestion }
    });
  } catch (error) {
    console.error('Error suggesting priority:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to suggest priority' 
    });
  }
};

// Check deadline feasibility
const checkDeadline = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { description, deadline, complexity } = req.body;
    const userId = req.user.id;

    const feasibility = await aiService.checkDeadlineFeasibility(description, deadline, complexity, userId);

    res.status(200).json({
      success: true,
      data: { feasibility }
    });
  } catch (error) {
    console.error('Error checking deadline:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to check deadline feasibility' 
    });
  }
};

// Generate task feedback
const generateTaskFeedback = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { taskId, rating } = req.body;
    const userId = req.user.id;

    const task = await TaskModel.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Calculate completion time
    const completionTime = new Date() - new Date(task.createdAt);

    const feedback = await aiService.generateTaskFeedback(task, completionTime, rating, userId);

    // Update task with AI feedback
    await TaskModel.findByIdAndUpdate(taskId, { aiFeedback: feedback });

    res.status(200).json({
      success: true,
      data: { feedback }
    });
  } catch (error) {
    console.error('Error generating task feedback:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate task feedback' 
    });
  }
};

// Generate performance report
const getPerformanceReport = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { period = 'monthly' } = req.query;
    const userId = req.user.id;

    // Check if user has access to this employee's data
    if (req.user.role === 'employee') {
      const employee = await EmpModel.findOne({ _id: employeeId, user: userId });
      if (!employee) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else {
      // For managers, check if employee belongs to them
      const employee = await EmpModel.findOne({ _id: employeeId, user: userId });
      if (!employee && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const report = await aiService.generatePerformanceReport(employeeId, period, userId);

    res.status(200).json({
      success: true,
      data: { report, period }
    });
  } catch (error) {
    console.error('Error generating performance report:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate performance report' 
    });
  }
};

// Predict deadline risk
const getDeadlineRisk = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const userId = req.user.id;

    // Check access permissions
    if (req.user.role === 'employee') {
      const employee = await EmpModel.findOne({ _id: employeeId, user: userId });
      if (!employee) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else {
      const employee = await EmpModel.findOne({ _id: employeeId, user: userId });
      if (!employee && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const riskAnalysis = await aiService.predictDeadlineRisk(employeeId, userId);

    res.status(200).json({
      success: true,
      data: { riskAnalysis }
    });
  } catch (error) {
    console.error('Error predicting deadline risk:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to predict deadline risk' 
    });
  }
};

// Analyze bottlenecks
const analyzeBottlenecks = async (req, res) => {
  // Return a temporary offline message as requested
  return res.status(503).json({
    error: "The AI service is temporarily offline due to usage limits.",
    configError: true
  });
};

// Simulate workload change
const simulateWorkloadChange = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { employeeId, taskData } = req.body;
    const userId = req.user.id;

    // Only managers can simulate workload changes
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const employee = await EmpModel.findOne({ _id: employeeId, user: userId });
    if (!employee && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const simulation = await aiService.simulateWorkloadChange(employeeId, taskData, userId);

    res.status(200).json({
      success: true,
      data: { simulation }
    });
  } catch (error) {
    console.error('Error simulating workload change:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to simulate workload change' 
    });
  }
};

// Explain task
const explainTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const task = await TaskModel.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user has access to this task
    if (req.user.role === 'employee') {
      const employee = await EmpModel.findOne({ user: userId });
      if (!employee || task.assignedTo.toString() !== employee._id.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else {
      // For managers, check if they assigned this task
      if (task.assignedBy.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const explanation = await aiService.explainTask(taskId, userId);

    res.status(200).json({
      success: true,
      data: { explanation }
    });
  } catch (error) {
    console.error('Error explaining task:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to explain task' 
    });
  }
};

// Suggest resources
const suggestResources = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const task = await TaskModel.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user has access to this task
    if (req.user.role === 'employee') {
      const employee = await EmpModel.findOne({ user: userId });
      if (!employee || task.assignedTo.toString() !== employee._id.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else {
      if (task.assignedBy.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const suggestions = await aiService.suggestResources(taskId, userId);

    res.status(200).json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    console.error('Error suggesting resources:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to suggest resources' 
    });
  }
};

// Chatbot response
const getChatbotResponse = async (req, res) => {
  console.log('========== CHATBOT REQUEST ==========');
  console.log('Request received at:', new Date().toISOString());
  console.log('Request body:', req.body);
  
  try {
    // Log authentication details
    console.log('Authentication check:');
    console.log('- User object:', req.user);
    console.log('- User authenticated:', !!req.user);
    console.log('- User ID:', req.user?.id || req.userId);
    console.log('- User role:', req.user?.role || req.role);
    console.log('- User type:', req.user?.userType || req.userType);
    console.log('- User email:', req.user?.email);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { query } = req.body;
    console.log('Query received:', query);
    
    // Get user ID from either the new or old structure
    const userId = req.user?.id || req.userId;
    if (!userId) {
      console.log('User ID not found in request');
      return res.status(401).json({ error: 'Authentication failed. Please log in again.' });
    }

    // Check if user is an employee (using either structure)
    const userType = req.user?.userType || req.userType;
    if (userType !== config.userTypes.EMPLOYEE) {
      console.log('Access denied: User type is not employee, actual type:', userType);
      return res.status(403).json({ error: 'Chatbot is only available for employees' });
    }

    console.log('Looking up employee profile for user ID:', userId);
    // Try to find employee by user ID first
    let employee = await EmpModel.findOne({ user: userId });
    
    // If not found, try to find by direct ID match (employee might be the user)
    if (!employee) {
      console.log('Employee not found by user reference, trying direct ID match');
      employee = await EmpModel.findById(userId);
    }
    
    console.log('Employee profile found:', !!employee);
    if (employee) {
      console.log('Employee ID:', employee._id);
      console.log('Employee name:', employee.name);
    }
    
    if (!employee) {
      console.log('Employee profile not found for user ID:', userId);
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    console.log('Calling AI service for chatbot response...');
    const response = await aiService.chatbotResponse(query, employee._id, userId);
    console.log('AI service response received, length:', response?.length || 0);

    console.log('Sending successful response');
    res.status(200).json({
      success: true,
      data: { response }
    });
    console.log('========== CHATBOT REQUEST COMPLETED ==========');
  } catch (error) {
    console.error('========== CHATBOT ERROR ==========');
    console.error('Error generating chatbot response:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('========== END CHATBOT ERROR ==========');
    
    res.status(500).json({ 
      error: error.message || 'Failed to generate chatbot response' 
    });
  }
};

module.exports = {
  generateTaskSummary,
  suggestPriority,
  checkDeadline,
  generateTaskFeedback,
  getPerformanceReport,
  getDeadlineRisk,
  analyzeBottlenecks,
  simulateWorkloadChange,
  explainTask,
  suggestResources,
  getChatbotResponse
};
