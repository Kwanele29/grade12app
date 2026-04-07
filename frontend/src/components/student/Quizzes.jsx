import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Quizzes.css';

const Quizzes = () => {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResults, setQuizResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
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
        
        // Fetch all quizzes from backend
        const response = await fetch('http://localhost:8080/api/quizzes/student/all', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const allQuizzes = await response.json();
        console.log('All quizzes:', allQuizzes);
        
        setQuizzes(allQuizzes);
        
        // Extract unique subjects
        const uniqueSubjects = [];
        const subjectMap = new Map();
        
        allQuizzes.forEach(quiz => {
          if (quiz.subjectId && !subjectMap.has(quiz.subjectId)) {
            subjectMap.set(quiz.subjectId, {
              id: quiz.subjectId,
              name: quiz.subjectName,
              icon: quiz.subjectIcon,
              color: quiz.subjectColor
            });
            uniqueSubjects.push(subjectMap.get(quiz.subjectId));
          }
        });
        
        setSubjects(uniqueSubjects);
        
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setTimerActive(false);
            if (quizStarted && !showResults) handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining, quizStarted, showResults]);

  const handleStartQuiz = (quiz) => {
    const timerSeconds = (quiz.timeLimitMinutes || 30) * 60;
    setSelectedQuiz(quiz);
    setQuizStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setQuizResults(null);
    setShowResults(false);
    setTimeRemaining(timerSeconds);
    setTimerActive(true);
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < selectedQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const handleSubmitQuiz = async () => {
    setTimerActive(false);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/quizzes/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: user.id,
          quizId: selectedQuiz.id,
          answers: selectedAnswers
        })
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      console.log('Quiz result:', result);
      
      const resultsData = {
        obtainedMarks: result.obtainedMarks || result.score || 0,
        totalMarks: result.totalMarks || selectedQuiz.totalMarks || 0,
        percentage: result.percentage || Math.round(((result.obtainedMarks || result.score || 0) / (result.totalMarks || selectedQuiz.totalMarks || 1)) * 100),
        studentName: result.studentName || user.firstName,
        quizTitle: result.quizTitle || selectedQuiz.title,
        subjectName: result.subjectName || selectedQuiz.subjectName
      };
      
      setQuizResults(resultsData);
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error submitting quiz: ' + error.message);
    }
  };

  const handleBackToQuizzes = () => {
    setQuizStarted(false);
    setSelectedQuiz(null);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setQuizResults(null);
    setShowResults(false);
    setTimerActive(false);
  };

  const handleRetryQuiz = () => {
    const timerSeconds = (selectedQuiz.timeLimitMinutes || 30) * 60;
    setQuizStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setQuizResults(null);
    setShowResults(false);
    setTimeRemaining(timerSeconds);
    setTimerActive(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getFilteredQuizzes = () => {
    if (selectedSubject === 'all') return quizzes;
    return quizzes.filter(quiz => quiz.subjectId === parseInt(selectedSubject));
  };

  const isCurrentQuestionAnswered = () => {
    if (!selectedQuiz) return false;
    return selectedAnswers[selectedQuiz.questions[currentQuestion].id] !== undefined;
  };

  if (loading) return <div className="loading">Loading...</div>;

  if (error) {
    return (
      <div className="quizzes-container">
        <div className="no-quizzes">
          <div className="no-quizzes-icon">❌</div>
          <h3>Error Loading Quizzes</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="quizzes-container">
        <div className="no-quizzes">
          <div className="no-quizzes-icon">📚</div>
          <h3>No Quizzes Available</h3>
          <p>No quizzes available yet. Check back later!</p>
          <button className="back-button" onClick={() => navigate('/student-dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="quizzes-container">
      {!quizStarted ? (
        <div className="quiz-selection-view">
          <div className="quizzes-header">
            <button className="back-button" onClick={() => navigate('/student-dashboard')}>← Back</button>
            <h1>Practice Quizzes</h1>
          </div>

          <div className="subject-filters">
            <button className={`filter-btn ${selectedSubject === 'all' ? 'active' : ''}`} onClick={() => setSelectedSubject('all')}>
              All Subjects
            </button>
            {subjects.map(subject => (
              <button
                key={subject.id}
                className={`filter-btn ${selectedSubject === subject.id ? 'active' : ''}`}
                onClick={() => setSelectedSubject(subject.id)}
                style={{ 
                  color: selectedSubject === subject.id ? 'white' : subject.color, 
                  background: selectedSubject === subject.id ? subject.color : 'transparent', 
                  borderColor: subject.color 
                }}
              >
                <span className="filter-icon">{subject.icon}</span> {subject.name}
              </button>
            ))}
          </div>

          <div className="quizzes-grid">
            {getFilteredQuizzes().map(quiz => (
              <div key={quiz.id} className="quiz-card" style={{ borderTopColor: quiz.subjectColor }}>
                <div className="quiz-card-header">
                  <div className="quiz-subject-info">
                    <span className="quiz-subject-icon" style={{ background: quiz.subjectColor + '20', color: quiz.subjectColor }}>
                      {quiz.subjectIcon}
                    </span>
                    <div>
                      <span className="quiz-subject-name">{quiz.subjectName}</span>
                      <h3>{quiz.title}</h3>
                    </div>
                  </div>
                </div>
                <div className="quiz-details">
                  <div className="quiz-meta">
                    <div className="meta-item">
                      <span className="meta-label">Questions</span>
                      <span className="meta-value">{quiz.totalQuestions}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Marks</span>
                      <span className="meta-value">{quiz.totalMarks}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Time</span>
                      <span className="meta-value">{quiz.timeLimitMinutes} min</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Difficulty</span>
                      <span className={`difficulty-badge ${quiz.difficulty.toLowerCase()}`}>{quiz.difficulty}</span>
                    </div>
                  </div>
                  <button className="start-quiz-btn" onClick={() => handleStartQuiz(quiz)} style={{ background: quiz.subjectColor }}>
                    Start Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : showResults ? (
        <div className="quiz-results-view">
          <button className="back-button" onClick={handleBackToQuizzes}>← Back</button>
          <div className="results-header">
            <div className="subject-badge" style={{ background: selectedQuiz.subjectColor + '20' }}>
              <span>{selectedQuiz.subjectIcon}</span> {selectedQuiz.subjectName}
            </div>
            <h2>{selectedQuiz.title}</h2>
            <p>Quiz Complete!</p>
          </div>
          <div className="score-display">
            <div className="score-circle" style={{ borderColor: selectedQuiz.subjectColor }}>
              <span className="score-number">{quizResults.percentage}%</span>
            </div>
          </div>
          <div className="results-stats">
            <div className="result-stat correct">
              <span className="stat-icon">✓</span>
              <div>
                <span className="stat-label">Score</span>
                <span className="stat-value">{quizResults.obtainedMarks}/{quizResults.totalMarks}</span>
              </div>
            </div>
          </div>
          <div className="results-actions">
            <button className="action-btn primary" onClick={handleRetryQuiz}>Try Again</button>
            <button className="action-btn secondary" onClick={handleBackToQuizzes}>Choose Another</button>
          </div>
        </div>
      ) : (
        <div className="quiz-taking-view">
          <div className="quiz-header">
            <button className="back-button" onClick={handleBackToQuizzes}>←</button>
            <div>
              <span className="quiz-subject" style={{ color: selectedQuiz.subjectColor }}>
                {selectedQuiz.subjectIcon} {selectedQuiz.subjectName}
              </span>
              <h2>{selectedQuiz.title}</h2>
            </div>
            <div className="quiz-progress">
              <span className="question-counter">{currentQuestion + 1}/{selectedQuiz.questions.length}</span>
              <div className="timer-display" style={{ color: timeRemaining < 300 ? '#f56565' : '#C5C6C7' }}>
                ⏱️ {formatTime(timeRemaining)}
              </div>
            </div>
          </div>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${((currentQuestion + 1) / selectedQuiz.questions.length) * 100}%`, background: selectedQuiz.subjectColor }}></div>
          </div>

          <div className="question-section">
            <div className="question-number">
              Question {currentQuestion + 1} of {selectedQuiz.questions.length}
              <span style={{ marginLeft: '10px', color: '#C5C6C7' }}>(Marks: {selectedQuiz.questions[currentQuestion].marks})</span>
            </div>
            <h3 className="question-text">{selectedQuiz.questions[currentQuestion].question}</h3>
            
            <div className="options-list">
              {[
                selectedQuiz.questions[currentQuestion].optionA,
                selectedQuiz.questions[currentQuestion].optionB,
                selectedQuiz.questions[currentQuestion].optionC,
                selectedQuiz.questions[currentQuestion].optionD
              ].map((option, index) => {
                const questionId = selectedQuiz.questions[currentQuestion].id;
                const isSelected = selectedAnswers[questionId] === index;
                return (
                  <button 
                    key={index} 
                    className={`option-btn ${isSelected ? 'selected' : ''}`} 
                    onClick={() => handleAnswerSelect(questionId, index)}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                    <span className="option-text">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="quiz-navigation">
            <button 
              className="nav-btn prev" 
              onClick={handlePreviousQuestion} 
              disabled={currentQuestion === 0}
            >
              ← Previous
            </button>
            
            {currentQuestion === selectedQuiz.questions.length - 1 ? (
              <button 
                className="nav-btn submit" 
                onClick={handleSubmitQuiz} 
                disabled={Object.keys(selectedAnswers).length !== selectedQuiz.questions.length}
                style={{
                  background: Object.keys(selectedAnswers).length === selectedQuiz.questions.length 
                    ? selectedQuiz.subjectColor 
                    : '#C5C6C7',
                  cursor: Object.keys(selectedAnswers).length === selectedQuiz.questions.length 
                    ? 'pointer' 
                    : 'not-allowed',
                  opacity: Object.keys(selectedAnswers).length === selectedQuiz.questions.length ? 1 : 0.6
                }}
              >
                Submit Quiz
              </button>
            ) : (
              <button 
                className="nav-btn next" 
                onClick={handleNextQuestion} 
                disabled={!isCurrentQuestionAnswered()}
                style={{
                  background: isCurrentQuestionAnswered() 
                    ? selectedQuiz.subjectColor 
                    : '#C5C6C7',
                  cursor: isCurrentQuestionAnswered() ? 'pointer' : 'not-allowed',
                  opacity: isCurrentQuestionAnswered() ? 1 : 0.6
                }}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Quizzes;