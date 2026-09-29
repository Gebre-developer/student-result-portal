import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserCheck, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
// 1. IMPORT YOUR CENTRALIZED API WORKSPACE TOOL
import { apiRequest } from '../services/api'; 

function ActivateAccount() {
  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const { studentId, fullName, email, password, confirmPassword } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });

    if (password !== confirmPassword) {
      return setStatusMessage({ type: 'danger', text: 'Passwords do not match. Please verify your credentials.' });
    }

    setLoading(true);

    try {
      // 2. USE YOUR SECURE API REQUEST HELPER FUNCTION
      // ✅ FIXED: JSON keys mapped to snake_case to match authController requirements
      const data = await apiRequest('/auth/activate', {
        method: 'POST',
        body: JSON.stringify({ 
          student_id: studentId.trim(), 
          email: email.trim(), 
          password: password 
        })
      });

      // The apiRequest helper handles JSON status checking automatically
      setStatusMessage({ type: 'success', text: data.message || 'Account activated successfully!' });
      
      // Route transition back to access portal
      setTimeout(() => {
        navigate('/login');
      }, 2500);

    } catch (error) {
      setStatusMessage({ type: 'danger', text: error.message || 'Activation failed. Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center flex-grow-1 my-5">
      <div className="card shadow border-0 rounded-3 p-4 w-100" style={{ maxWidth: '500px' }}>
        
        <div className="text-center mb-4">
          <div className="bg-primary text-white d-inline-flex p-3 rounded-circle shadow-sm mb-3">
            <ShieldCheck size={32} />
          </div>
          <h3 className="fw-bold text-dark mb-1">Account Activation</h3>
          <p className="text-muted small">Software Engineering Section B Result Portal</p>
        </div>

        {statusMessage.text && (
          <div className={`alert alert-${statusMessage.type} text-center py-2 px-3 small mb-3`} role="alert">
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary mb-1">Official Student ID</label>
            <div className="input-group">
              <span className="input-group-text bg-white text-muted border-end-0"><UserCheck size={18} /></span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="e.g. BDU1702026"
                name="studentId"
                value={studentId}
                onChange={onChange}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary mb-1">Full Name (as on roster)</label>
            <div className="input-group">
              <span className="input-group-text bg-white text-muted border-end-0"><UserCheck size={18} /></span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="e.g. Gebreselassie Sisay"
                name="fullName"
                value={fullName}
                onChange={onChange}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary mb-1">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-white text-muted border-end-0"><Mail size={18} /></span>
              <input
                type="email"
                className="form-control border-start-0 ps-0"
                placeholder="e.g. name@example.com"
                name="email"
                value={email}
                onChange={onChange}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary mb-1">Create Password</label>
            <div className="input-group">
              <span className="input-group-text bg-white text-muted border-end-0"><Lock size={18} /></span>
              <input
                type="password"
                className="form-control border-start-0 border-end-0 ps-0"
                placeholder="••••••••"
                name="password"
                value={password}
                onChange={onChange}
                minLength="6"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold text-secondary mb-1">Confirm Password</label>
            <div className="input-group">
              <span className="input-group-text bg-white text-muted border-end-0"><Lock size={18} /></span>
              <input
                type="password"
                className="form-control border-start-0 ps-0"
                placeholder="••••••••"
                name="confirmPassword"
                value={confirmPassword}
                onChange={onChange}
                minLength="6"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm mb-3" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm" role="status"></span> : <>{'Activate Account '} <ArrowRight size={18} /></>}
          </button>

          <div className="text-center mt-3">
            <p className="small text-muted mb-0">
              Already activated?{' '}
              <Link to="/login" className="text-primary fw-semibold text-decoration-none">Sign In Instead</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ActivateAccount;
