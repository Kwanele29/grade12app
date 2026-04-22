import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentSubjectSelection.css';

const StudentSubjectSelection = () => {
  const navigate = useNavigate();
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  const availableSubjects = [
    { id: 1, name: 'Mathematics', icon: '📐', color: '#3b82f6', bgColor: '#eff6ff', category: 'Core' },
    { id: 2, name: 'Mathematical Literacy', icon: '🧮', color: '#f97316', bgColor: '#fff7ed', category: 'Core' },
    { id: 3, name: 'Physical Science', icon: '⚛️', color: '#10b981', bgColor: '#f0fdf4', category: 'Core' },
    { id: 4, name: 'Life Sciences', icon: '🧬', color: '#8b5cf6', bgColor: '#f5f3ff', category: 'Core' },
    { id: 5, name: 'English', icon: '📝', color: '#f59e0b', bgColor: '#fef3c7', category: 'Core' },
    { id: 6, name: 'Geography', icon: '🌍', color: '#ec4899', bgColor: '#fdf2f8', category: 'Humanities' },
    { id: 7, name: 'History', icon: '📜', color: '#a855f7', bgColor: '#f3e8ff', category: 'Humanities' },
    { id: 8, name: 'Accounting', icon: '💰', color: '#14b8a6', bgColor: '#e0f2fe', category: 'Commerce' },
    { id: 9, name: 'Business Studies', icon: '💼', color: '#f43f5e', bgColor: '#fce7f3', category: 'Commerce' },
    { id: 10, name: 'Tourism', icon: '✈️', color: '#06b6d4', bgColor: '#e0f2fe', category: 'Consumer' },
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.category !== 'student') {
        navigate('/login');
        return;
      }
      
      setUser(parsedUser);
      
      // Check if student already has subjects
      fetchStudentSubjects(parsedUser.id, token);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchStudentSubjects = async (studentId, token) => {
    try {
      const response = await fetch(`http://localhost:8080/api/student/subjects/${studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const existingSubjects = await response.json();
        if (existingSubjects && existingSubjects.length > 0) {
          // Student already has subjects, redirect to dashboard
          navigate('/student-dashboard');
        }
      }
    } catch (error) {
      console.error('Error fetching student subjects:', error);
    }
  };

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

  const handleConfirmSubjects = async () => {
    if (selectedSubjects.length === 0) {
      alert('Please select at least one subject');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:8080/api/student/subjects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: user.id,
          subjectIds: selectedSubjects.map(s => s.id)
        })
      });
      
      if (response.ok) {
        localStorage.setItem(`student_subjects_${user.id}`, JSON.stringify(selectedSubjects));
        navigate('/student-dashboard');
      } else {
        const error = await response.text();
        alert('Failed to save subjects: ' + error);
      }
    } catch (error) {
      console.error('Error saving subjects:', error);
      alert('Error saving subjects');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    navigate('/student-dashboard');
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

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="student-subject-selection">
      <div className="selection-container">
        <div className="selection-header">
          <div className="header-icon">👨‍🎓</div>
          <h1>Welcome, {user?.firstName || 'Student'}!</h1>
          <p>Select the subjects you'll be studying</p>
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
          <button className="skip-btn" onClick={handleSkip}>
            Skip for now
          </button>
          <button 
            className={`continue-btn ${selectedSubjects.length === 0 ? 'disabled' : ''}`}
            onClick={handleConfirmSubjects}
            disabled={selectedSubjects.length === 0 || saving}
          >
            {saving ? 'Saving...' : 'Continue to Dashboard →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentSubjectSelection;