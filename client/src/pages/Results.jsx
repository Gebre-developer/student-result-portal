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
import { apiRequest } from '../services/api'; 

function Results() {
  const navigate = useNavigate();

  // Core API State Variables Mapping
  const [results, setResults] = useState([]);
  const [cgpa, setCgpa] = useState('0.00');
  const [totalCredits, setTotalCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAcademicResults = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch flat row records matching your SQL database layout output
        const data = await apiRequest('/results/my-grades', { method: 'GET' });
        setResults(data || []);

        // Calculate dynamic tracking stats based on credit hours and grade points
        let runningPointsTotal = 0;
        let runningCreditsCount = 0;

        (data || []).forEach(item => {
          const credits = parseInt(item.credit_hour || 0, 10);
          const totalMark = parseFloat(item.total_mark || 0);
          
          runningCreditsCount += credits;
          
          // Quality point scaling matrix matching standard Ethiopian university systems
          if (totalMark >= 85) runningPointsTotal += 4.0 * credits;
          else if (totalMark >= 75) runningPointsTotal += 3.0 * credits;
          else if (totalMark >= 60) runningPointsTotal += 2.0 * credits;
          else if (totalMark >= 50) runningPointsTotal += 1.0 * credits;
        });

        setTotalCredits(runningCreditsCount);
        setCgpa(runningCreditsCount > 0 ? (runningPointsTotal / runningCreditsCount).toFixed(2) : '0.00');

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

      <div className="container my-5">
        {error && (
          <div className="alert alert-danger shadow-sm text-center small mb-4" role="alert">
            <AlertCircle size={18} className="me-2 d-inline-block" /> {error}
          </div>
        )}

        {/* Hero Score Tracker Header Cards */}
        <div className="row g-4 mb-5">
          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm rounded-3 bg-dark text-white p-4 d-flex flex-row align-items-center justify-content-between">
              <div>
                <p className="text-light small text-uppercase fw-semibold mb-1 opacity-75">Portal CGPA</p>
                <h1 className="display-4 fw-bold mb-0 text-success">{cgpa}</h1>
              </div>
              <div className="bg-success bg-opacity-25 p-3 rounded-circle text-success">
                <Award size={40} />
              </div>
            </div>
          </div>

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

        <h4 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
          <FileText size={22} className="text-primary" />
          <span>Continuous Assessment Grid</span>
        </h4>

        {results.length === 0 ? (
          <div className="card border-0 shadow-sm p-5 text-center bg-white rounded-3">
            <BookOpen size={48} className="text-muted mb-3 mx-auto" />
            <h5 className="text-secondary fw-semibold mb-1">No Academic Records Live</h5>
            <p className="text-muted small mb-0">Your instructors haven't published or uploaded any course grades for your section yet.</p>
          </div>
        ) : (
          <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 px-4 small">
                <thead className="table-light text-secondary fw-semibold">
                  <tr>
                    <th className="ps-4 py-3" style={{ width: '15%' }}>Course Code</th>
                    <th className="py-3" style={{ width: '35%' }}>Course Description</th>
                    <th className="text-center py-3">Assignment (15%)</th>
                    <th className="text-center py-3">Mid Exam (35%)</th>
                    <th className="text-center py-3">Final Exam (50%)</th>
                    <th className="text-center py-3">Total Score</th>
                    <th className="text-center py-3 pe-4">Letter Grade</th>
                  </tr>
                </thead>
                <tbody className="text-dark border-top-0">
                  {results.map((item, index) => (
                    <tr key={index}>
                      <td className="ps-4 py-3 fw-bold text-primary font-monospace">{item.course_code}</td>
                      <td className="py-3 fw-semibold text-secondary">{item.course_name} <span className="text-muted small">({item.credit_hour} Cr)</span></td>
                      <td className="text-center py-3 text-muted">{parseFloat(item.assignment || 0).toFixed(2)}</td>
                      <td className="text-center py-3 text-muted">{parseFloat(item.mid_exam || 0).toFixed(2)}</td>
                      <td className="text-center py-3 text-muted font-monospace">{parseFloat(item.final_exam || 0).toFixed(2)}</td>
                      <td className="text-center py-3 fw-bold text-dark">{parseFloat(item.total_mark || 0).toFixed(2)} / 100</td>
                      <td className="text-center py-3 pe-4">
                        <span className={`badge px-3 py-2 rounded-2 fw-bold ${
                          ['A+', 'A', 'A-', 'B+', 'B'].includes(item.grade) ? 'bg-success-subtle text-success' :
                          ['B-', 'C+', 'C'].includes(item.grade) ? 'bg-warning-subtle text-warning' :
                          'bg-danger-subtle text-danger'
                        }`} style={{ minWidth: '45px', fontSize: '12px' }}>
                          {item.grade || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Results;
