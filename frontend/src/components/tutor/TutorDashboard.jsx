import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TutorDashboard.css';

const TutorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([
    { id: 1, name: 'Thabo Mokoena', subject: 'Mathematics', progress: 75, lastActive: '2 hours ago' },
    { id: 2, name: 'Lerato Ndlovu', subject: 'Physical Science', progress: 82, lastActive: '1 day ago' },
    { id: 3, name: 'Sipho Dlamini', subject: 'Mathematics', progress: 68, lastActive: '3 hours ago' },
    { id: 4, name: 'Nomsa Zwane', subject: 'English', progress: 90, lastActive: '5 hours ago' }
  ]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.category !== 'tutor') {
      navigate('/login');
      return;
    }
    
    setUser(parsedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const navigateTo = (path) => {
    navigate(path);
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="tutor-dashboard">
      {/* Navigation */}
      <nav className="tutor-nav">
        <div className="nav-brand">
          <h2>📚 Grade 12 Central</h2>
          <span className="role-badge tutor">Tutor</span>
        </div>
        
        <div className="nav-links">
          <button className="nav-link active">Dashboard</button>
          <button className="nav-link" onClick={() => navigateTo('/tutor/students')}>My Students</button>
          <button className="nav-link" onClick={() => navigateTo('/tutor/quizzes')}>Create Quiz</button>
          <button className="nav-link" onClick={() => navigateTo('/tutor/materials')}>Teaching Materials</button>
          <button className="nav-link" onClick={() => navigateTo('/tutor/schedule')}>Schedule</button>
        </div>
        
        <div className="nav-user">
          <div className="user-info">
            <span className="user-name">{user.firstName} {user.lastName}</span>
            <span className="user-email">{user.email}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="tutor-content">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1>Welcome back, Tutor {user.firstName}! 👨‍🏫</h1>
          <p>Here's an overview of your teaching activity.</p>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat-box">
            <span className="stat-value">24</span>
            <span className="stat-label">Active Students</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">3</span>
            <span className="stat-label">Subjects</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">12</span>
            <span className="stat-label">Quizzes Created</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">85%</span>
            <span className="stat-label">Avg. Student Score</span>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="schedule-section">
          <h2>Today's Schedule</h2>
          <div className="schedule-list">
            <div className="schedule-item">
              <span className="schedule-time">09:00 - 10:30</span>
              <span className="schedule-subject">Mathematics Group Session</span>
              <span className="schedule-students">8 students</span>
              <button className="schedule-btn">Join</button>
            </div>
            <div className="schedule-item">
              <span className="schedule-time">11:00 - 12:30</span>
              <span className="schedule-subject">Physical Science 1-on-1</span>
              <span className="schedule-students">Lerato Ndlovu</span>
              <button className="schedule-btn">Join</button>
            </div>
            <div className="schedule-item">
              <span className="schedule-time">14:00 - 15:30</span>
              <span className="schedule-subject">English Essay Review</span>
              <span className="schedule-students">5 students</span>
              <button className="schedule-btn">Join</button>
            </div>
          </div>
        </div>

        {/* Student Performance */}
        <div className="student-performance">
          <div className="section-header">
            <h2>Student Performance</h2>
            <button className="view-all-btn" onClick={() => navigateTo('/tutor/students')}>View All</button>
          </div>
          <div className="student-table">
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Subject</th>
                  <th>Progress</th>
                  <th>Last Active</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{student.subject}</td>
                    <td>
                      <div className="progress-cell">
                        <span>{student.progress}%</span>
                        <div className="progress-bar-small">
                          <div className="progress-fill-small" style={{ width: `${student.progress}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td>{student.lastActive}</td>
                    <td>
                      <button className="action-btn">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-card" onClick={() => navigateTo('/tutor/create-quiz')}>
              <span className="action-icon">📝</span>
              <h3>Create New Quiz</h3>
              <p>Design practice questions for students</p>
            </button>

            <button className="action-card" onClick={() => navigateTo('/tutor/upload-material')}>
              <span className="action-icon">📄</span>
              <h3>Upload Material</h3>
              <p>Share study guides and resources</p>
            </button>

            <button className="action-card" onClick={() => navigateTo('/tutor/schedule-session')}>
              <span className="action-icon">📅</span>
              <h3>Schedule Session</h3>
              <p>Plan group or individual tutoring</p>
            </button>

            <button className="action-card" onClick={() => navigateTo('/tutor/feedback')}>
              <span className="action-icon">💬</span>
              <h3>Student Feedback</h3>
              <p>Review and respond to feedback</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;