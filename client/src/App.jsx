import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from './context/AuthContext'; // 🚀 Import custom session hook

import Login from './pages/Login';
import ActivateAccount from './pages/ActivateAccount';
import Dashboard from './pages/Dashboard';
import Results from './pages/Results';

function App() {
  const { isAuthenticated } = useAuth(); // 🚀 Pull dynamic authorization flag

  return (
    <Router>
      <div className="bg-light min-vh-100 d-flex flex-column">
        <Routes>
          <Route path="/activate" element={<ActivateAccount />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
          
          {/* Protected Routes relying directly on dynamic session conditions */}
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} />
          <Route path="/results" element={isAuthenticated ? <Results /> : <Navigate to="/login" replace />} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
