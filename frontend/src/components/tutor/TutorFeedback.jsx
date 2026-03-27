// src/components/tutor/TutorFeedback.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TutorFeedback.css';

const TutorFeedback = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock feedback data
    const mockFeedbacks = [
      { 
        id: 1, 
        studentName: 'John Doe', 
        studentAvatar: 'JD',
        rating: 5, 
        comment: 'Great session! Very helpful explanations. I finally understand quadratic equations!',
        date: '2024-03-20',
        subject: 'Mathematics',
        response: null
      },
      { 
        id: 2, 
        studentName: 'Jane Smith', 
        studentAvatar: 'JS',
        rating: 4, 
        comment: 'Good explanation, but need more practice problems for physics.',
        date: '2024-03-19',
        subject: 'Physics',
        response: 'Thank you for the feedback! I will prepare more practice problems for next session.'
      },
      { 
        id: 3, 
        studentName: 'Mike Johnson', 
        studentAvatar: 'MJ',
        rating: 5, 
        comment: 'Excellent tutor! Very patient and explains concepts clearly.',
        date: '2024-03-18',
        subject: 'English',
        response: null
      },
      { 
        id: 4, 
        studentName: 'Sarah Williams', 
        studentAvatar: 'SW',
        rating: 4, 
        comment: 'Good session, helped me understand chemistry concepts better.',
        date: '2024-03-17',
        subject: 'Chemistry',
        response: 'Glad I could help! Let me know if you need more clarification.'
      },
      { 
        id: 5, 
        studentName: 'David Brown', 
        studentAvatar: 'DB',
        rating: 5, 
        comment: 'Amazing tutor! My grades have improved significantly.',
        date: '2024-03-16',
        subject: 'Mathematics',
        response: null
      }
    ];
    
    setFeedbacks(mockFeedbacks);
    setLoading(false);
  }, []);

  const handleRespond = (feedbackId) => {
    const response = prompt('Enter your response to this feedback:');
    if (response) {
      const updatedFeedbacks = feedbacks.map(f => 
        f.id === feedbackId ? { ...f, response: response } : f
      );
      setFeedbacks(updatedFeedbacks);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/tutor-dashboard');
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#48bb78';
    if (rating >= 3.5) return '#f59e0b';
    return '#f56565';
  };

  if (loading) {
    return (
      <div className="feedback-loading">
        <div className="loading-spinner"></div>
        <p>Loading feedback...</p>
      </div>
    );
  }

  const averageRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;

  return (
    <div className="feedback-container">
      <div className="feedback-card">
        <div className="feedback-header">
          <button onClick={handleBackToDashboard} className="back-btn">
            ← Back to Dashboard
          </button>
          <h1>Student Feedback</h1>
          <div className="rating-summary">
            <div className="average-rating">
              <span className="rating-value">{averageRating.toFixed(1)}</span>
              <span className="rating-stars">{renderStars(Math.round(averageRating))}</span>
            </div>
            <div className="total-feedback">
              {feedbacks.length} review(s)
            </div>
          </div>
        </div>

        <div className="feedback-stats">
          <div className="stat-card">
            <div className="stat-value">{feedbacks.filter(f => f.rating >= 4).length}</div>
            <div className="stat-label">Positive Reviews</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{feedbacks.filter(f => !f.response).length}</div>
            <div className="stat-label">Pending Responses</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Math.round(averageRating * 20)}%</div>
            <div className="stat-label">Satisfaction Rate</div>
          </div>
        </div>

        <div className="feedback-list">
          {feedbacks.map(feedback => (
            <div key={feedback.id} className="feedback-item">
              <div className="feedback-item-header">
                <div className="student-info">
                  <div className="student-avatar">{feedback.studentAvatar}</div>
                  <div>
                    <div className="student-name">{feedback.studentName}</div>
                    <div className="feedback-subject">{feedback.subject}</div>
                  </div>
                </div>
                <div className="feedback-rating" style={{ color: getRatingColor(feedback.rating) }}>
                  {renderStars(feedback.rating)}
                  <span className="rating-number">{feedback.rating}/5</span>
                </div>
              </div>
              
              <div className="feedback-comment">
                <p>"{feedback.comment}"</p>
                <div className="feedback-date">{feedback.date}</div>
              </div>
              
              {feedback.response ? (
                <div className="feedback-response">
                  <div className="response-label">Your Response:</div>
                  <div className="response-text">{feedback.response}</div>
                </div>
              ) : (
                <button 
                  onClick={() => handleRespond(feedback.id)} 
                  className="respond-btn"
                >
                  Respond to Feedback
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TutorFeedback;