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

  // ALL SUBJECTS MATCHING YOUR DATABASE EXACTLY
  const availableSubjects = [
    { id: 1, name: 'Mathematics', icon: '📐', color: '#3b82f6', bgColor: '#eff6ff', category: 'Core' },
    { id: 2, name: 'Mathematical Literacy', icon: '🧮', color: '#f97316', bgColor: '#fff7ed', category: 'Core' },
    { id: 3, name: 'Physical Science', icon: '⚛️', color: '#10b981', bgColor: '#f0fdf4', category: 'Core' },
    { id: 4, name: 'English', icon: '📝', color: '#f59e0b', bgColor: '#fef3c7', category: 'Core' },
    { id: 5, name: 'Tourism', icon: '✈️', color: '#06b6d4', bgColor: '#e0f2fe', category: 'Consumer Studies' },
    { id: 6, name: 'Life Sciences', icon: '🧬', color: '#8b5cf6', bgColor: '#f5f3ff', category: 'Core' },
    { id: 7, name: 'Geography', icon: '🌍', color: '#ec4899', bgColor: '#fdf2f8', category: 'Humanities' },
    { id: 19, name: 'Consumer Studies', icon: '🛍️', color: '#d946ef', bgColor: '#fae8ff', category: 'Consumer Studies' },
    { id: 20, name: 'Hospitality Studies', icon: '🍽️', color: '#f97316', bgColor: '#fff7ed', category: 'Consumer Studies' },
    { id: 21, name: 'Visual Arts', icon: '🎨', color: '#a855f7', bgColor: '#f3e8ff', category: 'Arts' },
    { id: 22, name: 'Dramatic Arts', icon: '🎭', color: '#ec4899', bgColor: '#fdf2f8', category: 'Arts' },
    { id: 23, name: 'Music', icon: '🎵', color: '#f59e0b', bgColor: '#fef3c7', category: 'Arts' },
    { id: 24, name: 'Agricultural Sciences', icon: '🌾', color: '#84cc16', bgColor: '#fefce8', category: 'Sciences' },
    { id: 25, name: 'Technical Sciences', icon: '🔧', color: '#0ea5e9', bgColor: '#f0f9ff', category: 'Sciences' }
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
      const savedSubjects = localStorage.getItem(`student_subjects_${parsedUser.id}`);
      if (savedSubjects) {
        const subjects = JSON.parse(savedSubjects);
        if (subjects && subjects.length > 0) {
          navigate('/student-dashboard');
          return;
        }
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    } finally {
      setLoading(false);
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
        alert(`Successfully selected ${selectedSubjects.length} subjects!`);
        navigate('/student-dashboard');
      } else {
        const error = await response.text();
        alert('Failed to save subjects: ' + error);
      }
    } catch (error) {
      console.error('Error saving subjects:', error);
      alert('Error saving subjects: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    navigate('/student-dashboard');
  };

  // Group subjects by category
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
    : [];

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="student-subject-selection">
      <div className="selection-container">
        <div className="selection-header">
          <div className="header-icon">👨‍🎓</div>
          <h1>Welcome, {user?.firstName || 'Student'}!</h1>
          <p>Select the subjects you'll be studying (you can select multiple)</p>
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
            {saving ? 'Saving...' : `Confirm ${selectedSubjects.length} Subject${selectedSubjects.length !== 1 ? 's' : ''} →`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentSubjectSelection;