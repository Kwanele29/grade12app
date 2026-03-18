import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TutorDashboard.css';

const TutorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.category !== 'tutor') {
        navigate('/login');
        return;
      }
      
      setUser(parsedUser);
      
      // Load selected subjects from localStorage
      const savedSubjects = localStorage.getItem(`tutor_subjects_${parsedUser.id}`);
      if (savedSubjects) {
        const subjects = JSON.parse(savedSubjects);
        setSelectedSubjects(subjects);
        loadTutorData(parsedUser.id, subjects);
      }
      
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const loadTutorData = (tutorId, subjects) => {
    // Filter students based on selected subjects
    const allStudents = [
      { id: 1, name: 'Thabo Mokoena', subject: 'Mathematics', progress: 75, lastActive: '2 hours ago', avatar: 'TM', email: 'thabo.m@student.com' },
      { id: 2, name: 'Lerato Ndlovu', subject: 'Physical Science', progress: 82, lastActive: '1 day ago', avatar: 'LN', email: 'lerato.n@student.com' },
      { id: 3, name: 'Sipho Dlamini', subject: 'Mathematics', progress: 68, lastActive: '3 hours ago', avatar: 'SD', email: 'sipho.d@student.com' },
      { id: 4, name: 'Nomsa Zwane', subject: 'English', progress: 90, lastActive: '5 hours ago', avatar: 'NZ', email: 'nomsa.z@student.com' },
      { id: 5, name: 'Zanele Khumalo', subject: 'Mathematical Literacy', progress: 71, lastActive: '1 day ago', avatar: 'ZK', email: 'zanele.k@student.com' },
      { id: 6, name: 'Kagiso Moeketsi', subject: 'Life Sciences', progress: 88, lastActive: '4 hours ago', avatar: 'KM', email: 'kagiso.m@student.com' },
      { id: 7, name: 'Priya Patel', subject: 'Tourism', progress: 79, lastActive: '2 days ago', avatar: 'PP', email: 'priya.p@student.com' },
      { id: 8, name: 'Michael van der Merwe', subject: 'Geography', progress: 84, lastActive: '6 hours ago', avatar: 'MV', email: 'michael.v@student.com' },
    ];

    const filteredStudents = allStudents.filter(student => 
      subjects.some(s => s.name === student.subject)
    );
    setStudents(filteredStudents);

    // Generate schedule based on selected subjects
    const todaySchedule = [
      { id: 1, time: '09:00 - 10:30', subject: subjects[0]?.name || 'Mathematics', type: 'Group Session', students: '8 students', color: subjects[0]?.color || '#3b82f6' },
      { id: 2, time: '11:00 - 12:30', subject: subjects[1]?.name || 'Physical Science', type: '1-on-1', students: 'Lerato Ndlovu', color: subjects[1]?.color || '#10b981' },
      { id: 3, time: '14:00 - 15:30', subject: subjects[2]?.name || 'English', type: 'Essay Review', students: '5 students', color: subjects[2]?.color || '#f59e0b' },
    ].filter(item => item.subject);
    setSchedule(todaySchedule);
  };

  const handleLogout = () => {
    // Clear all user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    if (user) {
      localStorage.removeItem(`tutor_subjects_${user.id}`);
    }
    // Navigate to home page
    navigate('/');
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const navigateTo = (path) => {
    navigate(path);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="tutor-dashboard-pro">
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <div className="logout-modal-icon">🚪</div>
            <h3>Sign Out</h3>
            <p>Are you sure you want to sign out?</p>
            <div className="logout-modal-actions">
              <button className="logout-modal-cancel" onClick={cancelLogout}>
                Cancel
              </button>
              <button className="logout-modal-confirm" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo-area">
            <span className="logo-icon">📚</span>
            <span className="logo-text">Grade<span>12</span>Central</span>
          </div>
          <span className="role-indicator tutor">Tutor</span>
        </div>

        <div className="header-right">
          <div className="subject-indicators">
            {selectedSubjects.map(subject => (
              <span 
                key={subject.id} 
                className="subject-indicator"
                style={{ backgroundColor: subject.bgColor, color: subject.color }}
              >
                {subject.icon} {subject.name}
              </span>
            ))}
          </div>

          <div className="user-menu">
            <div className="user-avatar" style={{ backgroundColor: selectedSubjects[0]?.color || '#48bb78' }}>
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="user-details">
              <span className="user-fullname">{user.firstName} {user.lastName}</span>
              <span className="user-role">Tutor</span>
            </div>
            
            {/* Sign Out Button - Enhanced */}
            <button 
              onClick={confirmLogout} 
              className="signout-button-enhanced" 
              title="Sign Out"
            >
              <span className="signout-icon">🚪</span>
              <span className="signout-text">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Welcome Banner */}
        <div className="welcome-banner">
          <div className="banner-content">
            <h1>Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, {user.firstName}! 👋</h1>
            <p>Here's what's happening with your {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} today.</p>
          </div>
          <div className="banner-stats">
            <div className="banner-stat">
              <span className="stat-number">{students.length}</span>
              <span className="stat-label">Active Students</span>
            </div>
            <div className="banner-stat">
              <span className="stat-number">12</span>
              <span className="stat-label">Quizzes</span>
            </div>
            <div className="banner-stat">
              <span className="stat-number">85%</span>
              <span className="stat-label">Avg. Score</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            My Students
          </button>
          <button 
            className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            Schedule
          </button>
          <button 
            className={`tab-button ${activeTab === 'materials' ? 'active' : ''}`}
            onClick={() => navigateTo('/tutor/materials')}
          >
            Materials
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <>
              {/* Schedule Preview */}
              <section className="content-section">
                <div className="section-header">
                  <h2>Today's Schedule</h2>
                  <button className="view-link" onClick={() => setActiveTab('schedule')}>View Full Schedule →</button>
                </div>
                <div className="schedule-grid">
                  {schedule.map(item => (
                    <div key={item.id} className="schedule-card" style={{ borderLeftColor: item.color }}>
                      <div className="schedule-card-time">{item.time}</div>
                      <div className="schedule-card-content">
                        <h3>{item.subject}</h3>
                        <p>{item.type} • {item.students}</p>
                      </div>
                      <button className="schedule-card-action" style={{ backgroundColor: item.color }}>
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Students Preview */}
              <section className="content-section">
                <div className="section-header">
                  <h2>Recent Students</h2>
                  <button className="view-link" onClick={() => setActiveTab('students')}>View All →</button>
                </div>
                <div className="students-grid">
                  {students.slice(0, 4).map(student => {
                    const subject = selectedSubjects.find(s => s.name === student.subject);
                    return (
                      <div key={student.id} className="student-card">
                        <div className="student-card-avatar" style={{ backgroundColor: subject?.bgColor || '#f0fdf4' }}>
                          <span style={{ color: subject?.color || '#48bb78' }}>{student.avatar}</span>
                        </div>
                        <div className="student-card-info">
                          <h4>{student.name}</h4>
                          <p>{student.subject}</p>
                          <div className="progress-indicator">
                            <div className="progress-bar-bg">
                              <div className="progress-bar-fill" style={{ width: `${student.progress}%`, backgroundColor: subject?.color || '#48bb78' }}></div>
                            </div>
                            <span className="progress-text">{student.progress}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Quick Actions */}
              <section className="content-section">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
                  <button className="action-card" onClick={() => navigateTo('/tutor/create-quiz')}>
                    <div className="action-icon-wrapper" style={{ backgroundColor: selectedSubjects[0]?.bgColor || '#f0fdf4' }}>
                      <span style={{ color: selectedSubjects[0]?.color || '#48bb78' }}>📝</span>
                    </div>
                    <h3>Create Quiz</h3>
                    <p>Design practice questions</p>
                  </button>

                  <button className="action-card" onClick={() => navigateTo('/tutor/upload-material')}>
                    <div className="action-icon-wrapper" style={{ backgroundColor: selectedSubjects[1]?.bgColor || '#f0fdf4' }}>
                      <span style={{ color: selectedSubjects[1]?.color || '#48bb78' }}>📄</span>
                    </div>
                    <h3>Upload Material</h3>
                    <p>Share study guides</p>
                  </button>

                  <button className="action-card" onClick={() => navigateTo('/tutor/schedule-session')}>
                    <div className="action-icon-wrapper" style={{ backgroundColor: selectedSubjects[2]?.bgColor || '#f0fdf4' }}>
                      <span style={{ color: selectedSubjects[2]?.color || '#48bb78' }}>📅</span>
                    </div>
                    <h3>Schedule Session</h3>
                    <p>Plan tutoring sessions</p>
                  </button>

                  <button className="action-card" onClick={() => navigateTo('/tutor/feedback')}>
                    <div className="action-icon-wrapper" style={{ backgroundColor: selectedSubjects[0]?.bgColor || '#f0fdf4' }}>
                      <span style={{ color: selectedSubjects[0]?.color || '#48bb78' }}>💬</span>
                    </div>
                    <h3>Feedback</h3>
                    <p>Review responses</p>
                  </button>
                </div>
              </section>
            </>
          )}

          {activeTab === 'students' && (
            <section className="content-section full-width">
              <h2>My Students</h2>
              <div className="students-table-container">
                <table className="students-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Subject</th>
                      <th>Progress</th>
                      <th>Last Active</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => {
                      const subject = selectedSubjects.find(s => s.name === student.subject);
                      return (
                        <tr key={student.id}>
                          <td>
                            <div className="student-info-cell">
                              <div className="student-avatar-small" style={{ backgroundColor: subject?.bgColor || '#f0fdf4', color: subject?.color || '#48bb78' }}>
                                {student.avatar}
                              </div>
                              <div>
                                <div className="student-name">{student.name}</div>
                                <div className="student-email">{student.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="subject-tag-small" style={{ backgroundColor: subject?.bgColor || '#f0fdf4', color: subject?.color || '#48bb78' }}>
                              {subject?.icon} {student.subject}
                            </span>
                          </td>
                          <td>
                            <div className="progress-cell">
                              <div className="progress-bar-small">
                                <div className="progress-fill-small" style={{ width: `${student.progress}%`, backgroundColor: subject?.color || '#48bb78' }}></div>
                              </div>
                              <span className="progress-value">{student.progress}%</span>
                            </div>
                          </td>
                          <td>{student.lastActive}</td>
                          <td>
                            <button className="table-action-btn" style={{ color: subject?.color || '#48bb78', borderColor: subject?.color || '#48bb78' }}>
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default TutorDashboard;