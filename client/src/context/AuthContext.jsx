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
        const token = localStorage.getItem('portal_token');
        const role = localStorage.getItem('portal_role');
        const fullName = localStorage.getItem('portal_user_name');
        const studentId = localStorage.getItem('portal_student_id');

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
    localStorage.setItem('portal_token', authPayload.token);
    localStorage.setItem('portal_role', authPayload.user.role);
    localStorage.setItem('portal_user_name', authPayload.user.fullName);
    localStorage.setItem('portal_student_id', authPayload.user.studentId);

    setUser({
      token: authPayload.token,
      role: authPayload.user.role,
      fullName: authPayload.user.fullName,
      studentId: authPayload.user.studentId
    });
  };

  // 3. State-driven authentication session clearance log out wrapper
  const logoutUser = () => {
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_role');
    localStorage.removeItem('portal_user_name');
    localStorage.removeItem('portal_student_id');
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
