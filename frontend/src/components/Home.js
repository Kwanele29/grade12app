import React from 'react';
import './Home.css';
import cityBg from '../assets/images/city.jpg';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="home-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-logo">
          <h1>Grade<span>12</span>Central</h1>
        </div>
        <ul className="nav-menu">
          <li><a href="/" className="active">Home</a></li>
          <li><a href="/study-guides">Study Guides</a></li>
          <li><a href="/practice-exams">Practice Exams</a></li>
          <li><a href="/features">Features</a></li>
          <li>
            <button onClick={handleLogin} className="login-btn">Log In</button>
          </li>
        </ul>
        <div className="hamburger">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Ace Your Matric Year with <span className="highlight">Grade 12 Central!</span></h1>
          <p className="hero-subtitle">The ultimate exam prep app for Grade 12 students.</p>
          <div className="hero-buttons">
            <button onClick={handleGetStarted} className="btn btn-primary">Get Started</button>
          </div>
        </div>
        <div className="hero-image">
          <div className="image-container">
            <div className="hero-img-wrapper">
              <div className="hero-img-placeholder">
                <div className="glow-effect"></div>
              </div>
            </div>
            <div className="image-glow"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Everything You Need to Succeed</h2>
          <p className="section-subtitle">Powerful features designed to help you ace your exams</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Past Exam Papers</h3>
            <p>Access over 1,000+ NSC past exam papers and memos from previous years.</p>
            <div className="feature-stats">1,200+ Papers</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Interactive Quizzes</h3>
            <p>Practice with topic-based quizzes and get instant feedback with explanations.</p>
            <div className="feature-stats">500+ Quizzes</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Track Your Progress</h3>
            <p>Monitor your performance and identify areas for improvement with detailed analytics.</p>
            <div className="feature-stats">Real-time Tracking</div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-overlay"></div>
        <div className="stats-content">
          <h2>Join Over <span className="highlight">500,000+</span> Grade 12 Learners</h2>
          <p className="stats-subtitle">Preparing for success with Grade 12 Central</p>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">98%</div>
              <div className="stat-label">Pass Rate</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Subjects</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Access</div>
            </div>
          </div>
          <div className="store-buttons">
            <button className="store-btn google">
              <span className="store-icon">📱</span>
              <span className="store-text">
                <small>GET IT ON</small>
                <strong>Google Play</strong>
              </span>
            </button>
            <button className="store-btn apple">
              <span className="store-icon">🍎</span>
              <span className="store-text">
                <small>Download on the</small>
                <strong>App Store</strong>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2>What Our Users Say</h2>
        <p className="section-subtitle">Join thousands of successful matriculants</p>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <div className="quote-icon">"</div>
              <p>This app made finding past papers so easy! I found all the resources I needed in one place.</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">👩‍🎓</div>
              <div className="author-info">
                <strong>Sarah M.</strong>
                <span>Matric 2023</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card featured">
            <div className="testimonial-content">
              <div className="quote-icon">"</div>
              <p>I love the quizzes and tracking my progress. It helped me improve from 60% to 85% in Maths!</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">👨‍🎓</div>
              <div className="author-info">
                <strong>Jason K.</strong>
                <span>Matric 2023</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-content">
              <div className="quote-icon">"</div>
              <p>Grade 12 Central boosted my confidence for exams! The past papers were exactly what I needed.</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">👩‍🎓</div>
              <div className="author-info">
                <strong>Ayesha P.</strong>
                <span>Matric 2023</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Grade<span>12</span>Central</h3>
            <p>Your ultimate exam preparation partner</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/about">About Us</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Use</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Follow Us</h4>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">📘</a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">🐦</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">📷</a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="social-link">🎵</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Grade 12 Central. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;