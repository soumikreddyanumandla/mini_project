// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateSurvey from './pages/CreateSurvey';
import EditSurvey from './pages/EditSurvey';
import MySurveys from './pages/MySurveys';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import PublicSurvey from './pages/PublicSurvey';
import SurveySuccess from './pages/SurveySuccess';
import Layout from './components/Layout';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/survey/:publicId" element={<PublicSurvey />} />
            <Route path="/survey/success" element={<SurveySuccess />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/surveys" element={<MySurveys />} />
                <Route path="/surveys/create" element={<CreateSurvey />} />
                <Route path="/surveys/edit/:id" element={<EditSurvey />} />
                <Route path="/analytics/:id" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
