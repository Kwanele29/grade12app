import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentSubjectSelection.css';

const StudentSubjectSelection = () => {
  const navigate = useNavigate();
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [user, setUser] = useState(null);
  
  // Complete Grade 12 subjects for students
  const availableSubjects = [
    // Core Subjects
    { id: 1, name: 'Mathematics', icon: '📐', color: '#3b82f6', bgColor: '#eff6ff' },
    { id: 2, name: 'Mathematical Literacy', icon: '🧮', color: '#f97316', bgColor: '#fff7ed' },
    { id: 3, name: 'Physical Science', icon: '⚛️', color: '#10b981', bgColor: '#f0fdf4' },
    { id: 4, name: 'Life Sciences', icon: '🧬', color: '#8b5cf6', bgColor: '#f5f3ff' },
    { id: 5, name: 'English', icon: '📝', color: '#f59e0b', bgColor: '#fef3c7' },
    { id: 6, name: 'Afrikaans', icon: '🇿🇦', color: '#f97316', bgColor: '#fff7ed' },
    { id: 7, name: 'isiZulu', icon: '🦓', color: '#14b8a6', bgColor: '#e0f2fe' },
    { id: 8, name: 'isiXhosa', icon: '🌅', color: '#8b5cf6', bgColor: '#f3e8ff' },
    
    // Humanities
    { id: 9, name: 'Geography', icon: '🌍', color: '#ec4899', bgColor: '#fdf2f8' },
    { id: 10, name: 'History', icon: '📜', color: '#a855f7', bgColor: '#f3e8ff' },
    { id: 11, name: 'Religion Studies', icon: '🕊️', color: '#6b7280', bgColor: '#f3f4f6' },
    
    // Commerce
    { id: 12, name: 'Accounting', icon: '💰', color: '#14b8a6', bgColor: '#e0f2fe' },
    { id: 13, name: 'Business Studies', icon: '💼', color: '#f43f5e', bgColor: '#fce7f3' },
    { id: 14, name: 'Economics', icon: '📊', color: '#f59e0b', bgColor: '#fef3c7' },
    
    // Languages (Additional)
    { id: 15, name: 'Sepedi', icon: '🗣️', color: '#3b82f6', bgColor: '#eff6ff' },
    { id: 16, name: 'Sesotho', icon: '🗣️', color: '#10b981', bgColor: '#f0fdf4' },
    { id: 17, name: 'Setswana', icon: '🗣️', color: '#f97316', bgColor: '#fff7ed' },
    { id: 18, name: 'Xitsonga', icon: '🗣️', color: '#8b5cf6', bgColor: '#f5f3ff' },
    { id: 19, name: 'SiSwati', icon: '🗣️', color: '#ec4899', bgColor: '#fdf2f8' },
    { id: 20, name: 'Tshivenda', icon: '🗣️', color: '#14b8a6', bgColor: '#e0f2fe' },
    { id: 21, name: 'Ndebele', icon: '🗣️', color: '#f59e0b', bgColor: '#fef3c7' },
    
    // Technical/Vocational
    { id: 22, name: 'Agricultural Sciences', icon: '🌾', color: '#10b981', bgColor: '#f0fdf4' },
    { id: 23, name: 'Agricultural Technology', icon: '🚜', color: '#f97316', bgColor: '#fff7ed' },
    { id: 24, name: 'Civil Technology', icon: '🏗️', color: '#6b7280', bgColor: '#f3f4f6' },
    { id: 25, name: 'Electrical Technology', icon: '⚡', color: '#f59e0b', bgColor: '#fef3c7' },
    { id: 26, name: 'Mechanical Technology', icon: '🔧', color: '#3b82f6', bgColor: '#eff6ff' },
    { id: 27, name: 'Engineering Graphics & Design', icon: '📐', color: '#8b5cf6', bgColor: '#f5f3ff' },
    
    // Creative Arts
    { id: 28, name: 'Visual Arts', icon: '🎨', color: '#ec4899', bgColor: '#fdf2f8' },
    { id: 29, name: 'Dramatic Arts', icon: '🎭', color: '#f97316', bgColor: '#fff7ed' },
    { id: 30, name: 'Music', icon: '🎵', color: '#14b8a6', bgColor: '#e0f2fe' },
    
    // Consumer Sciences
    { id: 31, name: 'Consumer Studies', icon: '🛒', color: '#f59e0b', bgColor: '#fef3c7' },
    { id: 32, name: 'Hospitality Studies', icon: '🍳', color: '#10b981', bgColor: '#f0fdf4' },
    { id: 33, name: 'Tourism', icon: '✈️', color: '#06b6d4', bgColor: '#e0f2fe' },
    
    // Computer Science
    { id: 34, name: 'Computer Applications Technology', icon: '💻', color: '#3b82f6', bgColor: '#eff6ff' },
    { id: 35, name: 'Information Technology', icon: '👨‍💻', color: '#8b5cf6', bgColor: '#f5f3ff' },
  ];

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.category !== 'student') {
      navigate('/login');
      return;
    }
    
    setUser(parsedUser);
    
    // Clear any previously selected subjects when coming to this page
    setSelectedSubjects([]);
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
      alert('Please select at least one subject to study');
      return;
    }

    // Save selected subjects to localStorage
    localStorage.setItem(`student_subjects_${user.id}`, JSON.stringify(selectedSubjects));
    
    // Navigate to the student dashboard
    navigate('/student-dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <div className="subject-selection-wrapper student-selection">
      <div className="selection-card">
        {/* Header with Logout */}
        <div className="selection-header-actions">
          <button className="logout-btn-small" onClick={handleLogout}>
            <span className="logout-icon">🚪</span>
            Logout
          </button>
        </div>

        <div className="selection-header">
          <div className="header-icon">👨‍🎓</div>
          <h1>Welcome, {user?.firstName || 'Student'}!</h1>
          <p>Select the subjects you'll be studying to personalize your experience</p>
        </div>

        <div className="subjects-container">
          {availableSubjects.map(subject => {
            const isSelected = selectedSubjects.some(s => s.id === subject.id);
            return (
              <div
                key={subject.id}
                className={`subject-option ${isSelected ? 'selected' : ''}`}
                style={{ 
                  borderColor: subject.color,
                  backgroundColor: isSelected ? subject.bgColor : 'white'
                }}
                onClick={() => handleSubjectToggle(subject)}
              >
                <div className="subject-option-icon" style={{ backgroundColor: subject.bgColor, color: subject.color }}>
                  {subject.icon}
                </div>
                <div className="subject-option-info">
                  <h3>{subject.name}</h3>
                </div>
                {isSelected && (
                  <div className="selected-badge" style={{ backgroundColor: subject.color }}>
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
            className="continue-btn"
            onClick={handleConfirmSubjects}
            disabled={selectedSubjects.length === 0}
          >
            Continue to Dashboard
            <span className="btn-arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentSubjectSelection;