const { default: mongoose } = require("mongoose");

exports.connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected with ${mongoose.connection.host}`);
  } catch (error) {
    console.log(error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};
