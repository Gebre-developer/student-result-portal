import React, { createContext, useState, useEffect, useContext } from 'react';

// Initialize the central context container layout
const AuthContext = createContext(null);

/**
 * Custom hook wrapper to easily inject authentication state into child layers
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be executed within an AuthProvider structural container.');
  }
  return context;
};

/**
 * Global State Provider Component Wrap
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Initial mounting cycle: Load active user token configurations from local storage
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        // UNIFIED KEYS: Swapped out 'portal_...' prefix to match your api.js hooks perfectly
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const fullName = localStorage.getItem('fullName');
        const studentId = localStorage.getItem('studentId');

        if (token && role) {
          setUser({
            token,
            role,
            fullName: fullName || 'Student Account',
            studentId: studentId || ''
          });
        }
      } catch (error) {
        console.error('Failed to parse cached local security context state:', error);
        localStorage.clear(); // Clear corrupt artifacts if present
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // 2. State-driven authentication login wrapper
  const loginUser = (authPayload) => {
    // UNIFIED STORAGE MUTATIONS
    localStorage.setItem('token', authPayload.token);
    localStorage.setItem('role', authPayload.user.role);
    localStorage.setItem('fullName', authPayload.user.fullName);
    localStorage.setItem('studentId', authPayload.user.studentId);

    setUser({
      token: authPayload.token,
      role: authPayload.user.role,
      fullName: authPayload.user.fullName,
      studentId: authPayload.user.studentId
    });
  };

  // 3. State-driven authentication session clearance log out wrapper
  const logoutUser = () => {
    // UNIFIED CLEARANCE PURGES
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    localStorage.removeItem('studentId');
    setUser(null);
  };

  // Bundle properties cleanly to shield application layouts
  const contextValue = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    loading,
    loginUser,
    logoutUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading ? children : (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading application session metrics...</span>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export default AuthContext;
