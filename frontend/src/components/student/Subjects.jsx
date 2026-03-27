import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Chat from './Chat';
import './Subjects.css';

const Subjects = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [activeTab, setActiveTab] = useState('papers');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [allSubjectsData, setAllSubjectsData] = useState([]);
  const [papers, setPapers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [videos, setVideos] = useState([]);

  const token = localStorage.getItem('token');

  // Fetch all subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/subjects', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Subjects from backend:', data);
          setAllSubjectsData(data);
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    
    fetchSubjects();
  }, [token]);

  // Fetch materials for selected subject
  useEffect(() => {
    if (selectedSubject) {
      fetchPapers();
      fetchNotes();
      fetchVideos();
    }
  }, [selectedSubject]);

  const fetchPapers = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/materials/papers/${selectedSubject.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPapers(data);
      }
    } catch (error) {
      console.error('Error fetching papers:', error);
      setPapers([]);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/materials/notes/${selectedSubject.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/materials/videos/${selectedSubject.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setVideos(data);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setVideos([]);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.category !== 'student') {
      navigate('/login');
      return;
    }
    
    setUser(parsedUser);

    const savedSubjects = localStorage.getItem(`student_subjects_${parsedUser.id}`);
    if (savedSubjects) {
      const subjects = JSON.parse(savedSubjects);
      setSelectedSubjects(subjects);
      console.log('Student selected subjects from localStorage:', subjects);
    }
    
    setLoading(false);
  }, [navigate, token]);

  // Get full subject details for selected subjects
  const enrolledSubjects = selectedSubjects.map(selected => {
    const fullDetails = allSubjectsData.find(sub => sub.id === selected.id);
    console.log('Looking for subject ID:', selected.id, 'Found details:', fullDetails);
    
    if (fullDetails) {
      return {
        id: fullDetails.id,
        name: fullDetails.name,
        icon: fullDetails.iconUrl || selected.icon || '📚',
        color: fullDetails.color || selected.color || '#3b82f6',
        bgColor: fullDetails.bgColor || selected.bgColor || '#eff6ff',
        tutorName: fullDetails.tutorName || 'Not Assigned',
        tutorId: fullDetails.tutorId
      };
    }
    return {
      ...selected,
      tutorName: selected.tutorName || 'Not Assigned',
      tutorId: selected.tutorId
    };
  });

  const handleSubjectClick = (subject) => {
    const fullDetails = allSubjectsData.find(sub => sub.id === subject.id);
    setSelectedSubject({
      id: subject.id,
      name: subject.name,
      icon: subject.icon,
      color: subject.color,
      bgColor: subject.bgColor,
      tutorName: fullDetails?.tutorName || subject.tutorName || 'Not Assigned',
      tutorId: fullDetails?.tutorId || subject.tutorId
    });
    setActiveTab('papers');
    setShowChat(false);
  };

  const handleDownload = (item) => {
    alert(`Downloading ${item.title}...`);
  };

  const handleWatchVideo = (video) => {
    if (video.url && video.url !== '#') {
      window.open(video.url, '_blank');
    } else {
      alert('Video link coming soon!');
    }
  };

  const openChat = () => setShowChat(true);
  const closeChat = () => setShowChat(false);

  const filteredPapers = papers.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.year && p.year.includes(searchTerm))
  );

  const filteredNotes = notes.filter(n => 
    n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (n.topic && n.topic.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredVideos = videos.filter(v => 
    v.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Loading your subjects...</div>;
  }

  return (
    <div className="subjects-page">
      <header className="subjects-header">
        <button className="back-btn" onClick={() => navigate('/student-dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>My Subjects</h1>
        <div className="student-info">
          <span>{user?.firstName} {user?.lastName}</span>
        </div>
      </header>

      <div className="subjects-layout">
        <div className="subjects-sidebar">
          <h2>Your Enrolled Subjects</h2>
          <div className="subjects-list">
            {enrolledSubjects.length === 0 ? (
              <div className="no-subjects-message">
                <p>You haven't selected any subjects yet.</p>
                <button onClick={() => navigate('/student/subject-selection')} className="select-subjects-btn">
                  Select Subjects
                </button>
              </div>
            ) : (
              enrolledSubjects.map(subject => (
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
              ))
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
                      <span className="item-count">{filteredPapers.length} papers</span>
                    </div>
                    <div className="papers-grid">
                      {filteredPapers.map(paper => (
                        <div key={paper.id} className="paper-card">
                          <div className="paper-icon">📄</div>
                          <div className="paper-info">
                            <h3>{paper.title}</h3>
                            <div className="paper-meta">
                              {paper.year && <span className="paper-year">{paper.year}</span>}
                              {paper.term && <span className="paper-term">{paper.term}</span>}
                              {paper.type && <span className="paper-type">{paper.type}</span>}
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
                      <span className="item-count">{filteredNotes.length} notes</span>
                    </div>
                    <div className="notes-grid">
                      {filteredNotes.map(note => (
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
                      <span className="item-count">{filteredVideos.length} videos</span>
                    </div>
                    <div className="videos-grid">
                      {filteredVideos.map(video => (
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
                      <button 
                        className="start-chat-btn" 
                        onClick={openChat} 
                        disabled={!selectedSubject.tutorId}
                      >
                        {selectedSubject.tutorId ? 'Start Chat' : 'No Tutor Assigned Yet'}
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
          studentName={user?.firstName + ' ' + user?.lastName}
          userRole="student"
          onClose={closeChat}
        />
      )}
    </div>
  );
};

export default Subjects;