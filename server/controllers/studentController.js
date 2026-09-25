const pool = require("../config/db");

// Get logged-in student's complete profile parameters
exports.getStudentProfile = async (req, res) => {
  try {
    // req.user is automatically populated by our authMiddleware interceptor
    const studentId = req.user.studentId;

    // Fetch the matching profile record from the students table
    const profileResult = await pool.query(
      "SELECT student_id, full_name, section, department, year, email, is_verified, created_at FROM students WHERE student_id = $1",
      [studentId],
    );

    // If the profile entry doesn't exist on the roster
    if (profileResult.rows.length === 0) {
      return res
        .status(404)
        .json({
          message: "Profile parameters not found for this student account.",
        });
    }

    // Return the student profile data object securely
    res.json(profileResult.rows[0]);
  } catch (error) {
    console.error("Fetch Profile Controller Error:", error.message);
    res
      .status(500)
      .json({ message: "Server error while retrieving student parameters." });
  }
};
