import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, 
  UserPlus, 
  FileSpreadsheet, 
  Upload, 
  PlusCircle, 
  LogOut, 
  Lock, 
  RefreshCw,
  BookOpen
} from 'lucide-react';
// 1. IMPORT YOUR CENTRALIZED API WORKSPACE TOOL
import { apiRequest } from '../services/api'; 

function AdminDashboard() {
  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  // Active Tab Toggle State ('single' or 'bulk')
  const [activeTab, setActiveTab] = useState('single');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Single Input Form State Matrix
  const [gradeForm, setGradeForm] = useState({
    studentId: '',
    courseCode: '',
    assignment: '',
    midExam: '',
    finalExam: '',
    semester: '1',
    academicYear: '2026'
  });

  // Bulk Upload File State
  const [selectedFile, setSelectedFile] = useState(null);

  const { studentId, courseCode, assignment, midExam, finalExam, semester, academicYear } = gradeForm;

  const handleInputChange = (e) => {
    setGradeForm({ ...gradeForm, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Helper utility to convert totals automatically into letter grades & grade points
  const evaluateGradeMetrics = (total) => {
    if (total >= 90) return { letter: 'A+', point: 4.0 };
    if (total >= 85) return { letter: 'A', point: 4.0 };
    if (total >= 80) return { letter: 'A-', point: 3.75 };
    if (total >= 75) return { letter: 'B+', point: 3.5 };
    if (total >= 70) return { letter: 'B', point: 3.0 };
    if (total >= 65) return { letter: 'B-', point: 2.75 };
    if (total >= 60) return { letter: 'C+', point: 2.5 };
    if (total >= 50) return { letter: 'C', point: 2.0 };
    return { letter: 'F', point: 0.0 };
  };

  // 1. Submit Single Student Split Marks Handler
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    setLoading(true);

    const assignMark = parseFloat(assignment) || 0;
    const midMark = parseFloat(midExam) || 0;
    const finalMark = parseFloat(finalExam) || 0;
    const totalMark = assignMark + midMark + finalMark;

    // Validate overall weights
    if (assignMark > 15 || midMark > 35 || finalMark > 50) {
      setLoading(false);
      return setStatusMessage({ 
        type: 'danger', 
        text: 'Invalid scale boundaries! Max parameters are: Assignment (15), Mid (35), Final (50).' 
      });
    }

    const { letter, point } = evaluateGradeMetrics(totalMark);

    try {
      // REFACTORED: Uses our custom environment-aware apiRequest tool instead of local fetch
      await apiRequest('/admin/results', {
        method: 'POST',
        body: JSON.stringify({
          studentId: studentId.trim(),
          courseCode: courseCode,
          assignment: assignMark,
          midExam: midMark,
          finalExam: finalMark,
          grade: letter,
          gradePoint: point,
          semester: parseInt(semester, 10),
          academicYear
        })
      });

      setStatusMessage({ 
        type: 'success', 
        text: `Successfully updated scores for ${studentId}! Total: ${totalMark.toFixed(1)} (${letter})` 
      });
      
      setGradeForm({ ...gradeForm, studentId: '', assignment: '', midExam: '', finalExam: '' });

    } catch (err) {
      setStatusMessage({ type: 'danger', text: err.message || 'Failed to submit grade metrics.' });
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Bulk CSV Spreadsheet Upload Handler
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      return setStatusMessage({ type: 'danger', text: 'Please select a valid CSV spreadsheet document first.' });
    }

    setStatusMessage({ type: '', text: '' });
    setLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // REFACTORED: Uses our custom apiRequest tool. Empty headers let the browser inject boundary parameters cleanly.
      const data = await apiRequest('/admin/students/upload', {
        method: 'POST',
        headers: {}, 
        body: formData
      });

      setStatusMessage({ type: 'success', text: data.message || 'Spreadsheet bulk ingestion successful!' });
      setSelectedFile(null);
      e.target.reset();

    } catch (err) {
      setStatusMessage({ type: 'danger', text: err.message || 'Spreadsheet bulk ingestion failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };
  return (
    <div className="bg-light min-vh-100">
      {/* Admin Panel Header Menu Control Component */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-3">
        <div className="container">
          <div className="navbar-brand fw-bold d-flex align-items-center gap-2 text-warning small">
            <Lock size={20} />
            <span>Instructor Administration Dashboard</span>
          </div>
          <button 
            className="btn btn-outline-light btn-sm d-flex align-items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <div className="container my-5" style={{ maxWidth: '900px' }}>
        
        {/* Status Feedback Message Banner */}
        {statusMessage.text && (
          <div className={`alert alert-${statusMessage.type} shadow-sm text-center small mb-4`} role="alert">
            {statusMessage.text}
          </div>
        )}

        {/* Tab Toggle Navigation Framework */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="bg-white p-2 rounded-3 shadow-sm d-flex gap-2">
              <button 
                className={`btn flex-grow-1 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 small ${activeTab === 'single' ? 'btn-primary' : 'btn-light text-secondary'}`}
                onClick={() => { setActiveTab('single'); setStatusMessage({type:'', text:''}); }}
              >
                <UserPlus size={18} /> Single Mark Entry
              </button>
              <button 
                className={`btn flex-grow-1 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 small ${activeTab === 'bulk' ? 'btn-primary' : 'btn-light text-secondary'}`}
                onClick={() => { setActiveTab('bulk'); setStatusMessage({type:'', text:''}); }}
              >
                <FileSpreadsheet size={18} /> Bulk Roster Import (.CSV)
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1 CONTENT VIEW: SINGLE ENTRY FORM CONTROL */}
        {activeTab === 'single' && (
          <div className="card border-0 shadow-sm p-4 bg-white rounded-3">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2 small">
              <PlusCircle size={20} className="text-primary" /> Input Student Marks Breakdown
            </h5>
            
            <form onSubmit={handleSingleSubmit} className="small">
              <div className="row g-3 mb-3">
                <div className="col-12 col-sm-6">
                  <label className="form-label fw-semibold text-secondary">Student ID</label>
                  <input type="text" className="form-control" placeholder="e.g. SE/103/15" name="studentId" value={studentId} onChange={handleInputChange} required />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label fw-semibold text-secondary">Official Course Code</label>
                  <select className="form-select" name="courseCode" value={courseCode} onChange={handleInputChange} required>
                    <option value="">-- Choose Course --</option>
                    <option value="SE3111">SE3111 - Microprocessor & Assembly</option>
                    <option value="SE3112">SE3112 - Object Oriented Programming</option>
                    <option value="SE3113">SE3113 - SE Tools & Practices</option>
                    <option value="SE3114">SE3114 - Web Design & Programming</option>
                    <option value="SE3115">SE3115 - Fundamental of Software Security</option>
                    <option value="SE3116">SE3116 - Requirements Engineering</option>
                  </select>
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-4">
                  <label className="form-label fw-semibold text-secondary">Assignment (Max 15)</label>
                  <input type="number" step="0.01" className="form-control" placeholder="e.g. 13.5" name="assignment" value={assignment} onChange={handleInputChange} required />
                </div>
                <div className="col-4">
                  <label className="form-label fw-semibold text-secondary">Mid Exam (Max 35)</label>
                  <input type="number" step="0.01" className="form-control" placeholder="e.g. 31.0" name="midExam" value={midExam} onChange={handleInputChange} required />
                </div>
                <div className="col-4">
                  <label className="form-label fw-semibold text-secondary">Final Exam (Max 50)</label>
                  <input type="number" step="0.01" className="form-control" placeholder="e.g. 44.0" name="finalExam" value={finalExam} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-6">
                  <label className="form-label fw-semibold text-secondary">Semester Context</label>
                  <input type="number" className="form-control" name="semester" value={semester} onChange={handleInputChange} required />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold text-secondary">Academic Year</label>
                  <input type="text" className="form-control" name="academicYear" value={academicYear} onChange={handleInputChange} required />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm" role="status"></span> : <><Upload size={18} /> Save & Publish Marks</>}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2 CONTENT VIEW: BULK ROSTER SPREADSHEET IMPORTER */}
        {activeTab === 'bulk' && (
          <div className="card border-0 shadow-sm p-4 bg-white rounded-3">
            <h5 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2 small">
              <FileSpreadsheet size={20} className="text-success" /> Bulk Roster CSV Registration
            </h5>
            <p className="text-muted small mb-4">Upload a `.csv` sheet to parse and register student rows into Neon. Columns must match the configuration layout order: `studentId, fullName, section, department, year, email`.</p>

            <form onSubmit={handleBulkSubmit}>
              <div className="mb-4">
                <label className="form-label fw-semibold text-secondary small">Choose CSV File</label>
                <div className="input-group">
                  <input 
                    type="file" 
                    className="form-control small" 
                    accept=".csv" 
                    onChange={handleFileChange} 
                    required 
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-success w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm" role="status"></span> : <><RefreshCw size={18} /> Process and Upload CSV</>}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;
