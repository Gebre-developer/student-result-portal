// server/testPush.js
const pool = require("./config/db");

const pushTestData = async () => {
  console.log("Initializing mock student result database injection...");

  // Test payload matching your exact Section B courses and student requirements
  const testPayload = {
    student_id: "BDU1234567", // Replace this with a valid student_id from your students table if you have one
    course_code: "SE-314", // Web Design and Programming
    assignment: 17.5,
    mid_exam: 24.0,
    final_exam: 45.0,
    total_mark: 86.5,
    grade: "A",
    grade_point: 4.0,
    semester: 1,
    academic_year: "2026/2027",
    published: true,
  };

  const queryText = `
    INSERT INTO results (
        student_id, course_code, assignment, mid_exam, 
        final_exam, total_mark, grade, grade_point, 
        semester, academic_year, published
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (student_id, course_code) 
    DO UPDATE SET 
        assignment = EXCLUDED.assignment,
        mid_exam = EXCLUDED.mid_exam,
        final_exam = EXCLUDED.final_exam,
        total_mark = EXCLUDED.total_mark,
        grade = EXCLUDED.grade,
        grade_point = EXCLUDED.grade_point,
        published = EXCLUDED.published
    RETURNING *;
  `;

  const values = [
    testPayload.student_id,
    testPayload.course_code,
    testPayload.assignment,
    testPayload.mid_exam,
    testPayload.final_exam,
    testPayload.total_mark,
    testPayload.grade,
    testPayload.grade_point,
    testPayload.semester,
    testPayload.academic_year,
    testPayload.published,
  ];

  try {
    const res = await pool.query(queryText, values);
    console.log(
      "✅ Success! Mock result row has been successfully synchronized into Neon database.",
    );
    console.log("Pushed Row Data:", res.rows[0]);
  } catch (error) {
    console.error("❌ Database push injection failed!");
    console.error("Error Message:", error.message);
    console.error(
      "Tip: Make sure the student_id string exists inside your 'students' roster table first due to the FOREIGN KEY constraint.",
    );
  } finally {
    // End the pool connection so the terminal script exits cleanly
    await pool.end();
  }
};

pushTestData();
