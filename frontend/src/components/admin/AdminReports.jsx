import React, { useState, useEffect } from 'react';
import './AdminReports.css';

const AdminReports = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('week');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
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
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from user data
  const getTotalUsers = () => users.length;
  
  const getStudentsCount = () => users.filter(u => u.category === 'student').length;
  
  const getTutorsCount = () => users.filter(u => u.category === 'tutor').length;
  
  const getAdminsCount = () => users.filter(u => u.category === 'admin').length;
  
  const getNewUsersByPeriod = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return {
      today: users.filter(u => {
        if (!u.createdAt) return false;
        const created = new Date(u.createdAt);
        return created.toDateString() === today.toDateString();
      }).length,
      thisWeek: users.filter(u => {
        if (!u.createdAt) return false;
        const created = new Date(u.createdAt);
        return created >= weekAgo;
      }).length,
      thisMonth: users.filter(u => {
        if (!u.createdAt) return false;
        const created = new Date(u.createdAt);
        return created >= monthAgo;
      }).length
    };
  };

  const getUserGrowthByDay = (days = 7) => {
    const growth = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const count = users.filter(user => {
        if (!user.createdAt) return false;
        const created = new Date(user.createdAt);
        created.setHours(0, 0, 0, 0);
        return created.getTime() === date.getTime();
      }).length;
      
      growth.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: count
      });
    }
    return growth;
  };

  const getUserGrowthByMonth = () => {
    const months = {};
    users.forEach(user => {
      if (user.createdAt) {
        const date = new Date(user.createdAt);
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        const label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!months[key]) {
          months[key] = { label, count: 0 };
        }
        months[key].count++;
      }
    });
    return Object.values(months);
  };

  const getCategoryDistribution = () => {
    return [
      { name: 'Students', count: getStudentsCount(), percentage: (getStudentsCount() / getTotalUsers() * 100).toFixed(1), color: '#66FCF1' },
      { name: 'Tutors', count: getTutorsCount(), percentage: (getTutorsCount() / getTotalUsers() * 100).toFixed(1), color: '#45A29E' },
      { name: 'Admins', count: getAdminsCount(), percentage: (getAdminsCount() / getTotalUsers() * 100).toFixed(1), color: '#f56565' }
    ];
  };

  const getRecentUsers = (limit = 10) => {
    return [...users]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  };

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalUsers: getTotalUsers(),
        students: getStudentsCount(),
        tutors: getTutorsCount(),
        admins: getAdminsCount(),
        newUsers: getNewUsersByPeriod()
      },
      users: users.map(u => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        category: u.category,
        joined: u.createdAt
      }))
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `user_report_${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return <div className="loading-reports">Loading report data...</div>;
  }

  return (
    <div className="admin-reports">
      {/* Header */}
      <div className="reports-header">
        <div>
          <h1>User Analytics Reports</h1>
          <p>View insights and statistics about your platform users</p>
        </div>
        <button onClick={exportReport} className="export-btn">
          📊 Export Report (JSON)
        </button>
      </div>

      {/* Report Type Tabs */}
      <div className="report-tabs">
        <button 
          className={`report-tab ${reportType === 'overview' ? 'active' : ''}`}
          onClick={() => setReportType('overview')}
        >
          📈 Overview
        </button>
        <button 
          className={`report-tab ${reportType === 'growth' ? 'active' : ''}`}
          onClick={() => setReportType('growth')}
        >
          📊 User Growth
        </button>
        <button 
          className={`report-tab ${reportType === 'users' ? 'active' : ''}`}
          onClick={() => setReportType('users')}
        >
          👥 User List
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="date-range-filter">
        <label>Time Period:</label>
        <div className="range-buttons">
          <button 
            className={`range-btn ${dateRange === 'week' ? 'active' : ''}`}
            onClick={() => setDateRange('week')}
          >
            Last 7 Days
          </button>
          <button 
            className={`range-btn ${dateRange === 'month' ? 'active' : ''}`}
            onClick={() => setDateRange('month')}
          >
            Last 30 Days
          </button>
          <button 
            className={`range-btn ${dateRange === 'all' ? 'active' : ''}`}
            onClick={() => setDateRange('all')}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Overview Report */}
      {reportType === 'overview' && (
        <div className="reports-content">
          {/* Key Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">👥</div>
              <div className="metric-info">
                <h4>Total Users</h4>
                <p className="metric-value">{getTotalUsers()}</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">👨‍🎓</div>
              <div className="metric-info">
                <h4>Students</h4>
                <p className="metric-value">{getStudentsCount()}</p>
                <span className="metric-percent">{((getStudentsCount() / getTotalUsers()) * 100).toFixed(1)}% of total</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">👨‍🏫</div>
              <div className="metric-info">
                <h4>Tutors</h4>
                <p className="metric-value">{getTutorsCount()}</p>
                <span className="metric-percent">{((getTutorsCount() / getTotalUsers()) * 100).toFixed(1)}% of total</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">👑</div>
              <div className="metric-info">
                <h4>Admins</h4>
                <p className="metric-value">{getAdminsCount()}</p>
                <span className="metric-percent">{((getAdminsCount() / getTotalUsers()) * 100).toFixed(1)}% of total</span>
              </div>
            </div>
          </div>

          {/* New Users Stats */}
          <div className="report-section">
            <h3>🆕 New Users</h3>
            <div className="new-users-stats">
              <div className="stat-box">
                <div className="stat-number">{getNewUsersByPeriod().today}</div>
                <div className="stat-label">Today</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">{getNewUsersByPeriod().thisWeek}</div>
                <div className="stat-label">This Week</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">{getNewUsersByPeriod().thisMonth}</div>
                <div className="stat-label">This Month</div>
              </div>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="report-section">
            <h3>📊 User Distribution</h3>
            <div className="distribution-chart">
              {getCategoryDistribution().map((cat, index) => (
                <div key={index} className="distribution-item">
                  <div className="distribution-header">
                    <span className="distribution-name">{cat.name}</span>
                    <span className="distribution-count">{cat.count} users ({cat.percentage}%)</span>
                  </div>
                  <div className="distribution-bar-container">
                    <div 
                      className="distribution-bar" 
                      style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Users */}
          <div className="report-section">
            <h3>📝 Recent Registrations</h3>
            <div className="recent-users-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Category</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {getRecentUsers(5).map(user => (
                    <tr key={user.id}>
                      <td>{user.firstName} {user.lastName}</td>
                      <td>{user.email}</td>
                      <td><span className={`category-badge ${user.category}`}>{user.category}</span></td>
                      <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Growth Report */}
      {reportType === 'growth' && (
        <div className="reports-content">
          {/* Daily Growth Chart */}
          <div className="report-section">
            <h3>📈 User Growth (Last 7 Days)</h3>
            <div className="growth-chart">
              {getUserGrowthByDay(7).map((day, index) => (
                <div key={index} className="chart-bar-container">
                  <div className="chart-bar" style={{ height: `${Math.min(day.count * 20, 100)}%` }}>
                    {day.count > 0 && <span className="bar-value">{day.count}</span>}
                  </div>
                  <div className="chart-label">{day.date}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Growth */}
          <div className="report-section">
            <h3>📅 Monthly Growth</h3>
            <div className="monthly-growth">
              {getUserGrowthByMonth().map((month, index) => (
                <div key={index} className="month-item">
                  <div className="month-name">{month.label}</div>
                  <div className="month-bar-container">
                    <div className="month-bar" style={{ width: `${Math.min(month.count * 5, 100)}%` }}>
                      <span>{month.count} new users</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Growth Summary */}
          <div className="report-section">
            <h3>📊 Growth Summary</h3>
            <div className="growth-summary">
              <div className="summary-item">
                <div className="summary-label">Total Users</div>
                <div className="summary-value">{getTotalUsers()}</div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Average Daily (Last 7 days)</div>
                <div className="summary-value">{(getUserGrowthByDay(7).reduce((sum, d) => sum + d.count, 0) / 7).toFixed(1)}</div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Fastest Growing Category</div>
                <div className="summary-value">
                  {getStudentsCount() > getTutorsCount() ? 'Students' : 'Tutors'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User List Report */}
      {reportType === 'users' && (
        <div className="reports-content">
          <div className="report-section full-width">
            <h3>👥 All Users</h3>
            <div className="users-table-container">
              <table className="users-report-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Category</th>
                    <th>Join Date</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.firstName} {user.lastName}</td>
                      <td>{user.email}</td>
                      <td><span className={`category-badge ${user.category}`}>{user.category}</span></td>
                      <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;