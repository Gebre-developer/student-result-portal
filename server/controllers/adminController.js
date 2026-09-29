// server/controllers/adminController.js
const pool = require("../config/db");

/**
 * Transactional Batch-Upsert for Assessment Marks
 * Expects { "grades": [ { "student_id": "...", "course_code": "...", "midterm": 24, "assignment": 15, "final_exam": 45 } ] }
 */
const bulkUploadGrades = async (req, res) => {
  const { grades } = req.body;

  // 1. Structural payload checks
  if (!grades || !Array.isArray(grades) || grades.length === 0) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid payload layout. 'grades' property must be a non-empty array.",
    });
  }

  const client = await pool.connect();

  try {
    // 2. Begin secure atomic transaction loop segment block
    await client.query("BEGIN");

    for (const record of grades) {
      const { student_id, course_code, midterm, assignment, final_exam } =
        record;

      // Numeric parsing schema constraints enforcement controls
      const mid = midterm !== undefined ? parseFloat(midterm) : 0;
      const assign = assignment !== undefined ? parseFloat(assignment) : 0;
      const finalE = final_exam !== undefined ? parseFloat(final_exam) : 0;

      // 3. Academic limit confirmation guards
      if (
        mid < 0 ||
        mid > 30 ||
        assign < 0 ||
        assign > 20 ||
        finalE < 0 ||
        finalE > 50
      ) {
        throw new Error(
          `Out of range score bounds on ID ${student_id} for course ${course_code}. Mid max is 30, Assg max is 20, Final max is 50.`,
        );
      }

      const upsertQuery = `
        INSERT INTO results (student_id, course_code, midterm, assignment, final_exam)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (student_id, course_code) 
        DO UPDATE SET 
          midterm = EXCLUDED.midterm,
          assignment = EXCLUDED.assignment,
          final_exam = EXCLUDED.final_exam,
          id = results.id;
      `;

      await client.query(upsertQuery, [
        student_id,
        course_code,
        mid,
        assign,
        finalE,
      ]);
    }

    // 4. Commit everything together safely
    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: `Successfully processed and synchronized academic marks for ${grades.length} student records inside Neon DB.`,
    });
  } catch (error) {
    // Structural safety rollback triggered automatically on faulty loop errors
    await client.query("ROLLBACK");
    console.error("Bulk upload transaction failure:", error.message);

    res.status(500).json({
      success: false,
      message: "Database transactional rollback triggered.",
      error: error.message,
    });
  } finally {
    client.release(); // Free up pool thread resources back to resource manager stack context
  }
};

// Object wrapper export to avoid routing mismatch collisions
module.exports = { bulkUploadGrades };
