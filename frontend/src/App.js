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
<<<<<<< HEAD
import AdminReports from './components/admin/AdminReports';
import Quizzes from './components/student/Quizzes';
=======
import AdminUsers from './components/admin/AdminUsers';
import AdminSettings from './components/admin/AdminSettings';
import SubjectManager from './components/SubjectManager';
import Quizzes from './components/student/Quizzes';
import TestQuizzes from './components/student/TestQuizzes';
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
import Material from './components/tutor/Material';
import TutorSessions from './components/tutor/TutorSessions';
import TutorQuizzes from './components/tutor/TutorQuizzes';
import TutorFeedback from './components/tutor/TutorFeedback';
<<<<<<< HEAD
import TutorMessages from './components/tutor/TutorMessages';



// Admin Component Imports (Essential only)
import AdminUsers from './components/admin/AdminUsers';
import AdminSettings from './components/admin/AdminSettings';

import TestQuizzes from './components/student/TestQuizzes';

=======
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
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
          if (studentSubjects && studentSubjects !== '[]' && studentSubjects !== 'null') {
            return <Navigate to="/student-dashboard" replace />;
          } else {
            return <Navigate to="/student/subject-selection" replace />;
          }
        case 'tutor':
<<<<<<< HEAD
          // Check if tutor has selected subjects
=======
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
          const tutorSubjects = localStorage.getItem(`tutor_subjects_${user.id}`);
          if (tutorSubjects && tutorSubjects !== '[]' && tutorSubjects !== 'null') {
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
          if (studentSubjects && studentSubjects !== '[]' && studentSubjects !== 'null') {
            return <Navigate to="/student-dashboard" replace />;
          } else {
            return <Navigate to="/student/subject-selection" replace />;
          }
        case 'tutor':
<<<<<<< HEAD
          // Check if tutor has selected subjects
=======
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
          const tutorSubjects = localStorage.getItem(`tutor_subjects_${user.id}`);
          if (tutorSubjects && tutorSubjects !== '[]' && tutorSubjects !== 'null') {
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
                    {/* ==================== PUBLIC ROUTES ==================== */}
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
                    
<<<<<<< HEAD

                    {/* ==================== STUDENT ROUTES ==================== */}

=======
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
                    {/* Password Reset Routes */}
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    
<<<<<<< HEAD
                    {/* Student Routes */}
=======
                    {/* ==================== STUDENT ROUTES ==================== */}
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
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
                    
<<<<<<< HEAD
                    {/* Subjects route */}
=======
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
                    <Route path="/subjects" element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <Subjects />
                        </ProtectedRoute>
                    } />

                    
                    {/* ==================== TUTOR ROUTES ==================== */}
                    <Route path="/tutor/subject-selection" element={
                        <ProtectedRoute allowedRoles={['tutor']}>
                            <TutorSubjectSelection />
                        </ProtectedRoute>
                    } />
                    
<<<<<<< HEAD
                    {/* Tutor Dashboard - Only after subjects are selected */}
=======
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
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
                    
                    {/* ==================== ADMIN ROUTES ==================== */}
<<<<<<< HEAD
                    {/* Admin Dashboard - Main admin panel */}
=======
                    {/* Main Admin Dashboard */}
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
                    <Route path="/admin-dashboard" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                    
<<<<<<< HEAD
                    {/* Admin Users Management */}
=======
                    {/* Admin User Management */}
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
                    <Route path="/admin/users" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminUsers />
                        </ProtectedRoute>
                    } />
                    
<<<<<<< HEAD
                    {/* Admin Settings */}
=======
                    {/* Admin System Settings */}
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
                    <Route path="/admin/settings" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminSettings />
                        </ProtectedRoute>
                    } />
<<<<<<< HEAD
                    <Route path="/admin/reports" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminReports />
  </ProtectedRoute>
} />
                    
                    {/* Test Route */}
=======
                    
                    {/* Subject Manager (Legacy) */}
                    <Route path="/subject-manager" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <SubjectManager />
                        </ProtectedRoute>
                    } />
                    
                    {/* ==================== TEST ROUTES ==================== */}
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
                    <Route path="/test-quizzes" element={<TestQuizzes />} />
                    
                    {/* ==================== CATCH ALL ==================== */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;