import React, { useState, useEffect } from 'react';
import './AssignTutors.css';

const AssignTutors = () => {
  const [subjects, setSubjects] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch subjects
      const subjectsRes = await fetch('http://localhost:8080/api/subjects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const subjectsData = await subjectsRes.json();
      
      // Fetch tutors
      const tutorsRes = await fetch('http://localhost:8080/api/users/category/tutor', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const tutorsData = await tutorsRes.json();
      
      setSubjects(subjectsData);
      setTutors(tutorsData);
      setError('');
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const assignTutor = async (subjectId, tutorId) => {
    const subject = subjects.find(s => s.id === subjectId);
    const updatedSubject = {
      ...subject,
      tutorId: tutorId
    };

    setSaving(true);
    try {
      const response = await fetch(`http://localhost:8080/api/subjects/${subjectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedSubject)
      });

      if (response.ok) {
        setMessage(`✅ Tutor assigned successfully to ${subject.name}!`);
        fetchData(); // Refresh the list
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError('❌ Failed to assign tutor');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('❌ Error assigning tutor');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const getCurrentTutorName = (subject) => {
    if (!subject.tutorId) return 'Not Assigned';
    const tutor = tutors.find(t => t.id === subject.tutorId);
    return tutor ? `${tutor.firstName} ${tutor.lastName}` : 'Unknown Tutor';
  };

  if (loading) return <div className="loading">Loading subjects and tutors...</div>;

  return (
    <div className="assign-tutors-container">
      <div className="assign-tutors-header">
        <h1>Assign Tutors to Subjects</h1>
        <button onClick={fetchData} className="refresh-btn">Refresh</button>
      </div>
      
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <div className="subjects-table-wrapper">
        <table className="subjects-table">
          <thead>
            <tr>
              <th>Subject ID</th>
              <th>Subject Name</th>
              <th>Current Tutor</th>
              <th>Available Tutors</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                  No subjects found. Please add subjects first.
                </td>
              </tr>
            ) : (
              subjects.map(subject => (
                <tr key={subject.id}>
                  <td>{subject.id}</td>
                  <td className="subject-name">{subject.name}</td>
                  <td>
                    <span className={`tutor-status ${subject.tutorId ? 'assigned' : 'unassigned'}`}>
                      {getCurrentTutorName(subject)}
                    </span>
                  </td>
                  <td>
                    <select 
                      id={`tutor-${subject.id}`}
                      defaultValue=""
                      className="tutor-select"
                      disabled={saving}
                    >
                      <option value="">-- Select a tutor --</option>
                      {tutors.map(tutor => (
                        <option key={tutor.id} value={tutor.id}>
                          {tutor.firstName} {tutor.lastName} ({tutor.email})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button 
                      className="assign-btn"
                      onClick={() => {
                        const select = document.getElementById(`tutor-${subject.id}`);
                        const tutorId = select.value;
                        if (tutorId) {
                          assignTutor(subject.id, parseInt(tutorId));
                        } else {
                          alert('Please select a tutor');
                        }
                      }}
                      disabled={saving}
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {tutors.length === 0 && (
        <div className="warning-message">
          ⚠️ No tutors found in the system. Please register tutors first.
        </div>
      )}
    </div>
  );
};

export default AssignTutors;