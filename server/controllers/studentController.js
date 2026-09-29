// server/controllers/studentController.js
const pool = require("../config/db");

/**
 * Fetch profile data for the authenticated student
 */
const getStudentProfile = async (req, res) => {
  const studentId = req.user.student_id; // Safe parsing context from token middleware

  try {
    const profile = await pool.query(
      "SELECT student_id, name, is_activated FROM students WHERE student_id = \$1",
      [studentId],
    );

    if (profile.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Student record profile not found." });
    }

    res.status(200).json({ success: true, profile: profile.rows[0] });
  } catch (error) {
    console.error("Profile pipeline fetch crash:", error.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server profile execution fault.",
      });
  }
};

/**
 * Fetch grade results mapped dynamically for the authenticated student
 */
const getStudentGrades = async (req, res) => {
  const studentId = req.user.student_id;

  try {
    const queryText = `
      SELECT c.course_code, c.course_name, c.credit_hour,
             COALESCE(g.midterm, 0) as midterm, 
             COALESCE(g.assignment, 0) as assignment, 
             COALESCE(g.final_exam, 0) as final_exam,
             COALESCE(g.total_mark, 0) as total_mark
      FROM courses c
      LEFT JOIN grades g ON c.course_code = g.course_code AND g.student_id = $1
      ORDER BY c.course_code ASC;
    `;

    const gradesResult = await pool.query(queryText, [studentId]);

    res.status(200).json({
      success: true,
      student_id: studentId,
      results: gradesResult.rows,
    });
  } catch (error) {
    console.error("Grades calculation runtime error:", error.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal grading matrix aggregation exception.",
      });
  }
};

// Export as an object dictionary matching your route imports destructured braces
module.exports = {
  getStudentProfile,
  getStudentGrades,
};
