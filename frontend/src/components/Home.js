import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div style={styles.container}>
            <h1 style={styles.title}>🎓 Grade 12 Exam Preparation App</h1>
            <p style={styles.subtitle}>Your ultimate study companion for matric success!</p>
            
            <div style={styles.features}>
                <div style={styles.featureCard}>
                    <h3>📚 Question Papers</h3>
                    <p>Access past exam papers with memos</p>
                </div>
                
                <div style={styles.featureCard}>
                    <h3>📝 Interactive Quizzes</h3>
                    <p>Test your knowledge with subject quizzes</p>
                </div>
                
                <div style={styles.featureCard}>
                    <h3>🤝 Tutor Chat</h3>
                    <p>Get help when you're stuck</p>
                </div>
                
                <div style={styles.featureCard}>
                    <h3>📊 Progress Tracking</h3>
                    <p>Monitor your improvement</p>
                </div>
            </div>
            
            <div style={styles.subjectsSection}>
                <h2>Available Subjects</h2>
                <div style={styles.subjectGrid}>
                    {['Mathematics', 'Physical Sciences', 'Life Sciences', 'Accounting', 'Geography', 'English'].map(subject => (
                        <div key={subject} style={styles.subjectCard}>
                            {subject}
                        </div>
                    ))}
                </div>
            </div>
            
            <div style={styles.ctaSection}>
                <Link to="/subjects" style={styles.ctaButton}>
                    Get Started
                </Link>
            </div>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
    },
    title: {
        color: '#2c3e50',
        fontSize: '2.5em',
        textAlign: 'center',
        marginBottom: '10px',
    },
    subtitle: {
        color: '#7f8c8d',
        fontSize: '1.2em',
        textAlign: 'center',
        marginBottom: '40px',
    },
    features: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px',
    },
    featureCard: {
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    subjectsSection: {
        marginBottom: '40px',
    },
    subjectGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginTop: '20px',
    },
    subjectCard: {
        padding: '15px',
        backgroundColor: '#e3f2fd',
        borderRadius: '6px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'transform 0.2s',
    },
    ctaSection: {
        textAlign: 'center',
        marginTop: '40px',
    },
    ctaButton: {
        display: 'inline-block',
        padding: '15px 40px',
        backgroundColor: '#007bff',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '5px',
        fontSize: '1.2em',
        fontWeight: 'bold',
    },
};

export default Home;