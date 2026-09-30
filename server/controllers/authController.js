// server/controllers/authController.js
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * Open Account Activation
 * Updates existing pre-seeded student records or creates a new entry if unlisted,
 * then registers authentication credentials in `users`.
 */
const activateAccount = async (req, res) => {
  const { student_id, full_name, email, password } = req.body;

  if (!student_id || !email || !password) {
    return res.status(400).json({
      success: false,
      message:
        "Please fill out all required fields (Student ID, Email, and Password).",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const cleanStudentId = student_id.trim();
    const cleanEmail = email.trim().toLowerCase();
    const displayName = full_name ? full_name.trim() : null;

    // 1. Check if the Student ID is already activated in the users table
    const existingUser = await client.query(
      "SELECT * FROM users WHERE UPPER(TRIM(student_id)) = UPPER(TRIM($1))",
      [cleanStudentId],
    );

    if (existingUser.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message:
          "This Student ID is already activated. Please log in directly.",
      });
    }

    // 2. Check if student already exists in students roster table
    const studentCheck = await client.query(
      "SELECT * FROM students WHERE UPPER(TRIM(student_id)) = UPPER(TRIM($1))",
      [cleanStudentId],
    );

    let studentRecordId;

    if (studentCheck.rows.length > 0) {
      // Existing record in roster -> UPDATE email, full_name (if provided), and set flags
      const existingStudent = studentCheck.rows[0];
      const finalName = displayName || existingStudent.full_name;

      const updatedStudent = await client.query(
        `UPDATE students 
         SET email = $1, 
             full_name = $2, 
             is_activated = TRUE, 
             is_verified = TRUE 
         WHERE UPPER(TRIM(student_id)) = UPPER(TRIM($3)) 
         RETURNING id`,
        [cleanEmail, finalName, cleanStudentId],
      );

      studentRecordId = updatedStudent.rows[0].id;
    } else {
      // New registration -> INSERT new record into students table
      const newStudent = await client.query(
        `INSERT INTO students (student_id, full_name, section, department, year, email, is_verified, is_activated)
         VALUES ($1, $2, $3, $4, $5, $6, TRUE, TRUE)
         RETURNING id`,
        [
          cleanStudentId,
          displayName || cleanStudentId,
          "B",
          "Software Engineering",
          3,
          cleanEmail,
        ],
      );
      studentRecordId = newStudent.rows[0].id;
    }

    // 3. Encrypt password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Create authentication record in users table
    await client.query(
      "INSERT INTO users (student_id, password_hash, role, is_active) VALUES ($1, $2, $3, $4)",
      [cleanStudentId, passwordHash, "student", true],
    );

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Registration and activation complete! You can now log in.",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Activation error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error occurred during account registration.",
    });
  } finally {
    client.release();
  }
};

/**
 * Student Login Handler
 */
const login = async (req, res) => {
  const { studentId, password } = req.body;

  if (!studentId || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter both your Student ID and Password.",
    });
  }

  try {
    const userQuery = await pool.query(
      `SELECT 
        u.id AS user_id, 
        u.student_id, 
        u.password_hash, 
        u.role, 
        s.full_name, 
        s.email 
       FROM users u 
       LEFT JOIN students s ON UPPER(TRIM(u.student_id)) = UPPER(TRIM(s.student_id)) 
       WHERE UPPER(TRIM(u.student_id)) = UPPER(TRIM($1))`,
      [studentId.trim()],
    );

    if (userQuery.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid credentials: No registered account found with that Student ID.",
      });
    }

    const user = userQuery.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials: Incorrect password.",
      });
    }

    const token = jwt.sign(
      { id: user.user_id, student_id: user.student_id, role: user.role },
      process.env.JWT_SECRET || "fallback_secret_key",
      { expiresIn: "7d" },
    );

    res.status(200).json({
      success: true,
      message: "Authentication successful.",
      token,
      user: {
        student_id: user.student_id,
        name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error occurred during login.",
    });
  }
};

module.exports = {
  activateAccount,
  login,
};
