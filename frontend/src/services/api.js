import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
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

// Handle response errors
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

// Auth APIs
export const login = (email, password) => api.post('/auth/login', { email, password });

// Admin APIs
export const getAdminStats = () => api.get('/admin/stats');
export const getUsers = (params) => api.get('/admin/users', { params });
export const createUser = (userData) => api.post('/admin/users', userData);
export const updateUser = (id, userData) => api.put(`/admin/users/${id}`, userData);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const toggleUserStatus = (id) => api.patch(`/admin/users/${id}/status`);
export const resetUserPassword = (id) => api.post(`/admin/users/${id}/reset-password`);

// Settings APIs
export const getSettings = () => api.get('/admin/settings');
export const updateGeneralSettings = (settings) => api.put('/admin/settings/general', settings);
export const updateSecuritySettings = (settings) => api.put('/admin/settings/security', settings);
export const updateNotificationSettings = (settings) => api.put('/admin/settings/notifications', settings);
export const updateSystemSettings = (settings) => api.put('/admin/settings/system', settings);

// Subjects APIs
export const getSubjects = () => api.get('/subjects');
export const createSubject = (subject) => api.post('/subjects', subject);

// Tutor APIs
export const getTutorStudents = (tutorId) => api.get(`/tutor/${tutorId}/students`);
export const getTutorMaterials = (tutorId) => api.get(`/materials/tutor/${tutorId}`);
export const uploadMaterial = (formData) => api.post('/materials/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteMaterial = (id) => api.delete(`/materials/${id}`);

// Student APIs
export const getStudentQuizzes = (studentId) => api.get(`/quizzes/student/${studentId}`);
export const submitQuiz = (quizId, data) => api.post(`/quizzes/${quizId}/submit`, data);

// Chat APIs
export const getConversation = (userId1, userId2) => api.get(`/chat/conversation/${userId1}/${userId2}`);
export const sendMessage = (messageData) => api.post('/chat/send', messageData);
export const markMessagesAsRead = (data) => api.post('/chat/mark-read', data);

export default api;