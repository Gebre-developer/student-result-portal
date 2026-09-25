const stream = require("stream");
const csvParser = require("csv-parser");
const pool = require("../config/db");

// Handle Bulk Student imports from an uploaded CSV file
exports.bulkImportStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Please upload a CSV file to parse." });
    }

    const studentsToInsert = [];
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    // Parse the file data buffer line-by-line
    bufferStream
      .pipe(
        csvParser([
          "studentId",
          "fullName",
          "section",
          "department",
          "year",
          "email",
        ]),
      )
      .on("data", (row) => {
        // Skip header row if the user included column titles in the Excel template
        if (
          row.studentId.toLowerCase() !== "studentid" &&
          row.studentId.trim() !== ""
        ) {
          studentsToInsert.push(row);
        }
      })
      .on("end", async () => {
        try {
          let successCount = 0;

          // Loop over parsed spreadsheet values and insert them into your Postgres roster
          for (const student of studentsToInsert) {
            await pool.query(
              `INSERT INTO students (student_id, full_name, section, department, year, email, is_verified)
               VALUES ($1, $2, $3, $4, $5, $6, false)
               ON CONFLICT (student_id) DO NOTHING`,
              [
                student.studentId.trim(),
                student.fullName.trim(),
                student.section.trim(),
                student.department.trim(),
                parseInt(student.year, 10) || 3,
                student.email.trim(),
              ],
            );
            successCount++;
          }

          res.status(200).json({
            message: `Bulk roster import complete! Successfully parsed and updated ${successCount} student profiles inside your Neon cluster.`,
          });
        } catch (dbError) {
          console.error("Database insertion array error:", dbError.message);
          res.status(500).json({
            message:
              "Database failure during bulk registry update processing loop.",
          });
        }
      });
  } catch (error) {
    console.error("CSV Upload System Error:", error.message);
    res
      .status(500)
      .json({ message: "Server error during structural file parsing." });
  }
};
