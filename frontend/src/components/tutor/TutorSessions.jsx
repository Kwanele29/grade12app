// src/components/tutor/TutorSessions.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TutorSessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newSession, setNewSession] = useState({
    title: '',
    date: '',
    time: '',
    duration: '1',
    subject: ''
  });

  useEffect(() => {
    // Mock sessions
    setSessions([
      { id: 1, title: 'Algebra Review', date: '2024-03-25', time: '14:00', duration: '1', subject: 'Mathematics', students: 3 },
      { id: 2, title: 'Physics Basics', date: '2024-03-26', time: '15:30', duration: '1.5', subject: 'Physics', students: 2 },
    ]);
  }, []);

  const handleCreateSession = () => {
    const session = {
      id: sessions.length + 1,
      ...newSession,
      students: 0
    };
    setSessions([...sessions, session]);
    setShowForm(false);
    setNewSession({ title: '', date: '', time: '', duration: '1', subject: '' });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'white', borderRadius: '20px', padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={() => navigate('/tutor-dashboard')} style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontSize: '16px' }}>
            ← Back to Dashboard
          </button>
          <button onClick={() => setShowForm(!showForm)} style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer' }}>
            + New Session
          </button>
        </div>
        
        <h1 style={{ marginBottom: '30px', color: '#2d3748' }}>My Sessions</h1>
        
        {showForm && (
          <div style={{ background: '#f7fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
            <h3>Create New Session</h3>
            <input type="text" placeholder="Title" value={newSession.title} onChange={(e) => setNewSession({...newSession, title: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
            <input type="date" value={newSession.date} onChange={(e) => setNewSession({...newSession, date: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
            <input type="time" value={newSession.time} onChange={(e) => setNewSession({...newSession, time: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
            <button onClick={handleCreateSession} style={{ background: '#48bb78', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', width: '100%' }}>Create</button>
          </div>
        )}
        
        {sessions.map(session => (
          <div key={session.id} style={{ background: '#f7fafc', padding: '20px', borderRadius: '12px', marginBottom: '15px' }}>
            <h3 style={{ marginBottom: '10px' }}>{session.title}</h3>
            <p><strong>Subject:</strong> {session.subject}</p>
            <p><strong>Date:</strong> {session.date} at {session.time}</p>
            <p><strong>Duration:</strong> {session.duration} hour(s)</p>
            <p><strong>Students:</strong> {session.students} enrolled</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TutorSessions;