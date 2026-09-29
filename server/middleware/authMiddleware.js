// server/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

/**
 * Secures routes by extracting and validating the JWT authorization header.
 * Attaches verified payload fields directly to the request object.
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Look for token inside the Authorization request header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Isolate token from 'Bearer <TOKEN>' pattern layout string
      token = req.headers.authorization.split(" ")[1];

      // 2. Decode signature structure using your hidden JWT environment key variable
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback_secret_key",
      );

      // 3. Mount student profile details context to the request structure state
      req.user = {
        id: decoded.id,
        student_id: decoded.student_id,
        role: decoded.role, // 'student' or 'admin'
      };

      return next(); // Step out to the next execution controller row node safely
    } catch (error) {
      console.error("Token verification pipeline failure:", error.message);
      return res
        .status(401)
        .json({
          success: false,
          message:
            "Not authorized: Invalid configuration token token signatures.",
        });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({
        success: false,
        message: "Not authorized: No session authorization tokens discovered.",
      });
  }
};

// Explicit object dictionary wrapper export format to cleanly match destructured calls
module.exports = { protect };
