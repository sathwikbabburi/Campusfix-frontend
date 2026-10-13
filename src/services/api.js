import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Week 6: Axios Request Interceptor for Authorization Header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Week 9: Response Interceptor & Global Error Handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
    }
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  getStaff: () => api.get('/auth/staff'),
  getAllUsers: () => api.get('/auth/users'),
};

export const complaintsApi = {
  getAll: (params = {}) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  getByTicket: (ticketNumber) => api.get(`/complaints/ticket/${ticketNumber}`),
  getMy: () => api.get('/complaints/my'),
  getAssigned: () => api.get('/complaints/assigned'),
  create: (data) => api.post('/complaints', data),
  update: (id, data) => api.put(`/complaints/${id}`, data),
  updateStatus: (id, data) => api.patch(`/complaints/${id}/status`, data),
  assignStaff: (id, staffId) => api.patch(`/complaints/${id}/assign?staffId=${staffId}`),
  toggleUpvote: (id) => api.post(`/complaints/${id}/upvote`),
  getTimeline: (id) => api.get(`/complaints/${id}/timeline`),
  delete: (id) => api.delete(`/complaints/${id}`),
};

export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const feedbacksApi = {
  submit: (data) => api.post('/feedbacks', data),
  getByComplaint: (complaintId) => api.get(`/feedbacks/complaint/${complaintId}`),
};

export const announcementsApi = {
  getActive: () => api.get('/announcements/active'),
  getAll: () => api.get('/announcements'),
  create: (data) => api.post('/announcements', data),
  delete: (id) => api.delete(`/announcements/${id}`),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

export const aiApi = {
  categorize: (title, description) => api.post('/ai/categorize', { title, description }),
  chat: (message, conversationHistory) => api.post('/ai/chat', { message, conversationHistory }),
};

export default api;
