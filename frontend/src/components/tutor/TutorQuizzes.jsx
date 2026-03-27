import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TutorQuizzes.css';

const TutorQuizzes  = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allSubjects, setAllSubjects] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');

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
      if (parsedUser.category !== 'student') {
        navigate('/login');
        return;
      }
      setUser(parsedUser);
      fetchQuizzes(parsedUser.id);
      fetchSubjects();
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

  // Fetch quizzes
  const fetchQuizzes = async (studentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/quizzes/student/${studentId}`);
      setQuizzes(response.data);
      setFilteredQuizzes(response.data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      // Mock data for demo
      const mockQuizzes = [
        { id: 1, title: 'Algebra Basics', subject: 'Mathematics', duration: 30, totalMarks: 100, passingScore: 60, questions: [
          { id: 1, text: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correct: '4' },
          { id: 2, text: 'What is 5 x 5?', options: ['20', '25', '30', '35'], correct: '25' }
        ] },
        { id: 2, title: 'Physics Fundamentals', subject: 'Physics', duration: 45, totalMarks: 100, passingScore: 60, questions: [
          { id: 1, text: 'What is Newton\'s first law?', options: ['Inertia', 'F=ma', 'Action-Reaction', 'Gravity'], correct: 'Inertia' }
        ] },
      ];
      setQuizzes(mockQuizzes);
      setFilteredQuizzes(mockQuizzes);
    } finally {
      setLoading(false);
    }
  };

  // Fetch subjects
  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/subjects`);
      setAllSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setAllSubjects([
        { id: 1, name: 'Mathematics' },
        { id: 2, name: 'Physics' },
        { id: 3, name: 'English' },
        { id: 4, name: 'Chemistry' },
        { id: 5, name: 'Biology' },
      ]);
    }
  };

  // Filter quizzes by subject - FIXED: added allSubjects to dependencies
  useEffect(() => {
    if (selectedSubject) {
      const filtered = quizzes.filter(quiz => quiz.subject === selectedSubject);
      setFilteredQuizzes(filtered);
    } else {
      setFilteredQuizzes(quizzes);
    }
  }, [selectedSubject, quizzes]); // Added 'quizzes' as dependency

  // Handle answer selection
  const handleAnswerSelect = useCallback((questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }, []);

  // Submit quiz - wrapped in useCallback
  const handleSubmitQuiz = useCallback(async () => {
    if (!selectedQuiz) return;
    
    // Calculate score
    let correctCount = 0;
    selectedQuiz.questions.forEach(question => {
      if (answers[question.id] === question.correct) {
        correctCount++;
      }
    });
    
    const calculatedScore = (correctCount / selectedQuiz.questions.length) * 100;
    setScore(calculatedScore);
    setSubmitted(true);
    
    try {
      await axios.post(`${API_BASE_URL}/quizzes/${selectedQuiz.id}/submit`, {
        studentId: user.id,
        answers: answers,
        score: calculatedScore
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  }, [selectedQuiz, answers, user]);

  // Timer effect - FIXED: added handleSubmitQuiz to dependencies
  useEffect(() => {
    if (selectedQuiz && timeLeft !== null && timeLeft > 0 && !submitted) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !submitted) {
      handleSubmitQuiz();
    }
  }, [timeLeft, selectedQuiz, submitted, handleSubmitQuiz]); // Added handleSubmitQuiz as dependency

  // Start quiz
  const startQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestion(0);
    setAnswers({});
    setTimeLeft(quiz.duration * 60);
    setSubmitted(false);
    setScore(null);
  };

  // Next question
  const nextQuestion = () => {
    if (currentQuestion < selectedQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // Previous question
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Reset quiz
  const resetQuiz = () => {
    setSelectedQuiz(null);
    setCurrentQuestion(0);
    setAnswers({});
    setTimeLeft(null);
    setSubmitted(false);
    setScore(null);
  };

  const handleBackToDashboard = () => {
    navigate('/student-dashboard');
  };

  if (loading) {
    return <div className="loading-container">Loading quizzes...</div>;
  }

  return (
    <div className="quizzes-container">
      <div className="quizzes-card">
        <div className="quizzes-header">
          <button onClick={handleBackToDashboard} className="back-btn">
            ← Back to Dashboard
          </button>
          <h1>My Quizzes</h1>
        </div>

        {!selectedQuiz ? (
          <>
            {/* Subject Filter */}
            <div className="subject-filter">
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="filter-select"
              >
                <option value="">All Subjects</option>
                {allSubjects.map(subject => (
                  <option key={subject.id} value={subject.name}>{subject.name}</option>
                ))}
              </select>
            </div>

            {/* Quiz List */}
            <div className="quizzes-list">
              {filteredQuizzes.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <p>No quizzes available</p>
                </div>
              ) : (
                filteredQuizzes.map(quiz => (
                  <div key={quiz.id} className="quiz-item">
                    <div className="quiz-info">
                      <h3>{quiz.title}</h3>
                      <p>{quiz.subject}</p>
                      <div className="quiz-meta">
                        <span>⏱️ {quiz.duration} minutes</span>
                        <span>📊 {quiz.totalMarks} marks</span>
                        <span>🎯 {quiz.passingScore}% to pass</span>
                      </div>
                    </div>
                    <button onClick={() => startQuiz(quiz)} className="start-quiz-btn">
                      Start Quiz
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        ) : !submitted ? (
          // Active Quiz
          <div className="active-quiz">
            <div className="quiz-header">
              <h2>{selectedQuiz.title}</h2>
              <div className="timer">
                ⏱️ Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
              <div className="progress">
                Question {currentQuestion + 1} of {selectedQuiz.questions.length}
              </div>
            </div>

            {selectedQuiz.questions.length > 0 && selectedQuiz.questions[currentQuestion] && (
              <div className="question-container">
                <h3>{selectedQuiz.questions[currentQuestion]?.text}</h3>
                <div className="options">
                  {selectedQuiz.questions[currentQuestion]?.options.map((option, index) => (
                    <label key={index} className="option">
                      <input
                        type="radio"
                        name="answer"
                        value={option}
                        checked={answers[selectedQuiz.questions[currentQuestion].id] === option}
                        onChange={() => handleAnswerSelect(selectedQuiz.questions[currentQuestion].id, option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>

                <div className="quiz-navigation">
                  <button 
                    onClick={prevQuestion} 
                    disabled={currentQuestion === 0}
                    className="nav-btn"
                  >
                    Previous
                  </button>
                  {currentQuestion === selectedQuiz.questions.length - 1 ? (
                    <button onClick={handleSubmitQuiz} className="submit-quiz-btn">
                      Submit Quiz
                    </button>
                  ) : (
                    <button onClick={nextQuestion} className="nav-btn">
                      Next
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Results
          <div className="quiz-results">
            <h2>Quiz Results</h2>
            <div className="score-card">
              <div className="score-circle">
                <span className="score-value">{Math.round(score)}%</span>
              </div>
              <div className="score-details">
                <p>You scored {Math.round(score)}%</p>
                <p>Passing Score: {selectedQuiz.passingScore}%</p>
                {score >= selectedQuiz.passingScore ? (
                  <p className="pass">🎉 Congratulations! You passed!</p>
                ) : (
                  <p className="fail">📚 Keep practicing! You can retake this quiz.</p>
                )}
              </div>
            </div>
            <div className="score-breakdown">
              <h3>Answer Summary</h3>
              {selectedQuiz.questions.map((question, idx) => (
                <div key={question.id} className="answer-summary">
                  <p><strong>Q{idx + 1}:</strong> {question.text}</p>
                  <p>Your answer: <span className={answers[question.id] === question.correct ? 'correct-answer' : 'wrong-answer'}>
                    {answers[question.id] || 'Not answered'}
                  </span></p>
                  {answers[question.id] !== question.correct && (
                    <p>Correct answer: <span className="correct-answer">{question.correct}</span></p>
                  )}
                </div>
              ))}
            </div>
            <button onClick={resetQuiz} className="back-to-quizzes-btn">
              Back to Quizzes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorQuizzes;