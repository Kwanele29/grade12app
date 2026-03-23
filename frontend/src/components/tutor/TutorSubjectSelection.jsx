// TutorSubjectSelection.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TutorSubjectSelection.css';

const TutorSubjectSelection = () => {
  const navigate = useNavigate();
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Available subjects for tutoring with enhanced data
  const availableSubjects = [
    { id: 1, name: 'Mathematics', icon: '📐', color: '#3b82f6', bgColor: '#eff6ff', description: 'Algebra, Calculus, Geometry' },
    { id: 2, name: 'Physical Science', icon: '⚛️', color: '#10b981', bgColor: '#f0fdf4', description: 'Physics & Chemistry' },
    { id: 3, name: 'English', icon: '📝', color: '#f59e0b', bgColor: '#fffbeb', description: 'Literature & Language' },
    { id: 4, name: 'Mathematical Literacy', icon: '📊', color: '#8b5cf6', bgColor: '#f5f3ff', description: 'Practical Mathematics' },
    { id: 5, name: 'Life Sciences', icon: '🧬', color: '#ec4899', bgColor: '#fdf2f8', description: 'Biology & Life Processes' },
    { id: 6, name: 'Geography', icon: '🌍', color: '#14b8a6', bgColor: '#f0fdfa', description: 'Physical & Human Geography' },
    { id: 7, name: 'History', icon: '📜', color: '#f97316', bgColor: '#fff7ed', description: 'World & South African History' },
    { id: 8, name: 'Accounting', icon: '💰', color: '#6b7280', bgColor: '#f3f4f6', description: 'Financial Accounting' },
    { id: 9, name: 'Business Studies', icon: '💼', color: '#84cc16', bgColor: '#f7fee7', description: 'Business Management' },
    { id: 10, name: 'Economics', icon: '📈', color: '#06b6d4', bgColor: '#ecfeff', description: 'Micro & Macroeconomics' },
    { id: 11, name: 'Tourism', icon: '✈️', color: '#d946ef', bgColor: '#fdf4ff', description: 'Travel & Tourism Industry' },
    { id: 12, name: 'Computer Applications', icon: '💻', color: '#4f46e5', bgColor: '#eef2ff', description: 'CAT & IT' },
  ];

  useEffect(() => {
    // Get user data from localStorage
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
      
      // Check if tutor already has selected subjects
      const savedSubjects = localStorage.getItem(`tutor_subjects_${parsedUser.id}`);
      if (savedSubjects) {
        // If subjects exist, go directly to dashboard
        navigate('/tutor-dashboard');
      }
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
        // Limit to 3 subjects max
        if (prev.length >= 3) {
          alert('You can select a maximum of 3 subjects');
          return prev;
        }
        return [...prev, subject];
      }
    });
  };

  const handleContinue = async () => {
    if (selectedSubjects.length === 0) {
      alert('Please select at least one subject to continue');
      return;
    }

    setLoading(true);
    
    try {
      // Save selected subjects to localStorage
      localStorage.setItem(`tutor_subjects_${user.id}`, JSON.stringify(selectedSubjects));
      
      // Navigate to tutor dashboard
      navigate('/tutor-dashboard');
    } catch (error) {
      console.error('Error saving subjects:', error);
      alert('Failed to save subjects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
  navigate('/');

  };

  const handleLogout = () => {
  if (window.confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  }
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="subject-selection-wrapper">
      <div className="selection-card">
        {/* Header with navigation */}
        <div className="selection-header-nav">
          <button onClick={handleBackToHome} className="back-home-btn">
            <span className="back-icon"></span>
            Back to Home
          </button>
          <button onClick={handleLogout} className="logout-btn">
            <span className="logout-icon"></span>
            Logout
          </button>
        </div>

        <div className="selection-header">
          <div className="header-icon"></div>
          <h1>Welcome, {user.firstName}!</h1>
          <p>Select the subjects you'll be tutoring</p>
          <div className="header-subtitle">
            Choose up to 3 subjects to get started with your tutoring journey
          </div>
        </div>

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
            <strong>{selectedSubjects.length}</strong> / 3 subjects selected
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

        {/* Help text */}
        <div className="selection-help">
          <p>💡 You can always change your subjects later in settings</p>
        </div>
      </div>
    </div>
  );
};

export default TutorSubjectSelection;