// src/components/tutor/TutorSubjectSelection.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { availableSubjects } from '../../constants/subjects';
import './TutorSubjectSelection.css';

const TutorSubjectSelection = () => {
  const navigate = useNavigate();
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.category !== 'tutor') {
        navigate('/login');
        return;
      }

      setUser(parsedUser);

      const savedSubjects = localStorage.getItem(`tutor_subjects_${parsedUser.id}`);
      if (savedSubjects) {
        navigate('/tutor-dashboard');
      }
    } catch (err) {
      console.error('Error parsing user data:', err);
      navigate('/login');
    }
  }, [navigate]); // navigate is stable from react-router, this is fine

  const handleSubjectToggle = useCallback((subject) => {
    setSelectedSubjects(prev => {
      const isSelected = prev.some(s => s.id === subject.id);
      if (isSelected) {
        return prev.filter(s => s.id !== subject.id);
      }
      setError('');
      return [...prev, subject];
    });
  }, []);

  const handleContinue = useCallback(async () => {
    if (selectedSubjects.length === 0) {
      setError('Please select at least one subject to continue');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    setError('');

    try {
      localStorage.setItem(`tutor_subjects_${user.id}`, JSON.stringify(selectedSubjects));
      navigate('/tutor-dashboard');
    } catch (err) {
      console.error('Error saving subjects:', err);
      setError('Failed to save subjects. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  }, [selectedSubjects, user, navigate]);

  const handleLogout = useCallback(() => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    }
  }, [navigate]);

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="subject-selection-wrapper">
      <div className="selection-card">
        <div className="selection-header-nav">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>

        <div className="selection-header">
          <div className="header-icon">📚</div>
          <h1>Welcome, {user.firstName}!</h1>
          <p>Select the subjects you'll be tutoring</p>
          <div className="header-subtitle">
            Choose the subjects you're qualified to teach (you can select as many as you want)
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="subjects-container">
          {availableSubjects.map(subject => {
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
                <div
                  className="subject-option-icon"
                  style={{
                    backgroundColor: subject.bgColor,
                    color: subject.color
                  }}
                >
                  {subject.icon}
                </div>
                <div className="subject-option-info">
                  <h3>{subject.name}</h3>
                  <span>{subject.description}</span>
                </div>
                {isSelected && (
                  <div
                    className="selected-badge"
                    style={{ backgroundColor: subject.color }}
                  >
                    ✓
                  </div>
                )}
              </div>
            );
          })}
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
            {loading ? 'Saving...' : 'Continue to Dashboard'}
            <span className="btn-arrow">→</span>
          </button>
        </div>

        <div className="selection-help">
          <p>💡 You can always change your subjects later in settings</p>
        </div>
      </div>
    </div>
  );
};

export default TutorSubjectSelection;