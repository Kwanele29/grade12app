import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
// REMOVE: import { availableSubjects } from '../../constants/subjects';
import './TutorSubjectSelection.css';

const TutorSubjectSelection = () => {
  const navigate = useNavigate();
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]); // ← load from DB
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingSubjects, setFetchingSubjects] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userData || !token) { navigate('/login'); return; }
    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.category !== 'tutor') { navigate('/login'); return; }
      setUser(parsedUser);

      // Don't redirect if subjects exist — let tutor re-select
      // Remove the localStorage redirect so tutor can always update

    } catch (err) {
      console.error(err);
      navigate('/login');
    }
  }, [navigate]);

  // ← NEW: fetch subjects from DB
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const res = await api.get('/subjects/with-tutors');
        // Map to consistent shape expected by the UI
        const mapped = res.data.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description || '',
          icon: s.icon || '📚',
          color: s.color || '#3b82f6',
          bgColor: s.bgColor || '#eff6ff',
        }));
        setAvailableSubjects(mapped);
      } catch (err) {
        console.error('Failed to load subjects:', err);
        setError('Could not load subjects. Please refresh.');
      } finally {
        setFetchingSubjects(false);
      }
    };
    loadSubjects();
  }, []);

  const handleSubjectToggle = (subject) => {
    setSelectedSubjects(prev => {
      const isSelected = prev.some(s => s.id === subject.id);
      if (isSelected) return prev.filter(s => s.id !== subject.id);
      setError('');
      return [...prev, subject];
    });
  };

  const handleContinue = async () => {
    if (selectedSubjects.length === 0) {
      setError('Please select at least one subject');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const subjectsToSend = selectedSubjects.map(s => ({
        id: Number(s.id),
        name: s.name,
        icon: s.icon,
        color: s.color,
        bgColor: s.bgColor,
      }));

      console.log('Sending subjects:', subjectsToSend); // debug

      const response = await api.post('/tutor/subjects', { subjects: subjectsToSend });
      if (response.status === 200 || response.status === 201) {
        localStorage.setItem(`tutor_subjects_${user.id}`, JSON.stringify(subjectsToSend));
        navigate('/tutor-dashboard');
      } else {
        throw new Error('Unexpected response');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError(err.response?.data?.message || 'Failed to save subjects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Logout?')) { localStorage.clear(); navigate('/login'); }
  };

  if (!user || fetchingSubjects) return <div className="loading">Loading...</div>;

  return (
    <div className="subject-selection-wrapper">
      <div className="selection-card">
        <div className="selection-header-nav">
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
        <div className="selection-header">
          <div className="header-icon">📚</div>
          <h1>Welcome, {user.firstName}!</h1>
          <p>Select the subjects you'll be tutoring</p>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="subjects-container">
          {availableSubjects.length === 0 ? (
            <div className="empty-state">
              <p>No subjects found. Please ask an admin to add subjects first.</p>
            </div>
          ) : (
            availableSubjects.map(subject => {
              const isSelected = selectedSubjects.some(s => s.id === subject.id);
              return (
                <div
                  key={subject.id}
                  className={`subject-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSubjectToggle(subject)}
                  style={{
                    borderColor: isSelected ? subject.color : '#e2e8f0',
                    backgroundColor: isSelected ? subject.bgColor : 'white'
                  }}
                >
                  <div className="subject-option-icon"
                    style={{ backgroundColor: subject.bgColor, color: subject.color }}>
                    {subject.icon}
                  </div>
                  <div className="subject-option-info">
                    <h3>{subject.name}</h3>
                    <span>{subject.description}</span>
                  </div>
                  {isSelected && (
                    <div className="selected-badge" style={{ backgroundColor: subject.color }}>✓</div>
                  )}
                </div>
              );
            })
          )}
        </div>
        <div className="selection-footer">
          <div className="selected-summary">
            <strong>{selectedSubjects.length}</strong> subject{selectedSubjects.length !== 1 ? 's' : ''} selected
          </div>
          <button
            onClick={handleContinue}
            disabled={selectedSubjects.length === 0 || loading}
            className="continue-btn"
          >
            {loading ? 'Saving...' : 'Continue to Dashboard'} →
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorSubjectSelection;