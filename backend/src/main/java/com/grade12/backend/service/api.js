import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Subjects API
export const getSubjects = () => api.get('/subjects');
export const createSubject = (subject) => api.post('/subjects', subject);

// You can add more APIs later for question papers, quizzes, etc.

export default api;