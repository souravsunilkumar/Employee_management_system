const mongoose = require("mongoose");

const configSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["priority", "workload", "deadline", "performance", "ai"],
    },
  },
  {
    timestamps: true,
  }
);

// Static method to get config value
configSchema.statics.getValue = async function(key, defaultValue = null) {
  try {
    const config = await this.findOne({ key });
    return config ? config.value : defaultValue;
  } catch (error) {
    console.error(`Error fetching config for key ${key}:`, error);
    return defaultValue;
  }
};

// Static method to set config value
configSchema.statics.setValue = async function(key, value, description, category) {
  try {
    return await this.findOneAndUpdate(
      { key },
      { value, description, category },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error(`Error setting config for key ${key}:`, error);
    throw error;
  }
};

const model = mongoose.model("config", configSchema);

// Initialize default configurations
const initializeDefaultConfigs = async () => {
  const defaultConfigs = [
    {
      key: "priority_levels",
      value: ["Low", "Medium", "High", "Critical"],
      description: "Available task priority levels",
      category: "priority"
    },
    {
      key: "task_statuses",
      value: ["Pending", "In Progress", "Completed", "Reviewed"],
      description: "Available task status options",
      category: "priority"
    },
    {
      key: "workload_limits",
      value: {
        daily_hours: 8,
        weekly_hours: 40,
        max_concurrent_tasks: 5,
        high_priority_limit: 3
      },
      description: "Employee workload limits and thresholds",
      category: "workload"
    },
    {
      key: "deadline_benchmarks",
      value: {
        urgent_days: 1,
        normal_days: 7,
        extended_days: 14,
        buffer_percentage: 20
      },
      description: "Deadline classification and buffer settings",
      category: "deadline"
    },
    {
      key: "performance_ranges",
      value: {
        excellent: { min: 4.5, max: 5.0 },
        good: { min: 3.5, max: 4.4 },
        average: { min: 2.5, max: 3.4 },
        poor: { min: 1.0, max: 2.4 }
      },
      description: "Performance rating ranges",
      category: "performance"
    },
    {
      key: "ai_settings",
      value: {
        model: "gpt-4o-mini",
        max_tokens: 1000,
        temperature: 0.7,
        rate_limit_per_hour: 100
      },
      description: "AI service configuration settings",
      category: "ai"
    }
  ];

  try {
    for (const config of defaultConfigs) {
      await model.findOneAndUpdate(
        { key: config.key },
        config,
        { upsert: true, new: true }
      );
    }
    console.log("Default configurations initialized successfully");
  } catch (error) {
    console.error("Error initializing default configurations:", error);
  }
};

// Call initialization when the model is loaded
setTimeout(initializeDefaultConfigs, 1000);

exports.ConfigModel = model;
