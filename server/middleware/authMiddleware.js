const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = function (req, res, next) {
  // 1. Extract the token from the standard HTTP Authorization header
  const authHeader = req.header("Authorization");

  // Check if the Authorization header is completely missing
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Access denied. No authentication token supplied." });
  }

  // Parse the standard "Bearer <token>" format string cleanly
  let token;
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    token = authHeader; // Fallback in case Postman sends the token directly without Bearer prefix
  }

  // Double-check if the token text string itself is blank
  if (!token) {
    return res
      .status(401)
      .json({
        message: "Access denied. Authentication token is invalid or empty.",
      });
  }

  try {
    // 2. Verify the signed token signature using your server environment key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Bind the extracted user profile data directly onto the Express request object
    req.user = decoded.user;

    // Pass control to the next middleware or controller callback function down the chain
    next();
  } catch (error) {
    console.error("Token validation interceptor fault:", error.message);
    res
      .status(401)
      .json({ message: "Token is expired or invalid. Access unauthorized." });
  }
};
