import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminReports.css';

const AdminReports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('week');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTutors: 0,
    totalAdmins: 0,
    totalContent: 0,
    newUsersToday: 0,
    activeSessions: 0,
  });
  const [userDistribution, setUserDistribution] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [popularContent, setPopularContent] = useState([]);
  const [subjectStats, setSubjectStats] = useState([]);
  const [weeklyUploads, setWeeklyUploads] = useState([]);
  const [quizScores, setQuizScores] = useState([]);
  const [progressDistribution, setProgressDistribution] = useState([]);
  const [trendData, setTrendData] = useState({ students: [], tutors: [] });
  const [error, setError] = useState('');

  // Main fetch function – unchanged
  const fetchAllReportData = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchOverviewData = async (token) => {
      try {
        const [userDistRes, activityRes, topPerformersRes] = await Promise.all([
          fetch(`http://localhost:8080/api/admin/reports/user-distribution?range=${dateRange}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).catch(() => ({ ok: false })),
          fetch(`http://localhost:8080/api/admin/reports/activity?range=${dateRange}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).catch(() => ({ ok: false })),
          fetch(`http://localhost:8080/api/admin/reports/top-performers`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).catch(() => ({ ok: false })),
        ]);

        if (userDistRes.ok) setUserDistribution(await userDistRes.json());
        else setUserDistribution([
          { category: 'Students', count: 1247, percent: 70 },
          { category: 'Tutors', count: 89, percent: 20 },
          { category: 'Admins', count: 5, percent: 10 }
        ]);

        if (activityRes.ok) setActivityData(await activityRes.json());
        else setActivityData([
          { day: 'Mon', value: 45 }, { day: 'Tue', value: 62 }, { day: 'Wed', value: 78 },
          { day: 'Thu', value: 53 }, { day: 'Fri', value: 89 }, { day: 'Sat', value: 34 }, { day: 'Sun', value: 27 }
        ]);

        if (topPerformersRes.ok) setTopPerformers(await topPerformersRes.json());
        else setTopPerformers([
          { id: 1, name: 'Thabo Mokoena', category: 'student', score: 98 },
          { id: 2, name: 'Sarah Johnson', category: 'tutor', score: 96 },
          { id: 3, name: 'Lerato Ndlovu', category: 'student', score: 95 },
          { id: 4, name: 'Mike Smith', category: 'admin', score: 94 }
        ]);
      } catch (err) { console.error(err); }
    };

    const fetchUserAnalytics = async (token) => {
      try {
        const [trendRes, progressRes] = await Promise.all([
          fetch(`http://localhost:8080/api/admin/reports/user-trend?range=${dateRange}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).catch(() => ({ ok: false })),
          fetch(`http://localhost:8080/api/admin/reports/progress-distribution`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).catch(() => ({ ok: false })),
        ]);
        if (trendRes.ok) setTrendData(await trendRes.json());
        else setTrendData({
          students: [120, 135, 148, 162, 175, 190, 210],
          tutors: [45, 48, 52, 56, 61, 68, 75]
        });
        if (progressRes.ok) setProgressDistribution(await progressRes.json());
        else setProgressDistribution([
          { range: '0-20%', count: 45 }, { range: '21-40%', count: 78 },
          { range: '41-60%', count: 112 }, { range: '61-80%', count: 156 },
          { range: '81-100%', count: 98 }
        ]);
      } catch (err) { console.error(err); }
    };

    const fetchContentAnalytics = async (token) => {
      try {
        const [popularRes, weeklyRes, subjectRes] = await Promise.all([
          fetch(`http://localhost:8080/api/admin/reports/popular-content`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).catch(() => ({ ok: false })),
          fetch(`http://localhost:8080/api/admin/reports/weekly-uploads?range=${dateRange}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).catch(() => ({ ok: false })),
          fetch(`http://localhost:8080/api/admin/reports/subject-stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).catch(() => ({ ok: false })),
        ]);
        if (popularRes.ok) setPopularContent(await popularRes.json());
        else setPopularContent([
          { id: 1, title: 'Algebra Fundamentals', type: 'quiz', views: 2345 },
          { id: 2, title: 'Physics Notes', type: 'material', views: 1890 },
          { id: 3, title: 'English Grammar', type: 'quiz', views: 1567 }
        ]);
        if (weeklyRes.ok) setWeeklyUploads(await weeklyRes.json());
        else setWeeklyUploads([
          { week: 'Week 1', materials: 12, quizzes: 8 },
          { week: 'Week 2', materials: 15, quizzes: 10 },
          { week: 'Week 3', materials: 10, quizzes: 6 },
          { week: 'Week 4', materials: 18, quizzes: 12 }
        ]);
        if (subjectRes.ok) setSubjectStats(await subjectRes.json());
        else setSubjectStats([
          { name: 'Mathematics', count: 45, percentage: 35 },
          { name: 'Physics', count: 28, percentage: 22 },
          { name: 'English', count: 32, percentage: 25 },
          { name: 'Chemistry', count: 18, percentage: 14 },
          { name: 'Biology', count: 12, percentage: 9 }
        ]);
      } catch (err) { console.error(err); }
    };

    const fetchAcademicAnalytics = async (token) => {
      try {
        const [quizRes, subjectScoreRes] = await Promise.all([
          fetch(`http://localhost:8080/api/admin/reports/quiz-performance`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).catch(() => ({ ok: false })),
          fetch(`http://localhost:8080/api/admin/reports/subject-scores`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).catch(() => ({ ok: false })),
        ]);
        if (quizRes.ok) setQuizScores(await quizRes.json());
        else setQuizScores([
          { title: 'Algebra Quiz', avgScore: 78, completionRate: 92 },
          { title: 'Physics Midterm', avgScore: 65, completionRate: 88 },
          { title: 'Essay Writing', avgScore: 82, completionRate: 95 }
        ]);
        if (subjectScoreRes.ok) setSubjectStats(await subjectScoreRes.json());
        else setSubjectStats([
          { name: 'Mathematics', score: 72, totalStudents: 156 },
          { name: 'Physics', score: 68, totalStudents: 98 },
          { name: 'English', score: 79, totalStudents: 142 },
          { name: 'Chemistry', score: 71, totalStudents: 76 }
        ]);
      } catch (err) { console.error(err); }
    };

    const setFallbackData = () => {
      setUserDistribution([
        { category: 'Students', count: 1247, percent: 70 },
        { category: 'Tutors', count: 89, percent: 20 },
        { category: 'Admins', count: 5, percent: 10 }
      ]);
      setActivityData([
        { day: 'Mon', value: 45 }, { day: 'Tue', value: 62 }, { day: 'Wed', value: 78 },
        { day: 'Thu', value: 53 }, { day: 'Fri', value: 89 }, { day: 'Sat', value: 34 }, { day: 'Sun', value: 27 }
      ]);
      setTopPerformers([
        { id: 1, name: 'Thabo Mokoena', category: 'student', score: 98 },
        { id: 2, name: 'Sarah Johnson', category: 'tutor', score: 96 }
      ]);
      setTrendData({ students: [120, 135, 148, 162, 175, 190, 210], tutors: [45, 48, 52, 56, 61, 68, 75] });
      setProgressDistribution([
        { range: '0-20%', count: 45 }, { range: '21-40%', count: 78 }, { range: '41-60%', count: 112 },
        { range: '61-80%', count: 156 }, { range: '81-100%', count: 98 }
      ]);
      setPopularContent([
        { id: 1, title: 'Algebra Fundamentals', type: 'quiz', views: 2345 },
        { id: 2, title: 'Physics Notes', type: 'material', views: 1890 }
      ]);
      setWeeklyUploads([
        { week: 'Week 1', materials: 12, quizzes: 8 },
        { week: 'Week 2', materials: 15, quizzes: 10 }
      ]);
      setSubjectStats([
        { name: 'Mathematics', count: 45, percentage: 35, score: 72 },
        { name: 'Physics', count: 28, percentage: 22, score: 68 }
      ]);
      setQuizScores([
        { title: 'Algebra Quiz', avgScore: 78, completionRate: 92 }
      ]);
    };

    try {
      const statsRes = await fetch('http://localhost:8080/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(prev => ({ ...prev, ...statsData }));
      }

      if (activeTab === 'overview') {
        await fetchOverviewData(token);
      } else if (activeTab === 'users') {
        await fetchUserAnalytics(token);
      } else if (activeTab === 'content') {
        await fetchContentAnalytics(token);
      } else if (activeTab === 'academic') {
        await fetchAcademicAnalytics(token);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports. Please try again later.');
      setFallbackData();
    } finally {
      setLoading(false);
    }
  }, [activeTab, dateRange]);

  useEffect(() => {
    fetchAllReportData();
  }, [fetchAllReportData]);

  const handleExport = () => {
    alert('Export functionality will be implemented soon.');
  };

  if (loading) {
    return <div className="loading-reports">Loading reports...</div>;
  }

  return (
    <div className="admin-reports">
      {/* Back Button */}
      <div className="settings-back-btn">
        <button onClick={() => navigate('/admin-dashboard')} className="back-btn">
          ← Back to Dashboard
        </button>
      </div>

      {/* Header */}
      <div className="reports-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Comprehensive insights into platform performance</p>
        </div>
        <button className="export-btn" onClick={handleExport}>
          📊 Export Report
        </button>
      </div>

      {/* Tabs */}
      <div className="report-tabs">
        <button className={`report-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <span className="tab-icon">📈</span> Overview
        </button>
        <button className={`report-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          <span className="tab-icon">👥</span> User Analytics
        </button>
        <button className={`report-tab ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}>
          <span className="tab-icon">📚</span> Content
        </button>
        <button className={`report-tab ${activeTab === 'academic' ? 'active' : ''}`} onClick={() => setActiveTab('academic')}>
          <span className="tab-icon">🎓</span> Academic
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="date-range-filter">
        <label>Time Range:</label>
        <div className="range-buttons">
          <button className={`range-btn ${dateRange === 'week' ? 'active' : ''}`} onClick={() => setDateRange('week')}>This Week</button>
          <button className={`range-btn ${dateRange === 'month' ? 'active' : ''}`} onClick={() => setDateRange('month')}>This Month</button>
          <button className={`range-btn ${dateRange === 'year' ? 'active' : ''}`} onClick={() => setDateRange('year')}>This Year</button>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="error-message" style={{ background: 'rgba(245,101,101,0.2)', color: '#f56565', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

      <div className="reports-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">👥</div>
                <div className="metric-info">
                  <h4>Total Users</h4>
                  <div className="metric-value">{stats.totalUsers || (stats.totalStudents + stats.totalTutors + stats.totalAdmins)}</div>
                  <div className="metric-change positive">+{stats.newUsersToday || 0} today</div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">👨‍🎓</div>
                <div className="metric-info">
                  <h4>Students</h4>
                  <div className="metric-value">{stats.totalStudents || 0}</div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">👨‍🏫</div>
                <div className="metric-info">
                  <h4>Tutors</h4>
                  <div className="metric-value">{stats.totalTutors || 0}</div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">📄</div>
                <div className="metric-info">
                  <h4>Content Items</h4>
                  <div className="metric-value">{stats.totalContent || 0}</div>
                </div>
              </div>
            </div>

            <div className="report-section">
              <h3>User Distribution</h3>
              <div className="distribution-grid">
                {userDistribution.map((item, idx) => (
                  <div key={idx} className="distribution-card">
                    <div className="dist-value">{item.count}</div>
                    <div className="dist-label">{item.category}</div>
                    <div className="dist-bar"><div className="bar-fill" style={{ width: `${item.percent}%` }}></div></div>
                    <div className="dist-percent">{item.percent}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="report-section">
              <h3>Daily Active Users</h3>
              <div className="activity-chart">
                {activityData.map((item, idx) => (
                  <div key={idx} className="chart-bar-container">
                    {/* NEW ORDER: Bar first, then label below */}
                    <div className="chart-bar-wrapper">
                      <div className="chart-bar" style={{ height: `${Math.min(200, (item.value / 100) * 200)}px` }}>
                        <span className="bar-value">{item.value}</span>
                      </div>
                    </div>
                    <div className="chart-label">{item.day}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="report-section">
              <h3>🏆 Top Performers</h3>
              <div className="performers-list">
                {topPerformers.map((p, idx) => (
                  <div key={p.id} className="performer-card">
                    <div className="performer-rank">#{idx+1}</div>
                    <div className="performer-info">
                      <div className="performer-name">{p.name}</div>
                      <div className="performer-category">{p.category}</div>
                    </div>
                    <div className="performer-score">
                      <div className="score-value">{p.score}%</div>
                      <div className="score-label">Engagement</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* User Analytics Tab */}
        {activeTab === 'users' && (
          <>
            <div className="report-section">
              <h3>User Growth Trend</h3>
              <div className="trend-chart">
                <div className="trend-group">
                  <div className="trend-month">Students</div>
                  <div className="trend-bars">
                    {trendData.students?.map((value, idx) => (
                      <div key={idx} className="trend-bar students" style={{ height: `${Math.min(200, (value / 300) * 200)}px` }}>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="trend-group">
                  <div className="trend-month">Tutors</div>
                  <div className="trend-bars">
                    {trendData.tutors?.map((value, idx) => (
                      <div key={idx} className="trend-bar tutors" style={{ height: `${Math.min(200, (value / 100) * 200)}px` }}>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="trend-legend">
                <div><span className="legend-color students"></span> Students</div>
                <div><span className="legend-color tutors"></span> Tutors</div>
              </div>
            </div>

            <div className="report-section">
              <h3>Student Progress Distribution</h3>
              <div className="progress-distribution">
                {progressDistribution.map((item, idx) => (
                  <div key={idx} className="progress-item">
                    <div className="progress-range">{item.range}</div>
                    <div className="progress-bar-container">
                      <div className="progress-fill-bar" style={{ width: `${(item.count / Math.max(...progressDistribution.map(p => p.count))) * 100}%` }}>
                        {item.count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Content Analytics Tab */}
        {activeTab === 'content' && (
          <>
            <div className="report-section">
              <h3>Most Popular Content</h3>
              <div className="content-list">
                {popularContent.map((item, idx) => (
                  <div key={item.id} className="content-item">
                    <div className="content-rank">#{idx+1}</div>
                    <div className="content-details">
                      <div className="content-title">{item.title}</div>
                      <div className="content-type">{item.type}</div>
                    </div>
                    <div className="content-views">{item.views} views</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="report-section">
              <h3>Weekly Uploads</h3>
              <div className="weekly-uploads">
                {weeklyUploads.map((week, idx) => (
                  <div key={idx} className="week-card">
                    <div className="week-label">{week.week}</div>
                    <div className="week-stats">
                      <div className="stat"><span className="stat-number">{week.materials}</span><span className="stat-label">Materials</span></div>
                      <div className="stat"><span className="stat-number">{week.quizzes}</span><span className="stat-label">Quizzes</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="report-section">
              <h3>Subject Distribution</h3>
              <div className="subject-distribution">
                {subjectStats.map((subject, idx) => (
                  <div key={idx} className="subject-item">
                    <div className="subject-name">{subject.name}</div>
                    <div className="subject-bar-container">
                      <div className="subject-bar" style={{ width: `${subject.percentage || (subject.count / Math.max(...subjectStats.map(s => s.count))) * 100}%` }}>
                        {subject.count || subject.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Academic Analytics Tab */}
        {activeTab === 'academic' && (
          <>
            <div className="report-section">
              <h3>Quiz Performance</h3>
              <div className="quiz-performance">
                {quizScores.map((quiz, idx) => (
                  <div key={idx} className="quiz-card">
                    <div className="quiz-title">{quiz.title}</div>
                    <div className="quiz-metrics">
                      <div className="metric">
                        <div className="metric-value">{quiz.avgScore}%</div>
                        <div className="metric-label">Average Score</div>
                        <div className="progress-bar"><div className="progress-fill" style={{ width: `${quiz.avgScore}%` }}></div></div>
                      </div>
                      <div className="metric">
                        <div className="metric-value">{quiz.completionRate}%</div>
                        <div className="metric-label">Completion Rate</div>
                        <div className="progress-bar"><div className="progress-fill" style={{ width: `${quiz.completionRate}%` }}></div></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="report-section">
              <h3>Average Scores by Subject</h3>
              <div className="scores-chart">
                {subjectStats.map((subject, idx) => (
                  <div key={idx} className="score-item">
                    <div className="score-subject">{subject.name}</div>
                    <div className="score-bar-container">
                      <div className="score-bar" style={{ width: `${subject.score || 70}%` }}>
                        {subject.score || 70}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminReports;