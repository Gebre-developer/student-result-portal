import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Award, 
  Layers, 
  FileText, 
  BookOpen, 
  AlertCircle,
  GraduationCap 
} from 'lucide-react';
// 1. IMPORT YOUR CENTRALIZED API WORKSPACE TOOL
import { apiRequest } from '../services/api'; 

function Results() {
  const navigate = useNavigate();

  // Core API State Variables Mapping
  const [cgpa, setCgpa] = useState('0.00');
  const [totalCredits, setTotalCredits] = useState(0);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Automatically trigger grade metric calculations upon layout mount
  useEffect(() => {
    const fetchAcademicResults = async () => {
      try {
        setLoading(true);
        setError('');

        // 2. USE YOUR SECURE API REQUEST HELPER FUNCTION
        // Automatically communicates with your backend endpoint securely
        const data = await apiRequest('/results/my-results', { method: 'GET' });

        // Map backend payload metrics straight into component state slots
        setCgpa(data.cgpa || '0.00');
        setTotalCredits(data.totalCreditsEarned || 0);
        setSemesters(data.semesters || []);

      } catch (err) {
        console.error('Grade History Fetch Failure:', err.message);
        setError(err.message || 'Unable to retrieve academic history scores.');
      } finally {
        setLoading(false);
      }
    };

    fetchAcademicResults();
  }, []);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Calculating academic metrics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      {/* Global Navigation Header Component bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm py-3">
        <div className="container">
          <div className="navbar-brand fw-bold d-flex align-items-center gap-2">
            <GraduationCap size={28} />
            <span>Academic Performance Record</span>
          </div>
          <Link to="/dashboard" className="btn btn-light btn-sm text-primary fw-semibold d-flex align-items-center gap-2 shadow-sm">
            <ArrowLeft size={16} /> Dashboard Home
          </Link>
        </div>
      </nav>
      {/* Main Content Layout Container */}
      <div className="container my-5">
        
        {error && (
          <div className="alert alert-danger shadow-sm text-center small mb-4" role="alert">
            <AlertCircle size={18} className="me-2 inline" /> {error}
          </div>
        )}

        {/* 1. TOP HERO REGION: Global Summary Metric Overview Cards */}
        <div className="row g-4 mb-5">
          {/* Cumulative GPA (CGPA) Badge Card */}
          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm rounded-3 bg-dark text-white p-4 d-flex flex-row align-items-center justify-content-between">
              <div>
                <p className="text-light small text-uppercase fw-semibold mb-1 opacity-75">Overall CGPA</p>
                <h1 className="display-4 fw-bold mb-0 text-success">{cgpa}</h1>
              </div>
              <div className="bg-success bg-opacity-25 p-3 rounded-circle text-success">
                <Award size={40} />
              </div>
            </div>
          </div>

          {/* Total Accumulated Credit Hours Badge Card */}
          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm rounded-3 bg-white p-4 d-flex flex-row align-items-center justify-content-between">
              <div>
                <p className="text-muted small text-uppercase fw-semibold mb-1">Total Earned Credits</p>
                <h1 className="display-4 fw-bold text-dark mb-0">{totalCredits}</h1>
              </div>
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                <Layers size={40} />
              </div>
            </div>
          </div>
        </div>

        {/* 2. BODY REGION: Dynamic Loop Iteration Over Semester Blocks */}
        <h4 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
          <FileText size={22} className="text-primary" />
          <span>Semester Performance Breakdown</span>
        </h4>

        {semesters.length === 0 ? (
          <div className="card border-0 shadow-sm p-5 text-center bg-white rounded-3">
            <BookOpen size={48} className="text-muted mb-3 mx-auto" />
            <h5 className="text-secondary fw-semibold mb-1">No Academic Records Live</h5>
            <p className="text-muted small mb-0">Your instructors haven't published or uploaded any course grades for your section yet.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-5">
            {semesters.map((sem, index) => (
              <div key={index} className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
                
                {/* Semester Summary Header Section */}
                <div className="bg-light px-4 py-3 border-bottom d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                  <h5 className="fw-bold text-dark mb-0">{sem.semesterName}</h5>
                  <div className="bg-primary bg-opacity-10 border border-primary border-opacity-25 px-3 py-1 rounded-pill text-primary fw-bold small">
                    Semester GPA: {sem.gpa}
                  </div>
                </div>

                {/* Grade Loop Rendering Table */}
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0 px-4 small">
                    <thead className="table-light text-secondary fw-semibold">
                      <tr>
                        <th className="ps-4 py-3" style={{ width: '20%' }}>Course Code</th>
                        <th className="py-3" style={{ width: '45%' }}>Course Title</th>
                        <th className="text-center py-3" style={{ width: '15%' }}>Credit Hours</th>
                        <th className="text-center py-3" style={{ width: '20%' }}>Earned Grade</th>
                      </tr>
                    </thead>
                    <tbody className="text-dark border-top-0">
                      {sem.courses.map((course) => (
                        <tr key={course.id || course.courseCode}>
                          <td className="ps-4 py-3 fw-semibold text-primary">{course.courseCode}</td>
                          <td className="py-3 fw-medium">{course.courseName}</td>
                          <td className="text-center py-3 text-secondary">{course.creditHour}</td>
                          <td className="text-center py-3">
                            <span className={`badge px-3 py-2 rounded-2 fw-bold ${
                              ['A+', 'A', 'A-'].includes(course.grade) ? 'bg-success-subtle text-success' :
                              ['B+', 'B', 'B-'].includes(course.grade) ? 'bg-primary-subtle text-primary' :
                              ['C+', 'C', 'C-'].includes(course.grade) ? 'bg-warning-subtle text-warning' :
                              'bg-danger-subtle text-danger'
                            }`} style={{ minWidth: '45px', fontSize: '12px' }}>
                              {course.grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default Results;
