const { TaskModel } = require("../models/task.model");
const { EmpModel } = require("../models/emp.model");
const { UserModel } = require("../models/user.model");

// Create a new task (Manager only)
exports.createTask = async (req, res) => {
  try {
    console.log('=== CREATE TASK ===');
    const { title, description, assignedTo, priority, deadline, attachments } = req.body;
    
    // Get the user ID from either the new or old structure
    const userId = req.user?.id || req.userId;
    if (!userId) {
      console.log('User ID not found in request');
      return res.status(401).json({ error: 'Authentication failed. Please log in again.' });
    }
    
    console.log('Manager ID creating task:', userId);
    console.log('Task details:', { title, assignedTo, priority, deadline });

    // Verify that the assigned employee exists and belongs to this manager
    const employee = await EmpModel.findById(assignedTo);
    if (!employee) {
      console.log('Employee not found:', assignedTo);
      return res.status(404).json({ error: "Employee not found" });
    }

    // Verify that the employee belongs to this manager
    if (employee.user.toString() !== userId.toString()) {
      console.log('Employee does not belong to this manager');
      return res.status(403).json({ error: "You can only assign tasks to your own employees" });
    }

    const task = await TaskModel.create({
      title,
      description,
      assignedBy: userId,
      assignedTo,
      priority: priority || "Medium",
      deadline: new Date(deadline),
      attachments: attachments || [],
    });
    console.log('Task created with ID:', task._id);

    // Populate the task with employee and manager details
    const populatedTask = await TaskModel.findById(task._id)
      .populate("assignedBy", "name email")
      .populate("assignedTo", "name email empId");

    res.status(201).json({
      message: "Task created successfully",
      task: populatedTask,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get tasks assigned by a manager
exports.getTasksByManager = async (req, res) => {
  try {
    console.log('=== GET TASKS BY MANAGER ===');
    // Get the user ID from either the new or old structure
    const userId = req.user?.id || req.userId;
    if (!userId) {
      console.log('User ID not found in request');
      return res.status(401).json({ error: 'Authentication failed. Please log in again.' });
    }
    
    console.log('Manager ID fetching tasks:', userId);

    const tasks = await TaskModel.find({ assignedBy: userId })
      .populate("assignedTo", "name email empId image")
      .sort({ createdAt: -1 });

    console.log(`Found ${tasks.length} tasks assigned by manager`);
    res.json({ tasks });
  } catch (error) {
    console.error("Error fetching manager tasks:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get tasks assigned to an employee
exports.getTasksByEmployee = async (req, res) => {
  try {
    console.log('=== GET TASKS BY EMPLOYEE ===');
    // Get the user ID from either the new or old structure
    const userId = req.user?.id || req.userId;
    if (!userId) {
      console.log('User ID not found in request');
      return res.status(401).json({ error: 'Authentication failed. Please log in again.' });
    }
    
    console.log('Employee ID fetching tasks:', userId);
    
    // First try to find the employee record for this user
    const employee = await EmpModel.findOne({ user: userId });
    
    // If not found by user reference, try direct ID match
    const employeeId = employee ? employee._id : userId;
    console.log('Using employee ID for task lookup:', employeeId);
    
    const tasks = await TaskModel.find({ assignedTo: employeeId })
      .populate("assignedBy", "name email")
      .sort({ createdAt: -1 });

    console.log(`Found ${tasks.length} tasks assigned to employee`);
    res.json({ tasks });
  } catch (error) {
    console.error("Error fetching employee tasks:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update task status (Employee only)
exports.updateTaskStatus = async (req, res) => {
  try {
    console.log('=== UPDATE TASK STATUS ===');
    const { id } = req.params;
    const { status, attachments } = req.body;
    
    // Get the user ID from either the new or old structure
    const userId = req.user?.id || req.userId;
    if (!userId) {
      console.log('User ID not found in request');
      return res.status(401).json({ error: 'Authentication failed. Please log in again.' });
    }
    
    console.log('Employee updating task status:', userId);
    console.log('Task ID:', id);
    console.log('New status:', status);
    
    // First try to find the employee record for this user
    const employee = await EmpModel.findOne({ user: userId });
    
    // If not found by user reference, try direct ID match
    const employeeId = employee ? employee._id : userId;
    console.log('Using employee ID for task verification:', employeeId);

    // Find the task and verify it belongs to this employee
    const task = await TaskModel.findById(id);
    if (!task) {
      console.log('Task not found');
      return res.status(404).json({ error: "Task not found" });
    }

    console.log('Task assignedTo:', task.assignedTo);
    console.log('Employee ID:', employeeId);
    
    if (task.assignedTo.toString() !== employeeId.toString()) {
      console.log('Task does not belong to this employee');
      return res.status(403).json({ error: "You can only update your own tasks" });
    }

    // Validate status transition
    const validStatuses = ["Pending", "In Progress", "Completed"];
    if (!validStatuses.includes(status)) {
      console.log('Invalid status:', status);
      return res.status(400).json({ error: "Invalid status" });
    }

    // Update task
    task.status = status;
    if (attachments && Array.isArray(attachments)) {
      task.attachments = [...task.attachments, ...attachments];
    }

    await task.save();
    console.log('Task status updated successfully');

    const updatedTask = await TaskModel.findById(id)
      .populate("assignedBy", "name email")
      .populate("assignedTo", "name email empId");

    res.json({
      message: "Task status updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ error: error.message });
  }
};

// Review task (Manager only)
exports.reviewTask = async (req, res) => {
  try {
    console.log('=== REVIEW TASK ===');
    const { id } = req.params;
    const { feedback, rating } = req.body;
    
    // Get the user ID from either the new or old structure
    const userId = req.user?.id || req.userId;
    if (!userId) {
      console.log('User ID not found in request');
      return res.status(401).json({ error: 'Authentication failed. Please log in again.' });
    }
    
    console.log('Manager reviewing task:', userId);
    console.log('Task ID:', id);
    console.log('Rating:', rating);

    // Find the task and verify it belongs to this manager
    const task = await TaskModel.findOne({ _id: id, assignedBy: userId });
    if (!task) {
      console.log('Task not found or unauthorized');
      return res.status(404).json({ error: "Task not found or unauthorized" });
    }

    // Verify task is in Completed status
    if (task.status !== "Completed") {
      console.log('Task not in Completed status:', task.status);
      return res.status(400).json({ error: "Only completed tasks can be reviewed" });
    }

    // Update task
    task.feedback = feedback || "";
    task.rating = rating;
    task.status = "Reviewed";
    task.reviewedAt = new Date();

    await task.save();
    console.log('Task reviewed successfully');

    const updatedTask = await TaskModel.findById(id)
      .populate("assignedBy", "name email")
      .populate("assignedTo", "name email empId");

    res.json({
      message: "Task reviewed successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Error reviewing task:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get task statistics for dashboard
exports.getTaskStats = async (req, res) => {
  try {
    console.log('=== GET TASK STATS ===');
    // Get the user ID from either the new or old structure
    const userId = req.user?.id || req.userId;
    if (!userId) {
      console.log('User ID not found in request');
      return res.status(401).json({ error: 'Authentication failed. Please log in again.' });
    }
    
    // Get user type from either structure
    const userType = req.user?.userType || req.userType;
    console.log('User getting task stats:', userId);
    console.log('User type:', userType);
    
    let stats = {};
    let employeeId = userId;

    // If user is an employee, we need to find their employee record
    if (userType === "employee") {
      const employee = await EmpModel.findOne({ user: userId });
      if (employee) {
        employeeId = employee._id;
        console.log('Found employee record, using ID:', employeeId);
      }
    }

    if (userType === "manager") {
      // Manager stats
      const totalAssigned = await TaskModel.countDocuments({ assignedBy: userId });
      const pendingReview = await TaskModel.countDocuments({ 
        assignedBy: userId, 
        status: "Completed" 
      });
      const inProgress = await TaskModel.countDocuments({ 
        assignedBy: userId, 
        status: "In Progress" 
      });
      const completed = await TaskModel.countDocuments({ 
        assignedBy: userId, 
        status: "Reviewed" 
      });

      stats = {
        totalAssigned,
        pendingReview,
        inProgress,
        completed,
      };
      console.log('Manager stats:', stats);
    } else if (userType === "employee") {
      // Employee stats
      const totalTasks = await TaskModel.countDocuments({ assignedTo: employeeId });
      const pending = await TaskModel.countDocuments({ 
        assignedTo: employeeId, 
        status: "Pending" 
      });
      const inProgress = await TaskModel.countDocuments({ 
        assignedTo: employeeId, 
        status: "In Progress" 
      });
      const completed = await TaskModel.countDocuments({ 
        assignedTo: employeeId, 
        status: { $in: ["Completed", "Reviewed"] }
      });

      stats = {
        totalTasks,
        pending,
        inProgress,
        completed,
      };
      console.log('Employee stats:', stats);
    }

    res.json({ stats });
  } catch (error) {
    console.error("Error fetching task stats:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get employees for assignment dropdown (manager only)
exports.getEmployeesForAssignment = async (req, res) => {
  try {
    console.log('=== GET EMPLOYEES FOR ASSIGNMENT ===');
    // Get the user ID from either the new or old structure
    const userId = req.user?.id || req.userId;
    if (!userId) {
      console.log('User ID not found in request');
      return res.status(401).json({ error: 'Authentication failed. Please log in again.' });
    }
    
    console.log('Manager ID fetching employees:', userId);

    // Find employees managed by this manager
    const employees = await EmpModel.find({ user: userId })
      .select("name empId email")
      .sort({ name: 1 });

    console.log(`Found ${employees.length} employees for assignment`);
    res.json({ employees });
  } catch (error) {
    console.error("Error fetching employees for assignment:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update task (manager only)
exports.updateTask = async (req, res) => {
  try {
    console.log('=== UPDATE TASK ===');
    const { id } = req.params;
    // Get the user ID from either the new or old structure
    const userId = req.user?.id || req.userId;
    if (!userId) {
      console.log('User ID not found in request');
      return res.status(401).json({ error: 'Authentication failed. Please log in again.' });
    }
    
    console.log('Manager ID updating task:', userId);
    console.log('Task ID:', id);
    
    const { title, description, priority, deadline, assignedTo } = req.body;
    console.log('Update data:', { title, priority, deadline, assignedTo });

    // Find the task and verify it belongs to the manager
    const task = await TaskModel.findOne({ _id: id, assignedBy: userId });
    if (!task) {
      console.log('Task not found or unauthorized');
      return res.status(404).json({ error: "Task not found or unauthorized" });
    }

    // If assignedTo is being changed, verify the new employee belongs to the manager
    if (assignedTo && assignedTo !== task.assignedTo.toString()) {
      console.log('Verifying new employee assignment:', assignedTo);
      const employee = await EmpModel.findOne({ 
        _id: assignedTo, 
        user: userId 
      });
      if (!employee) {
        console.log('Employee not found or not managed by this manager');
        return res.status(400).json({ error: "Employee not found or not managed by you" });
      }
    }

    // Update task fields
    if (title) task.title = title;
    if (description) task.description = description;
    if (priority) task.priority = priority;
    if (deadline) task.deadline = new Date(deadline);
    if (assignedTo) task.assignedTo = assignedTo;

    await task.save();
    console.log('Task updated successfully');

    // Populate the updated task
    const updatedTask = await TaskModel.findById(task._id)
      .populate("assignedBy", "name email")
      .populate("assignedTo", "name empId email");

    res.json({ 
      message: "Task updated successfully", 
      task: updatedTask 
    });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete task (manager only)
exports.deleteTask = async (req, res) => {
  try {
    console.log('=== DELETE TASK ===');
    const { id } = req.params;
    // Get the user ID from either the new or old structure
    const userId = req.user?.id || req.userId;
    if (!userId) {
      console.log('User ID not found in request');
      return res.status(401).json({ error: 'Authentication failed. Please log in again.' });
    }
    
    console.log('Manager ID deleting task:', userId);
    console.log('Task ID:', id);

    // Find and delete the task, ensuring it belongs to the manager
    const task = await TaskModel.findOneAndDelete({ 
      _id: id, 
      assignedBy: userId 
    });

    if (!task) {
      console.log('Task not found or unauthorized');
      return res.status(404).json({ error: "Task not found or unauthorized" });
    }

    console.log('Task deleted successfully');
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: error.message });
  }
};
