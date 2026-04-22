import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import SignUp from './components/SignUp';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import StudentDashboard from './components/student/StudentDashboard';
import TutorSubjectSelection from './components/tutor/TutorSubjectSelection';
import StudentSubjectSelection from './components/student/StudentSubjectSelection';
import Subjects from './components/student/Subjects';
import TutorDashboard from './components/tutor/TutorDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import Quizzes from './components/student/Quizzes';
import Material from './components/tutor/Material';
import TutorSessions from './components/tutor/TutorSessions';
import TutorQuizzes from './components/tutor/TutorQuizzes';
import TutorFeedback from './components/tutor/TutorFeedback';
import TutorMessages from './components/tutor/TutorMessages';

// Admin Component Imports (Essential only)
import AdminUsers from './components/admin/AdminUsers';
import AdminSettings from './components/admin/AdminSettings';

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
            return <Navigate to="/tutor/subject-selection" replace />;
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
            return <Navigate to="/tutor/subject-selection" replace />;
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
                    

                    {/* ==================== STUDENT ROUTES ==================== */}

                    {/* Password Reset Routes */}
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    
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
                    
                    {/* Subjects route */}
                    <Route path="/subjects" element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <Subjects />
                        </ProtectedRoute>
                    } />
                    
                    {/* ==================== TUTOR ROUTES ==================== */}
                    {/* Tutor Subject Selection - First page after login for new tutors */}
                    <Route path="/tutor/subject-selection" element={
                        <ProtectedRoute allowedRoles={['tutor']}>
                            <TutorSubjectSelection />
                        </ProtectedRoute>
                    } />
                    
                    {/* Tutor Dashboard - Only after subjects are selected */}
                    <Route path="/tutor-dashboard" element={
                        <ProtectedRoute allowedRoles={['tutor']}>
                            <TutorDashboard />
                        </ProtectedRoute>
                    } />
                    
                    {/* Materials Management */}
                    <Route path="/tutor/materials" element={
                        <ProtectedRoute allowedRoles={['tutor']}>
                            <Material />
                        </ProtectedRoute>
                    } />
                    
                    {/* Alternative route for upload material (backward compatibility) */}
                    <Route path="/tutor/upload-material" element={
                        <ProtectedRoute allowedRoles={['tutor']}>
                            <Material />
                        </ProtectedRoute>
                    } />
                    
                    {/* Sessions Management */}
                    <Route path="/tutor/sessions" element={
                        <ProtectedRoute allowedRoles={['tutor']}>
                            <TutorSessions />
                        </ProtectedRoute>
                    } />
                    
                    {/* Quizzes Management - Main route for tutor quizzes */}
                    <Route path="/tutor/quizzes" element={
                        <ProtectedRoute allowedRoles={['tutor']}>
                            <TutorQuizzes />
                        </ProtectedRoute>
                    } />
                    
                    {/* Feedback Management */}
                    <Route path="/tutor/feedback" element={
                        <ProtectedRoute allowedRoles={['tutor']}>
                            <TutorFeedback />
                        </ProtectedRoute>
                    } />
                    
                    {/* Messages/Communication */}
                    <Route path="/tutor/messages" element={
                        <ProtectedRoute allowedRoles={['tutor']}>
                            <TutorMessages />
                        </ProtectedRoute>
                    } />
                    
                    {/* ==================== ADMIN ROUTES ==================== */}
                    {/* Admin Dashboard - Main admin panel */}
                    <Route path="/admin-dashboard" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                    
                    {/* Admin Users Management */}
                    <Route path="/admin/users" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminUsers />
                        </ProtectedRoute>
                    } />
                    
                    {/* Admin Settings */}
                    <Route path="/admin/settings" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminSettings />
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