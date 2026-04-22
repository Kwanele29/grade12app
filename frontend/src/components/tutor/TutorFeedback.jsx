// src/components/tutor/TutorFeedback.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './TutorFeedback.css';

const TutorFeedback = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch feedbacks from API
  const fetchFeedbacks = useCallback(async (tutorId) => {
    try {
      const response = await api.get(`/tutor/${tutorId}/feedbacks`);
      if (response.data && response.data.length > 0) {
        const formattedFeedbacks = response.data.map(feedback => ({
          id: feedback.id,
          studentName: feedback.studentName,
          studentAvatar: feedback.studentName?.split(' ').map(n => n[0]).join('') || 'ST',
          rating: feedback.rating,
          comment: feedback.comment,
          date: feedback.createdAt ? new Date(feedback.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          subject: feedback.subjectName,
          response: feedback.response || null
        }));
        setFeedbacks(formattedFeedbacks);
      } else {
        setFeedbacks([]);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Submit response to feedback
  const handleRespond = async (feedbackId) => {
    const responseText = prompt('Enter your response to this feedback:');
    if (!responseText || !responseText.trim()) return;

    try {
      const response = await api.post(`/feedbacks/${feedbackId}/respond`, {
        response: responseText.trim()
      });

      if (response.data) {
        setSuccess('Response submitted successfully!');
        // Update local state
        setFeedbacks(prev => prev.map(f => 
          f.id === feedbackId ? { ...f, response: responseText.trim() } : f
        ));
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      setError('Failed to submit response. Please try again.');
      setTimeout(() => setError(''), 3000);
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

  // Load user and fetch feedbacks
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
      
      fetchFeedbacks(parsedUser.id);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate, fetchFeedbacks]);

  if (loading) {
    return (
      <div className="feedback-loading">
        <div className="loading-spinner"></div>
        <p>Loading feedback from database...</p>
      </div>
    );
  }

  const averageRating = feedbacks.length > 0 
    ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length 
    : 0;

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

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

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
            <div className="stat-value">{feedbacks.length > 0 ? Math.round(averageRating * 20) : 0}%</div>
            <div className="stat-label">Satisfaction Rate</div>
          </div>
        </div>

        <div className="feedback-list">
          {feedbacks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <p>No feedback received yet</p>
              <p className="empty-subtext">When students leave feedback, it will appear here</p>
            </div>
          ) : (
            feedbacks.map(feedback => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorFeedback;