// src/services/api.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('survey_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('survey_token');
      localStorage.removeItem('survey_admin');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ───────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// ─── Surveys (Admin) ────────────────────────────────
export const surveyAPI = {
  getAll: () => api.get('/admin/surveys'),
  getById: (id) => api.get(`/admin/surveys/${id}`),
  create: (data) => api.post('/admin/surveys', data),
  update: (id, data) => api.put(`/admin/surveys/${id}`, data),
  delete: (id) => api.delete(`/admin/surveys/${id}`),
  togglePublish: (id) => api.patch(`/admin/surveys/${id}/publish`),
  getDashboardStats: () => api.get('/admin/surveys/dashboard/stats'),
};

// ─── Public ─────────────────────────────────────────
export const publicAPI = {
  getSurvey: (publicId) => api.get(`/public/surveys/${publicId}`),
  submitResponse: (publicId, data) => api.post(`/public/surveys/${publicId}/submit`, data),
};

// ─── Analytics ──────────────────────────────────────
export const analyticsAPI = {
  getSurveyAnalytics: (surveyId) => api.get(`/admin/analytics/${surveyId}`),
};

// ─── CSV Export ─────────────────────────────────────
export const exportAPI = {
  downloadCsv: (surveyId) =>
    api.get(`/admin/export/${surveyId}/csv`, { responseType: 'blob' }),
};

// ─── Settings ───────────────────────────────────────
export const settingsAPI = {
  getProfile:      ()       => api.get('/admin/settings/profile'),
  updateProfile:   (data)   => api.put('/admin/settings/profile', data),
  changePassword:  (data)   => api.put('/admin/settings/password', data),
  deleteAccount:   (data)   => api.delete('/admin/settings/account', { data }),
};

export default api;
