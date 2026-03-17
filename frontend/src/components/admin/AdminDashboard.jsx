import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 1247,
    totalTutors: 89,
    totalAdmins: 5,
    activeSessions: 345,
    newUsersToday: 28,
    pendingApprovals: 12
  });

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.category !== 'admin') {
      navigate('/login');
      return;
    }
    
    setUser(parsedUser);
    
    // Fetch admin stats from backend
    fetchAdminStats();
  }, [navigate]);

  const fetchAdminStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

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
    <div className="admin-dashboard">
      {/* Navigation */}
      <nav className="admin-nav">
        <div className="nav-brand">
          <h2>📚 Grade 12 Central</h2>
          <span className="role-badge admin">Admin</span>
        </div>
        
        <div className="nav-links">
          <button className="nav-link active">Dashboard</button>
          <button className="nav-link" onClick={() => navigateTo('/admin/users')}>Users</button>
          <button className="nav-link" onClick={() => navigateTo('/admin/content')}>Content</button>
          <button className="nav-link" onClick={() => navigateTo('/admin/reports')}>Reports</button>
          <button className="nav-link" onClick={() => navigateTo('/admin/settings')}>Settings</button>
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
      <div className="admin-content">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1>Welcome back, {user.firstName}! 👋</h1>
          <p>Here's what's happening with your platform today.</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-details">
              <h3>Total Students</h3>
              <p className="stat-number">{stats.totalStudents}</p>
              <span className="stat-trend positive">+{stats.newUsersToday} today</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👨‍🏫</div>
            <div className="stat-details">
              <h3>Total Tutors</h3>
              <p className="stat-number">{stats.totalTutors}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👑</div>
            <div className="stat-details">
              <h3>Administrators</h3>
              <p className="stat-number">{stats.totalAdmins}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🟢</div>
            <div className="stat-details">
              <h3>Active Sessions</h3>
              <p className="stat-number">{stats.activeSessions}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-card" onClick={() => navigateTo('/admin/users/add')}>
              <span className="action-icon">➕</span>
              <h3>Add New User</h3>
              <p>Create student, tutor, or admin account</p>
            </button>

            <button className="action-card" onClick={() => navigateTo('/admin/content/add-paper')}>
              <span className="action-icon">📄</span>
              <h3>Upload Exam Paper</h3>
              <p>Add new past exam paper</p>
            </button>

            <button className="action-card" onClick={() => navigateTo('/admin/approvals')}>
              <span className="action-icon">✓</span>
              <h3>Pending Approvals</h3>
              <p>{stats.pendingApprovals} items awaiting review</p>
            </button>

            <button className="action-card" onClick={() => navigateTo('/admin/backup')}>
              <span className="action-icon">💾</span>
              <h3>Backup System</h3>
              <p>Create database backup</p>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-time">2 min ago</span>
              <span className="activity-text">New user registered: Thabo Mokoena (Student)</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">15 min ago</span>
              <span className="activity-text">Exam paper uploaded: Mathematics P1 2023</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">1 hour ago</span>
              <span className="activity-text">Tutor application approved: Sarah Johnson</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">3 hours ago</span>
              <span className="activity-text">System backup completed successfully</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;