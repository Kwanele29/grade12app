import React, { useState, useEffect } from 'react';
import './AdminReports.css';

const AdminReports = () => {
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    overview: {},
    users: {},
    content: {},
    performance: {}
  });

  useEffect(() => {
    fetchReportData();
  }, [reportType, dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/admin/reports/${reportType}?range=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        loadMockData();
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockData = {
      overview: {
        totalUsers: 1341,
        totalStudents: 1247,
        totalTutors: 89,
        totalAdmins: 5,
        activeUsers: 892,
        newUsersThisMonth: 156,
        totalSessions: 3456,
        avgSessionDuration: 24,
        completionRate: 78,
        satisfactionRate: 92
      },
      users: {
        totalRegistrations: [
          { month: 'Jan', students: 145, tutors: 12 },
          { month: 'Feb', students: 168, tutors: 15 },
          { month: 'Mar', students: 190, tutors: 18 },
          { month: 'Apr', students: 210, tutors: 22 },
          { month: 'May', students: 225, tutors: 25 },
          { month: 'Jun', students: 240, tutors: 28 }
        ],
        userActivity: [
          { day: 'Mon', active: 450 },
          { day: 'Tue', active: 520 },
          { day: 'Wed', active: 580 },
          { day: 'Thu', active: 610 },
          { day: 'Fri', active: 590 },
          { day: 'Sat', active: 380 },
          { day: 'Sun', active: 290 }
        ],
        topPerformers: [
          { name: 'Thabo Mokoena', category: 'student', score: 98, assignments: 45 },
          { name: 'Lerato Ndlovu', category: 'student', score: 96, assignments: 42 },
          { name: 'Sarah Johnson', category: 'tutor', score: 95, students: 28 },
          { name: 'Mike Smith', category: 'tutor', score: 94, students: 25 }
        ]
      },
      content: {
        totalMaterials: 156,
        totalQuizzes: 48,
        publishedMaterials: 134,
        publishedQuizzes: 42,
        mostViewed: [
          { title: 'Mathematics P1 Exam Paper 2023', type: 'material', views: 1234 },
          { title: 'Physical Sciences Study Guide', type: 'material', views: 987 },
          { title: 'Algebra Fundamentals Quiz', type: 'quiz', views: 876 },
          { title: 'Newton\'s Laws Quiz', type: 'quiz', views: 765 }
        ],
        subjectDistribution: [
          { subject: 'Mathematics', count: 45 },
          { subject: 'Physical Sciences', count: 38 },
          { subject: 'English', count: 32 },
          { subject: 'Life Sciences', count: 28 },
          { subject: 'History', count: 25 },
          { subject: 'Geography', count: 22 }
        ],
        weeklyUploads: [
          { week: 'Week 1', materials: 12, quizzes: 4 },
          { week: 'Week 2', materials: 15, quizzes: 5 },
          { week: 'Week 3', materials: 18, quizzes: 6 },
          { week: 'Week 4', materials: 20, quizzes: 7 }
        ]
      },
      performance: {
        averageScores: [
          { subject: 'Mathematics', score: 72 },
          { subject: 'Physical Sciences', score: 68 },
          { subject: 'English', score: 78 },
          { subject: 'Life Sciences', score: 75 },
          { subject: 'History', score: 82 },
          { subject: 'Geography', score: 79 }
        ],
        quizCompletion: [
          { quiz: 'Algebra Fundamentals', completion: 85, avgScore: 78 },
          { quiz: 'Newton\'s Laws', completion: 78, avgScore: 72 },
          { quiz: 'Shakespeare Assessment', completion: 65, avgScore: 82 },
          { quiz: 'World War II Quiz', completion: 82, avgScore: 79 }
        ],
        studentProgress: [
          { range: '90-100%', count: 156 },
          { range: '75-89%', count: 345 },
          { range: '60-74%', count: 423 },
          { range: '50-59%', count: 189 },
          { range: 'Below 50%', count: 134 }
        ]
      }
    };
    setReportData(mockData);
  };

  const exportReport = () => {
    const dataStr = JSON.stringify(reportData[reportType], null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${reportType}_report_${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getCurrentData = () => {
    return reportData[reportType] || {};
  };

  const data = getCurrentData();

  return (
    <div className="admin-reports">
      {/* Header */}
      <div className="reports-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Comprehensive insights and statistics about your platform</p>
        </div>
        <button onClick={exportReport} className="export-btn">
          <span>📊</span> Export Report
        </button>
      </div>

      {/* Report Type Tabs */}
      <div className="report-tabs">
        <button 
          className={`report-tab ${reportType === 'overview' ? 'active' : ''}`}
          onClick={() => setReportType('overview')}
        >
          <span className="tab-icon">📈</span>
          Overview
        </button>
        <button 
          className={`report-tab ${reportType === 'users' ? 'active' : ''}`}
          onClick={() => setReportType('users')}
        >
          <span className="tab-icon">👥</span>
          Users Analytics
        </button>
        <button 
          className={`report-tab ${reportType === 'content' ? 'active' : ''}`}
          onClick={() => setReportType('content')}
        >
          <span className="tab-icon">📚</span>
          Content Analytics
        </button>
        <button 
          className={`report-tab ${reportType === 'performance' ? 'active' : ''}`}
          onClick={() => setReportType('performance')}
        >
          <span className="tab-icon">🎯</span>
          Performance Metrics
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
            className={`range-btn ${dateRange === 'quarter' ? 'active' : ''}`}
            onClick={() => setDateRange('quarter')}
          >
            Last Quarter
          </button>
          <button 
            className={`range-btn ${dateRange === 'year' ? 'active' : ''}`}
            onClick={() => setDateRange('year')}
          >
            Last Year
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-reports">Loading reports data...</div>
      ) : (
        <div className="reports-content">
          {/* Overview Report */}
          {reportType === 'overview' && (
            <>
              {/* Key Metrics */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon">👥</div>
                  <div className="metric-info">
                    <h4>Total Users</h4>
                    <p className="metric-value">{data.totalUsers?.toLocaleString()}</p>
                    <span className="metric-change positive">+{data.newUsersThisMonth} this month</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">✅</div>
                  <div className="metric-info">
                    <h4>Active Users</h4>
                    <p className="metric-value">{data.activeUsers?.toLocaleString()}</p>
                    <span className="metric-change positive">{(data.activeUsers / data.totalUsers * 100).toFixed(1)}% of total</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">⏱️</div>
                  <div className="metric-info">
                    <h4>Avg. Session Duration</h4>
                    <p className="metric-value">{data.avgSessionDuration} min</p>
                    <span className="metric-change positive">+12% vs last month</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">📊</div>
                  <div className="metric-info">
                    <h4>Completion Rate</h4>
                    <p className="metric-value">{data.completionRate}%</p>
                    <span className="metric-change positive">+5% vs last month</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">⭐</div>
                  <div className="metric-info">
                    <h4>Satisfaction Rate</h4>
                    <p className="metric-value">{data.satisfactionRate}%</p>
                    <span className="metric-change positive">+3% vs last month</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">🎯</div>
                  <div className="metric-info">
                    <h4>Total Sessions</h4>
                    <p className="metric-value">{data.totalSessions?.toLocaleString()}</p>
                    <span className="metric-change positive">+18% vs last month</span>
                  </div>
                </div>
              </div>

              {/* User Distribution */}
              <div className="report-section">
                <h3>User Distribution</h3>
                <div className="distribution-grid">
                  <div className="distribution-card">
                    <div className="dist-value">{data.totalStudents?.toLocaleString()}</div>
                    <div className="dist-label">Students</div>
                    <div className="dist-bar">
                      <div className="bar-fill" style={{ width: `${(data.totalStudents / data.totalUsers) * 100}%` }}></div>
                    </div>
                    <div className="dist-percent">{((data.totalStudents / data.totalUsers) * 100).toFixed(1)}%</div>
                  </div>
                  <div className="distribution-card">
                    <div className="dist-value">{data.totalTutors?.toLocaleString()}</div>
                    <div className="dist-label">Tutors</div>
                    <div className="dist-bar">
                      <div className="bar-fill" style={{ width: `${(data.totalTutors / data.totalUsers) * 100}%` }}></div>
                    </div>
                    <div className="dist-percent">{((data.totalTutors / data.totalUsers) * 100).toFixed(1)}%</div>
                  </div>
                  <div className="distribution-card">
                    <div className="dist-value">{data.totalAdmins?.toLocaleString()}</div>
                    <div className="dist-label">Admins</div>
                    <div className="dist-bar">
                      <div className="bar-fill" style={{ width: `${(data.totalAdmins / data.totalUsers) * 100}%` }}></div>
                    </div>
                    <div className="dist-percent">{((data.totalAdmins / data.totalUsers) * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Users Analytics Report */}
          {reportType === 'users' && (
            <>
              {/* User Activity Chart (Mock) */}
              <div className="report-section">
                <h3>User Activity (Weekly)</h3>
                <div className="activity-chart">
                  {data.userActivity?.map((item, index) => (
                    <div key={index} className="chart-bar-container">
                      <div className="chart-label">{item.day}</div>
                      <div className="chart-bar-wrapper">
                        <div 
                          className="chart-bar" 
                          style={{ height: `${(item.active / 650) * 100}%` }}
                        >
                          <span className="bar-value">{item.active}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Registrations Trend */}
              <div className="report-section">
                <h3>New Registrations Trend</h3>
                <div className="trend-chart">
                  {data.totalRegistrations?.map((item, index) => (
                    <div key={index} className="trend-group">
                      <div className="trend-month">{item.month}</div>
                      <div className="trend-bars">
                        <div className="trend-bar students" style={{ height: `${(item.students / 300) * 100}%` }}>
                          <span>{item.students}</span>
                        </div>
                        <div className="trend-bar tutors" style={{ height: `${(item.tutors / 40) * 100}%` }}>
                          <span>{item.tutors}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="trend-legend">
                  <span><span className="legend-color students"></span> Students</span>
                  <span><span className="legend-color tutors"></span> Tutors</span>
                </div>
              </div>

              {/* Top Performers */}
              <div className="report-section">
                <h3>Top Performers</h3>
                <div className="performers-list">
                  {data.topPerformers?.map((performer, index) => (
                    <div key={index} className="performer-card">
                      <div className="performer-rank">#{index + 1}</div>
                      <div className="performer-info">
                        <div className="performer-name">{performer.name}</div>
                        <div className="performer-category">{performer.category}</div>
                      </div>
                      <div className="performer-score">
                        <div className="score-value">{performer.score}%</div>
                        <div className="score-label">Performance Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Content Analytics Report */}
          {reportType === 'content' && (
            <>
              {/* Content Stats */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon">📚</div>
                  <div className="metric-info">
                    <h4>Total Materials</h4>
                    <p className="metric-value">{data.totalMaterials}</p>
                    <span className="metric-change positive">{data.publishedMaterials} published</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">✏️</div>
                  <div className="metric-info">
                    <h4>Total Quizzes</h4>
                    <p className="metric-value">{data.totalQuizzes}</p>
                    <span className="metric-change positive">{data.publishedQuizzes} published</span>
                  </div>
                </div>
              </div>

              {/* Most Viewed Content */}
              <div className="report-section">
                <h3>Most Viewed Content</h3>
                <div className="content-list">
                  {data.mostViewed?.map((item, index) => (
                    <div key={index} className="content-item">
                      <div className="content-rank">{index + 1}</div>
                      <div className="content-details">
                        <div className="content-title">{item.title}</div>
                        <div className="content-type">{item.type}</div>
                      </div>
                      <div className="content-views">{item.views.toLocaleString()} views</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject Distribution */}
              <div className="report-section">
                <h3>Content by Subject</h3>
                <div className="subject-distribution">
                  {data.subjectDistribution?.map((subject, index) => (
                    <div key={index} className="subject-item">
                      <div className="subject-name">{subject.subject}</div>
                      <div className="subject-bar-container">
                        <div className="subject-bar" style={{ width: `${(subject.count / 50) * 100}%` }}>
                          <span>{subject.count} items</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Uploads */}
              <div className="report-section">
                <h3>Weekly Content Uploads</h3>
                <div className="weekly-uploads">
                  {data.weeklyUploads?.map((week, index) => (
                    <div key={index} className="week-card">
                      <div className="week-label">{week.week}</div>
                      <div className="week-stats">
                        <div className="stat">
                          <span className="stat-number">{week.materials}</span>
                          <span className="stat-label">Materials</span>
                        </div>
                        <div className="stat">
                          <span className="stat-number">{week.quizzes}</span>
                          <span className="stat-label">Quizzes</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Performance Metrics Report */}
          {reportType === 'performance' && (
            <>
              {/* Average Scores by Subject */}
              <div className="report-section">
                <h3>Average Scores by Subject</h3>
                <div className="scores-chart">
                  {data.averageScores?.map((subject, index) => (
                    <div key={index} className="score-item">
                      <div className="score-subject">{subject.subject}</div>
                      <div className="score-bar-container">
                        <div className="score-bar" style={{ width: `${subject.score}%` }}>
                          <span>{subject.score}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quiz Performance */}
              <div className="report-section">
                <h3>Quiz Performance Metrics</h3>
                <div className="quiz-performance">
                  {data.quizCompletion?.map((quiz, index) => (
                    <div key={index} className="quiz-card">
                      <div className="quiz-title">{quiz.quiz}</div>
                      <div className="quiz-metrics">
                        <div className="metric">
                          <div className="metric-value">{quiz.completion}%</div>
                          <div className="metric-label">Completion Rate</div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${quiz.completion}%` }}></div>
                          </div>
                        </div>
                        <div className="metric">
                          <div className="metric-value">{quiz.avgScore}%</div>
                          <div className="metric-label">Average Score</div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${quiz.avgScore}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Progress Distribution */}
              <div className="report-section">
                <h3>Student Performance Distribution</h3>
                <div className="progress-distribution">
                  {data.studentProgress?.map((range, index) => (
                    <div key={index} className="progress-item">
                      <div className="progress-range">{range.range}</div>
                      <div className="progress-bar-container">
                        <div className="progress-fill-bar" style={{ width: `${(range.count / 1300) * 100}%` }}>
                          <span>{range.count} students</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminReports;