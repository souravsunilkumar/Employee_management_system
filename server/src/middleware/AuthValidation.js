const jwt = require("jsonwebtoken");
const jwt_auth_scret = "@#$%^&()(^^&*()";

exports.AuthValidationMiddleware = (req, res, next) => {
  try {
    const auth_token = req.headers["authorization"] || "";
    if (!auth_token || !auth_token.startsWith("Bearer ")) {
      throw new Error("Please Login First");
    }

    const token = auth_token.split(" ")[1];
    if (!token) {
      throw new Error("Enter Valid Token");
    }
    const payload = jwt.verify(token, jwt_auth_scret);
    req.user = payload.userId;
    next();
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};
