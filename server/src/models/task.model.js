const mongoose = require("mongoose");
const { default: randomInt } = require("random-int");

const schema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "employee",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Reviewed"],
      default: "Pending",
    },
    deadline: {
      type: Date,
      required: true,
    },
    attachments: [{
      type: String, // URLs to uploaded files
    }],
    feedback: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    // AI-powered fields
    aiSummary: {
      type: String,
      trim: true,
    },
    aiPrioritySuggestion: {
      type: String,
      trim: true,
    },
    aiDeadlineWarning: {
      type: String,
      trim: true,
    },
    aiFeedback: {
      type: String,
      trim: true,
    },
    aiAnalysis: {
      complexity: {
        type: String,
        enum: ["Simple", "Moderate", "Complex", "Very Complex"],
      },
      estimatedHours: {
        type: Number,
        min: 0,
      },
      skillsRequired: [{
        type: String,
      }],
      riskFactors: [{
        type: String,
      }],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate unique taskId
schema.pre("save", async function (next) {
  if (this.isNew && !this.taskId) {
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      const taskId = `TASK-${Date.now()}-${randomInt(1000, 9999)}`;
      try {
        const existingTask = await this.constructor.findOne({ taskId });
        if (!existingTask) {
          this.taskId = taskId;
          isUnique = true;
        }
      } catch (error) {
        console.error('Error checking taskId uniqueness:', error);
      }
      attempts++;
    }
    
    if (!isUnique) {
      return next(new Error('Failed to generate unique taskId'));
    }
  }
  next();
});

const model = mongoose.model("task", schema);

exports.TaskModel = model;
