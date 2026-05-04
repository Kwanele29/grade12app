import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Chat from './Chat';
import './Subjects.css';

const Subjects = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [activeTab, setActiveTab] = useState('papers');
  const [searchTerm, setSearchTerm] = useState('');
  const [enrolledSubjects, setEnrolledSubjects] = useState([]);
  const [papers, setPapers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const token = localStorage.getItem('token');

  // Fetch materials for a specific subject
  const fetchMaterialsForSubject = useCallback(async (subjectId) => {
    try {
      const res = await api.get(`/materials/subject/${subjectId}`);
      const all = res.data;
      // ✅ Filter by explicit material types (set by tutor)
      setPapers(all.filter(m => m.materialType === 'paper'));
      setNotes(all.filter(m => m.materialType === 'note'));
      setVideos(all.filter(m => m.materialType === 'video'));
    } catch (err) {
      console.error(err);
      setPapers([]);
      setNotes([]);
      setVideos([]);
    }
  }, []);

  // Load enrolled subjects for the student
  const loadEnrolledSubjects = useCallback(async (studentId) => {
    try {
      const res = await api.get(`/student/subjects/${studentId}`);
      const enrolled = res.data.map(ss => ({
        id: ss.subject.id,
        name: ss.subject.name,
        icon: ss.subject.iconUrl || '📚',
        color: ss.subject.color || '#3b82f6',
        bgColor: ss.subject.bgColor || '#eff6ff',
        tutorId: ss.subject.tutorId,
        tutorName: ss.subject.tutorName || 'Not Assigned'
      }));
      setEnrolledSubjects(enrolled);
      if (enrolled.length) {
        setSelectedSubject(enrolled[0]);
        setActiveTab('papers');
        await fetchMaterialsForSubject(enrolled[0].id);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [fetchMaterialsForSubject]);

  // Initial load
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    try {
      const parsed = JSON.parse(userData);
      if (parsed.category !== 'student') {
        navigate('/login');
        return;
      }
      setUser(parsed);
      loadEnrolledSubjects(parsed.id);
    } catch (err) {
      console.error(err);
      navigate('/login');
    }
  }, [navigate, token, loadEnrolledSubjects]);

  const handleSubjectClick = async (subject) => {
    setSelectedSubject(subject);
    setActiveTab('papers');
    await fetchMaterialsForSubject(subject.id);
  };

  const handleDownload = (item) => {
    window.open(`http://localhost:8080${item.fileUrl}`, '_blank');
  };

  const handleWatchVideo = (video) => {
    if (video.videoLink) {
      window.open(video.videoLink, '_blank');
    } else if (video.url && video.url !== '#') {
      window.open(video.url, '_blank');
    } else {
      alert('Video link not available');
    }
  };

  const openChat = () => setShowChat(true);
  const closeChat = () => setShowChat(false);

  const filterBySearch = (arr) =>
    arr.filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleEditSubjects = () => {
    navigate('/student/subject-selection?edit=true&returnTo=subjects');
  };

  if (loading) return <div className="loading">Loading your subjects...</div>;

  return (
    <div className="subjects-page">
      <header className="subjects-header">
        <button className="back-btn" onClick={() => navigate('/student-dashboard')}>← Back to Dashboard</button>
        <h1>My Subjects</h1>
        <div className="student-info"><span>{user?.firstName} {user?.lastName}</span></div>
      </header>
      <div className="subjects-layout">
        <div className="subjects-sidebar">
          <div className="sidebar-header">
            <h2>Your Enrolled Subjects</h2>
            <button className="edit-subjects-btn" onClick={handleEditSubjects}>
              ✏️ Edit Subjects
            </button>
          </div>
          <div className="subjects-list">
            {enrolledSubjects.map(subject => (
              <div
                key={subject.id}
                className={`subject-card ${selectedSubject?.id === subject.id ? 'active' : ''}`}
                onClick={() => handleSubjectClick(subject)}
                style={{ borderLeftColor: subject.color }}
              >
                <div className="subject-icon" style={{ background: subject.bgColor, color: subject.color }}>
                  {subject.icon}
                </div>
                <div className="subject-details">
                  <h3>{subject.name}</h3>
                  <span className="subject-tutor">Tutor: {subject.tutorName}</span>
                </div>
              </div>
            ))}
            {enrolledSubjects.length === 0 && (
              <div className="no-subjects-message">
                <p>You haven't selected any subjects yet.</p>
                <button onClick={() => navigate('/student/subject-selection')} className="select-subjects-btn">
                  Select Subjects
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="subjects-content">
          {selectedSubject ? (
            <>
              <div className="subject-header" style={{ borderBottomColor: selectedSubject.color }}>
                <div className="subject-header-info">
                  <div className="subject-header-icon" style={{ background: selectedSubject.bgColor, color: selectedSubject.color }}>
                    {selectedSubject.icon}
                  </div>
                  <div>
                    <h1>{selectedSubject.name}</h1>
                    <p>Tutor: {selectedSubject.tutorName}</p>
                  </div>
                </div>
                <div className="subject-header-actions">
                  <button className={`tab-btn ${activeTab === 'papers' ? 'active' : ''}`} onClick={() => setActiveTab('papers')}>📄 Past Papers</button>
                  <button className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>📝 Study Notes</button>
                  <button className={`tab-btn ${activeTab === 'videos' ? 'active' : ''}`} onClick={() => setActiveTab('videos')}>🎥 Video Lessons</button>
                  <button className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>💬 Chat with Tutor</button>
                </div>
                <div className="search-bar">
                  <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <div className="tab-content">
                {activeTab === 'papers' && (
                  <div className="papers-section">
                    <div className="section-header">
                      <h2>Past Exam Papers</h2>
                      <span className="item-count">{filterBySearch(papers).length} papers</span>
                    </div>
                    <div className="papers-grid">
                      {filterBySearch(papers).map(paper => (
                        <div key={paper.id} className="paper-card">
                          <div className="paper-icon">📄</div>
                          <div className="paper-info">
                            <h3>{paper.title}</h3>
                            <div className="paper-meta">
                              {paper.year && <span className="paper-year">{paper.year}</span>}
                              {paper.term && <span className="paper-term">{paper.term}</span>}
                            </div>
                          </div>
                          <button className="download-btn" onClick={() => handleDownload(paper)}>Download</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === 'notes' && (
                  <div className="notes-section">
                    <div className="section-header">
                      <h2>Study Notes</h2>
                      <span className="item-count">{filterBySearch(notes).length} notes</span>
                    </div>
                    <div className="notes-grid">
                      {filterBySearch(notes).map(note => (
                        <div key={note.id} className="note-card">
                          <div className="note-icon">📘</div>
                          <div className="note-info">
                            <h3>{note.title}</h3>
                            <div className="note-meta">
                              {note.topic && <span className="note-topic">{note.topic}</span>}
                              {note.pages && <span className="note-pages">{note.pages} pages</span>}
                            </div>
                            {note.preview && <p className="note-preview">{note.preview}</p>}
                          </div>
                          <button className="download-btn" onClick={() => handleDownload(note)}>Download</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === 'videos' && (
                  <div className="videos-section">
                    <div className="section-header">
                      <h2>Video Lessons</h2>
                      <span className="item-count">{filterBySearch(videos).length} videos</span>
                    </div>
                    <div className="videos-grid">
                      {filterBySearch(videos).map(video => (
                        <div key={video.id} className="video-card">
                          <div className="video-thumbnail" onClick={() => handleWatchVideo(video)}>
                            <div className="video-play-overlay">▶️</div>
                            <div className="video-duration">{video.duration}</div>
                          </div>
                          <div className="video-info">
                            <h3>{video.title}</h3>
                            <div className="video-meta">
                              {video.teacher && <span className="video-teacher">👨‍🏫 {video.teacher}</span>}
                              {video.views && <span className="video-views">👁️ {video.views} views</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === 'chat' && (
                  <div className="chat-section">
                    <div className="chat-preview">
                      <div className="chat-preview-icon">💬</div>
                      <h3>Chat with {selectedSubject.tutorName}</h3>
                      <p>Have questions about {selectedSubject.name}? Chat with your tutor for help!</p>
                      <button className="start-chat-btn" onClick={openChat} disabled={!selectedSubject.tutorId}>
                        Start Chat
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="no-subject-selected">
              <span className="empty-icon">📚</span>
              <h2>Select a Subject</h2>
              <p>Choose a subject from the left to access materials and chat with your tutor.</p>
            </div>
          )}
        </div>
      </div>
      {showChat && selectedSubject && selectedSubject.tutorId && (
        <Chat
          studentId={user?.id}
          tutorId={selectedSubject.tutorId}
          subjectId={selectedSubject.id}
          subjectName={selectedSubject.name}
          tutorName={selectedSubject.tutorName}
          studentName={`${user?.firstName} ${user?.lastName}`}
          userRole="student"
          onClose={closeChat}
        />
      )}
    </div>
  );
};

export default Subjects;