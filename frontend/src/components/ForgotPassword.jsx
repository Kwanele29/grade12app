import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './ForgotPassword.css';
import cityBg from '../assets/images/city.jpg';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setMessage('If an account exists with this email, you will receive password reset instructions.');
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-background" style={{ backgroundImage: `url(${cityBg})` }}>
        <div className="background-overlay"></div>
      </div>

      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="forgot-password-header">
            <Link to="/login" className="back-to-login">
              ← Back to Login
            </Link>
            <h1>Forgot Password?</h1>
            <p>Enter your email address and we'll send you instructions to reset your password.</p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="forgot-password-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              {error && <div className="error-alert">{error}</div>}

              <button 
                type="submit" 
                className="reset-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Instructions'}
              </button>
            </form>
          ) : (
            <div className="success-message">
              <div className="success-icon">📧</div>
              <h3>Check Your Email</h3>
              <p>{message}</p>
              <p className="email-sent-to">We sent instructions to: <strong>{email}</strong></p>
              <button 
                onClick={() => navigate('/login')} 
                className="back-to-login-btn"
              >
                Return to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;