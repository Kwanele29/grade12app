<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
// REMOVE: import { availableSubjects } from '../../constants/subjects';
=======
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
import './TutorSubjectSelection.css';

const TutorSubjectSelection = () => {
  const navigate = useNavigate();
  const [selectedSubjects, setSelectedSubjects] = useState([]);
<<<<<<< HEAD
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
=======
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get user directly from localStorage - no useState for user
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const token = localStorage.getItem('token');

  // Check if user is logged in and is a tutor
  if (!token || !user || user.category !== 'tutor') {
    navigate('/login');
    return null;
  }

  // Check if already has subjects
  const savedSubjects = localStorage.getItem(`tutor_subjects_${user.id}`);
  if (savedSubjects && savedSubjects !== '[]' && savedSubjects !== 'null') {
    navigate('/tutor-dashboard');
    return null;
  }
  
  const availableSubjects = [
    { id: 1, name: 'Mathematics', icon: '📐', color: '#3b82f6', bgColor: '#eff6ff', category: 'Core' },
    { id: 2, name: 'Mathematical Literacy', icon: '🧮', color: '#f97316', bgColor: '#fff7ed', category: 'Core' },
    { id: 3, name: 'Physical Science', icon: '⚛️', color: '#10b981', bgColor: '#f0fdf4', category: 'Core' },
    { id: 4, name: 'Life Sciences', icon: '🧬', color: '#8b5cf6', bgColor: '#f5f3ff', category: 'Core' },
    { id: 5, name: 'English', icon: '📝', color: '#f59e0b', bgColor: '#fef3c7', category: 'Core' },
    { id: 6, name: 'Afrikaans', icon: '🇿🇦', color: '#f97316', bgColor: '#fff7ed', category: 'Languages' },
    { id: 7, name: 'isiZulu', icon: '🦓', color: '#14b8a6', bgColor: '#e0f2fe', category: 'Languages' },
    { id: 8, name: 'isiXhosa', icon: '🌅', color: '#8b5cf6', bgColor: '#f3e8ff', category: 'Languages' },
    { id: 9, name: 'Geography', icon: '🌍', color: '#ec4899', bgColor: '#fdf2f8', category: 'Humanities' },
    { id: 10, name: 'History', icon: '📜', color: '#a855f7', bgColor: '#f3e8ff', category: 'Humanities' },
    { id: 11, name: 'Accounting', icon: '💰', color: '#14b8a6', bgColor: '#e0f2fe', category: 'Commerce' },
    { id: 12, name: 'Business Studies', icon: '💼', color: '#f43f5e', bgColor: '#fce7f3', category: 'Commerce' },
    { id: 13, name: 'Economics', icon: '📊', color: '#f59e0b', bgColor: '#fef3c7', category: 'Commerce' },
    { id: 14, name: 'Computer Applications Technology', icon: '💻', color: '#3b82f6', bgColor: '#eff6ff', category: 'Tech' },
    { id: 15, name: 'Information Technology', icon: '👨‍💻', color: '#8b5cf6', bgColor: '#f5f3ff', category: 'Tech' },
    { id: 16, name: 'Tourism', icon: '✈️', color: '#06b6d4', bgColor: '#e0f2fe', category: 'Consumer' },
  ];
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734

  const handleSubjectToggle = (subject) => {
    setSelectedSubjects(prev => {
      const isSelected = prev.some(s => s.id === subject.id);
<<<<<<< HEAD
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
=======
      if (isSelected) {
        return prev.filter(s => s.id !== subject.id);
      } else {
        return [...prev, subject];
      }
    });
  };

  const handleConfirmSubjects = () => {
    if (selectedSubjects.length === 0) {
      alert('Please select at least one subject');
      return;
    }

    localStorage.setItem(`tutor_subjects_${user.id}`, JSON.stringify(selectedSubjects));
    navigate('/tutor-dashboard');
  };

  const handleSkip = () => {
    localStorage.setItem(`tutor_subjects_${user.id}`, JSON.stringify([]));
    navigate('/tutor-dashboard');
  };

  const groupedSubjects = availableSubjects.reduce((acc, subject) => {
    if (!acc[subject.category]) {
      acc[subject.category] = [];
    }
    acc[subject.category].push(subject);
    return acc;
  }, {});

  const filteredSubjects = searchTerm
    ? availableSubjects.filter(subject => 
        subject.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : availableSubjects;

  return (
    <div className="tutor-subject-selection">
      <div className="selection-container">
        <div className="selection-header">
          <div className="header-icon">👨‍🏫</div>
          <h1>Welcome, {user?.firstName || 'Tutor'}!</h1>
          <p className="header-subtitle">Let's set up your tutoring profile</p>
          <p className="header-description">
            Select the subjects you specialize in. This will help students find you 
            and personalize your tutoring experience.
          </p>
        </div>

        <div className="search-section">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="selection-summary">
            <span className="selected-badge">{selectedSubjects.length}</span>
            <span>subject{selectedSubjects.length !== 1 ? 's' : ''} selected</span>
          </div>
        </div>

        <div className="subjects-scroll-container">
          {searchTerm ? (
            <div className="search-results">
              <h3>Search Results ({filteredSubjects.length})</h3>
              <div className="subjects-grid">
                {filteredSubjects.map(subject => {
                  const isSelected = selectedSubjects.some(s => s.id === subject.id);
                  return (
                    <div
                      key={subject.id}
                      className={`subject-card ${isSelected ? 'selected' : ''}`}
                      style={{ borderColor: subject.color }}
                      onClick={() => handleSubjectToggle(subject)}
                    >
                      <div className="subject-icon" style={{ backgroundColor: subject.bgColor, color: subject.color }}>
                        {subject.icon}
                      </div>
                      <div className="subject-info">
                        <h4>{subject.name}</h4>
                        <span className="subject-category">{subject.category}</span>
                      </div>
                      {isSelected && (
                        <div className="selected-check" style={{ backgroundColor: subject.color }}>
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            Object.keys(groupedSubjects).sort().map(category => (
              <div key={category} className="category-section">
                <h3 className="category-title">{category}</h3>
                <div className="subjects-grid">
                  {groupedSubjects[category].map(subject => {
                    const isSelected = selectedSubjects.some(s => s.id === subject.id);
                    return (
                      <div
                        key={subject.id}
                        className={`subject-card ${isSelected ? 'selected' : ''}`}
                        style={{ borderColor: subject.color }}
                        onClick={() => handleSubjectToggle(subject)}
                      >
                        <div className="subject-icon" style={{ backgroundColor: subject.bgColor, color: subject.color }}>
                          {subject.icon}
                        </div>
                        <div className="subject-info">
                          <h4>{subject.name}</h4>
                          <span className="subject-category">{subject.category}</span>
                        </div>
                        {isSelected && (
                          <div className="selected-check" style={{ backgroundColor: subject.color }}>
                            ✓
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="selection-footer">
          <div className="footer-left">
            <button className="skip-btn" onClick={handleSkip}>
              Skip for now
            </button>
          </div>
          <div className="footer-right">
            <button 
              className={`continue-btn ${selectedSubjects.length === 0 ? 'disabled' : ''}`}
              onClick={handleConfirmSubjects}
              disabled={selectedSubjects.length === 0}
            >
              <span>Continue to Dashboard</span>
              <span className="continue-arrow">→</span>
            </button>
            <p className="helper-text">
              You can always add more subjects later
            </p>
          </div>
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
        </div>
      </div>
    </div>
  );
};

export default TutorSubjectSelection;