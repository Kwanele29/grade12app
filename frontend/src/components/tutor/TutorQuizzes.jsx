import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TutorQuizzes.css';

const TutorQuizzes = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    timeLimitMinutes: 30,
    difficulty: 'medium',
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const API_BASE_URL = 'http://localhost:8080/api';

  // Load user data
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
      fetchTutorQuizzes(parsedUser.id);
      fetchSubjects();
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

  // Fetch quizzes created by this tutor
  const fetchTutorQuizzes = async (tutorId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/quizzes/tutor/quizzes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch subjects list
  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/subjects`);
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle question input changes
  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion(prev => ({ ...prev, [name]: value }));
  };

  // Add question to the quiz
  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      setError('Question text is required');
      return;
    }
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion }]
    }));
    // Reset question form
    setCurrentQuestion({
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 0,
      marks: 1
    });
    setError('');
  };

  // Remove question
  const removeQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  // Create or update quiz
  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Quiz title is required');
      return;
    }
    if (!formData.subjectId) {
      setError('Please select a subject');
      return;
    }
    if (formData.questions.length === 0) {
      setError('Please add at least one question');
      return;
    }

    setUploading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        subjectId: parseInt(formData.subjectId),
        timeLimitMinutes: parseInt(formData.timeLimitMinutes),
        difficulty: formData.difficulty,
        questions: formData.questions.map(q => ({
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctOption: parseInt(q.correctOption),
          marks: parseInt(q.marks)
        }))
      };

      if (editingQuiz) {
        // Update existing quiz (you may need a PUT endpoint)
        await axios.put(`${API_BASE_URL}/quizzes/${editingQuiz.id}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setSuccess('Quiz updated successfully!');
      } else {
        // Create new quiz
        await axios.post(`${API_BASE_URL}/quizzes/upload`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setSuccess('Quiz created successfully!');
      }

      // Reset form and refresh list
      setFormData({
        title: '',
        description: '',
        subjectId: '',
        timeLimitMinutes: 30,
        difficulty: 'medium',
        questions: []
      });
      setEditingQuiz(null);
      setShowCreateForm(false);
      fetchTutorQuizzes(user.id);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save quiz');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploading(false);
    }
  };

  // Delete quiz
  const deleteQuiz = async (quizId) => {
    try {
      await axios.delete(`${API_BASE_URL}/quizzes/${quizId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Quiz deleted');
      fetchTutorQuizzes(user.id);
      setShowDeleteConfirm(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete quiz');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Edit quiz – populate form with existing data
  const editQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description || '',
      subjectId: quiz.subject?.id?.toString() || '',
      timeLimitMinutes: quiz.timeLimitMinutes || 30,
      difficulty: quiz.difficulty || 'medium',
      questions: quiz.questions?.map(q => ({
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctOption: q.correctOption,
        marks: q.marks
      })) || []
    });
    setShowCreateForm(true);
  };

  const handleBackToDashboard = () => {
    navigate('/tutor-dashboard');
  };

  if (loading) {
    return <div className="loading-container">Loading your quizzes...</div>;
  }

  return (
    <div className="quizzes-container">
      <div className="quizzes-card">
        <div className="quizzes-header">
          <button onClick={handleBackToDashboard} className="back-btn">
            ← Back to Dashboard
          </button>
          <h1>My Quizzes</h1>
          {!showCreateForm && (
            <button onClick={() => setShowCreateForm(true)} className="create-quiz-btn">
              + Create New Quiz
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {showCreateForm ? (
          <div className="create-quiz-form">
            <h3>{editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}</h3>
            <form onSubmit={handleSubmitQuiz}>
              <div className="form-group">
                <label>Quiz Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Subject *</label>
                  <select
                    name="subjectId"
                    value={formData.subjectId}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Time Limit (minutes)</label>
                  <input
                    type="number"
                    name="timeLimitMinutes"
                    value={formData.timeLimitMinutes}
                    onChange={handleFormChange}
                    min="1"
                    max="180"
                  />
                </div>
                <div className="form-group">
                  <label>Difficulty</label>
                  <select name="difficulty" value={formData.difficulty} onChange={handleFormChange}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="questions-section">
                <h4>Questions ({formData.questions.length})</h4>
                <div className="add-question-panel">
                  <div className="form-group">
                    <label>Question Text</label>
                    <textarea
                      name="question"
                      value={currentQuestion.question}
                      onChange={handleQuestionChange}
                      rows="2"
                    />
                  </div>
                  <div className="options-row">
                    <input type="text" name="optionA" placeholder="Option A" value={currentQuestion.optionA} onChange={handleQuestionChange} />
                    <input type="text" name="optionB" placeholder="Option B" value={currentQuestion.optionB} onChange={handleQuestionChange} />
                    <input type="text" name="optionC" placeholder="Option C" value={currentQuestion.optionC} onChange={handleQuestionChange} />
                    <input type="text" name="optionD" placeholder="Option D" value={currentQuestion.optionD} onChange={handleQuestionChange} />
                  </div>
                  <div className="options-row">
                    <select name="correctOption" value={currentQuestion.correctOption} onChange={handleQuestionChange}>
                      <option value="0">Correct: A</option>
                      <option value="1">Correct: B</option>
                      <option value="2">Correct: C</option>
                      <option value="3">Correct: D</option>
                    </select>
                    <input type="number" name="marks" placeholder="Marks" value={currentQuestion.marks} onChange={handleQuestionChange} min="1" />
                    <button type="button" onClick={addQuestion} className="add-question-btn">+ Add</button>
                  </div>
                </div>

                {formData.questions.length > 0 && (
                  <div className="questions-list">
                    {formData.questions.map((q, idx) => (
                      <div key={idx} className="question-item">
                        <span className="question-number">Q{idx+1}</span>
                        <div className="question-preview">
                          <p>{q.question}</p>
                          <small>Options: A) {q.optionA}, B) {q.optionB}, C) {q.optionC}, D) {q.optionD}</small>
                          <small>Correct: {String.fromCharCode(65 + q.correctOption)} | Marks: {q.marks}</small>
                        </div>
                        <button type="button" onClick={() => removeQuestion(idx)} className="remove-question-btn">✖</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => { setShowCreateForm(false); setEditingQuiz(null); }} className="cancel-btn">Cancel</button>
                <button type="submit" disabled={uploading} className="submit-quiz-btn">
                  {uploading ? 'Saving...' : (editingQuiz ? 'Update Quiz' : 'Create Quiz')}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="quizzes-list">
            {quizzes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <p>You haven't created any quizzes yet.</p>
                <button onClick={() => setShowCreateForm(true)} className="empty-create-btn">
                  Create Your First Quiz
                </button>
              </div>
            ) : (
              <div className="quizzes-grid">
                {quizzes.map(quiz => (
                  <div key={quiz.id} className="quiz-card">
                    <div className="quiz-header">
                      <h3>{quiz.title}</h3>
                      <span className={`status ${quiz.status?.toLowerCase() || 'published'}`}>
                        {quiz.status || 'Published'}
                      </span>
                    </div>
                    <p className="quiz-description">{quiz.description || 'No description'}</p>
                    <div className="quiz-details">
                      <div className="detail-item"><span>Subject:</span><strong>{quiz.subject?.name || 'General'}</strong></div>
                      <div className="detail-item"><span>Questions:</span><strong>{quiz.totalQuestions || quiz.questions?.length || 0}</strong></div>
                      <div className="detail-item"><span>Total Marks:</span><strong>{quiz.totalMarks}</strong></div>
                      <div className="detail-item"><span>Time Limit:</span><strong>{quiz.timeLimitMinutes || 0} min</strong></div>
                      <div className="detail-item"><span>Difficulty:</span><strong className={`difficulty-${quiz.difficulty}`}>{quiz.difficulty || 'medium'}</strong></div>
                    </div>
                    <div className="quiz-actions">
                      <button onClick={() => editQuiz(quiz)} className="edit-btn">Edit</button>
                      <button onClick={() => setShowDeleteConfirm(quiz.id)} className="delete-btn">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="delete-confirm-modal">
            <h3>Delete Quiz</h3>
            <p>Are you sure you want to delete this quiz? This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteConfirm(null)} className="cancel-btn">Cancel</button>
              <button onClick={() => deleteQuiz(showDeleteConfirm)} className="confirm-delete-btn">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorQuizzes;