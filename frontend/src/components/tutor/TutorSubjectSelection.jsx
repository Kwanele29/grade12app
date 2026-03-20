import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TutorSubjectSelection.css';

const TutorSubjectSelection = () => {
  const navigate = useNavigate();
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Complete Grade 12 subjects available for tutoring
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

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    console.log('TutorSubjectSelection - Checking user:', userData);
    
    if (!userData || !token) {
      console.log('No user data or token, redirecting to login');
      navigate('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      console.log('Parsed user:', parsedUser);
      
      if (parsedUser.category !== 'tutor') {
        console.log('User is not a tutor, redirecting to login');
        navigate('/login');
        return;
      }
      
      setUser(parsedUser);
      
      // IMPORTANT: Check if tutor has ALREADY selected subjects
      const savedSubjects = localStorage.getItem(`tutor_subjects_${parsedUser.id}`);
      console.log('Saved subjects check:', savedSubjects);
      
      // Only redirect if they have NON-EMPTY subjects
      if (savedSubjects && savedSubjects !== '[]' && savedSubjects !== 'null' && savedSubjects !== 'undefined') {
        console.log('Tutor already has subjects, redirecting to dashboard');
        navigate('/tutor-dashboard');
        return;
      }
      
      console.log('First time tutor or no subjects saved, showing selection page');
      setLoading(false);
      
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

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
      alert('Please select at least one subject you specialize in');
      return;
    }

    console.log('Saving subjects for tutor:', user.id, selectedSubjects);
    
    // Save selected subjects to localStorage
    const subjectsString = JSON.stringify(selectedSubjects);
    localStorage.setItem(`tutor_subjects_${user.id}`, subjectsString);
    
    // Verify it was saved
    const check = localStorage.getItem(`tutor_subjects_${user.id}`);
    console.log('Verified saved subjects:', check);
    
    // Navigate to the tutor dashboard
    console.log('Redirecting to tutor dashboard');
    navigate('/tutor-dashboard');
  };

  const handleSkip = () => {
    console.log('Tutor skipped subject selection');
    // Save empty array so they won't be asked again
    localStorage.setItem(`tutor_subjects_${user.id}`, JSON.stringify([]));
    navigate('/tutor-dashboard');
  };

  // Group subjects by category
  const groupedSubjects = availableSubjects.reduce((acc, subject) => {
    if (!acc[subject.category]) {
      acc[subject.category] = [];
    }
    acc[subject.category].push(subject);
    return acc;
  }, {});

  // Filter subjects based on search
  const filteredSubjects = searchTerm
    ? availableSubjects.filter(subject => 
        subject.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : availableSubjects;

  if (loading) {
    return <div className="tutor-subject-loading">Loading...</div>;
  }

  return (
    <div className="tutor-subject-selection">
      <div className="selection-container">
        {/* Header */}
        <div className="selection-header">
          <div className="header-icon">👨‍🏫</div>
          <h1>Welcome, {user?.firstName || 'Tutor'}!</h1>
          <p className="header-subtitle">Let's set up your tutoring profile</p>
          <p className="header-description">
            Select the subjects you specialize in. This will help students find you 
            and personalize your tutoring experience.
          </p>
        </div>

        {/* Search Bar */}
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

        {/* Subjects Grid */}
        <div className="subjects-scroll-container">
          {searchTerm ? (
            // Search Results
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
            // Grouped by Category
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

        {/* Footer with Action Buttons */}
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