import React, { useState, useEffect } from 'react';
import { getSubjects, createSubject } from '../services/api';

function SubjectManager() {
    const [subjects, setSubjects] = useState([]);
    const [newSubject, setNewSubject] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await getSubjects();
            setSubjects(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load subjects. Make sure backend is running on port 8080');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newSubject.name.trim()) {
            setError('Subject name is required');
            return;
        }
        
        try {
            await createSubject(newSubject);
            setNewSubject({ name: '', description: '' });
            setError('');
            fetchSubjects();
        } catch (err) {
            setError('Failed to create subject');
        }
    };

    if (loading) return <div style={styles.loading}>Loading subjects...</div>;

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>📚 Manage Subjects</h2>
            
            {error && <div style={styles.error}>{error}</div>}
            
            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    type="text"
                    placeholder="Subject Name (e.g., Mathematics)"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                    style={styles.input}
                    required
                />
                <input
                    type="text"
                    placeholder="Description (optional)"
                    value={newSubject.description}
                    onChange={(e) => setNewSubject({...newSubject, description: e.target.value})}
                    style={styles.input}
                />
                <button type="submit" style={styles.button}>
                    Add Subject
                </button>
            </form>

            <div style={styles.subjectsList}>
                <h3>Subjects ({subjects.length})</h3>
                {subjects.length === 0 ? (
                    <p style={styles.noData}>No subjects yet. Add your first subject above!</p>
                ) : (
                    subjects.map(subject => (
                        <div key={subject.id} style={styles.subjectCard}>
                            <div>
                                <strong>{subject.name}</strong>
                                {subject.description && <p style={styles.description}>{subject.description}</p>}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
    },
    heading: {
        color: '#333',
        textAlign: 'center',
    },
    form: {
        display: 'flex',
        gap: '10px',
        marginBottom: '30px',
        flexWrap: 'wrap',
    },
    input: {
        flex: '1',
        minWidth: '200px',
        padding: '10px',
        fontSize: '16px',
        border: '1px solid #ddd',
        borderRadius: '4px',
    },
    button: {
        padding: '10px 20px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    subjectsList: {
        marginTop: '20px',
    },
    subjectCard: {
        padding: '15px',
        marginBottom: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        borderLeft: '4px solid #007bff',
    },
    description: {
        color: '#666',
        margin: '5px 0 0 0',
        fontSize: '14px',
    },
    error: {
        color: '#dc3545',
        marginBottom: '10px',
        padding: '10px',
        backgroundColor: '#f8d7da',
        borderRadius: '4px',
    },
    loading: {
        textAlign: 'center',
        padding: '50px',
        fontSize: '18px',
    },
    noData: {
        color: '#999',
        textAlign: 'center',
        padding: '20px',
    },
};

export default SubjectManager;