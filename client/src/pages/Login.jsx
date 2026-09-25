import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, UserCheck, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 

function Login() {
  // 1. Core Form Field and UI Visibility States
  const [formData, setFormData] = useState({ studentId: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const navigate = useNavigate();
  const { loginUser } = useAuth(); 
  const { studentId, password } = formData;

  // 2. Input Field Change Handlers
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Password Visibility Toggle Handler
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // 4. Session Authentication Request Dispatcher
  const onSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    setLoading(true);

    // Dynamic API endpoint configuration using Vite environment variables or local fallback
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Maps the studentId field cleanly to whatever your backend controllers expect (e.g. username/email/studentId)
        body: JSON.stringify({ 
          studentId: studentId.trim(), 
          password 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed.');
      }

      // Save the returned session token securely in the browser's storage
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      // Dispatch response token payload directly down to global AuthContext state machine
      loginUser(data);

      setStatusMessage({ type: 'success', text: 'Authentication successful! Redirecting...' });

      // 🚀 AUTOMATED ROLE ROUTER: Evaluate user access boundaries dynamically on success
      setTimeout(() => {
        if (data.user && data.user.role === 'admin') {
          navigate('/admin'); // Forward instructors securely to administration view links
        } else {
          navigate('/dashboard'); // Forward standard section classmates to home panel grid
        }
      }, 1500);

    } catch (error) {
      setStatusMessage({ type: 'danger', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center flex-grow-1 my-5">
      <div className="card shadow border-0 rounded-3 p-4 w-100" style={{ maxWidth: '450px' }}>
        
        {/* Hub Title Identity Component Block */}
        <div className="text-center mb-4">
          <div className="bg-primary text-white d-inline-flex p-3 rounded-circle shadow-sm mb-3">
            <LogIn size={32} />
          </div>
          <h3 className="fw-bold text-dark mb-1">Student Portal Sign In</h3>
          <p className="text-muted small">Software Engineering Section B</p>
        </div>

        {/* Dynamic Warning and Success Message Flash Container */}
        {statusMessage.text && (
          <div className={`alert alert-${statusMessage.type} text-center py-2 px-3 small mb-3`} role="alert">
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={onSubmit}>
          
          {/* Identity Entry ID Form Field Row */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary mb-1">Student ID / Admin Username</label>
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

          {/* Masked Password Field with Integrated Lucide Visibility Toggler */}
          <div className="mb-4">
            <label className="form-label small fw-semibold text-secondary mb-1">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-white text-muted border-end-0"><Lock size={18} /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control border-start-0 border-end-0 ps-0"
                placeholder="••••••••"
                name="password"
                value={password}
                onChange={onChange}
                required
              />
              <button
                type="button"
                className="input-group-text bg-white text-muted border-start-0"
                onClick={togglePasswordVisibility}
                style={{ cursor: 'pointer', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Form Action Access Request Control Submission Button */}
          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm mb-3"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <>
                Sign In to Portal <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* Dynamic Redirection Registration Block Link */}
          <div className="text-center mt-3">
            <p className="small text-muted mb-0">
              New student to the platform?{' '}
              <Link to="/activate" className="text-primary fw-semibold text-decoration-none">
                Activate Account Here
              </Link>
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}

export default Login;
