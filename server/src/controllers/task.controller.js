const { TaskModel } = require("../models/task.model");
const { EmpModel } = require("../models/emp.model");
const { UserModel } = require("../models/user.model");

// Create a new task (Manager only)
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, deadline, attachments } = req.body;
    const assignedBy = req.user; // Manager ID from JWT

    // Verify that the assigned employee exists and belongs to this manager
    const employee = await EmpModel.findById(assignedTo);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Verify that the employee belongs to this manager
    if (employee.user.toString() !== assignedBy.toString()) {
      return res.status(403).json({ error: "You can only assign tasks to your own employees" });
    }

    const task = await TaskModel.create({
      title,
      description,
      assignedBy,
      assignedTo,
      priority: priority || "Medium",
      deadline: new Date(deadline),
      attachments: attachments || [],
    });

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
    const managerId = req.user; // Manager ID from JWT

    const tasks = await TaskModel.find({ assignedBy: managerId })
      .populate("assignedTo", "name email empId image")
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    console.error("Error fetching manager tasks:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get tasks assigned to an employee
exports.getTasksByEmployee = async (req, res) => {
  try {
    const employeeId = req.user; // Employee ID from JWT

    const tasks = await TaskModel.find({ assignedTo: employeeId })
      .populate("assignedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    console.error("Error fetching employee tasks:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update task status (Employee only)
exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, attachments } = req.body;
    const employeeId = req.user; // Employee ID from JWT

    // Find the task and verify it belongs to this employee
    const task = await TaskModel.findById(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (task.assignedTo.toString() !== employeeId.toString()) {
      return res.status(403).json({ error: "You can only update your own tasks" });
    }

    // Validate status transition
    const validStatuses = ["Pending", "In Progress", "Completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Update task
    task.status = status;
    if (attachments && Array.isArray(attachments)) {
      task.attachments = [...task.attachments, ...attachments];
    }

    await task.save();

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
    const { id } = req.params;
    const { feedback, rating } = req.body;
    const managerId = req.user; // Manager ID from JWT

    // Find the task and verify it was assigned by this manager
    const task = await TaskModel.findById(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (task.assignedBy.toString() !== managerId.toString()) {
      return res.status(403).json({ error: "You can only review tasks you assigned" });
    }

    if (task.status !== "Completed") {
      return res.status(400).json({ error: "Task must be completed before review" });
    }

    // Update task with review
    task.feedback = feedback;
    task.rating = rating;
    task.status = "Reviewed";

    await task.save();

    const reviewedTask = await TaskModel.findById(id)
      .populate("assignedBy", "name email")
      .populate("assignedTo", "name email empId");

    res.json({
      message: "Task reviewed successfully",
      task: reviewedTask,
    });
  } catch (error) {
    console.error("Error reviewing task:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get task statistics for dashboard
exports.getTaskStats = async (req, res) => {
  try {
    const userId = req.user;
    const userType = req.userType;

    let stats = {};

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
    } else if (userType === "employee") {
      // Employee stats
      const totalTasks = await TaskModel.countDocuments({ assignedTo: userId });
      const pending = await TaskModel.countDocuments({ 
        assignedTo: userId, 
        status: "Pending" 
      });
      const inProgress = await TaskModel.countDocuments({ 
        assignedTo: userId, 
        status: "In Progress" 
      });
      const completed = await TaskModel.countDocuments({ 
        assignedTo: userId, 
        status: { $in: ["Completed", "Reviewed"] }
      });

      stats = {
        totalTasks,
        pending,
        inProgress,
        completed,
      };
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
    const managerId = req.user; // Manager ID from JWT

    // Find employees managed by this manager
    const employees = await EmpModel.find({ user: managerId })
      .select("name empId email")
      .sort({ name: 1 });

    res.json({ employees });
  } catch (error) {
    console.error("Error fetching employees for assignment:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update task (manager only)
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user;
    const { title, description, priority, deadline, assignedTo } = req.body;

    // Find the task and verify it belongs to the manager
    const task = await TaskModel.findOne({ _id: id, assignedBy: managerId });
    if (!task) {
      return res.status(404).json({ error: "Task not found or unauthorized" });
    }

    // If assignedTo is being changed, verify the new employee belongs to the manager
    if (assignedTo && assignedTo !== task.assignedTo.toString()) {
      const employee = await EmpModel.findOne({ 
        _id: assignedTo, 
        user: managerId 
      });
      if (!employee) {
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
    const { id } = req.params;
    const managerId = req.user;

    // Find and delete the task, ensuring it belongs to the manager
    const task = await TaskModel.findOneAndDelete({ 
      _id: id, 
      assignedBy: managerId 
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found or unauthorized" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: error.message });
  }
};
