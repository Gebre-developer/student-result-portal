// server/controllers/resultController.js
const pool = require("../config/db");

// Helper function implementing standard software engineering scale conversions
const computeLetterGrade = (total) => {
  if (total >= 85) return { letter: "A", points: 4.0 };
  if (total >= 80) return { letter: "A-", points: 3.75 };
  if (total >= 75) return { letter: "B+", points: 3.5 };
  if (total >= 70) return { letter: "B", points: 3.0 };
  if (total >= 65) return { letter: "B-", points: 2.75 };
  if (total >= 60) return { letter: "C+", points: 2.5 };
  if (total >= 50) return { letter: "C", points: 2.0 };
  if (total >= 45) return { letter: "D", points: 1.0 };
  return { letter: "F", points: 0.0 };
};

/**
 * Fetch and calculate dynamic aggregated grades securely for the logged-in student
 */
const getMyResults = async (req, res) => {
  const studentId = req.user.student_id; // Secure context passed down from auth middleware

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

    const dbResult = await pool.query(queryText, [studentId]);

    let totalEarnedPoints = 0;
    let totalCreditHours = 0;

    const formattedResults = dbResult.rows.map((row) => {
      const numericTotal = parseFloat(row.total_mark);
      const gradeMetrics = computeLetterGrade(numericTotal);

      totalEarnedPoints += gradeMetrics.points * row.credit_hour;
      totalCreditHours += row.credit_hour;

      return {
        ...row,
        letter_grade: gradeMetrics.letter,
        grade_points: gradeMetrics.points,
      };
    });

    const semesterGPA =
      totalCreditHours > 0
        ? (totalEarnedPoints / totalCreditHours).toFixed(2)
        : "0.00";

    res.status(200).json({
      success: true,
      student_id: studentId,
      gpa: semesterGPA,
      total_credits: totalCreditHours,
      results: formattedResults,
    });
  } catch (error) {
    console.error("GPA calculation chain exception:", error.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal metrics calculation system error.",
      });
  }
};

// 💡 FIX 3: Export as an object matching your destructured require paths!
module.exports = {
  getMyResults,
};
