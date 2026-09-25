import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserCheck, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

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
      const response = await fetch('http://localhost:5000/api/auth/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, fullName, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Activation failed. Something went wrong.');
      }

      setStatusMessage({ type: 'success', text: data.message });
      
      // Route transition back to access portal
      setTimeout(() => {
        navigate('/login');
      }, 2500);

    } catch (error) {
      setStatusMessage({ type: 'danger', text: error.message });
    } finally {
      // 🚀 FIXED: Changed from 'Sandy' to 'finally' to clear the red compilation error
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
                placeholder="e.g. SE/103/15"
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
                placeholder="e.g. Abebe Chala"
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
