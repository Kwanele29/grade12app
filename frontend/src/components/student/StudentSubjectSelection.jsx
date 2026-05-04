// src/components/student/StudentSubjectSelection.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './StudentSubjectSelection.css'; // reuse your existing CSS (or adapt from tutor)

const StudentSubjectSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isEditMode = queryParams.get('edit') === 'true';

  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loadingExisting, setLoadingExisting] = useState(false);

  useEffect(() => {
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

    // Fetch all available subjects
    const fetchSubjects = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/subjects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load subjects');
        const data = await res.json();
        const formatted = data.map(sub => ({
          id: sub.id,
          name: sub.name,
          icon: sub.iconUrl || '📚',
          color: sub.color || '#3b82f6',
          bgColor: sub.bgColor || '#eff6ff',
          description: sub.description || 'Click to select this subject'
        }));
        setAvailableSubjects(formatted);
      } catch (err) {
        console.error(err);
        setError('Could not load subjects. Please refresh.');
      } finally {
        setFetching(false);
      }
    };

    // Fetch student's existing subjects (for edit mode)
    const fetchExistingSubjects = async () => {
      if (!isEditMode) return;
      setLoadingExisting(true);
      try {
        const res = await fetch(`http://localhost:8080/api/student/subjects/${parsedUser.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const existing = await res.json();
          if (existing && existing.length > 0) {
            // Map backend subject objects to the same format as availableSubjects
            const selected = existing.map(s => ({
              id: s.subject?.id || s.id,
              name: s.subject?.name || s.name,
              icon: s.subject?.iconUrl || '📚',
              color: s.subject?.color || '#3b82f6',
              bgColor: s.subject?.bgColor || '#eff6ff',
              description: s.subject?.description || ''
            }));
            setSelectedSubjects(selected);
          }
        }
      } catch (err) {
        console.error('Error fetching existing subjects', err);
      } finally {
        setLoadingExisting(false);
      }
    };

    fetchSubjects();
    fetchExistingSubjects();
  }, [navigate, isEditMode]);

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
      setError('Please select at least one subject');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    setError('');

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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to save subjects');
      }

      // Save to localStorage for quick reference (optional)
      localStorage.setItem(`student_subjects_${user.id}`, JSON.stringify(selectedSubjects));

      // After save, go back to dashboard
      navigate('/student-dashboard');
    } catch (err) {
      console.error('Error saving subjects:', err);
      setError(err.message || 'Failed to save subjects. Please try again.');
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

  const handleBack = () => {
    navigate('/student-dashboard');
  };

  if (fetching || loadingExisting) {
    return <div className="loading">Loading subjects...</div>;
  }

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="subject-selection-wrapper">
      <div className="selection-card">
        <div className="selection-header-nav">
          <button onClick={handleBack} className="back-btn">
            ← Back
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>

        <div className="selection-header">
          <div className="header-icon">👨‍🎓</div>
          <h1>{isEditMode ? 'Update Your Subjects' : 'Welcome, ' + user.firstName + '!'}</h1>
          <p>{isEditMode ? 'Modify the subjects you want to study' : 'Select the subjects you will be studying'}</p>
          <div className="header-subtitle">
            Choose the subjects you want to focus on (you can select as many as you like)
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="subjects-container">
          {availableSubjects.length === 0 ? (
            <div className="no-subjects">No subjects available. Please contact admin.</div>
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
            {loading ? 'Saving...' : (isEditMode ? 'Update Subjects' : 'Continue to Dashboard')}
            <span className="btn-arrow">→</span>
          </button>
        </div>

        <div className="selection-help">
          <p>💡 You can always change your subjects later from the dashboard</p>
        </div>
      </div>
    </div>
  );
};

export default StudentSubjectSelection;