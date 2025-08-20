const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    empId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      enum: ["employee", "manager"],
      default: "employee",
    },
    salary: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      // Only required when employee has login access
    },
    hasLoginAccess: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
// Add pre-save hook to hash password
schema.pre("save", async function (next) {
  // Only hash the password if it's modified (or new)
  if (this.isModified("password") && this.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to compare password
schema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

const model = mongoose.model("employee", schema);

exports.EmpModel = model;
