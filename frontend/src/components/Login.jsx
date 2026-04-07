import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import cityBg from '../assets/images/city.jpg';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if we have OAuth2 response in URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const refreshToken = urlParams.get('refreshToken');
    const userParam = urlParams.get('user');
    
    console.log('OAuth2 Response - Token:', token);
    console.log('OAuth2 Response - User Param:', userParam);
    
    if (token && userParam) {
      try {
        // Decode the URL encoded JSON
        const decodedUserJson = decodeURIComponent(userParam);
        console.log('Decoded User JSON:', decodedUserJson);
        
        const user = JSON.parse(decodedUserJson);
        console.log('Parsed User:', user);
        
        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(user));
        
        // Redirect based on user role
        redirectBasedOnRole(user.category);
        
      } catch (error) {
        console.error('Error parsing user data:', error);
        console.error('Raw userParam:', userParam);
        alert('Login failed: Could not process user data');
      }
    }
  }, []);

  const redirectBasedOnRole = (category) => {
    const userData = JSON.parse(localStorage.getItem('user'));
    
    if (category === 'student') {
      const savedSubjects = localStorage.getItem(`student_subjects_${userData?.id}`);
      if (savedSubjects && savedSubjects !== '[]' && savedSubjects !== 'null') {
        navigate('/student-dashboard');
      } else {
        navigate('/student/subject-selection');
      }
    } else if (category === 'tutor') {
      const savedSubjects = localStorage.getItem(`tutor_subjects_${userData?.id}`);
      if (savedSubjects && savedSubjects !== '[]' && savedSubjects !== 'null') {
        navigate('/tutor-dashboard');
      } else {
        navigate('/tutor/subject-selection');
      }
    } else if (category === 'admin') {
      navigate('/admin-dashboard');
    } else {
      navigate('/');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('refreshToken', data.refreshToken);
          
          if (rememberMe) {
            localStorage.setItem('rememberedEmail', formData.email);
          }
          
          console.log('User role:', data.user.category);
          
          redirectBasedOnRole(data.user.category);
        } else {
          setErrors({ submit: data.message || 'Invalid email or password' });
        }
      } catch (error) {
        console.error('Login error:', error);
        setErrors({ submit: 'Network error. Please check your connection.' });
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="login-page">
      <div className="login-background" style={{ backgroundImage: `url(${cityBg})` }}>
        <div className="background-overlay"></div>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Welcome Back!</h1>
            <p>Log in to continue your exam preparation journey</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={errors.email ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={errors.password ? 'error' : ''}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <span className="checkbox-text">Remember me</span>
              </label>
              <button 
                type="button" 
                className="forgot-password-link"
                onClick={handleForgotPassword}
                disabled={isLoading}
              >
                Forgot Password?
              </button>
            </div>

            {errors.submit && <div className="error-alert">{errors.submit}</div>}
            
            <button 
              type="submit" 
              className="login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>

            <div className="divider">
              <span>or</span>
            </div>

            <button 
              type="button" 
              onClick={handleGoogleLogin} 
              className="google-login-btn"
              disabled={isLoading}
            >
              <span className="google-icon">G</span>
              Continue with Google
            </button>

            <div className="signup-link">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;