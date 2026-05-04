import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  // Sample data
  const [notifications] = useState([
    { id: 1, message: 'New Mathematics quiz available', time: '5 min ago', read: false, type: 'quiz' },
    { id: 2, message: 'Your Physical Science paper has been graded', time: '1 hour ago', read: false, type: 'grade' },
    { id: 3, message: 'Study group session starts in 30 minutes', time: '2 hours ago', read: true, type: 'session' },
    { id: 4, message: 'New past paper uploaded: English FAL 2023', time: '1 day ago', read: true, type: 'paper' },
  ]);

  const [subjects] = useState([
    { id: 1, name: 'Mathematics', progress: 75, grade: 'A', teacher: 'Mr. Smith' },
    { id: 2, name: 'Physical Science', progress: 68, grade: 'B', teacher: 'Dr. Johnson' },
    { id: 3, name: 'English', progress: 82, grade: 'A', teacher: 'Ms. Williams' },
    { id: 4, name: 'Life Sciences', progress: 70, grade: 'B', teacher: 'Prof. Brown' },
    { id: 5, name: 'Geography', progress: 88, grade: 'A', teacher: 'Mr. Davis' },
  ]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.category !== 'student') {
      navigate('/login');
      return;
    }
    
    setUser(parsedUser);

    // Load selected subjects from localStorage
    const savedSubjects = localStorage.getItem(`student_subjects_${parsedUser.id}`);
    if (savedSubjects) {
      const subjects = JSON.parse(savedSubjects);
      setSelectedSubjects(subjects);
      console.log('Student selected subjects:', subjects);
    }
  }, [navigate]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className={`student-dashboard-modern ${darkMode ? 'dark-mode' : ''}`}>
      {/* Sidebar */}
      <div className="sidebar-modern">
        <div className="sidebar-header-modern">
          <div className="logo">
            <span className="logo-icon">🎓</span>
            <span className="logo-text">Grade<span>12</span>Central</span>
          </div>
        </div>

        <div className="sidebar-menu-modern">
          <button 
            className="menu-item-modern active"
            onClick={() => navigate('/student-dashboard')}
          >
            <span className="menu-icon">📊</span>
            <span className="menu-text">Dashboard</span>
          </button>

          <button 
            className="menu-item-modern"
            onClick={() => navigate('/subjects')}
          >
            <span className="menu-icon">📚</span>
            <span className="menu-text">Subjects</span>
          </button>

          <button 
            className="menu-item-modern"
            onClick={() => navigate('/quizzes')}
          >
            <span className="menu-icon">📝</span>
            <span className="menu-text">Quizzes</span>
          </button>

         
        </div>

        <div className="sidebar-footer-modern">
          <div className="user-profile-modern">
            <div className="user-avatar-modern">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="user-info-modern">
              <span className="user-name-modern">{user?.firstName} {user?.lastName}</span>
              <span className="user-email-modern">{user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content-modern">
        <div className="top-bar">
          <div className="page-title-modern">Dashboard</div>
          <div className="top-bar-actions">
            <button onClick={toggleTheme} className="action-icon-btn">
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={handleLogout} className="logout-btn-modern">
              <span>Logout</span>
              <span className="logout-icon">→</span>
            </button>
          </div>
        </div>
        
        <div className="content-area">
          <div className="dashboard-content">
            {/* Welcome Section */}
            <div className="welcome-section-modern">
              <div className="welcome-text">
                <h1>Welcome, {user?.firstName}! 👋</h1>
                <p>Track your progress and continue your learning journey</p>
              </div>
              <div className="date-badge">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid-modern">
              <div className="stat-card-modern">
                <div className="stat-icon-wrapper blue">
                  <span className="stat-icon">📊</span>
                </div>
                <div className="stat-info">
                  <span className="stat-value">85%</span>
                  <span className="stat-label">Average Score</span>
                </div>
                <div className="stat-trend positive">+5.2%</div>
              </div>

              <div className="stat-card-modern">
                <div className="stat-icon-wrapper green">
                  <span className="stat-icon">📋</span>
                </div>
                <div className="stat-info">
                  <span className="stat-value">24</span>
                  <span className="stat-label">Quizzes Done</span>
                </div>
                <div className="stat-trend positive">+3</div>
              </div>

              <div className="stat-card-modern">
                <div className="stat-icon-wrapper purple">
                  <span className="stat-icon">📑</span>
                </div>
                <div className="stat-info">
                  <span className="stat-value">15</span>
                  <span className="stat-label">Papers Downloaded</span>
                </div>
                <div className="stat-trend positive">+2</div>
              </div>

              <div className="stat-card-modern">
                <div className="stat-icon-wrapper orange">
                  <span className="stat-icon">⏱️</span>
                </div>
                <div className="stat-info">
                  <span className="stat-value">12h</span>
                  <span className="stat-label">Study Time</span>
                </div>
                <div className="stat-trend positive">+2.5h</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-grid">
              <div className="quick-action-card" onClick={() => navigate('/quizzes')}>
                <div className="quick-action-icon">📝</div>
                <h3>Practice Quizzes</h3>
                <p>Test your knowledge with subject quizzes</p>
              </div>
              <div className="quick-action-card" onClick={() => navigate('/subjects')}>
                <div className="quick-action-icon">📚</div>
                <h3>My Subjects</h3>
                <p>View your enrolled subjects</p>
              </div>
             
            </div>

            {/* Subjects List */}
            <div className="subjects-panel">
              <div className="panel-header">
                <h2>Current Subjects</h2>
                <button className="view-all-btn" onClick={() => navigate('/subjects')}>View All</button>
              </div>
              <div className="subjects-list-modern">
                {subjects.slice(0, 3).map(subject => (
                  <div key={subject.id} className="subject-item-modern">
                    <div className="subject-info">
                      <h3>{subject.name}</h3>
                      <span className="subject-teacher">{subject.teacher}</span>
                    </div>
                    <div className="subject-progress-modern">
                      <div className="progress-header">
                        <span className="progress-percent">{subject.progress}%</span>
                        <span className="subject-grade">{subject.grade}</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill-modern" style={{ width: `${subject.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Subjects Summary (optional) */}
            {selectedSubjects.length > 0 && (
              <div className="activity-panel" style={{ marginTop: '1rem' }}>
                <h2>Your Selected Subjects ({selectedSubjects.length})</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                  {selectedSubjects.map(subject => (
                    <span 
                      key={subject.id}
                      style={{
                        padding: '0.4rem 1rem',
                        background: subject.bgColor || 'rgba(102, 252, 241, 0.1)',
                        color: subject.color || '#66FCF1',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      {subject.icon} {subject.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications Preview */}
            <div className="activity-panel">
              <h2>Recent Notifications ({unreadNotifications} unread)</h2>
              <div className="notifications-mini-list">
                {notifications.slice(0, 3).map(notif => (
                  <div key={notif.id} className={`notification-mini-item ${!notif.read ? 'unread' : ''}`}>
                    <div className="notification-mini-icon">
                      {notif.type === 'quiz' && '📋'}
                      {notif.type === 'grade' && '📊'}
                      {notif.type === 'session' && '👥'}
                      {notif.type === 'paper' && '📑'}
                    </div>
                    <div className="notification-mini-content">
                      <p>{notif.message}</p>
                      <span className="notification-mini-time">{notif.time}</span>
                    </div>
                    {!notif.read && <span className="notification-mini-badge"></span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;