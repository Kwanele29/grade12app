import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './TutorSessions.css';

const TutorSessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newSession, setNewSession] = useState({
    title: '',
    topic: '',
    description: '',
    startTime: '',
    duration: 60,
    subjectId: '',
    sessionType: 'LIVE',
    maxStudents: 10,
    meetingProvider: 'GOOGLE_MEET',
    customMeetingLink: ''   // new field
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/sessions');
      setSessions(response.data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  // Convert datetime-local to ISO string without timezone shift
  const toBackendDateTime = (datetimeLocalValue) => {
    return datetimeLocalValue + ':00.000Z';
  };

  const handleCreateSession = async () => {
    setError('');

    if (!newSession.title.trim()) {
      setError('Please enter a session title');
      return;
    }
    if (!newSession.startTime) {
      setError('Please select a date and time');
      return;
    }
    if (!newSession.duration || parseInt(newSession.duration) < 15) {
      setError('Duration must be at least 15 minutes');
      return;
    }

    // Validation: if provider is not Google Meet, a custom link is required
    if (newSession.meetingProvider !== 'GOOGLE_MEET' && !newSession.customMeetingLink.trim()) {
      setError(`A custom meeting link is required for ${newSession.meetingProvider}`);
      return;
    }

    try {
      const payload = {
        title: newSession.title.trim(),
        topic: newSession.topic.trim(),
        description: newSession.description.trim(),
        startTime: toBackendDateTime(newSession.startTime),
        duration: parseInt(newSession.duration, 10),
        sessionType: newSession.sessionType || 'LIVE',
        maxStudents: parseInt(newSession.maxStudents, 10) || 10,
        meetingProvider: newSession.meetingProvider || 'GOOGLE_MEET',
        subjectId: newSession.subjectId ? parseInt(newSession.subjectId, 10) : null,
        customMeetingLink: newSession.customMeetingLink.trim() || null
      };

      console.log('📤 Sending payload:', payload);

      const response = await api.post('/sessions', payload);
      setSessions(prev => [...prev, response.data]);
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('❌ Error creating session:', error);
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Unknown error';
      setError('Failed to create session: ' + errorMsg);
    }
  };

  const resetForm = () => {
    setNewSession({
      title: '',
      topic: '',
      description: '',
      startTime: '',
      duration: 60,
      subjectId: '',
      sessionType: 'LIVE',
      maxStudents: 10,
      meetingProvider: 'GOOGLE_MEET',
      customMeetingLink: ''
    });
    setError('');
  };

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await api.delete(`/sessions/${sessionId}`);
        setSessions(sessions.filter(s => s.id !== sessionId));
      } catch (error) {
        setError('Failed to delete session');
      }
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  if (loading) {
    return <div className="loading">Loading sessions...</div>;
  }

  return (
    <div className="tutor-sessions-container">
      <div className="sessions-card">

        <div className="sessions-header">
          <button onClick={() => navigate('/tutor-dashboard')} className="back-btn">
            ← Back to Dashboard
          </button>
          <button onClick={() => { setShowForm(!showForm); setError(''); }} className="create-session-btn">
            {showForm ? '✕ Cancel' : '+ New Session'}
          </button>
        </div>

        <div className="sessions-title-section">
          <h1>My Sessions</h1>
          <div className="stats-badge">
            <span>{sessions.length} Total</span>
            <span>{sessions.filter(s => s.status === 'SCHEDULED').length} Scheduled</span>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            ⚠️ {error}
            <button onClick={() => setError('')} className="error-close">✕</button>
          </div>
        )}

        {showForm && (
          <div className="create-session-form">
            <h3>Create New Session</h3>

            <input
              type="text"
              placeholder="Title *"
              value={newSession.title}
              onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
            />

            <input
              type="text"
              placeholder="Topic (optional)"
              value={newSession.topic}
              onChange={(e) => setNewSession({ ...newSession, topic: e.target.value })}
            />

            <textarea
              placeholder="Description (optional)"
              value={newSession.description}
              onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
              rows="2"
            />

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startTime">Date & Time *</label>
                <input
                  id="startTime"
                  type="datetime-local"
                  value={newSession.startTime}
                  min={getMinDateTime()}
                  onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="duration">Duration (minutes) *</label>
                <input
                  id="duration"
                  type="number"
                  min="15"
                  max="480"
                  value={newSession.duration}
                  onChange={(e) => setNewSession({ ...newSession, duration: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="sessionType">Session Type</label>
                <select
                  id="sessionType"
                  value={newSession.sessionType}
                  onChange={(e) => setNewSession({ ...newSession, sessionType: e.target.value })}
                >
                  <option value="LIVE">Live</option>
                  <option value="RECORDED">Recorded</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="maxStudents">Max Students</label>
                <input
                  id="maxStudents"
                  type="number"
                  min="1"
                  max="100"
                  value={newSession.maxStudents}
                  onChange={(e) => setNewSession({ ...newSession, maxStudents: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="meetingProvider">Meeting Provider</label>
                <select
                  id="meetingProvider"
                  value={newSession.meetingProvider}
                  onChange={(e) => setNewSession({ ...newSession, meetingProvider: e.target.value })}
                >
                  <option value="GOOGLE_MEET">Google Meet</option>
                  <option value="ZOOM">Zoom</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="MICROSOFT_TEAMS">Microsoft Teams</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="customLink">Meeting Link {newSession.meetingProvider !== 'GOOGLE_MEET' && '*'}</label>
                <input
                  id="customLink"
                  type="url"
                  placeholder="https://..."
                  value={newSession.customMeetingLink}
                  onChange={(e) => setNewSession({ ...newSession, customMeetingLink: e.target.value })}
                />
                {newSession.meetingProvider === 'GOOGLE_MEET' && (
                  <p className="helper-text">Leave empty to auto‑generate a valid Google Meet link.</p>
                )}
                {newSession.meetingProvider !== 'GOOGLE_MEET' && (
                  <p className="helper-text">Required: paste your full meeting/call link (Zoom, WhatsApp, Teams, etc.)</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="subjectId">Subject ID (optional)</label>
                <input
                  id="subjectId"
                  type="number"
                  placeholder="e.g. 1"
                  value={newSession.subjectId}
                  onChange={(e) => setNewSession({ ...newSession, subjectId: e.target.value })}
                />
              </div>
            </div>

            <button onClick={handleCreateSession} className="submit-btn">
              ✓ Create Session
            </button>
          </div>
        )}

        {sessions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <p>No sessions yet</p>
            <p>Click "New Session" to create your first session</p>
            <button onClick={() => setShowForm(true)} className="empty-create-btn">
              Create Your First Session
            </button>
          </div>
        ) : (
          <div className="sessions-grid">
            {sessions.map(session => (
              <div key={session.id} className="session-card">
                <div className="session-header">
                  <h3>{session.title}</h3>
                  <span className={`session-badge ${session.status === 'SCHEDULED' ? 'badge-scheduled' : ''}`}>
                    {session.sessionType || 'LIVE'}
                  </span>
                </div>

                <div className="session-details">
                  <div className="detail-item">
                    <span>Date:</span>
                    <span>
                      {session.formattedDate ||
                        new Date(session.startTime).toLocaleDateString('en-ZA', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span>Time:</span>
                    <span>
                      {session.formattedTime ||
                        new Date(session.startTime).toLocaleTimeString('en-ZA', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span>Duration:</span>
                    <span>{session.duration} min</span>
                  </div>
                  <div className="detail-item">
                    <span>Subject:</span>
                    <span>{session.subjectName || 'General'}</span>
                  </div>
                  <div className="detail-item">
                    <span>Status:</span>
                    <span>{session.status || 'SCHEDULED'}</span>
                  </div>
                  <div className="detail-item students-count">
                    <span>Students:</span>
                    <span>{session.currentStudents || 0} / {session.maxStudents || 10}</span>
                  </div>
                </div>

                {session.topic && (
                  <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#718096' }}>
                    <strong>Topic:</strong> {session.topic}
                  </p>
                )}
                {session.description && (
                  <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#718096' }}>
                    {session.description}
                  </p>
                )}

                <div className="session-actions">
                  {session.meetingLink && (
                    <button
                      className="view-btn"
                      onClick={() => window.open(session.meetingLink, '_blank')}
                    >
                      Join
                    </button>
                  )}
                  <button
                    className="cancel-btn"
                    onClick={() => handleDeleteSession(session.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorSessions;