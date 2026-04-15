// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('survey_token');
    const savedAdmin = localStorage.getItem('survey_admin');
    if (savedToken && savedAdmin) {
      setToken(savedToken);
      setAdmin(JSON.parse(savedAdmin));
    }
    setLoading(false);
  }, []);

  const login = (authData) => {
    const adminInfo = {
      id: authData.adminId,
      email: authData.email,
      fullName: authData.fullName,
    };
    setToken(authData.token);
    setAdmin(adminInfo);
    localStorage.setItem('survey_token', authData.token);
    localStorage.setItem('survey_admin', JSON.stringify(adminInfo));
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('survey_token');
    localStorage.removeItem('survey_admin');
  };

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
