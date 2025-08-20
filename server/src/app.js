const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");

//middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(morgan("dev"));

//routes
app.use("/api/v1", require("./routes/main.routes"));
app.use("/api/v1/tasks", require("./routes/task.routes"));
app.use("/api/v1/ai", require("./routes/ai.routes"));

module.exports = app;
