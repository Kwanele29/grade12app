import React, { useState, useEffect } from 'react';
import './TestQuizzes.css';

const TestQuizzes = () => {
  const [status, setStatus] = useState('Testing connection...');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testBackend = async () => {
      try {
        setStatus('Connecting to backend...');
        
        // Test if backend is reachable
        const response = await fetch('http://localhost:8080/api/quizzes/student/1');
        
        setStatus(`Response received. Status: ${response.status}`);
        
        if (response.ok) {
          const result = await response.json();
          setData(result);
          setStatus(`✅ Success! Found ${result.length} quizzes`);
        } else {
          const text = await response.text();
          setStatus(`❌ Error ${response.status}`);
          setError(text.substring(0, 200));
        }
      } catch (err) {
        setStatus('❌ Failed to connect');
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    testBackend();
  }, []);

  const getStatusClass = () => {
    if (status.includes('✅')) return 'success';
    if (status.includes('❌')) return 'error';
    return 'warning';
  };

  return (
    <div className="test-container">
      <h1 className="test-header">
        Backend Connection Test
      </h1>
      
      <div className={`status-card ${getStatusClass()}`}>
        <h3 className={`status-title ${getStatusClass()}`}>
          {status}
        </h3>
        
        {loading && <p className="loading-text loading">Please wait...</p>}
        
        {error && (
          <div className="error-section">
            <h4 className="error-heading">Error Details:</h4>
            <pre className="error-pre">
              {error}
            </pre>
          </div>
        )}
        
        {data && (
          <div className="data-section">
            <h4 className="data-heading">Data Received:</h4>
            <pre className="data-pre">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <div className="debug-section">
        <h4 className="debug-heading">Debug Information:</h4>
        <ul className="debug-list">
          <li><strong>Backend URL:</strong> http://localhost:8080</li>
          <li><strong>API Endpoint:</strong> /api/quizzes/student/1</li>
          <li><strong>Frontend URL:</strong> http://localhost:3000</li>
          <li><strong>Time:</strong> {new Date().toLocaleString()}</li>
        </ul>
      </div>
      
      <div className="button-container">
        <button 
          onClick={() => window.location.reload()}
          className="refresh-btn"
        >
          Refresh Test
        </button>
      </div>
    </div>
  );
};

export default TestQuizzes;