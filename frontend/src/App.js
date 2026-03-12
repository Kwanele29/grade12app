import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import SubjectManager from './components/SubjectManager';
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <nav style={styles.nav}>
                    <div style={styles.navContainer}>
                        <h1 style={styles.navLogo}>📚 Grade 12 App</h1>
                        <div style={styles.navLinks}>
                            <a href="/" style={styles.navLink}>Home</a>
                            <a href="/subjects" style={styles.navLink}>Subjects</a>
                        </div>
                    </div>
                </nav>
                
                <main style={styles.main}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/subjects" element={<SubjectManager />} />
                    </Routes>
                </main>
                
                <footer style={styles.footer}>
                    <p>© 2026 Grade 12 Exam Preparation App. All rights reserved.</p>
                </footer>
            </div>
        </Router>
    );
}

const styles = {
    nav: {
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    navContainer: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    navLogo: {
        margin: 0,
        fontSize: '1.5rem',
    },
    navLinks: {
        display: 'flex',
        gap: '20px',
    },
    navLink: {
        color: 'white',
        textDecoration: 'none',
        fontSize: '1rem',
    },
    main: {
        minHeight: 'calc(100vh - 150px)',
        padding: '20px',
    },
    footer: {
        backgroundColor: '#34495e',
        color: 'white',
        textAlign: 'center',
        padding: '1rem',
        marginTop: 'auto',
    },
};

export default App;