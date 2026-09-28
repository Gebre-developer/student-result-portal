// server/controllers/resultController.js (PART 1)
const Result = require("../models/Result");

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
// @route   GET /api/results/my-grades
// @access  Private (Student Profile Only)
exports.getMyResults = async (req, res) => {
  try {
    // SECURE ID: Extracts string-based student_id cleanly from authentication token
    const studentId =
      req.user?.student_id || req.user?.id || req.user?.studentId;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Student identity verification failed. Access denied.",
      });
    }

    // Call the model file (Result.js) to query the Neon database
    const rows = await Result.findByStudentId(studentId);

    if (!rows || rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No results published yet.",
        cgpa: "0.00",
        totalCreditsEarned: 0,
        semesters: [],
      });
    }
    // server/controllers/resultController.js (PART 2)
    const semestersMap = {};
    let totalCumulativePoints = 0;
    let totalCumulativeCredits = 0;

    // Aggregate courses across chronological academic terms
    rows.forEach((row) => {
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
    // server/controllers/resultController.js (PART 3)
    // Format output arrays for each individual semester card
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

    // Compute absolute cumulative average matching standard registrar calculations
    const cgpa =
      totalCumulativeCredits > 0
        ? (totalCumulativePoints / totalCumulativeCredits).toFixed(2)
        : "0.00";

    // Returns structural parameters cleanly to your React client dashboard
    res.status(200).json({
      success: true,
      cgpa: cgpa,
      totalCreditsEarned: totalCumulativeCredits,
      semesters: formattedSemesters.reverse(), // Shows most recent term first on screen
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
