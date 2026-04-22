import React, { useState, useEffect, useCallback } from 'react';
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
    title: '', date: '', time: '', duration: '1', subject: '', studentId: null, studentName: ''
  });
  
  const [uploading, setUploading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', subjectId: '', subjectName: '', topic: '', tags: '', file: null
  });
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch dashboard data from backend
  const fetchDashboard = useCallback(async () => {
    try {
      const response = await api.get('/tutor/dashboard');
      const data = response.data;
      setUser(data.tutor);
      setSelectedSubjects(data.tutor.subjects || []);
      setStudents(data.students || []);
      setSchedule(data.todaySessions || []);
      // you can also set stats from data.stats if needed
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Could not load dashboard data. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch subjects list for dropdown
  const fetchSubjects = useCallback(async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
    } catch (err) {
      console.error('Failed to load subjects:', err);
    }
  }, []);

  // Fetch materials for the Materials tab
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
    fetchDashboard();
    fetchSubjects();
  }, [navigate, fetchDashboard, fetchSubjects]);

  useEffect(() => {
    if (user && activeTab === 'materials') {
      fetchMaterials(user.id);
    }
  }, [user, activeTab, fetchMaterials]);

  // Material upload handlers
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.subjectId || !formData.file) {
      setError('Title, subject, and file are required.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('title', formData.title);
    uploadData.append('description', formData.description);
    uploadData.append('subjectId', formData.subjectId);
    uploadData.append('topic', formData.topic);
    uploadData.append('tags', formData.tags);
    uploadData.append('file', formData.file);
    uploadData.append('tutorId', user.id);

    try {
      await api.post('/materials/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Material uploaded successfully!');
      setFormData({ title: '', description: '', subjectId: '', subjectName: '', topic: '', tags: '', file: null });
      setShowUploadForm(false);
      fetchMaterials(user.id);
      document.getElementById('file-input').value = '';
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
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

  // Helper functions (schedule grouping, modals, etc.)
  const groupScheduleByDate = () => {
    const grouped = {};
    schedule.forEach(item => {
      if (!grouped[item.date]) grouped[item.date] = [];
      grouped[item.date].push(item);
    });
    return grouped;
  };

  const handleJoinSession = (session) => {
    setSelectedSession(session);
    setShowJoinModal(true);
  };
  const handleStartMeeting = () => {
    if (selectedSession?.meetingLink) window.open(selectedSession.meetingLink, '_blank');
    setShowJoinModal(false);
  };
  const handleSendMessage = (student) => navigate('/tutor/messages', { state: { selectedStudent: student } });
  const handleScheduleMeeting = (student) => {
    setScheduledStudent(student);
    setNewSession({
      title: `${student.subject} Session - ${student.name}`,
      date: '', time: '', duration: '1',
      subject: student.subject, studentId: student.id, studentName: student.name
    });
    setShowScheduleModal(true);
  };
  const handleCreateSession = async () => {
    if (!newSession.date || !newSession.time) {
      alert('Please select date and time');
      return;
    }
    try {
      const response = await api.post('/sessions', {
        title: newSession.title,
        date: newSession.date,
        startTime: newSession.time,
        duration: parseFloat(newSession.duration),
        subjectName: newSession.subject,
        studentId: newSession.studentId,
        tutorId: user.id
      });
      alert('Session created!');
      setShowScheduleModal(false);
      fetchDashboard(); // refresh schedule
    } catch (err) {
      alert('Failed to create session');
    }
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };
  const handleViewProgress = (student) => alert(`Progress for ${student.name}: ${student.progress}%`);
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };
  const confirmLogout = () => setShowLogoutConfirm(true);
  const cancelLogout = () => setShowLogoutConfirm(false);
  const navigateTo = (path) => navigate(path);
  const handleChangeSubjects = () => setShowSubjectChangeModal(true);
  const confirmSubjectChange = () => {
    localStorage.removeItem(`tutor_subjects_${user.id}`);
    setShowSubjectChangeModal(false);
    navigate('/tutor/subject-selection');
  };
  const cancelSubjectChange = () => setShowSubjectChangeModal(false);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!user) return null;

  return (
    <div className="tutor-dashboard-pro">
      {/* Modals (subject change, student details, schedule, join, logout) – keep your existing JSX */}
      {/* For brevity, the modal JSX is the same as before but using real data */}
      {/* ... (paste your existing modal JSX from your original file) */}
      
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo-area"><span className="logo-icon">📚</span><span className="logo-text">Grade<span>12</span>Central</span></div>
          <span className="role-indicator tutor">Tutor</span>
        </div>
        <div className="header-right">
          <div className="subject-indicators">
            {selectedSubjects.map(subject => (
              <span key={subject.id} className="subject-indicator" style={{ backgroundColor: subject.bgColor, color: subject.color }}>
                {subject.icon} {subject.name}
              </span>
            ))}
            <button onClick={handleChangeSubjects} className="edit-subjects-indicator">✏️ Edit Subjects</button>
          </div>
          <div className="user-menu">
            <div className="user-avatar">{user.firstName?.[0]}{user.lastName?.[0]}</div>
            <div className="user-details"><span className="user-fullname">{user.firstName} {user.lastName}</span><span className="user-role">Tutor</span></div>
            <button onClick={confirmLogout} className="signout-button-enhanced">🚪 Sign Out</button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-banner">
          <div className="banner-content"><h1>Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, {user.firstName}! 👋</h1>
          <p>Here's what's happening with your {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} today.</p></div>
          <div className="banner-stats">
            <div className="banner-stat"><span className="stat-number">{students.length}</span><span className="stat-label">Active Students</span></div>
            <div className="banner-stat"><span className="stat-number">{materials.length}</span><span className="stat-label">Materials</span></div>
            <div className="banner-stat"><span className="stat-number">{schedule.filter(s => s.date === 'Today').length}</span><span className="stat-label">Today's Sessions</span></div>
          </div>
        </div>

        <div className="dashboard-tabs">
          <button className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`tab-button ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>My Students ({students.length})</button>
          <button className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>Schedule ({schedule.length})</button>
          <button className={`tab-button ${activeTab === 'materials' ? 'active' : ''}`} onClick={() => setActiveTab('materials')}>Materials ({materials.length})</button>
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <>
              <section className="content-section">
                <div className="section-header"><h2>Today's Schedule</h2><button className="view-link" onClick={() => setActiveTab('schedule')}>View Full Schedule →</button></div>
                <div className="schedule-grid">
                  {schedule.filter(item => item.date === 'Today').map(item => (
                    <div key={item.id} className="schedule-card" style={{ borderLeftColor: item.color }}>
                      <div className="schedule-card-time">{item.time}</div>
                      <div className="schedule-card-content"><h3>{item.subject}</h3><p>{item.type} • {item.students}</p><small className="session-topic">{item.topic}</small></div>
                      <button className="schedule-card-action" style={{ backgroundColor: item.color }} onClick={() => handleJoinSession(item)}>Join</button>
                    </div>
                  ))}
                  {schedule.filter(item => item.date === 'Today').length === 0 && <div className="empty-state"><p>No sessions scheduled for today</p></div>}
                </div>
              </section>

              <section className="content-section">
                <div className="section-header"><h2>Recent Students</h2><button className="view-link" onClick={() => setActiveTab('students')}>View All →</button></div>
                <div className="students-grid">
                  {students.slice(0,4).map(student => (
                    <div key={student.id} className="student-card" onClick={() => handleViewStudent(student)}>
                      <div className="student-card-avatar" style={{ backgroundColor: student.bgColor || '#f0fdf4' }}><span style={{ color: student.color || '#48bb78' }}>{student.avatar}</span></div>
                      <div className="student-card-info"><h4>{student.name}</h4><p>{student.subject}</p><div className="progress-indicator"><div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${student.progress}%`, backgroundColor: student.color || '#48bb78' }}></div></div><span className="progress-text">{student.progress}%</span></div></div>
                    </div>
                  ))}
                  {students.length === 0 && <div className="empty-state"><p>No students assigned yet</p></div>}
                </div>
              </section>

              <section className="content-section">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
                  <button className="action-card" onClick={() => navigateTo('/tutor/quizzes')}><div className="action-icon-wrapper"><span>📝</span></div><h3>Create Quiz</h3><p>Design practice questions</p></button>
                  <button className="action-card" onClick={() => { setActiveTab('materials'); setShowUploadForm(true); }}><div className="action-icon-wrapper"><span>📄</span></div><h3>Upload Material</h3><p>Share study guides</p></button>
                  <button className="action-card" onClick={() => { if(students.length) handleScheduleMeeting(students[0]); else alert('No students'); }}><div className="action-icon-wrapper"><span>📅</span></div><h3>Schedule Session</h3><p>Plan tutoring sessions</p></button>
                  <button className="action-card" onClick={() => navigateTo('/tutor/feedback')}><div className="action-icon-wrapper"><span>💬</span></div><h3>Feedback</h3><p>Review responses</p></button>
                </div>
              </section>
            </>
          )}

          {activeTab === 'students' && (
            <section className="content-section full-width">
              <h2>My Students ({students.length})</h2>
              <div className="students-table-container">
                <table className="students-table">
                  <thead><tr><th>Student</th><th>Subject</th><th>Progress</th><th>Last Active</th><th>Actions</th></tr></thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id}>
                        <td><div className="student-info-cell"><div className="student-avatar-small">{student.avatar}</div><div><div className="student-name">{student.name}</div><div className="student-email">{student.email}</div></div></div></td>
                        <td><span className="subject-tag-small">{student.icon} {student.subject}</span></td>
                        <td><div className="progress-cell"><div className="progress-bar-small"><div className="progress-fill-small" style={{ width: `${student.progress}%` }}></div></div><span className="progress-value">{student.progress}%</span></div></td>
                        <td>{student.lastActive}</td>
                        <td><div className="action-buttons-cell"><button className="table-action-btn view-btn" onClick={() => handleViewStudent(student)}>View</button><button className="table-action-btn message-btn" onClick={() => handleSendMessage(student)}>💬</button><button className="table-action-btn schedule-btn" onClick={() => handleScheduleMeeting(student)}>📅</button></div></td>
                      </tr>
                    ))}
                    {students.length === 0 && <tr><td colSpan="5" style={{textAlign:'center'}}>No students found</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'schedule' && (
            <section className="content-section full-width">
              <h2>Full Schedule ({schedule.length})</h2>
              <div className="schedule-container">
                {Object.entries(groupScheduleByDate()).map(([date, items]) => (
                  <div key={date} className="schedule-date-group"><h3 className="date-header">{date}</h3>
                    <div className="schedule-list">
                      {items.map(item => (
                        <div key={item.id} className="schedule-list-item" style={{ borderLeftColor: item.color }}>
                          <div className="schedule-item-time">{item.time}</div>
                          <div className="schedule-item-details"><h4>{item.subject}</h4><p className="schedule-item-topic">{item.topic}</p><div className="schedule-item-meta"><span className="schedule-item-type">{item.type}</span><span className="schedule-item-students">👥 {item.students}</span></div></div>
                          <button className="schedule-item-join" style={{ backgroundColor: item.color }} onClick={() => handleJoinSession(item)}>Join</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {schedule.length === 0 && <div className="empty-state"><p>No sessions scheduled</p></div>}
              </div>
            </section>
          )}

          {activeTab === 'materials' && (
            <div className="material-container-inline">
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}
              {showUploadForm && (
                <div className="upload-form-container">
                  <div className="upload-form-header"><h2>Upload New Material</h2><button onClick={() => setShowUploadForm(false)} className="close-form-btn">×</button></div>
                  <form onSubmit={handleSubmit} className="upload-form">
                    <div className="form-group"><label>Title *</label><input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="Enter material title" /></div>
                    <div className="form-group"><label>Description</label><textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" placeholder="Describe what this material is about" /></div>
                    <div className="form-row">
                      <div className="form-group"><label>Subject *</label>
                        <select name="subjectId" value={formData.subjectId} onChange={(e) => { const selectedId = e.target.value; const selected = subjects.find(s => s.id.toString() === selectedId); setFormData(prev => ({ ...prev, subjectId: selectedId, subjectName: selected?.name || '' })); }} required>
                          <option value="">Select a subject</option>
                          {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                        </select>
                      </div>
                      <div className="form-group"><label>Topic</label><input type="text" name="topic" value={formData.topic} onChange={handleInputChange} placeholder="e.g., Algebra, Grammar, etc." /></div>
                    </div>
                    <div className="form-group"><label>Tags (comma-separated)</label><input type="text" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="e.g., beginner, advanced, practice" /></div>
                    <div className="form-group"><label>File *</label><input type="file" id="file-input" onChange={handleFileChange} required accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.jpg,.jpeg,.png" /><small>Supported: PDF, DOC, DOCX, PPT, PPTX, MP4, JPG, PNG (Max 100MB)</small></div>
                    <button type="submit" className="submit-btn" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload Material'}</button>
                  </form>
                </div>
              )}
              <div className="materials-list">
                <div className="materials-header"><h2>Your Materials ({materials.length})</h2>{!showUploadForm && <button onClick={() => setShowUploadForm(true)} className="upload-new-btn">+ Upload New Material</button>}</div>
                {materials.length === 0 ? (
                  <div className="empty-state"><div className="empty-icon">📚</div><p>No materials uploaded yet</p><button onClick={() => setShowUploadForm(true)} className="empty-upload-btn">Upload Your First Material</button></div>
                ) : (
                  <div className="materials-grid">
                    {materials.map(m => (
                      <div key={m.id} className="material-card-item">
                        <div className="material-icon">📄</div>
                        <div className="material-info"><h3>{m.title}</h3><p>{m.description || 'No description'}</p><div className="material-meta"><span>{m.materialType}</span><span>{m.fileSize ? (m.fileSize/1024/1024).toFixed(2)+' MB' : ''}</span><span>👁️ {m.views || 0}</span><span>⬇️ {m.downloads || 0}</span></div><div className="material-actions"><a href={`http://localhost:8080${m.fileUrl}`} target="_blank" rel="noopener noreferrer" className="view-btn">View</a><button onClick={() => handleDeleteMaterial(m.id)} className="delete-btn">Delete</button></div></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TutorDashboard;