// server/controllers/resultController.js
const pool = require("../config/db");

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
  return mapping[letterGrade.toUpperCase()] || 0.0;
};

exports.getMyResults = async (req, res) => {
  try {
    // Extracts your verified identity precisely from req.user payload
    const studentId =
      req.user?.student_id || req.user?.id || req.user?.studentId;

    if (!studentId) {
      return res
        .status(400)
        .json({ message: "Student identity could not be verified." });
    }

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
        message: "No results published yet.",
        cgpa: "0.00",
        totalCreditsEarned: 0,
        semesters: [],
      });
    }

    const semestersMap = {};
    let totalCumulativePoints = 0;
    let totalCumulativeCredits = 0;

    dbResult.rows.forEach((row) => {
      const semesterKey = `${row.academicYear} - Semester ${row.semester}`;
      const creditHour = parseInt(row.creditHour, 10) || 0;
      const gradePoint = getGradePoint(row.grade);
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

    const formattedSemesters = Object.values(semestersMap).map((sem) => {
      const gpa =
        sem.totalSemesterCredits > 0
          ? (sem.totalSemesterPoints / sem.totalSemesterCredits).toFixed(2)
          : "0.00";

      return {
        semesterName: sem.semesterName,
        gpa: gpa,
        courses: sem.courses,
      };
    });

    const cgpa =
      totalCumulativeCredits > 0
        ? (totalCumulativePoints / totalCumulativeCredits).toFixed(2)
        : "0.00";

    res.status(200).json({
      cgpa: cgpa,
      totalCreditsEarned: totalCumulativeCredits,
      semesters: formattedSemesters.reverse(),
    });
  } catch (error) {
    console.error("GPA Controller Error:", error.message);
    res
      .status(500)
      .json({ message: "Server error while calculating academic metrics." });
  }
};
