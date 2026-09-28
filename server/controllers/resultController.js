const pool = require("../config/db");

// Helper function to map standard letter grades to grade points
const getGradePoint = (letterGrade) => {
  if (!letterGrade) return 0.0;
  const mapping = {
    "A+": 4.0,
    A: 4.0,
    "A-": 3.75,
    "B+": 3.5,
    B: 3.0,
    "B-": 2.75,
    "C+": 2.5,
    C: 2.0,
    "C-": 1.75,
    D: 1.0,
    F: 0.0,
  };
  return mapping[letterGrade.toUpperCase().trim()] || 0.0;
};

// @desc    Secure individual student grading retrieval with GPA/CGPA analysis
// @route   GET /api/results/my-results
// @access  Private (Student Profile Only)
exports.getMyResults = async (req, res) => {
  try {
    // Extracts string-based student_id cleanly from verification payload middleware
    const studentId =
      req.user?.student_id || req.user?.id || req.user?.studentId;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Student identity verification failed. Access denied.",
      });
    }

    // MATCHED SCHEMA QUERY: Only requests columns that actually exist in your database
    const queryText = `
      SELECT 
        r.id,
        r.course_code AS "courseCode",
        c.course_name AS "courseName",
        c.credit_hour AS "creditHour",
        r.grade,
        r.semester,
        r.academic_year AS "academicYear"
      FROM results r
      JOIN courses c ON r.course_code = c.course_code
      WHERE r.student_id = $1 AND r.published = true
      ORDER BY r.academic_year ASC, r.semester ASC;
    `;

    const dbResult = await pool.query(queryText, [studentId]);

    if (dbResult.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message:
          "No marksheet profiles have been published yet for your account profile.",
        cgpa: "0.00",
        totalCreditsEarned: 0,
        semesters: [],
      });
    }

    const semestersMap = {};
    let totalCumulativePoints = 0;
    let totalCumulativeCredits = 0;

    // Aggregate metrics across academic terms
    dbResult.rows.forEach((row) => {
      const semesterKey = `${row.academicYear} - Semester ${row.semester}`;
      const creditHour = parseInt(row.creditHour, 10) || 0;
      const gradePoint =
        parseFloat(row.grade_point) || getGradePoint(row.grade);
      const qualityPoints = gradePoint * creditHour;

      totalCumulativePoints += qualityPoints;
      totalCumulativeCredits += creditHour;

      if (!semestersMap[semesterKey]) {
        semestersMap[semesterKey] = {
          semesterName: semesterKey,
          academicYear: row.academicYear,
          semester: row.semester,
          courses: [],
          totalSemesterPoints: 0,
          totalSemesterCredits: 0,
        };
      }

      semestersMap[semesterKey].courses.push({
        id: row.id,
        courseCode: row.courseCode,
        courseName: row.courseName,
        creditHour: creditHour,
        grade: row.grade,
      });

      semestersMap[semesterKey].totalSemesterPoints += qualityPoints;
      semestersMap[semesterKey].totalSemesterCredits += creditHour;
    });

    // Format output data for each individual semester
    const formattedSemesters = Object.values(semestersMap).map((sem) => {
      const gpa =
        sem.totalSemesterCredits > 0
          ? (sem.totalSemesterPoints / sem.totalSemesterCredits).toFixed(2)
          : "0.00";

      return {
        semesterName: sem.semesterName,
        gpa: gpa,
        totalSemesterCredits: sem.totalSemesterCredits,
        courses: sem.courses,
      };
    });

    const cgpa =
      totalCumulativeCredits > 0
        ? (totalCumulativePoints / totalCumulativeCredits).toFixed(2)
        : "0.00";

    res.status(200).json({
      success: true,
      cgpa: cgpa,
      totalCreditsEarned: totalCumulativeCredits,
      semesters: formattedSemesters.reverse(), // Shows most recent semester first on the UI
    });
  } catch (error) {
    console.error("Critical GPA Controller Error Context:", error.message);
    res.status(500).json({
      success: false,
      message:
        "Server error encountered during academic metrics calculations pipelines.",
    });
  }
};
