const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==========================================
// 1. Verify Student and Activate/Register Account
// ==========================================
exports.activateAccount = async (req, res) => {
  const { studentId, fullName, email, password } = req.body;

  try {
    // Check if user credentials have already been registered to prevent ID theft
    const userCheck = await pool.query(
      "SELECT * FROM users WHERE student_id = $1",
      [studentId],
    );
    if (userCheck.rows.length > 0) {
      return res.status(400).json({
        message:
          "Account has already been activated with this ID. Please proceed to login.",
      });
    }

    // Hash the password securely using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // ALL students can register here successfully!
    await pool.query(
      "INSERT INTO users (student_id, password_hash, role) VALUES ($1, $2, $3)",
      [studentId, passwordHash, "student"],
    );

    // IF they happen to be on your official roster, update their profile status to verified
    const studentCheck = await pool.query(
      "SELECT * FROM students WHERE student_id = $1",
      [studentId],
    );

    if (studentCheck.rows.length > 0) {
      await pool.query(
        "UPDATE students SET email = $1, full_name = $2, is_verified = true WHERE student_id = $3",
        [email, fullName, studentId],
      );
    }

    res.status(201).json({
      message: "Account created successfully! You can now log in.",
    });
  } catch (error) {
    console.error("Activation Error:", error.message);
    res.status(500).json({
      message: "Server error during registration workflow.",
    });
  }
};

// ==========================================
// 2. Student & Admin Login Handler
// ==========================================
exports.login = async (req, res) => {
  const { studentId, password } = req.body;

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE student_id = $1",
      [studentId],
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid credentials. User matching that ID does not exist.",
      });
    }

    const user = userResult.rows[0]; // Targeted the single user row object cleanly

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials. Incorrect password.",
      });
    }

    // Dynamic payload mapping based on whether they exist in the official class roster
    let userDetails = { fullName: "Student User", email: "" };
    const studentProfile = await pool.query(
      "SELECT full_name, email FROM students WHERE student_id = $1",
      [studentId],
    );

    if (studentProfile.rows.length > 0) {
      userDetails.fullName = studentProfile.rows[0].full_name;
      userDetails.email = studentProfile.rows[0].email;
    }

    const payload = {
      user: {
        studentId: user.student_id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
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
    res.status(500).json({
      message: "Server error during authentication validation loop.",
    });
  }
};
