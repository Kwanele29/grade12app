import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminDashboard.css';
import AdminUsers from './AdminUsers';
import AdminReports from './AdminReports';
import AdminSettings from './AdminSettings';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [allUsers, setAllUsers] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTutors: 0,
    totalAdmins: 0,
    activeSessions: 345,
    newUsersToday: 0,
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
    fetchAllUsers();
    fetchAdminStats();
  }, [navigate]);

  // Set active menu based on current path
  useEffect(() => {
    const path = location.pathname;
    if (path === '/admin-dashboard') {
      setActiveMenu('dashboard');
    } else if (path === '/admin/users') {
      setActiveMenu('users');
    } else if (path === '/admin/reports') {
      setActiveMenu('reports');
    } else if (path === '/admin/settings') {
      setActiveMenu('settings');
    }
  }, [location]);

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const usersData = Array.isArray(data) ? data : (data.users || data.data || []);
        setAllUsers(usersData);
        
        const students = usersData.filter(u => u.category === 'student').length;
        const tutors = usersData.filter(u => u.category === 'tutor').length;
        const admins = usersData.filter(u => u.category === 'admin').length;
        
        const today = new Date();
        const newToday = usersData.filter(user => {
          if (!user.createdAt) return false;
          const createdDate = new Date(user.createdAt);
          return createdDate.toDateString() === today.toDateString();
        }).length;
        
        setStats(prev => ({
          ...prev,
          totalStudents: students,
          totalTutors: tutors,
          totalAdmins: admins,
          newUsersToday: newToday
        }));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

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
        setStats(prev => ({ ...prev, ...data }));
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
      case 'reports':
        navigate('/admin/reports');
        break;
      case 'settings':
        navigate('/admin/settings');
        break;
      default:
        break;
    }
  };

  // Get recent users (last 5)
  const getRecentUsers = () => {
    return [...allUsers]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  };

  // Function to render the main content based on the current route
  const renderMainContent = () => {
    const path = location.pathname;
    
    switch(path) {
      case '/admin/users':
        return <AdminUsers />;
      case '/admin/reports':
        return <AdminReports />;
      case '/admin/settings':
        return <AdminSettings />;
      default:
        return (
          <>
            {/* Welcome Banner */}
            <div className="welcome-banner">
              <div className="welcome-text">
                <h2>Welcome back, {user?.firstName}! 👋</h2>
                <p>Here's what's happening with your platform today.</p>
              </div>
              <div className="stats-date">
                📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card clickable" onClick={() => handleMenuClick('users')}>
                <div className="stat-icon">👨‍🎓</div>
                <div className="stat-details">
                  <h3>Total Students</h3>
                  <p className="stat-number">{stats.totalStudents}</p>
                  <span className="stat-trend">From database</span>
                </div>
              </div>

              <div className="stat-card clickable" onClick={() => handleMenuClick('users')}>
                <div className="stat-icon">👨‍🏫</div>
                <div className="stat-details">
                  <h3>Total Tutors</h3>
                  <p className="stat-number">{stats.totalTutors}</p>
                  <span className="stat-trend">From database</span>
                </div>
              </div>

              <div className="stat-card clickable" onClick={() => handleMenuClick('users')}>
                <div className="stat-icon">👑</div>
                <div className="stat-details">
                  <h3>Administrators</h3>
                  <p className="stat-number">{stats.totalAdmins}</p>
                  <span className="stat-trend">From database</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-details">
                  <h3>Total Users</h3>
                  <p className="stat-number">{allUsers.length}</p>
                  <span className="stat-trend positive">+{stats.newUsersToday} today</span>
                </div>
              </div>
            </div>

            {/* Recent Users Section */}
            <div className="recent-users-card">
              <div className="card-header">
                <h3>🆕 Recently Joined Users</h3>
                <button className="view-all-link" onClick={() => handleMenuClick('users')}>
                  View All →
                </button>
              </div>
              <div className="recent-users-list">
                {getRecentUsers().length > 0 ? (
                  getRecentUsers().map(user => (
                    <div key={user.id} className="recent-user-item">
                      <div className="user-avatar-small">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <div className="user-details">
                        <div className="user-name">{user.firstName} {user.lastName}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                      <div className={`user-category category-${user.category}`}>
                        {user.category === 'student' && '👨‍🎓'}
                        {user.category === 'tutor' && '👨‍🏫'}
                        {user.category === 'admin' && '👑'}
                        {user.category}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No users found in database</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-section">
              <h3>⚡ Quick Actions</h3>
              <div className="actions-grid">
                <button className="action-card" onClick={() => handleMenuClick('users')}>
                  <span className="action-icon">➕</span>
                  <h4>Add New User</h4>
                  <p>Create student, tutor, or admin account</p>
                </button>

                <button className="action-card" onClick={() => handleMenuClick('users')}>
                  <span className="action-icon">👥</span>
                  <h4>Manage Users</h4>
                  <p>View, edit, or remove user accounts</p>
                </button>

                <button className="action-card" onClick={() => handleMenuClick('reports')}>
                  <span className="action-icon">📊</span>
                  <h4>View Reports</h4>
                  <p>Access user analytics and insights</p>
                </button>

                <button className="action-card" onClick={() => handleMenuClick('settings')}>
                  <span className="action-icon">⚙️</span>
                  <h4>System Settings</h4>
                  <p>Configure platform preferences</p>
                </button>
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
      case '/admin/reports':
        return 'Reports & Analytics';
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
      case '/admin/reports':
        return 'View user analytics, growth trends, and insights';
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
            className={`sidebar-menu-item ${activeMenu === 'reports' ? 'active' : ''}`}
            onClick={() => handleMenuClick('reports')}
          >
            <span className="menu-icon">📈</span>
            <span className="menu-text">Reports</span>
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