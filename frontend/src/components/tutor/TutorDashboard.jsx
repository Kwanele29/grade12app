import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
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
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showSubjectChangeModal, setShowSubjectChangeModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledStudent, setScheduledStudent] = useState(null);
  const [newSession, setNewSession] = useState({
    title: '', date: '', time: '', duration: '60', subject: '', studentId: null, studentName: ''
  });
  const [sessionError, setSessionError] = useState('');

  const [uploading, setUploading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // ✅ materialType instead of uploadMode
  const [formData, setFormData] = useState({
    title: '', description: '', subjectId: '', subjectName: '',
    topic: '', tags: '', file: null, videoLink: '',
    materialType: 'paper'   // 'paper', 'note', 'video'
  });

  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fileInputRef = useRef(null);

  // ─── Data fetching ────────────────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    const formatDateGroup = (dateStr) => {
      const inputDate = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const inputDateOnly = new Date(inputDate);
      inputDateOnly.setHours(0, 0, 0, 0);
      if (inputDateOnly.getTime() === today.getTime()) return 'Today';
      if (inputDateOnly.getTime() === tomorrow.getTime()) return 'Tomorrow';
      return inputDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (dateStr) =>
      new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const transformSession = (session) => {
      const subjectColors = {
        'Mathematics': '#667eea', 'English': '#48bb78',
        'Physics': '#ed8936', 'Chemistry': '#9f7aea',
        'Biology': '#38b2ac', 'History': '#f687b3',
      };
      const subjectName = session.subjectName || 'General';
      return {
        id: session.id,
        date: formatDateGroup(session.startTime),
        time: formatTime(session.startTime),
        subject: subjectName,
        topic: session.topic || session.title,
        type: session.sessionType || 'LIVE',
        students: `${session.currentStudents || 0}/${session.maxStudents || 10}`,
        meetingLink: session.meetingLink,
        color: subjectColors[subjectName] || '#718096',
        startTime: session.startTime,
      };
    };

    try {
      const dashboardRes = await api.get('/tutor/dashboard');
      const dashboardData = dashboardRes.data;
      setUser(dashboardData.tutor);

      let subjs = dashboardData.tutor?.subjects || [];
      if (subjs.length === 0) {
        const stored = localStorage.getItem(`tutor_subjects_${dashboardData.tutor?.id}`);
        if (stored) subjs = JSON.parse(stored);
      }
      setSelectedSubjects(subjs);
      setStudents(dashboardData.students || []);

      const sessionsRes = await api.get('/sessions');
      const transformed = (sessionsRes.data || []).map(transformSession);
      transformed.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      setSchedule(transformed);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Could not load dashboard data. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
    } catch (err) {
      console.error('Failed to load subjects:', err);
    }
  }, []);

  const fetchMaterials = useCallback(async (tutorId) => {
    try {
      const res = await api.get(`/materials/tutor/${tutorId}`);
      setMaterials(res.data);
    } catch (err) {
      console.error('Failed to load materials:', err);
      setMaterials([]);
    }
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userData || !token) { navigate('/login'); return; }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.category !== 'tutor') { navigate('/login'); return; }
    setUser(parsedUser);
    fetchDashboard();
    fetchSubjects();
  }, [navigate, fetchDashboard, fetchSubjects]);

  useEffect(() => {
    if (user && activeTab === 'materials') fetchMaterials(user.id);
  }, [user, activeTab, fetchMaterials]);

  // ─── Form handlers ────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 100 * 1024 * 1024) {
      setError('File size must be less than 100MB');
      setTimeout(() => setError(''), 3000);
      e.target.value = '';
      return;
    }
    setFormData(prev => ({ ...prev, file }));
  };

  const handleMaterialTypeChange = (e) => {
    const newType = e.target.value;
    setFormData(prev => ({
      ...prev,
      materialType: newType,
      file: null,
      videoLink: '',
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', subjectId: '', subjectName: '',
      topic: '', tags: '', file: null, videoLink: '',
      materialType: 'paper',
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Title is required.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (!formData.subjectId) {
      setError('Subject is required.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (formData.materialType === 'video') {
      if (!formData.videoLink.trim()) {
        setError('Please enter a video link.');
        setTimeout(() => setError(''), 3000);
        return;
      }
    } else {
      if (!formData.file) {
        setError('Please select a file.');
        setTimeout(() => setError(''), 3000);
        return;
      }
    }

    const truncatedDescription = (formData.description || '').substring(0, 255);

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('title', formData.title.trim());
    uploadData.append('description', truncatedDescription);
    uploadData.append('subjectId', Number(formData.subjectId));
    uploadData.append('topic', formData.topic || '');
    uploadData.append('tags', formData.tags || '');
    uploadData.append('tutorId', user.id);
    uploadData.append('materialType', formData.materialType);

    if (formData.materialType === 'video') {
      uploadData.append('videoLink', formData.videoLink.trim());
    } else {
      uploadData.append('file', formData.file);
    }

    try {
      await api.post('/materials/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Material uploaded successfully!');
      resetForm();
      setShowUploadForm(false);
      await fetchMaterials(user.id);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Upload failed';
      setError(msg);
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await api.delete(`/materials/${materialId}`);
      setSuccess('Deleted');
      fetchMaterials(user.id);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Delete failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  // ─── Schedule helpers ─────────────────────────────────────────────────────
  const groupScheduleByDate = () => {
    const grouped = {};
    schedule.forEach(item => {
      if (!grouped[item.date]) grouped[item.date] = [];
      grouped[item.date].push(item);
    });
    const order = { 'Today': 0, 'Tomorrow': 1 };
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      const aO = order[a] !== undefined ? order[a] : 2;
      const bO = order[b] !== undefined ? order[b] : 2;
      if (aO !== bO) return aO - bO;
      return new Date(a) - new Date(b);
    });
    const out = {};
    sortedDates.forEach(d => { out[d] = grouped[d]; });
    return out;
  };

  const handleJoinSession = (session) => { setSelectedSession(session); setShowJoinModal(true); };
  const handleStartMeeting = () => { if (selectedSession?.meetingLink) window.open(selectedSession.meetingLink, '_blank'); setShowJoinModal(false); };
  const handleSendMessage = (student) => navigate('/tutor/messages', { state: { selectedStudent: student } });
  const handleViewStudent = (student) => { setSelectedStudent(student); setShowStudentModal(true); };
  const handleLogout = () => { localStorage.clear(); navigate('/login'); };
  const confirmLogout = () => setShowLogoutConfirm(true);
  const cancelLogout = () => setShowLogoutConfirm(false);
  const navigateTo = (path) => navigate(path);
  const handleChangeSubjects = () => setShowSubjectChangeModal(true);
  const cancelSubjectChange = () => setShowSubjectChangeModal(false);
  const getMinDate = () => new Date().toISOString().split('T')[0];

  const confirmSubjectChange = () => {
    localStorage.removeItem(`tutor_subjects_${user.id}`);
    setShowSubjectChangeModal(false);
    navigate('/tutor/subject-selection');
  };

  const handleScheduleMeeting = (student) => {
    setScheduledStudent(student);
    setSessionError('');
    setNewSession({
      title: `${student.subject} Session - ${student.name}`,
      date: '', time: '', duration: '60',
      subject: student.subject, studentId: student.id, studentName: student.name,
    });
    setShowScheduleModal(true);
  };

  const handleCreateSession = async () => {
    setSessionError('');
    if (!newSession.date) { setSessionError('Please select a date'); return; }
    if (!newSession.time) { setSessionError('Please select a time'); return; }
    if (!newSession.duration || parseInt(newSession.duration) < 15) { setSessionError('Duration must be at least 15 minutes'); return; }

    try {
      const payload = {
        title: newSession.title.trim(),
        topic: newSession.subject,
        description: `Session with ${newSession.studentName}`,
        startTime: `${newSession.date}T${newSession.time}:00.000Z`,
        duration: parseInt(newSession.duration, 10),
        sessionType: 'LIVE',
        maxStudents: 1,
        meetingProvider: 'GOOGLE_MEET',
        subjectId: null,
      };
      await api.post('/sessions', payload);
      setShowScheduleModal(false);
      await fetchDashboard();
      setSuccess('Session scheduled successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to create session';
      setSessionError(msg);
    }
  };

  // ─── Loading / auth guard ─────────────────────────────────────────────────
  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!user) return null;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="tutor-dashboard-pro">
      {/* Header */}
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
              <span key={subject.id} className="subject-indicator"
                style={{ backgroundColor: subject.bgColor, color: subject.color }}>
                {subject.icon} {subject.name}
              </span>
            ))}
            <button onClick={handleChangeSubjects} className="edit-subjects-indicator">✏️ Edit Subjects</button>
          </div>
          <div className="user-menu">
            <div className="user-avatar">{user.firstName?.[0]}{user.lastName?.[0]}</div>
            <div className="user-details">
              <span className="user-fullname">{user.firstName} {user.lastName}</span>
              <span className="user-role">Tutor</span>
            </div>
            <button onClick={confirmLogout} className="signout-button-enhanced">🚪 Sign Out</button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-banner">
          <div className="banner-content">
            <h1>Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, {user.firstName}! 👋</h1>
            <p>Here's what's happening with your {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} today.</p>
          </div>
          <div className="banner-stats">
            <div className="banner-stat"><span className="stat-number">{students.length}</span><span className="stat-label">Active Students</span></div>
            <div className="banner-stat"><span className="stat-number">{materials.length}</span><span className="stat-label">Materials</span></div>
            <div className="banner-stat"><span className="stat-number">{schedule.filter(s => s.date === 'Today').length}</span><span className="stat-label">Today's Sessions</span></div>
          </div>
        </div>

        {success && (
          <div className="error-banner" style={{ background: '#f0fff4', borderColor: '#9ae6b4', color: '#276749' }}>
            ✅ {success}
          </div>
        )}

        <div className="dashboard-tabs">
          {['overview', 'students', 'schedule', 'materials'].map(tab => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' && 'Overview'}
              {tab === 'students' && `My Students (${students.length})`}
              {tab === 'schedule' && `Schedule (${schedule.length})`}
              {tab === 'materials' && `Materials (${materials.length})`}
            </button>
          ))}
        </div>

        <div className="tab-content">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              <section className="content-section">
                <div className="section-header">
                  <h2>Today's Schedule</h2>
                  <button className="view-link" onClick={() => setActiveTab('schedule')}>View Full Schedule →</button>
                </div>
                <div className="schedule-grid">
                  {schedule.filter(item => item.date === 'Today').map(item => (
                    <div key={item.id} className="schedule-card" style={{ borderLeftColor: item.color }}>
                      <div className="schedule-card-time">{item.time}</div>
                      <div className="schedule-card-content">
                        <h3>{item.subject}</h3>
                        <p>{item.type} • {item.students}</p>
                        <small className="session-topic">{item.topic}</small>
                      </div>
                      <button className="schedule-card-action" style={{ backgroundColor: item.color }}
                        onClick={() => handleJoinSession(item)}>Join</button>
                    </div>
                  ))}
                  {schedule.filter(item => item.date === 'Today').length === 0 && (
                    <div className="empty-state"><p>No sessions scheduled for today</p></div>
                  )}
                </div>
              </section>

              <section className="content-section">
                <div className="section-header">
                  <h2>Recent Students</h2>
                  <button className="view-link" onClick={() => setActiveTab('students')}>View All →</button>
                </div>
                <div className="students-grid">
                  {students.slice(0, 4).map(student => (
                    <div key={student.id} className="student-card" onClick={() => handleViewStudent(student)}>
                      <div className="student-card-avatar" style={{ backgroundColor: student.bgColor || '#f0fdf4' }}>
                        <span style={{ color: student.color || '#48bb78' }}>{student.avatar}</span>
                      </div>
                      <div className="student-card-info">
                        <h4>{student.name}</h4>
                        <p>{student.subject}</p>
                        <div className="progress-indicator">
                          <div className="progress-bar-bg">
                            <div className="progress-bar-fill"
                              style={{ width: `${student.progress}%`, backgroundColor: student.color || '#48bb78' }}>
                            </div>
                          </div>
                          <span className="progress-text">{student.progress}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {students.length === 0 && <div className="empty-state"><p>No students assigned yet</p></div>}
                </div>
              </section>

              <section className="content-section">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
                  <button className="action-card" onClick={() => navigateTo('/tutor/quizzes')}>
                    <div className="action-icon-wrapper"><span>📝</span></div>
                    <h3>Create Quiz</h3><p>Design practice questions</p>
                  </button>
                  <button className="action-card" onClick={() => { setActiveTab('materials'); setShowUploadForm(true); }}>
                    <div className="action-icon-wrapper"><span>📄</span></div>
                    <h3>Upload Material</h3><p>Share study guides</p>
                  </button>
                  <button className="action-card" onClick={() => {
                    if (students.length) handleScheduleMeeting(students[0]);
                    else alert('No students yet');
                  }}>
                    <div className="action-icon-wrapper"><span>📅</span></div>
                    <h3>Schedule Session</h3><p>Plan tutoring sessions</p>
                  </button>
                  <button className="action-card" onClick={() => navigateTo('/tutor/feedback')}>
                    <div className="action-icon-wrapper"><span>💬</span></div>
                    <h3>Feedback</h3><p>Review responses</p>
                  </button>
                </div>
              </section>
            </>
          )}

          {/* STUDENTS TAB */}
          {activeTab === 'students' && (
            <section className="content-section full-width">
              <h2>My Students ({students.length})</h2>
              <div className="students-table-container">
                <table className="students-table">
                  <thead>
                    <tr>
                      <th>Student</th><th>Subject</th><th>Progress</th>
                      <th>Last Active</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id}>
                        <td>
                          <div className="student-info-cell">
                            <div className="student-avatar-small">{student.avatar}</div>
                            <div>
                              <div className="student-name">{student.name}</div>
                              <div className="student-email">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="subject-tag-small">{student.icon} {student.subject}</span></td>
                        <td>
                          <div className="progress-cell">
                            <div className="progress-bar-small">
                              <div className="progress-fill-small" style={{ width: `${student.progress}%` }}></div>
                            </div>
                            <span className="progress-value">{student.progress}%</span>
                          </div>
                        </td>
                        <td>{student.lastActive}</td>
                        <td>
                          <div className="action-buttons-cell">
                            <button className="table-action-btn view-btn" onClick={() => handleViewStudent(student)}>View</button>
                            <button className="table-action-btn message-btn" onClick={() => handleSendMessage(student)}>💬</button>
                            <button className="table-action-btn schedule-btn" onClick={() => handleScheduleMeeting(student)}>📅</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr><td colSpan="5" style={{ textAlign: 'center' }}>No students found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* SCHEDULE TAB */}
          {activeTab === 'schedule' && (
            <section className="content-section full-width">
              <h2>Full Schedule ({schedule.length})</h2>
              <div className="schedule-container">
                {Object.entries(groupScheduleByDate()).map(([date, items]) => (
                  <div key={date} className="schedule-date-group">
                    <h3 className="date-header">{date}</h3>
                    <div className="schedule-list">
                      {items.map(item => (
                        <div key={item.id} className="schedule-list-item" style={{ borderLeftColor: item.color }}>
                          <div className="schedule-item-time">{item.time}</div>
                          <div className="schedule-item-details">
                            <h4>{item.subject}</h4>
                            <p className="schedule-item-topic">{item.topic}</p>
                            <div className="schedule-item-meta">
                              <span className="schedule-item-type">{item.type}</span>
                              <span className="schedule-item-students">👥 {item.students}</span>
                            </div>
                          </div>
                          <button className="schedule-item-join" style={{ backgroundColor: item.color }}
                            onClick={() => handleJoinSession(item)}>Join</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {schedule.length === 0 && <div className="empty-state"><p>No sessions scheduled</p></div>}
              </div>
            </section>
          )}

          {/* MATERIALS TAB */}
          {activeTab === 'materials' && (
            <div className="material-container-inline">
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              {showUploadForm && (
                <div className="upload-form-container">
                  <div className="upload-form-header">
                    <h2>Upload New Material</h2>
                    <button onClick={() => { setShowUploadForm(false); resetForm(); }} className="close-form-btn">×</button>
                  </div>

                  <form onSubmit={handleSubmit} className="upload-form">
                    <div className="form-group">
                      <label>Title *</label>
                      <input type="text" name="title" value={formData.title}
                        onChange={handleInputChange} required placeholder="Enter material title" />
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        name="description" value={formData.description}
                        onChange={handleInputChange} rows="3" maxLength="255"
                        placeholder="Describe what this material is about (max 255 characters)"
                      />
                      <small>{formData.description?.length || 0} / 255 characters</small>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Subject *</label>
                        <select
                          name="subjectId" value={formData.subjectId} required
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            const selected = subjects.find(s => s.id.toString() === selectedId);
                            setFormData(prev => ({ ...prev, subjectId: selectedId, subjectName: selected?.name || '' }));
                          }}
                        >
                          <option value="">Select a subject</option>
                          {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Topic</label>
                        <input type="text" name="topic" value={formData.topic}
                          onChange={handleInputChange} placeholder="e.g., Algebra, Grammar, etc." />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Tags (comma-separated)</label>
                      <input type="text" name="tags" value={formData.tags}
                        onChange={handleInputChange} placeholder="e.g., beginner, advanced, practice" />
                    </div>

                    {/* Material Type Dropdown */}
                    <div className="form-group">
                      <label>Material Type *</label>
                      <select
                        name="materialType"
                        value={formData.materialType}
                        onChange={handleMaterialTypeChange}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      >
                        <option value="paper">📄 Past Paper</option>
                        <option value="note">📝 Study Note</option>
                        <option value="video">🎥 Video Lesson</option>
                      </select>
                    </div>

                    {formData.materialType === 'video' ? (
                      <div className="form-group">
                        <label>Video Link *</label>
                        <input
                          type="url"
                          name="videoLink"
                          value={formData.videoLink}
                          onChange={handleInputChange}
                          placeholder="https://youtube.com/watch?v=..."
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                        <small>Paste a YouTube, Vimeo, or any public video URL</small>
                      </div>
                    ) : (
                      <div className="form-group">
                        <label>File *</label>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.ppt,.pptx"
                        />
                        <small>PDF, DOC, DOCX, PPT, PPTX (Max 100MB)</small>
                      </div>
                    )}

                    <button type="submit" className="submit-btn" disabled={uploading}>
                      {uploading ? 'Uploading...' : 'Upload Material'}
                    </button>
                  </form>
                </div>
              )}

              <div className="materials-list">
                <div className="materials-header">
                  <h2>Your Materials ({materials.length})</h2>
                  {!showUploadForm && (
                    <button onClick={() => setShowUploadForm(true)} className="upload-new-btn">
                      + Upload New Material
                    </button>
                  )}
                </div>

                {materials.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📚</div>
                    <p>No materials uploaded yet</p>
                    <button onClick={() => setShowUploadForm(true)} className="empty-upload-btn">
                      Upload Your First Material
                    </button>
                  </div>
                ) : (
                  <div className="materials-grid">
                    {materials.map(m => (
                      <div key={m.id} className="material-card-item">
                        <div className="material-icon">
                          {m.materialType === 'video' ? '🎥' : (m.materialType === 'note' ? '📝' : '📄')}
                        </div>
                        <div className="material-info">
                          <h3>{m.title}</h3>
                          <p>{m.description || 'No description'}</p>
                          <div className="material-meta">
                            <span>{m.materialType === 'video' ? 'Video Lesson' : (m.materialType === 'note' ? 'Study Note' : 'Past Paper')}</span>
                            {m.fileSize > 0 && <span>{(m.fileSize / 1024 / 1024).toFixed(2)} MB</span>}
                            <span>👁️ {m.views || 0}</span>
                            <span>⬇️ {m.downloads || 0}</span>
                          </div>
                          <div className="material-actions">
                            {m.videoLink ? (
                              <a href={m.videoLink} target="_blank" rel="noopener noreferrer" className="view-btn">▶ Watch Video</a>
                            ) : (
                              <a href={`http://localhost:8080${m.fileUrl}`} target="_blank" rel="noopener noreferrer" className="view-btn">View</a>
                            )}
                            <button onClick={() => handleDeleteMaterial(m.id)} className="delete-btn">Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODALS */}
      {showLogoutConfirm && (
        <div className="logout-modal-overlay" onClick={cancelLogout}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-icon">🚪</div>
            <h3>Sign Out</h3>
            <p>Are you sure you want to sign out?</p>
            <div className="logout-modal-actions">
              <button onClick={cancelLogout} className="logout-modal-cancel">Cancel</button>
              <button onClick={handleLogout} className="logout-modal-confirm">Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {showSubjectChangeModal && (
        <div className="modal-overlay" onClick={cancelSubjectChange}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Change Subjects</h3>
              <button className="modal-close" onClick={cancelSubjectChange}>×</button>
            </div>
            <div className="modal-body">
              <p>Changing your subjects will reset your dashboard and student assignments.</p>
              <p>Are you sure you want to continue?</p>
            </div>
            <div className="modal-footer">
              <button onClick={cancelSubjectChange} className="modal-cancel-btn">Cancel</button>
              <button onClick={confirmSubjectChange} className="modal-join-btn">Continue</button>
            </div>
          </div>
        </div>
      )}

      {showStudentModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowStudentModal(false)}>
          <div className="modal-content student-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Student Details</h3>
              <button className="modal-close" onClick={() => setShowStudentModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="student-profile-header">
                <div className="student-profile-avatar">{selectedStudent.avatar}</div>
                <div className="student-profile-info">
                  <h2>{selectedStudent.name}</h2>
                  <p className="student-profile-email">{selectedStudent.email}</p>
                  <span className="status-badge">Active</span>
                </div>
              </div>
              <div className="student-details-grid">
                <div className="detail-card">
                  <h4>Academic Info</h4>
                  <div className="detail-row"><span className="detail-label">Subject:</span><span className="detail-value">{selectedStudent.subject}</span></div>
                  <div className="detail-row"><span className="detail-label">Grade:</span><span className="detail-value">{selectedStudent.grade || 'N/A'}</span></div>
                  <div className="detail-row"><span className="detail-label">School:</span><span className="detail-value">{selectedStudent.school || 'N/A'}</span></div>
                </div>
                <div className="detail-card">
                  <h4>Performance</h4>
                  <div className="detail-row"><span className="detail-label">Progress:</span><span className="detail-value progress-value">{selectedStudent.progress}%</span></div>
                  <div className="detail-row"><span className="detail-label">Avg Score:</span><span className="detail-value">{selectedStudent.averageScore || 0}%</span></div>
                  <div className="detail-row"><span className="detail-label">Quizzes Completed:</span><span className="detail-value">{selectedStudent.completedQuizzes || 0}</span></div>
                </div>
              </div>
              {selectedStudent.upcomingSession && selectedStudent.upcomingSession !== 'No upcoming sessions' && (
                <div className="upcoming-session">
                  <h4>📅 Upcoming Session</h4>
                  <p>{selectedStudent.upcomingSession}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => handleSendMessage(selectedStudent)} className="modal-secondary-btn">💬 Send Message</button>
              <button onClick={() => { setShowStudentModal(false); handleScheduleMeeting(selectedStudent); }} className="modal-join-btn">📅 Schedule Session</button>
            </div>
          </div>
        </div>
      )}

      {showScheduleModal && scheduledStudent && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📅 Schedule Session with {scheduledStudent.name}</h3>
              <button className="modal-close" onClick={() => setShowScheduleModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {sessionError && (
                <div style={{
                  background: '#fff5f5', border: '1px solid #feb2b2', color: '#c53030',
                  padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px',
                }}>
                  ⚠️ {sessionError}
                </div>
              )}
              <div className="form-group">
                <label htmlFor="session-title">Session Title</label>
                <input id="session-title" type="text" value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  placeholder="Enter session title" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="session-date">Date *</label>
                  <input id="session-date" type="date" value={newSession.date} min={getMinDate()}
                    onChange={(e) => setNewSession({ ...newSession, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="session-time">Time *</label>
                  <input id="session-time" type="time" value={newSession.time}
                    onChange={(e) => setNewSession({ ...newSession, time: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="session-duration">Duration (minutes) *</label>
                  <input id="session-duration" type="number" min="15" max="480" step="15"
                    value={newSession.duration}
                    onChange={(e) => setNewSession({ ...newSession, duration: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => { setShowScheduleModal(false); setSessionError(''); }} className="modal-cancel-btn">Cancel</button>
              <button onClick={handleCreateSession} className="modal-join-btn">✓ Create Session</button>
            </div>
          </div>
        </div>
      )}

      {showJoinModal && selectedSession && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Join Session</h3>
              <button className="modal-close" onClick={() => setShowJoinModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="session-details">
                <div className="session-detail-item"><span>Subject:</span><strong>{selectedSession.subject}</strong></div>
                <div className="session-detail-item"><span>Time:</span><strong>{selectedSession.time}</strong></div>
                <div className="session-detail-item"><span>Topic:</span><strong>{selectedSession.topic}</strong></div>
              </div>
              <div className="meeting-info">
                <h4>Meeting Link</h4>
                <div className="meeting-link-box">
                  <span className="link-label">Join URL:</span>
                  <a href={selectedSession.meetingLink} target="_blank" rel="noopener noreferrer">
                    {selectedSession.meetingLink || 'No link provided'}
                  </a>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowJoinModal(false)} className="modal-cancel-btn">Cancel</button>
              <button onClick={handleStartMeeting} className="modal-join-btn">Join Meeting</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorDashboard;