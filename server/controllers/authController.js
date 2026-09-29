// server/controllers/authController.js
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * STEP 1A: Student Account Activation
 * Validates a student's ID against the pre-approved roster list of 61 students.
 */
const activateAccount = async (req, res) => {
  const { student_id, email, password } = req.body;

  // Basic structural body fields verification validation
  if (!student_id || !email || !password) {
    return res.status(400).json({
      success: false,
      message:
        "Please fill out all activation fields completely (Student ID, Email, Password).",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Verify if the student exists in the pre-approved class list
    const rosterCheck = await client.query(
      "SELECT * FROM students WHERE student_id = $1",
      [student_id.trim().toUpperCase()],
    );

    if (rosterCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message:
          "Access Denied: This Student ID is not authorized or registered in the Section B class list.",
      });
    }

    const studentProfile = rosterCheck.rows[0];

    // 2. Prevent duplicate profile activations
    if (studentProfile.is_activated) {
      return res.status(400).json({
        success: false,
        message:
          "This student profile account is already active. Please proceed directly to login.",
      });
    }

    // 3. Encrypt the chosen password using a secure hashing algorithm salt string length
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Save credentials to users authentication database log register
    await client.query(
      "INSERT INTO users (student_id, email, password_hash) VALUES ($1, $2, $3)",
      [
        student_id.trim().toUpperCase(),
        email.trim().toLowerCase(),
        passwordHash,
      ],
    );

    // 5. Toggle the activation state flag inside the master students roster table
    await client.query(
      "UPDATE students SET is_activated = TRUE WHERE student_id = $1",
      [student_id.trim().toUpperCase()],
    );

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message:
        "Your profile has been successfully activated! You can now log into your portal dashboard safely.",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Activation pipeline failure context:", error.message);
    res.status(500).json({
      success: false,
      message:
        "Internal server processing error occurred during student profile activation loop chains.",
    });
  } finally {
    client.release();
  }
};

/**
 * STEP 1B: Secure Student Portal Login Handler
 * Verifies password matching, validates registration profiles, and hands down session keys.
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter both your registered Email and Password.",
    });
  }

  try {
    // 1. Fetch user mapping matching data logs from Neon server cluster tables
    const userQuery = await pool.query(
      "SELECT u.*, s.name, s.is_activated FROM users u JOIN students s ON u.student_id = s.student_id WHERE u.email = $1",
      [email.trim().toLowerCase()],
    );

    if (userQuery.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid credentials: Specified profile account email address does not exist.",
      });
    }

    const user = userQuery.rows[0];

    // 2. Cross-reference encrypted crypt string verification hashes matches
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid credentials: Correct password combination verification check dropped.",
      });
    }

    // 3. Generate a signed secure JSON Web Token mapping session parameters context metadata
    const token = jwt.sign(
      { id: user.id, student_id: user.student_id, role: "student" },
      process.env.JWT_SECRET || "fallback_secret_key",
      { expiresIn: "7d" }, // Active session signature shelf life spans 7 consecutive days loop
    );

    res.status(200).json({
      success: true,
      message: "Authentication handshake complete.",
      token,
      user: {
        student_id: user.student_id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login verification loop exception:", error.message);
    res.status(500).json({
      success: false,
      message:
        "Internal server error occurred within validation check structures.",
    });
  }
};

module.exports = {
  activateAccount,
  login,
};
