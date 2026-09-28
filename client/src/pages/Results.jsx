// src/components/Results.jsx (PART 1)
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Results() {
  const [academicData, setAcademicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudentGrades = async () => {
      try {
        setLoading(true);
        // Replace this URL string with your live Render server domain URL once deployed
        const response = await axios.get("http://localhost:5000/api/results/my-grades", {
          withCredentials: true, // Crucial for passing HTTP-Only credentials securely
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}` // Standard token protection backup
          }
        });

        if (response.data.success || response.data.semesters) {
          setAcademicData(response.data);
        } else {
          setError("Failed to fetch academic records framework mapping arrays.");
        }
      } catch (err) {
        console.error("Frontend Results Fetch Error:", err);
        setError(err.response?.data?.message || "Server communication pipeline fault.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentGrades();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", fontFamily: "sans-serif", color: "#666" }}>
        <h3>Loading your secure transcript performance boxes...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", fontFamily: "sans-serif", color: "#dc3545" }}>
        <h3>Error Accessing Metrics</h3>
        <p>{error}</p>
      </div>
    );
  }
  // src/components/Results.jsx (PART 2)
  return (
    <div style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto", fontFamily: "sans-serif", backgroundColor: "#f8f9fa" }}>
      <h2 style={{ marginBottom: "1.5rem", color: "#333", borderBottom: "2px solid #e9ecef", paddingBottom: "0.5rem" }}>
        Academic Performance Dashboard
      </h2>

      {/* ============================================================
          METRIC BOXES ROW (CGPA & CREDITS GRID LAYOUT)
          ============================================================ */}
      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2.5rem" }}>
        {/* Cumulative GPA Box */}
        <div style={{
          flex: "1", backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "10px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.05)", borderLeft: "5px solid #28a745"
        }}>
          <span style={{ fontSize: "0.9rem", color: "#6c757d", textTransform: "uppercase", fontWeight: "bold" }}>
            Cumulative GPA (CGPA)
          </span>
          <h1 style={{ margin: "0.5rem 0 0 0", fontSize: "2.5rem", color: "#212529" }}>
            {academicData?.cgpa || "0.00"}
          </h1>
        </div>

        {/* Total Credits Box */}
        <div style={{
          flex: "1", backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "10px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.05)", borderLeft: "5px solid #007bff"
        }}>
          <span style={{ fontSize: "0.9rem", color: "#6c757d", textTransform: "uppercase", fontWeight: "bold" }}>
            Total Credits Earned
          </span>
          <h1 style={{ margin: "0.5rem 0 0 0", fontSize: "2.5rem", color: "#212529" }}>
            {academicData?.totalCreditsEarned || 0} Cr. Hrs
          </h1>
        </div>
      </div>
      // src/components/Results.jsx (PART 3)
      {/* ============================================================
          CHRONOLOGICAL SEMESTER TERM DATA VIEWS
          ============================================================ */}
      {academicData?.semesters && academicData.semesters.length > 0 ? (
        academicData.semesters.map((sem, index) => (
          <div key={index} style={{
            backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "10px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.03)", marginBottom: "2rem"
          }}>
            {/* Semester Header Box */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #dee2e6", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, color: "#495057" }}>{sem.semesterName}</h3>
              <div style={{ backgroundColor: "#e2f0d9", color: "#385723", padding: "0.4rem 0.8rem", borderRadius: "20px", fontWeight: "bold", fontSize: "0.9rem" }}>
                GPA: {sem.gpa}
              </div>
            </div>

            {/* Courses Sheet Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f1f3f5", color: "#495057", borderBottom: "2px solid #dee2e6" }}>
                    <th style={{ padding: "0.75rem" }}>Course Code</th>
                    <th style={{ padding: "0.75rem" }}>Course Name</th>
                    <th style={{ padding: "0.75rem", textAlign: "center" }}>Credit Hours</th>
                    <th style={{ padding: "0.75rem", textAlign: "center" }}>Letter Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {sem.courses && sem.courses.map((course) => (
                    <tr key={course.id} style={{ borderBottom: "1px solid #dee2e6", color: "#333" }}>
                      <td style={{ padding: "0.75rem", fontWeight: "bold", color: "#007bff" }}>{course.courseCode}</td>
                      <td style={{ padding: "0.75rem" }}>{course.courseName}</td>
                      <td style={{ padding: "0.75rem", textAlign: "center" }}>{course.creditHour}</td>
                      <td style={{ padding: "0.75rem", textAlign: "center" }}>
                        <span style={{
                          backgroundColor: course.grade.startsWith("A") ? "#d4edda" : "#fff3cd",
                          color: course.grade.startsWith("A") ? "#155724" : "#856404",
                          padding: "0.25rem 0.6rem", borderRadius: "4px", fontWeight: "bold"
                        }}>
                          {course.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <div style={{ textAlign: "center", color: "#777", padding: "2rem", backgroundColor: "#fff", borderRadius: "10px" }}>
          No formal grading transcripts registered for your account mapping profile.
        </div>
      )}
    </div>
  );
}
