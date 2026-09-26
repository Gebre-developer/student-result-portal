import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  GraduationCap, 
  BookOpen, 
  Bell, 
  LogOut, 
  Calendar, 
  Award, 
  Mail, 
  BookMarked 
} from 'lucide-react';
// 1. IMPORT YOUR CENTRALIZED API WORKSPACE TOOL
import { apiRequest } from '../services/api'; 

function Dashboard() {
  const { logoutUser } = useAuth();
  const navigate = useNavigate();
  
  // Local state metrics
  const [profile, setProfile] = useState(null);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch student profile and notices parallel lines on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 2. USE YOUR SECURE API REQUEST HELPER FUNCTION
        // It injects 'Bearer ' token headers and switches URLs automatically
        const profileData = await apiRequest('/students/me', { method: 'GET' });
        
        // Safely handle both single object and index array database payloads
        if (Array.isArray(profileData)) {
          setProfile(profileData.length > 0 ? profileData[0] : null);
        } else {
          setProfile(profileData);
        }

        // OFFICIAL TIMETABLE DATASET: Directly mapping your core courses
        setNotices([
          {
            id: 1,
            title: 'Official 3rd Year Semester I Registration',
            message: 'You are successfully registered for 6 core courses: Microprocessor & Assembly, OOP, SE Tools, Web Design, Software Security, and Requirements Engineering.',
            date: 'Today'
          },
          {
            id: 2,
            title: 'View-Only Score Matrix Active',
            message: 'Your individual mark splits (Assignments, Midterms, and Finals) are locked directly to the viewing station. Printing and file downloading are disabled.',
            date: 'System'
          }
        ]);

      } catch (err) {
        console.error(err);
        setError(err.message || 'An error occurred while loading dashboard parameters.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Session destruction route handler
  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading dashboard parameters...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 1. Global Navigation Bar Header Layout */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm py-3">
        <div className="container">
          <div className="navbar-brand fw-bold d-flex align-items-center gap-2">
            <GraduationCap size={28} />
            <span>SE Section B Portal</span>
          </div>
          <button 
            className="btn btn-light btn-sm text-primary fw-semibold d-flex align-items-center gap-2 shadow-sm"
            onClick={handleLogout}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </nav>

      {/* 2. Main Workspace Layout Grid */}
      <div className="container my-5">
        
        {/* Welcome Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="bg-white p-4 rounded-3 shadow-sm d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <h2 className="fw-bold text-dark mb-1">Welcome back, {profile?.full_name || 'Student'}!</h2>
                <p className="text-muted mb-0">Student ID: <span className="fw-semibold text-primary">{profile?.student_id || 'N/A'}</span> | Status: Verified Academic Member</p>
              </div>
              <Link to="/results" className="btn btn-outline-primary fw-semibold d-flex align-items-center gap-2">
                <BookOpen size={18} /> View Academic History
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger shadow-sm text-center small mb-4" role="alert">
            {error}
          </div>
        )}

        {/* Core Architecture Flex Containers Grid */}
        <div className="row g-4">
          
          {/* LEFT CONTAINER: Profile Parameters Card */}
          <div className="col-12 col-lg-5">
            <div className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden">
              <div className="bg-dark text-white p-4 d-flex align-items-center gap-3">
                <div className="bg-secondary p-3 rounded-circle d-inline-flex text-white">
                  <User size={24} />
                </div>
                <div>
                  <h5 className="fw-bold mb-0">Academic Profile</h5>
                  <p className="small text-light mb-0 opacity-75">Official Registration Parameters</p>
                </div>
              </div>
              <div className="card-body p-4 bg-white">
                <ul className="list-group list-group-flush small">
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                    <span className="text-muted d-flex align-items-center gap-2"><User size={16} /> Department</span>
                    <span className="fw-semibold text-dark text-end">{profile?.department || 'Software Engineering'}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                    <span className="text-muted d-flex align-items-center gap-2"><Award size={16} /> Current Section</span>
                    <span className="fw-semibold text-primary">Section {profile?.section || 'B'}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                    <span className="text-muted d-flex align-items-center gap-2"><Calendar size={16} /> Year of Study</span>
                    <span className="fw-semibold text-dark">Year {profile?.year || 3}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                    <span className="text-muted d-flex align-items-center gap-2"><Mail size={16} /> Email Address</span>
                    <span className="fw-semibold text-dark text-break ps-3 text-end">{profile?.email || 'N/A'}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3 border-bottom-0">
                    <span className="text-muted d-flex align-items-center gap-2"><BookMarked size={16} /> Roster Date</span>
                    <span className="fw-semibold text-dark">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Active'}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* RIGHT CONTAINER: Notices and Board Subsystem */}
          <div className="col-12 col-lg-7">
            <div className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden">
              <div className="bg-white border-bottom p-4 d-flex align-items-center gap-2">
                <Bell className="text-primary" size={22} />
                <h5 className="fw-bold text-dark mb-0">Announcements & Notices</h5>
              </div>
              <div className="card-body p-4 bg-white">
                {notices.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted mb-0">No active notices at this time.</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {notices.map((notice) => (
                      <div key={notice.id} className="p-3 bg-light rounded-3 border-start border-primary border-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <h6 className="fw-bold text-dark mb-0">{notice.title}</h6>
                          <span className="badge bg-secondary px-2 py-1 font-monospace" style={{ fontSize: '10px' }}>{notice.date}</span>
                        </div>
                        <p className="text-muted small mb-0">{notice.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
