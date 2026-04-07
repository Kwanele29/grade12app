import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TutorSubjectSelection.css';

const TutorSubjectSelection = () => {
  const navigate = useNavigate();
  const [selectedSubjects, setSelectedSubjects] = useState([]);
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

  const handleSubjectToggle = (subject) => {
    setSelectedSubjects(prev => {
      const isSelected = prev.some(s => s.id === subject.id);
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
        </div>
      </div>
    </div>
  );
};

export default TutorSubjectSelection;