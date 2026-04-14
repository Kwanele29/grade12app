import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminDashboard.css';
import AdminUsers from './AdminUsers';
import AdminSettings from './AdminSettings';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [stats, setStats] = useState({
    totalStudents: 1247,
    totalTutors: 89,
    totalAdmins: 5,
    activeSessions: 345,
    newUsersToday: 28,
    pendingApprovals: 12
  });

  useEffect(() => {
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
    fetchAdminStats();
  }, [navigate]);

  // Set active menu based on current path
  useEffect(() => {
    const path = location.pathname;
    if (path === '/admin-dashboard') {
      setActiveMenu('dashboard');
    } else if (path === '/admin/users') {
      setActiveMenu('users');
    } else if (path === '/admin/settings') {
      setActiveMenu('settings');
    }
  }, [location]);

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

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    switch(menu) {
      case 'dashboard':
        navigate('/admin-dashboard');
        break;
      case 'users':
        navigate('/admin/users');
        break;
      case 'settings':
        navigate('/admin/settings');
        break;
      default:
        break;
    }
  };

  // Function to render the main content based on the current route
  const renderMainContent = () => {
    const path = location.pathname;
    
    switch(path) {
      case '/admin/users':
        return <AdminUsers />;
      case '/admin/settings':
        return <AdminSettings />;
      default:
        return (
          <>
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
                <button className="action-card" onClick={() => handleMenuClick('users')}>
                  <span className="action-icon">➕</span>
                  <h3>Add New User</h3>
                  <p>Create student, tutor, or admin account</p>
                </button>

                <button className="action-card" onClick={() => handleMenuClick('settings')}>
                  <span className="action-icon">⚙️</span>
                  <h3>System Settings</h3>
                  <p>Configure platform preferences</p>
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
          </>
        );
    }
  };

  // Get the page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    switch(path) {
      case '/admin/users':
        return 'User Management';
      case '/admin/settings':
        return 'System Settings';
      default:
        return 'Dashboard';
    }
  };

  // Get the page subtitle based on current route
  const getPageSubtitle = () => {
    const path = location.pathname;
    switch(path) {
      case '/admin/users':
        return 'Manage students, tutors, and administrators';
      case '/admin/settings':
        return 'Configure system settings and preferences';
      default:
        return `Welcome back, ${user?.firstName}!`;
    }
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="logo-area">
            <span className="logo-icon">📚</span>
            <span className="logo-text">Grade<span>12</span>Central</span>
          </div>
          <span className="role-badge admin">Admin</span>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`sidebar-menu-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleMenuClick('dashboard')}
          >
            <span className="menu-icon">📊</span>
            <span className="menu-text">Dashboard</span>
          </button>

          <button 
            className={`sidebar-menu-item ${activeMenu === 'users' ? 'active' : ''}`}
            onClick={() => handleMenuClick('users')}
          >
            <span className="menu-icon">👥</span>
            <span className="menu-text">Users</span>
          </button>

          <button 
            className={`sidebar-menu-item ${activeMenu === 'settings' ? 'active' : ''}`}
            onClick={() => handleMenuClick('settings')}
          >
            <span className="menu-icon">⚙️</span>
            <span className="menu-text">Settings</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
            <div className="user-details">
              <span className="user-name">{user.firstName} {user.lastName}</span>
              <span className="user-role">Administrator</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <span className="logout-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Top Bar */}
        <div className="top-bar">
          <div className="page-title">
            <h1>{getPageTitle()}</h1>
            <p>{getPageSubtitle()}</p>
          </div>
          <div className="top-bar-actions">
            <div className="date-badge">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="admin-content">
          {renderMainContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;