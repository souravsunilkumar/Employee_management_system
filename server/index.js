require("dotenv").config({
  path: ".env",
});

const app = require("./src/app");
const { connectDB } = require("./src/config/db.config");

connectDB();
const port = process.env.PORT || 4500;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
