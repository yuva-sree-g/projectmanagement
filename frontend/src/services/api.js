import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    return api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  register: (userData) => api.post('/auth/register', userData),
};

// Project API
export const projectsAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (projectData) => api.post('/projects', projectData),
  update: (id, projectData) => api.put(`/projects/${id}`, projectData),
  delete: (id) => api.delete(`/projects/${id}`),
};

// Task API
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (taskData) => api.post('/tasks', taskData),
  update: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  delete: (id) => api.delete(`/tasks/${id}`),
  getMyTasks: () => api.get('/tasks/my-tasks'),
  logTime: (taskId, timeData) => api.post(`/tasks/${taskId}/log-time`, timeData),
  getTimeLogs: (taskId) => api.get(`/tasks/${taskId}/time-logs`),
  getPerformanceMetrics: () => api.get('/performance-metrics'),
};

// Comment API
export const commentsAPI = {
  getByProject: (projectId) => api.get(`/projects/${projectId}/comments`),
  getByTask: (taskId) => api.get(`/tasks/${taskId}/comments`),
  createForProject: (projectId, commentData) => api.post(`/projects/${projectId}/comments`, commentData),
  createForTask: (taskId, commentData) => api.post(`/tasks/${taskId}/comments`, commentData),
  update: (id, commentData) => api.put(`/comments/${id}`, commentData),
  delete: (id) => api.delete(`/comments/${id}`),
};

// User API
export const usersAPI = {
  getCurrentUser: () => api.get('/users/me'),
  updateCurrentUser: (userData) => api.put('/users/me', userData),
  getAll: (params) => api.get('/users', { params }),
};

// Time Log API
export const timelogAPI = {
  createTimeLog: (timeLogData) => api.post('/timelog', timeLogData),
  getTimeLogs: (filters = {}) => api.get('/timelog', { params: filters }),
  getTimeLog: (id) => api.get(`/timelog/${id}`),
  updateTimeLog: (id, timeLogData) => api.put(`/timelog/${id}`, timeLogData),
  deleteTimeLog: (id) => api.delete(`/timelog/${id}`),
  getTimeSummary: (userId, filters = {}) => api.get(`/timelog/summary/user/${userId}`, { params: filters }),
};



export default api; 