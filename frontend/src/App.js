import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import SignUp from './components/SignUp';
import Login from './components/Login';
import StudentDashboard from './components/student/StudentDashboard';
import StudentSubjectSelection from './components/student/StudentSubjectSelection';
import TutorDashboard from './components/tutor/TutorDashboard';
import TutorSubjectSelection from './components/tutor/TutorSubjectSelection'; // Import TutorSubjectSelection
import AdminDashboard from './components/admin/AdminDashboard';
import SubjectManager from './components/SubjectManager';
import Quizzes from './components/student/Quizzes';
import TestQuizzes from './components/student/TestQuizzes';
import './App.css';

// Protected Route component to check authentication and role
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  
  if (!token || !userJson) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userJson);
    
    if (!allowedRoles.includes(user.category)) {
      // Redirect to appropriate dashboard based on role
      switch(user.category) {
        case 'student':
          const studentSubjects = localStorage.getItem(`student_subjects_${user.id}`);
          if (studentSubjects) {
            return <Navigate to="/student-dashboard" replace />;
          } else {
            return <Navigate to="/student/subject-selection" replace />;
          }
        case 'tutor':
          // Check if tutor has selected subjects
          const tutorSubjects = localStorage.getItem(`tutor_subjects_${user.id}`);
          if (tutorSubjects) {
            return <Navigate to="/tutor-dashboard" replace />;
          } else {
            return <Navigate to="/tutor/subject-selection" replace />; // Go to subject selection first
          }
        case 'admin':
          return <Navigate to="/admin-dashboard" replace />;
        default:
          return <Navigate to="/login" replace />;
      }
    }

    return children;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return <Navigate to="/login" replace />;
  }
};

// Public route - redirects to dashboard if already logged in
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');

  if (token && userJson) {
    try {
      const user = JSON.parse(userJson);
      switch(user.category) {
        case 'student':
          const studentSubjects = localStorage.getItem(`student_subjects_${user.id}`);
          if (studentSubjects) {
            return <Navigate to="/student-dashboard" replace />;
          } else {
            return <Navigate to="/student/subject-selection" replace />;
          }
        case 'tutor':
          // Check if tutor has selected subjects
          const tutorSubjects = localStorage.getItem(`tutor_subjects_${user.id}`);
          if (tutorSubjects) {
            return <Navigate to="/tutor-dashboard" replace />;
          } else {
            return <Navigate to="/tutor/subject-selection" replace />; // Go to subject selection first
          }
        case 'admin':
          return <Navigate to="/admin-dashboard" replace />;
        default:
          return children;
      }
    } catch (error) {
      return children;
    }
  }

  return children;
};

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={
                        <PublicRoute>
                            <Home />
                        </PublicRoute>
                    } />
                    
                    <Route path="/signup" element={
                        <PublicRoute>
                            <SignUp />
                        </PublicRoute>
                    } />
                    
                    <Route path="/login" element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } />
                    
                    {/* Student Routes */}
                    <Route path="/student/subject-selection" element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <StudentSubjectSelection />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/student-dashboard" element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <StudentDashboard />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/quizzes" element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <Quizzes />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/subjects" element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <SubjectManager />
                        </ProtectedRoute>
                    } />
                    
                    {/* Tutor Routes */}
                    <Route path="/tutor/subject-selection" element={
                        <ProtectedRoute allowedRoles={['tutor']}>
                            <TutorSubjectSelection />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/tutor-dashboard" element={
                        <ProtectedRoute allowedRoles={['tutor']}>
                            <TutorDashboard />
                        </ProtectedRoute>
                    } />
                    
                    {/* Admin Routes */}
                    <Route path="/admin-dashboard" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                    
                    {/* Test Route */}
                    <Route path="/test-quizzes" element={<TestQuizzes />} />
                    
                    {/* Catch all - redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;