// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-slate-400">Loading...</div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
