const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==========================================
// 1. Verify Student and Activate Account
// ==========================================
exports.activateAccount = async (req, res) => {
  const { studentId, fullName, email, password } = req.body;

  try {
    // Check if the student exists on the official Section B roster
    const studentCheck = await pool.query(
      "SELECT * FROM students WHERE student_id = $1 AND email = $2",
      [studentId, email],
    );

    if (studentCheck.rows.length === 0) {
      return res
        .status(400)
        .json({
          message:
            "Verification failed. Student ID or email not found on the official list.",
        });
    }

    // Check if user credentials have already been registered
    const userCheck = await pool.query(
      "SELECT * FROM users WHERE student_id = $1",
      [studentId],
    );
    if (userCheck.rows.length > 0) {
      return res
        .status(400)
        .json({
          message:
            "Account has already been activated. Please proceed to login.",
        });
    }

    // Hash the password securely using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert new credentials into the users authentication table
    await pool.query(
      "INSERT INTO users (student_id, password_hash, role) VALUES ($1, $2, $3)",
      [studentId, passwordHash, "student"],
    );

    // Update the student profile status to verified
    await pool.query(
      "UPDATE students SET is_verified = true WHERE student_id = $1",
      [studentId],
    );

    res
      .status(201)
      .json({ message: "Account activated successfully! You can now log in." });
  } catch (error) {
    console.error("Activation Error:", error.message);
    res
      .status(500)
      .json({ message: "Server error during activation runtime loop." });
  }
};

// ==========================================
// 2. Student & Admin Login Handler
// ==========================================
exports.login = async (req, res) => {
  const { studentId, password } = req.body;

  try {
    // Look up the user record by their unique student_id or admin identifier
    const userResult = await pool.query(
      "SELECT * FROM users WHERE student_id = $1",
      [studentId],
    );

    if (userResult.rows.length === 0) {
      return res
        .status(400)
        .json({
          message: "Invalid credentials. User matching that ID does not exist.",
        });
    }

    const user = userResult.rows[0];

    // Check if the user account has been disabled by an administrator
    if (!user.is_active) {
      return res
        .status(403)
        .json({
          message:
            "Account access has been deactivated. Please contact your administrator.",
        });
    }

    // Compare incoming plain-text password against the stored bcrypt hash string
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid credentials. Incorrect password." });
    }

    // Fetch profile details from the students table to return descriptive frontend payloads
    let userDetails = { fullName: "Administrator", email: "" };
    if (user.role === "student") {
      const studentProfile = await pool.query(
        "SELECT full_name, email FROM students WHERE student_id = $1",
        [studentId],
      );
      if (studentProfile.rows.length > 0) {
        userDetails.fullName = studentProfile.rows[0].full_name;
        userDetails.email = studentProfile.rows[0].email;
      }
    }

    // Generate a secure JWT payload signed with your custom environment key
    const payload = {
      user: {
        studentId: user.student_id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" }, // Session token configuration valid for 1 day
      (err, token) => {
        if (err) throw err;

        // Return success response containing the access token, role status, and basic context
        res.json({
          token,
          user: {
            studentId: user.student_id,
            role: user.role,
            fullName: userDetails.fullName,
            email: userDetails.email,
          },
        });
      },
    );
  } catch (error) {
    console.error("Login Endpoint Error:", error.message);
    res
      .status(500)
      .json({ message: "Server error during authentication validation loop." });
  }
};
