const pool = require("../config/db");

// Helper function to map letter grades to standard grade points if missing in the row
const getGradePoint = (letterGrade) => {
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
  return mapping[letterGrade.toUpperCase()] || 0.0;
};

// Fetch student's grades and calculate Semester GPA & CGPA
exports.getMyResults = async (req, res) => {
  try {
    // Row-Level Privacy Guard: extract student_id directly from the verified JWT payload
    const studentId = req.user.studentId;

    // Fetch all published results along with course details via an inner join
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
        message: "No published results found for your account at this time.",
        cgpa: "0.00",
        semesters: [],
      });
    }

    // Grouping records by Academic Year and Semester
    const semestersMap = {};
    let totalCumulativePoints = 0;
    let totalCumulativeCredits = 0;

    dbResult.rows.forEach((row) => {
      const semesterKey = `${row.academicYear} - Semester ${row.semester}`;
      const creditHour = parseInt(row.creditHour, 10);
      const gradePoint = getGradePoint(row.grade);
      const qualityPoints = gradePoint * creditHour;

      // Accumulate global totals for overall CGPA math
      totalCumulativePoints += qualityPoints;
      totalCumulativeCredits += creditHour;

      // Initialize semester group if it doesn't exist
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

      // Add course and accumulate semester totals
      semestersMap[semesterKey].courses.push({
        id: row.id,
        courseCode: row.courseCode,
        courseName: row.courseName,
        creditHour: creditHour,
        grade: row.grade,
        gradePoint: gradePoint,
      });

      semestersMap[semesterKey].totalSemesterPoints += qualityPoints;
      semestersMap[semesterKey].totalSemesterCredits += creditHour;
    });

    // Format structure and compute final GPA metrics
    const formattedSemesters = Object.values(semestersMap).map((sem) => {
      const gpa =
        sem.totalSemesterCredits > 0
          ? (sem.totalSemesterPoints / sem.totalSemesterCredits).toFixed(2)
          : "0.00";

      return {
        semesterName: sem.semesterName,
        academicYear: sem.academicYear,
        semester: sem.semester,
        gpa: gpa,
        courses: sem.courses,
      };
    });

    // Compute ultimate Cumulative GPA (CGPA)
    const cgpa =
      totalCumulativeCredits > 0
        ? (totalCumulativePoints / totalCumulativeCredits).toFixed(2)
        : "0.00";

    // Return payload structured cleanly for React UI state updates
    res.status(200).json({
      studentId: studentId,
      cgpa: cgpa,
      totalCreditsEarned: totalCumulativeCredits,
      semesters: formattedSemesters.reverse(), // Present most recent semester first
    });
  } catch (error) {
    console.error(
      "Fetch and Calculate GPA Metrics Controller Error:",
      error.message,
    );
    res
      .status(500)
      .json({ message: "Server error while calculating academic metrics." });
  }
};
