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

function AdminDashboard() {
  const { user, logoutUser } = useAuth();
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
      const response = await fetch('http://localhost:5000/api/admin/results', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId,
          courseCode,
          assignment: assignMark,
          midExam: midMark,
          finalExam: finalMark,
          grade: letter,
          gradePoint: point,
          semester: parseInt(semester, 10),
          academicYear
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to submit grade metrics.');

      setStatusMessage({ type: 'success', text: `Successfully updated scores for ${studentId}! Total: ${totalMark.toFixed(1)} (${letter})` });
      setGradeForm({ ...gradeForm, studentId: '', assignment: '', midExam: '', finalExam: '' });

    } catch (err) {
      setStatusMessage({ type: 'danger', text: err.message });
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
      const response = await fetch('http://localhost:5000/api/admin/students/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Spreadsheet bulk ingestion failed.');

      setStatusMessage({ type: 'success', text: data.message });
      setSelectedFile(null);
      e.target.reset();

    } catch (err) {
      setStatusMessage({ type: 'danger', text: err.message });
    } finally {
      setLoading(false);
    }
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
            onClick={() => { logoutUser(); navigate('/login'); }}
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
              <div className="border border-2 border-dashed rounded-3 p-5 text-center bg-light mb-4 position-relative">
                <Upload size={40} className="text-muted mb-3 mx-auto d-block" />
                <input 
                  type="file" 
                  accept=".csv" 
                  className="form-control position-absolute top-0 start-0 w-100 h-100 opacity-0" 
                  style={{ cursor: 'pointer' }}
                  onChange={handleFileChange}
                />
                <span className="fw-bold text-dark d-block mb-1 small">
                  {selectedFile ? selectedFile.name : "Click here or drag file to upload spreadsheet"}
                </span>
                <span className="text-muted small d-block">Supports standard comma-separated text files (.CSV) up to 5MB</span>
              </div>

              <button type="submit" className="btn btn-success w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm" role="status"></span> : <><Upload size={18} /> Execute Bulk Roster Ingestion</>}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;
