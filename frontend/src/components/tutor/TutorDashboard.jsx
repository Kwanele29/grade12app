import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TutorDashboard.css';

const TutorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjectStats, setSubjectStats] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    subjectId: '',
    timeLimitMinutes: 30,
    difficulty: 'Medium',
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 0,
    marks: 1
  });

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
        const subjects = JSON.parse(savedSubjects);
        setSelectedSubjects(subjects);
      }
      
      fetchStudentsBySubjects(parsedUser.id, token);
      fetchTutorQuizzes(parsedUser.id, token);
      loadMockSchedule(parsedUser, savedSubjects ? JSON.parse(savedSubjects) : []);
      
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchStudentsBySubjects = async (tutorId, token) => {
    try {
      setDebugInfo('Fetching students...');
      const response = await fetch(`http://localhost:8080/api/quizzes/tutor/${tutorId}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Students fetched:', data);
        setStudents(data);
        
        const stats = {};
        data.forEach(student => {
          const key = student.subjectId;
          if (!stats[key]) {
            stats[key] = {
              subjectId: student.subjectId,
              subjectName: student.subjectName,
              subjectIcon: student.subjectIcon,
              subjectColor: student.subjectColor,
              count: 0
            };
          }
          stats[key].count++;
        });
        
        setSubjectStats(Object.values(stats));
        
        if (data.length === 0) {
          setDebugInfo('No students found. Make sure students have registered and selected subjects.');
        } else {
          setDebugInfo(`Found ${data.length} students`);
        }
      } else {
        const errorText = await response.text();
        setDebugInfo(`Failed to fetch students: ${errorText}`);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setDebugInfo(`Error: ${error.message}`);
    }
  };

  const fetchTutorQuizzes = async (tutorId, token) => {
    try {
      const response = await fetch(`http://localhost:8080/api/quizzes/tutor/${tutorId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setQuizzes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const loadMockSchedule = (user, subjects) => {
    if (subjects.length > 0) {
      const mockSchedule = [
        { id: 1, time: '09:00 - 10:30', subject: subjects[0]?.name || 'Mathematics', type: 'Group Session', students: '8 students', color: subjects[0]?.color || '#3b82f6' },
        { id: 2, time: '11:00 - 12:30', subject: subjects[1]?.name || 'Physical Science', type: '1-on-1', students: 'Lerato Ndlovu', color: subjects[1]?.color || '#10b981' },
      ].filter(item => item.subject);
      setSchedule(mockSchedule);
    }
  };

  // Debug function to check all student-subject relationships
  const checkAllStudentSubjects = async () => {
    const token = localStorage.getItem('token');
    try {
      setDebugInfo('Checking database...');
      const response = await fetch('http://localhost:8080/api/quizzes/debug/student-subjects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('All student-subject relationships:', data);
        alert(`Found ${data.length} student-subject relationships. Check console for details.`);
        setDebugInfo(`Found ${data.length} student-subject entries`);
        
        // Refresh students list
        if (user) {
          fetchStudentsBySubjects(user.id, token);
        }
      } else {
        alert('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    navigate('/');
  };

  const confirmLogout = () => setShowLogoutConfirm(true);
  const cancelLogout = () => setShowLogoutConfirm(false);

  const handleQuizFormChange = (e) => {
    const { name, value } = e.target;
    setQuizForm(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion(prev => ({ ...prev, [name]: value }));
  };

  const addQuestion = () => {
    if (!currentQuestion.question || !currentQuestion.optionA || !currentQuestion.optionB) {
      alert('Please fill in at least the question and first two options');
      return;
    }

    setQuizForm(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion, id: Date.now() }]
    }));

    setCurrentQuestion({
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 0,
      marks: 1
    });
  };

  const removeQuestion = (questionId) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const submitQuiz = async () => {
    if (!quizForm.title || !quizForm.subjectId || quizForm.questions.length === 0) {
      alert('Please fill in all required fields and add at least one question');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      const quizData = {
        title: quizForm.title,
        description: quizForm.description,
        subjectId: parseInt(quizForm.subjectId),
        timeLimitMinutes: parseInt(quizForm.timeLimitMinutes),
        difficulty: quizForm.difficulty,
        questions: quizForm.questions.map(q => ({
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC || '',
          optionD: q.optionD || '',
          correctOption: parseInt(q.correctOption),
          marks: parseInt(q.marks)
        }))
      };

      const response = await fetch('http://localhost:8080/api/quizzes/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizData)
      });

      if (response.ok) {
        setSuccessMessage('Quiz uploaded successfully!');
        setShowSuccessMessage(true);
        setShowQuizModal(false);
        setQuizForm({
          title: '',
          description: '',
          subjectId: '',
          timeLimitMinutes: 30,
          difficulty: 'Medium',
          questions: []
        });
        
        if (user) {
          await fetchTutorQuizzes(user.id, token);
        }
        
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } else {
        const errorText = await response.text();
        alert('Failed to upload quiz: ' + errorText);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return null;

  return (
    <div className="tutor-dashboard-pro">
      {showSuccessMessage && (
        <div className="success-toast">
          <span className="success-icon">✅</span> {successMessage}
        </div>
      )}

      {showQuizModal && (
        <div className="quiz-modal-overlay">
          <div className="quiz-modal">
            <div className="quiz-modal-header">
              <h2>Create New Quiz</h2>
              <button className="close-modal-btn" onClick={() => setShowQuizModal(false)}>×</button>
            </div>
            
            <div className="quiz-modal-body">
              <div className="quiz-form-section">
                <h3>Quiz Details</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Quiz Title *</label>
                    <input type="text" name="title" value={quizForm.title} onChange={handleQuizFormChange} />
                  </div>
                  
                  <div className="form-group">
                    <label>Subject *</label>
                    <select name="subjectId" value={quizForm.subjectId} onChange={handleQuizFormChange}>
                      <option value="">Select Subject</option>
                      {selectedSubjects.map(subject => (
                        <option key={subject.id} value={subject.id}>{subject.icon} {subject.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Time Limit (minutes)</label>
                    <input type="number" name="timeLimitMinutes" value={quizForm.timeLimitMinutes} onChange={handleQuizFormChange} />
                  </div>
                  
                  <div className="form-group">
                    <label>Difficulty</label>
                    <select name="difficulty" value={quizForm.difficulty} onChange={handleQuizFormChange}>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea name="description" value={quizForm.description} onChange={handleQuizFormChange} rows="2" />
                  </div>
                </div>
              </div>

              <div className="quiz-form-section">
                <h3>Add Questions</h3>
                <div className="question-form">
                  <div className="form-group full-width">
                    <label>Question *</label>
                    <input type="text" name="question" value={currentQuestion.question} onChange={handleQuestionChange} />
                  </div>
                  
                  <div className="options-grid">
                    <div className="form-group"><label>Option A *</label><input type="text" name="optionA" value={currentQuestion.optionA} onChange={handleQuestionChange} /></div>
                    <div className="form-group"><label>Option B *</label><input type="text" name="optionB" value={currentQuestion.optionB} onChange={handleQuestionChange} /></div>
                    <div className="form-group"><label>Option C</label><input type="text" name="optionC" value={currentQuestion.optionC} onChange={handleQuestionChange} /></div>
                    <div className="form-group"><label>Option D</label><input type="text" name="optionD" value={currentQuestion.optionD} onChange={handleQuestionChange} /></div>
                  </div>
                  
                  <div className="options-row">
                    <div className="form-group">
                      <label>Correct Option</label>
                      <select name="correctOption" value={currentQuestion.correctOption} onChange={handleQuestionChange}>
                        <option value={0}>A</option>
                        <option value={1}>B</option>
                        <option value={2}>C</option>
                        <option value={3}>D</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Marks</label>
                      <input type="number" name="marks" value={currentQuestion.marks} onChange={handleQuestionChange} />
                    </div>
                    <button className="add-question-btn" onClick={addQuestion}>+ Add Question</button>
                  </div>
                </div>

                {quizForm.questions.length > 0 && (
                  <div className="questions-list">
                    <h4>Questions Added ({quizForm.questions.length})</h4>
                    {quizForm.questions.map((q, index) => (
                      <div key={q.id} className="question-item">
                        <div className="question-number">Q{index + 1}</div>
                        <div className="question-preview">
                          <p>{q.question}</p>
                        </div>
                        <div className="question-actions">
                          <span className="question-marks">{q.marks} mark{q.marks > 1 ? 's' : ''}</span>
                          <button className="remove-question-btn" onClick={() => removeQuestion(q.id)}>×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="quiz-modal-footer">
              <button className="cancel-btn" onClick={() => setShowQuizModal(false)}>Cancel</button>
              <button className="submit-quiz-btn" onClick={submitQuiz} disabled={quizForm.questions.length === 0 || isSubmitting}>
                {isSubmitting ? 'Uploading...' : 'Upload Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <div className="logout-modal-icon">🚪</div>
            <h3>Sign Out</h3>
            <p>Are you sure you want to sign out?</p>
            <div className="logout-modal-actions">
              <button className="logout-modal-cancel" onClick={cancelLogout}>Cancel</button>
              <button className="logout-modal-confirm" onClick={handleLogout}>Sign Out</button>
            </div>
          </div>
        </div>
      )}

      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo-area">
            <span className="logo-icon">📚</span>
            <span className="logo-text">Grade<span>12</span>Central</span>
          </div>
          <span className="role-indicator tutor">Tutor</span>
        </div>
        <div className="header-right">
          <div className="subject-indicators">
            {selectedSubjects.map(subject => (
              <span key={subject.id} className="subject-indicator" style={{ backgroundColor: subject.bgColor, color: subject.color }}>
                {subject.icon} {subject.name}
              </span>
            ))}
          </div>
          <div className="user-menu">
            <div className="user-avatar" style={{ backgroundColor: selectedSubjects[0]?.color || '#48bb78' }}>
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="user-details">
              <span className="user-fullname">{user.firstName} {user.lastName}</span>
              <span className="user-role">Tutor</span>
            </div>
            <button onClick={confirmLogout} className="signout-button-enhanced">
              <span className="signout-icon">🚪</span> <span className="signout-text">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-banner">
          <div className="banner-content">
            <h1>Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, {user.firstName}! 👋</h1>
            <p>Here's what's happening with your {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} today.</p>
          </div>
          <div className="banner-stats">
            <div className="banner-stat"><span className="stat-number">{students.length}</span><span className="stat-label">Students</span></div>
            <div className="banner-stat"><span className="stat-number">{quizzes.length}</span><span className="stat-label">Quizzes</span></div>
          </div>
        </div>

        <div className="dashboard-tabs">
          <button className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`tab-button ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>My Students</button>
          <button className={`tab-button ${activeTab === 'quizzes' ? 'active' : ''}`} onClick={() => setActiveTab('quizzes')}>My Quizzes</button>
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <>
              <section className="content-section">
                <h2>Students by Subject</h2>
                {subjectStats.length === 0 ? (
                  <div className="empty-state small">
                    <p>No students enrolled yet. Students will appear here when they register and select subjects.</p>
                  </div>
                ) : (
                  <div className="subject-stats-grid">
                    {subjectStats.map(stat => (
                      <div key={stat.subjectId} className="subject-stat-card" style={{ borderLeftColor: stat.subjectColor }}>
                        <div className="subject-stat-icon" style={{ backgroundColor: `${stat.subjectColor}20`, color: stat.subjectColor }}>
                          {stat.subjectIcon}
                        </div>
                        <div className="subject-stat-info">
                          <h3>{stat.subjectName}</h3>
                          <div className="student-count">
                            <span className="count-number">{stat.count}</span>
                            <span className="count-label">Student{stat.count !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="content-section">
                <h2>Quick Actions</h2>
                <div className="quick-actions-grid">
                  <div className="quick-action-card" onClick={() => setShowQuizModal(true)}>
                    <div className="quick-action-icon" style={{ background: '#667eea20', color: '#667eea' }}>📝</div>
                    <h3>Create Quiz</h3>
                    <p>Design a new quiz</p>
                  </div>
                  <div className="quick-action-card" onClick={() => setActiveTab('students')}>
                    <div className="quick-action-icon" style={{ background: '#ec489920', color: '#ec4899' }}>👥</div>
                    <h3>View Students</h3>
                    <p>Check all {students.length} student{students.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </section>

              <section className="content-section">
                <h2>Today's Schedule</h2>
                <div className="schedule-grid">
                  {schedule.map(item => (
                    <div key={item.id} className="schedule-card" style={{ borderLeftColor: item.color }}>
                      <div className="schedule-card-time">{item.time}</div>
                      <div className="schedule-card-content">
                        <h3>{item.subject}</h3>
                        <p>{item.type} • {item.students}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === 'students' && (
            <section className="content-section full-width">
              <div className="section-header">
                <h2>My Students</h2>
                <div className="total-students-badge">
                  Total: {students.length} Student{students.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              {students.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👥</div>
                  <h3>No Students Yet</h3>
                  <p>Students who register and select subjects will appear here.</p>
                  <button className="empty-state-btn" onClick={checkAllStudentSubjects}>
                    Check Database
                  </button>
                </div>
              ) : (
                <div className="students-table-container">
                  <table className="students-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Subject</th>
                        <th>Progress</th>
                        <th>Grade</th>
                        <th>Last Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(student => (
                        <tr key={student.studentId}>
                          <td>
                            <div className="student-info-cell">
                              <div className="student-avatar-small" style={{ backgroundColor: student.subjectColor + '20', color: student.subjectColor }}>
                                {student.studentName.charAt(0)}
                              </div>
                              <div>
                                <div className="student-name">{student.studentName}</div>
                                <div className="student-email">{student.studentEmail}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="subject-tag-small" style={{ backgroundColor: student.subjectColor + '20', color: student.subjectColor }}>
                              {student.subjectIcon} {student.subjectName}
                            </span>
                          </td>
                          <td>
                            <div className="progress-cell">
                              <div className="progress-bar-small">
                                <div className="progress-fill-small" style={{ width: `${student.progress || 0}%`, backgroundColor: student.subjectColor }}></div>
                              </div>
                              <span>{student.progress || 0}%</span>
                            </div>
                          </td>
                          <td>
                            <span className={`grade-badge ${(student.grade || 'na').toLowerCase()}`}>
                              {student.grade || 'N/A'}
                            </span>
                          </td>
                          <td>{student.lastActive || 'Recently'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activeTab === 'quizzes' && (
            <section className="content-section full-width">
              <div className="section-header">
                <h2>My Quizzes</h2>
                <button className="create-quiz-btn" onClick={() => setShowQuizModal(true)}><span>+</span> Create New Quiz</button>
              </div>
              
              {quizzes.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>No Quizzes Yet</h3>
                  <p>Create your first quiz to help your students practice</p>
                  <button className="empty-state-btn" onClick={() => setShowQuizModal(true)}>Create Quiz</button>
                </div>
              ) : (
                <div className="quizzes-grid">
                  {quizzes.map(quiz => {
                    const subject = selectedSubjects.find(s => s.id === quiz.subject?.id) || 
                                   { name: 'Unknown', icon: '📚', color: '#667eea', bgColor: '#667eea20' };
                    return (
                      <div key={quiz.id} className="quiz-card">
                        <div className="quiz-card-header" style={{ borderLeftColor: subject.color }}>
                          <div className="quiz-subject-icon" style={{ background: subject.bgColor, color: subject.color }}>{subject.icon}</div>
                          <div className="quiz-header-content">
                            <h3>{quiz.title}</h3>
                            <p className="quiz-description">{quiz.description || ''}</p>
                          </div>
                        </div>
                        <div className="quiz-card-body">
                          <div className="quiz-meta">
                            <div className="quiz-meta-item"><span className="meta-label">Questions</span><span className="meta-value">{quiz.totalQuestions || 0}</span></div>
                            <div className="quiz-meta-item"><span className="meta-label">Time</span><span className="meta-value">{quiz.timeLimitMinutes || 30} min</span></div>
                            <div className="quiz-meta-item"><span className="meta-label">Difficulty</span><span className={`difficulty-badge ${(quiz.difficulty || 'medium').toLowerCase()}`}>{quiz.difficulty || 'Medium'}</span></div>
                          </div>
                          <div className="quiz-stats">
                            <div className="stat"><span className="stat-label">Marks</span><span className="stat-value">{quiz.totalMarks || 0}</span></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: '#1e293b', color: 'white', padding: '10px', borderRadius: '5px', fontSize: '12px', zIndex: 9999, maxWidth: '300px' }}>
        <strong>Debug:</strong> {debugInfo}<br/>
        <button onClick={checkAllStudentSubjects} style={{ marginTop: '5px', padding: '4px 8px', fontSize: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
          Check Student-Subject Relations
        </button>
      </div>
    </div>
  );
};

export default TutorDashboard;