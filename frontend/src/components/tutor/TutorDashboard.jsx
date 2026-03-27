import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TutorDashboard.css';

const TutorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Schedule Session Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledStudent, setScheduledStudent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [newSession, setNewSession] = useState({
    title: '',
    date: '',
    time: '',
    duration: '1',
    subject: '',
    studentId: null,
    studentName: ''
  });
  
  // Materials state
  const [uploading, setUploading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    subjectName: '',
    topic: '',
    tags: '',
    file: null
  });
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE_URL = 'http://localhost:8080/api';

  // Load sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('tutor_sessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.category !== 'tutor') {
        navigate('/login');
        return;
      }
      
      setUser(parsedUser);
      
      // Load selected subjects from localStorage
      const savedSubjects = localStorage.getItem(`tutor_subjects_${parsedUser.id}`);
      if (savedSubjects) {
        const subjects = JSON.parse(savedSubjects);
        setSelectedSubjects(subjects);
        loadTutorData(parsedUser.id, subjects);
        loadScheduleData(subjects);
        fetchSubjects();
      } else {
        // If no subjects selected, redirect to subject selection
        navigate('/tutor/subject-selection');
      }
      
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const loadTutorData = (tutorId, subjects) => {
    const allStudents = [
      { 
        id: 1, 
        name: 'Thabo Mokoena', 
        subject: 'Mathematics', 
        progress: 75, 
        lastActive: '2 hours ago', 
        avatar: 'TM', 
        email: 'thabo.m@student.com',
        phone: '+27 71 234 5678',
        grade: 12,
        school: 'Parktown Boys High',
        joinDate: '15 Jan 2024',
        totalSessions: 12,
        averageScore: 68,
        completedQuizzes: 8,
        upcomingSession: 'Tomorrow, 10:00 AM',
        strengths: ['Algebra', 'Calculus'],
        weaknesses: ['Trigonometry', 'Probability'],
        recentActivity: [
          { date: '2024-01-20', type: 'Quiz', subject: 'Calculus', score: 82 },
          { date: '2024-01-18', type: 'Session', subject: 'Algebra', attendance: 'Present' },
          { date: '2024-01-15', type: 'Quiz', subject: 'Trigonometry', score: 65 }
        ]
      },
      { 
        id: 2, 
        name: 'Lerato Ndlovu', 
        subject: 'Physical Science', 
        progress: 82, 
        lastActive: '1 day ago', 
        avatar: 'LN', 
        email: 'lerato.n@student.com',
        phone: '+27 72 345 6789',
        grade: 12,
        school: 'Pretoria Girls High',
        joinDate: '10 Jan 2024',
        totalSessions: 15,
        averageScore: 78,
        completedQuizzes: 10,
        upcomingSession: 'Today, 11:00 AM',
        strengths: ['Chemistry', 'Electricity'],
        weaknesses: ['Organic Chemistry', 'Motion'],
        recentActivity: [
          { date: '2024-01-19', type: 'Quiz', subject: 'Chemistry', score: 88 },
          { date: '2024-01-17', type: 'Session', subject: 'Physics', attendance: 'Present' },
          { date: '2024-01-14', type: 'Quiz', subject: 'Electricity', score: 72 }
        ]
      },
      { 
        id: 3, 
        name: 'Sipho Dlamini', 
        subject: 'Mathematics', 
        progress: 68, 
        lastActive: '3 hours ago', 
        avatar: 'SD', 
        email: 'sipho.d@student.com',
        phone: '+27 73 456 7890',
        grade: 12,
        school: 'Durban High School',
        joinDate: '20 Jan 2024',
        totalSessions: 8,
        averageScore: 62,
        completedQuizzes: 6,
        upcomingSession: 'Thursday, 2:00 PM',
        strengths: ['Geometry'],
        weaknesses: ['Calculus', 'Statistics'],
        recentActivity: [
          { date: '2024-01-18', type: 'Quiz', subject: 'Geometry', score: 75 },
          { date: '2024-01-16', type: 'Session', subject: 'Calculus', attendance: 'Present' },
          { date: '2024-01-12', type: 'Quiz', subject: 'Statistics', score: 45 }
        ]
      },
      { 
        id: 4, 
        name: 'Nomsa Zwane', 
        subject: 'English', 
        progress: 90, 
        lastActive: '5 hours ago', 
        avatar: 'NZ', 
        email: 'nomsa.z@student.com',
        phone: '+27 74 567 8901',
        grade: 12,
        school: 'Roedean School',
        joinDate: '5 Jan 2024',
        totalSessions: 18,
        averageScore: 85,
        completedQuizzes: 15,
        upcomingSession: 'Wednesday, 3:00 PM',
        strengths: ['Literature', 'Essay Writing'],
        weaknesses: ['Poetry Analysis'],
        recentActivity: [
          { date: '2024-01-19', type: 'Quiz', subject: 'Literature', score: 92 },
          { date: '2024-01-16', type: 'Session', subject: 'Essay Writing', attendance: 'Present' },
          { date: '2024-01-13', type: 'Quiz', subject: 'Poetry', score: 78 }
        ]
      },
      { 
        id: 5, 
        name: 'Zanele Khumalo', 
        subject: 'Mathematical Literacy', 
        progress: 71, 
        lastActive: '1 day ago', 
        avatar: 'ZK', 
        email: 'zanele.k@student.com',
        phone: '+27 75 678 9012',
        grade: 12,
        school: 'Alexandra High',
        joinDate: '12 Jan 2024',
        totalSessions: 10,
        averageScore: 68,
        completedQuizzes: 7,
        upcomingSession: 'Friday, 9:00 AM',
        strengths: ['Finance', 'Data Handling'],
        weaknesses: ['Maps & Plans'],
        recentActivity: [
          { date: '2024-01-17', type: 'Quiz', subject: 'Finance', score: 78 },
          { date: '2024-01-15', type: 'Session', subject: 'Data', attendance: 'Present' },
          { date: '2024-01-10', type: 'Quiz', subject: 'Maps', score: 58 }
        ]
      },
      { 
        id: 6, 
        name: 'Kagiso Moeketsi', 
        subject: 'Life Sciences', 
        progress: 88, 
        lastActive: '4 hours ago', 
        avatar: 'KM', 
        email: 'kagiso.m@student.com',
        phone: '+27 76 789 0123',
        grade: 12,
        school: 'St Johns College',
        joinDate: '8 Jan 2024',
        totalSessions: 14,
        averageScore: 82,
        completedQuizzes: 12,
        upcomingSession: 'Tomorrow, 2:30 PM',
        strengths: ['Human Biology', 'Genetics'],
        weaknesses: ['Evolution'],
        recentActivity: [
          { date: '2024-01-18', type: 'Quiz', subject: 'Biology', score: 88 },
          { date: '2024-01-16', type: 'Session', subject: 'Genetics', attendance: 'Present' },
          { date: '2024-01-11', type: 'Quiz', subject: 'Evolution', score: 70 }
        ]
      },
      { 
        id: 7, 
        name: 'Priya Patel', 
        subject: 'Tourism', 
        progress: 79, 
        lastActive: '2 days ago', 
        avatar: 'PP', 
        email: 'priya.p@student.com',
        phone: '+27 77 890 1234',
        grade: 12,
        school: 'Lenasia Secondary',
        joinDate: '18 Jan 2024',
        totalSessions: 9,
        averageScore: 74,
        completedQuizzes: 7,
        upcomingSession: 'Thursday, 11:00 AM',
        strengths: ['Tourism Geography', 'Marketing'],
        weaknesses: ['Sustainable Tourism'],
        recentActivity: [
          { date: '2024-01-15', type: 'Quiz', subject: 'Geography', score: 82 },
          { date: '2024-01-13', type: 'Session', subject: 'Marketing', attendance: 'Present' },
          { date: '2024-01-08', type: 'Quiz', subject: 'Sustainability', score: 65 }
        ]
      },
      { 
        id: 8, 
        name: 'Michael van der Merwe', 
        subject: 'Geography', 
        progress: 84, 
        lastActive: '6 hours ago', 
        avatar: 'MV', 
        email: 'michael.v@student.com',
        phone: '+27 78 901 2345',
        grade: 12,
        school: 'Paarl Gimnasium',
        joinDate: '3 Jan 2024',
        totalSessions: 16,
        averageScore: 80,
        completedQuizzes: 14,
        upcomingSession: 'Today, 3:30 PM',
        strengths: ['Climatology', 'Geomorphology'],
        weaknesses: ['Economic Geography'],
        recentActivity: [
          { date: '2024-01-19', type: 'Quiz', subject: 'Climate', score: 88 },
          { date: '2024-01-17', type: 'Session', subject: 'Geomorphology', attendance: 'Present' },
          { date: '2024-01-14', type: 'Quiz', subject: 'Economic', score: 72 }
        ]
      },
    ];

    const filteredStudents = allStudents.filter(student => 
      subjects.some(s => s.name === student.subject)
    );
    setStudents(filteredStudents);
  };

  const loadScheduleData = (subjects) => {
    const allScheduleItems = [
      { 
        id: 1, 
        time: '09:00 - 10:30', 
        subject: subjects[0]?.name || 'Mathematics', 
        type: 'Group Session', 
        students: '8 students', 
        color: subjects[0]?.color || '#3b82f6',
        date: 'Today',
        sessionId: 'sess_001',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        topic: 'Calculus Review: Derivatives',
        attendees: ['Thabo M.', 'Sipho D.', 'Lerato N.', '+5 more']
      },
      { 
        id: 2, 
        time: '11:00 - 12:30', 
        subject: subjects[1]?.name || 'Physical Science', 
        type: '1-on-1', 
        students: 'Lerato Ndlovu', 
        color: subjects[1]?.color || '#10b981',
        date: 'Today',
        sessionId: 'sess_002',
        meetingLink: 'https://meet.google.com/xyz-abcd-efg',
        topic: 'Chemical Bonding',
        attendees: ['Lerato N.']
      },
      { 
        id: 3, 
        time: '14:00 - 15:30', 
        subject: subjects[2]?.name || 'English', 
        type: 'Essay Review', 
        students: '5 students', 
        color: subjects[2]?.color || '#f59e0b',
        date: 'Today',
        sessionId: 'sess_003',
        meetingLink: 'https://meet.google.com/lmn-opqr-stu',
        topic: 'Poetry Analysis: "London"',
        attendees: ['Nomsa Z.', 'Priya P.', '+3 more']
      }
    ].filter(item => item.subject);

    setSchedule(allScheduleItems);
  };

  // Materials functions
  const fetchMaterials = async (tutorId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/materials/tutor/${tutorId}`);
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/subjects`);
      console.log('Subjects API response:', response.data);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setSubjects(response.data);
      } else if (response.data && response.data.content && Array.isArray(response.data.content) && response.data.content.length > 0) {
        setSubjects(response.data.content);
      } else {
        console.warn('No subjects from API, using default subjects');
        setSubjects([
          { id: 1, name: 'Mathematics', icon: '📐', color: '#3b82f6', bgColor: '#eff6ff' },
          { id: 2, name: 'Physical Science', icon: '⚛️', color: '#10b981', bgColor: '#f0fdf4' },
          { id: 3, name: 'English', icon: '📝', color: '#f59e0b', bgColor: '#fffbeb' },
          { id: 4, name: 'Mathematical Literacy', icon: '📊', color: '#8b5cf6', bgColor: '#f5f3ff' },
          { id: 5, name: 'Life Sciences', icon: '🧬', color: '#ec4899', bgColor: '#fdf2f8' },
          { id: 6, name: 'Geography', icon: '🌍', color: '#14b8a6', bgColor: '#f0fdfa' },
          { id: 7, name: 'History', icon: '📜', color: '#f97316', bgColor: '#fff7ed' },
          { id: 8, name: 'Accounting', icon: '💰', color: '#6b7280', bgColor: '#f3f4f6' },
          { id: 9, name: 'Business Studies', icon: '💼', color: '#84cc16', bgColor: '#f7fee7' },
          { id: 10, name: 'Economics', icon: '📈', color: '#06b6d4', bgColor: '#ecfeff' },
          { id: 11, name: 'Agricultural Sciences', icon: '🌾', color: '#2ecc71', bgColor: '#e8f8f5' },
          { id: 12, name: 'Tourism', icon: '✈️', color: '#e67e22', bgColor: '#fef5e7' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([
        { id: 1, name: 'Mathematics', icon: '📐', color: '#3b82f6', bgColor: '#eff6ff' },
        { id: 2, name: 'Physical Science', icon: '⚛️', color: '#10b981', bgColor: '#f0fdf4' },
        { id: 3, name: 'English', icon: '📝', color: '#f59e0b', bgColor: '#fffbeb' }
      ]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        setError('File size must be less than 100MB');
        setTimeout(() => setError(''), 3000);
        e.target.value = '';
        return;
      }
      setFormData(prev => ({
        ...prev,
        file: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError('');
    setSuccess('');

    if (!formData.file) {
      setError('Please select a file to upload');
      setUploading(false);
      return;
    }

    if (!formData.title) {
      setError('Please enter a title');
      setUploading(false);
      return;
    }

    if (!formData.subjectId && !formData.subjectName) {
      setError('Please select a subject');
      setUploading(false);
      return;
    }

    const uploadData = new FormData();
    uploadData.append('file', formData.file);
    uploadData.append('title', formData.title);
    uploadData.append('description', formData.description);
    uploadData.append('subjectId', formData.subjectId);
    uploadData.append('subjectName', formData.subjectName);
    uploadData.append('topic', formData.topic);
    uploadData.append('tags', formData.tags);
    uploadData.append('tutorId', user.id);

    try {
      await axios.post(`${API_BASE_URL}/materials/upload`, uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Material uploaded successfully!');
      setFormData({
        title: '',
        description: '',
        subjectId: '',
        subjectName: '',
        topic: '',
        tags: '',
        file: null
      });
      setShowUploadForm(false);
      fetchMaterials(user.id);
      
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error uploading material:', error);
      setError(error.response?.data?.error || 'Failed to upload material');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/materials/${materialId}`);
      setSuccess('Material deleted successfully');
      fetchMaterials(user.id);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting material:', error);
      setError('Failed to delete material');
      setTimeout(() => setError(''), 3000);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'document': return '📝';
      case 'presentation': return '📊';
      case 'video': return '🎥';
      case 'image': return '🖼️';
      default: return '📎';
    }
  };

  // Button handlers
  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const handleJoinSession = (session) => {
    setSelectedSession(session);
    setShowJoinModal(true);
  };

  const handleStartMeeting = () => {
    if (selectedSession?.meetingLink) {
      window.open(selectedSession.meetingLink, '_blank');
    }
    setShowJoinModal(false);
  };

 const handleSendMessage = (student) => {
  // Navigate to messages page with the selected student
  navigate('/tutor/messages', { state: { selectedStudent: student } });
};

  const handleScheduleMeeting = (student) => {
    setScheduledStudent(student);
    setNewSession({
      title: `${student.subject} Session - ${student.name}`,
      date: '',
      time: '',
      duration: '1',
      subject: student.subject,
      studentId: student.id,
      studentName: student.name
    });
    setShowScheduleModal(true);
  };

  const handleCreateSession = () => {
    if (!newSession.date || !newSession.time) {
      alert('Please select a date and time for the session');
      return;
    }

    const session = {
      id: sessions.length + 1,
      title: newSession.title,
      date: newSession.date,
      time: newSession.time,
      duration: newSession.duration,
      subject: newSession.subject,
      studentId: newSession.studentId,
      studentName: newSession.studentName,
      students: newSession.studentId ? 1 : 0,
      createdAt: new Date().toISOString()
    };
    
    const updatedSessions = [...sessions, session];
    setSessions(updatedSessions);
    localStorage.setItem('tutor_sessions', JSON.stringify(updatedSessions));
    
    // Calculate end time
    const [hours, minutes] = session.time.split(':');
    const totalMinutes = parseInt(hours) * 60 + parseInt(minutes) + (parseFloat(session.duration) * 60);
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    
    // Also add to schedule state
    const newScheduleItem = {
      id: session.id,
      time: `${session.time} - ${endTime}`,
      subject: session.subject,
      type: session.studentId ? '1-on-1' : 'Group Session',
      students: session.studentId ? session.studentName : `${session.students} student${session.students !== 1 ? 's' : ''}`,
      color: selectedSubjects.find(s => s.name === session.subject)?.color || '#48bb78',
      date: session.date,
      sessionId: `sess_${session.id}`,
      meetingLink: `https://meet.google.com/auto-generated-${session.id}`,
      topic: session.title,
      attendees: session.studentId ? [session.studentName] : []
    };
    
    setSchedule(prev => [...prev, newScheduleItem]);
    
    // Close modal and reset form
    setShowScheduleModal(false);
    setScheduledStudent(null);
    setNewSession({
      title: '',
      date: '',
      time: '',
      duration: '1',
      subject: '',
      studentId: null,
      studentName: ''
    });
    
    alert(`✅ Session scheduled successfully!\n\n📚 ${session.title}\n📅 Date: ${session.date}\n⏰ Time: ${session.time}\n👤 Student: ${session.studentName}`);
  };

  const handleViewProgress = (student) => {
    alert(`📊 Viewing detailed progress for ${student.name}\n\nThis feature will be available soon!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    if (user) {
      localStorage.removeItem(`tutor_subjects_${user.id}`);
    }
    navigate('/');
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const navigateTo = (path) => {
    navigate(path);
  };

  // Edit subjects button handler
  const handleChangeSubjects = () => {
    if (user && window.confirm('Changing subjects will reset your dashboard data. Continue?')) {
      localStorage.removeItem(`tutor_subjects_${user.id}`);
      navigate('/tutor/subject-selection');
    }
  };

  const groupScheduleByDate = () => {
    const grouped = {};
    schedule.forEach(item => {
      if (!grouped[item.date]) {
        grouped[item.date] = [];
      }
      grouped[item.date].push(item);
    });
    return grouped;
  };

  // Fetch materials when user is loaded and materials tab is active
  useEffect(() => {
    if (user && activeTab === 'materials') {
      fetchMaterials(user.id);
    }
  }, [user, activeTab]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="tutor-dashboard-pro">
      {/* Student Details Modal */}
      {showStudentModal && selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-content student-modal">
            <div className="modal-header" style={{ borderBottomColor: selectedSubjects.find(s => s.name === selectedStudent.subject)?.color || '#48bb78' }}>
              <h3>Student Profile</h3>
              <button className="modal-close" onClick={() => setShowStudentModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {/* Student Header */}
              <div className="student-profile-header">
                <div 
                  className="student-profile-avatar"
                  style={{ 
                    backgroundColor: selectedSubjects.find(s => s.name === selectedStudent.subject)?.bgColor || '#f0fdf4',
                    color: selectedSubjects.find(s => s.name === selectedStudent.subject)?.color || '#48bb78'
                  }}
                >
                  {selectedStudent.avatar}
                </div>
                <div className="student-profile-info">
                  <h2>{selectedStudent.name}</h2>
                  <p className="student-profile-email">{selectedStudent.email}</p>
                  <p className="student-profile-phone">{selectedStudent.phone}</p>
                </div>
                <div className="student-profile-status">
                  <span className="status-badge active">
                    Last active: {selectedStudent.lastActive}
                  </span>
                </div>
              </div>

              {/* Student Details Grid */}
              <div className="student-details-grid">
                <div className="detail-card">
                  <h4>Personal Information</h4>
                  <div className="detail-row">
                    <span className="detail-label">Grade:</span>
                    <span className="detail-value">{selectedStudent.grade}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">School:</span>
                    <span className="detail-value">{selectedStudent.school}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Joined:</span>
                    <span className="detail-value">{selectedStudent.joinDate}</span>
                  </div>
                </div>

                <div className="detail-card">
                  <h4>Academic Progress</h4>
                  <div className="detail-row">
                    <span className="detail-label">Subject:</span>
                    <span className="detail-value" style={{ color: selectedSubjects.find(s => s.name === selectedStudent.subject)?.color || '#48bb78' }}>
                      {selectedStudent.subject}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Overall Progress:</span>
                    <span className="detail-value progress-value">{selectedStudent.progress}%</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Average Score:</span>
                    <span className="detail-value">{selectedStudent.averageScore}%</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Sessions:</span>
                    <span className="detail-value">{selectedStudent.totalSessions}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Quizzes:</span>
                    <span className="detail-value">{selectedStudent.completedQuizzes}</span>
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="strengths-weaknesses">
                <div className="strengths-section">
                  <h4>💪 Strengths</h4>
                  <div className="tags">
                    {selectedStudent.strengths.map((strength, index) => (
                      <span key={index} className="tag strength-tag">{strength}</span>
                    ))}
                  </div>
                </div>
                <div className="weaknesses-section">
                  <h4>📚 Needs Improvement</h4>
                  <div className="tags">
                    {selectedStudent.weaknesses.map((weakness, index) => (
                      <span key={index} className="tag weakness-tag">{weakness}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="recent-activity">
                <h4>Recent Activity</h4>
                <div className="activity-timeline">
                  {selectedStudent.recentActivity.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-date">{activity.date}</div>
                      <div className="activity-details">
                        <span className="activity-type" style={{ 
                          backgroundColor: activity.type === 'Quiz' ? '#3b82f6' : '#10b981',
                          color: 'white'
                        }}>
                          {activity.type}
                        </span>
                        <span className="activity-subject">{activity.subject}</span>
                        {activity.score && (
                          <span className="activity-score">Score: {activity.score}%</span>
                        )}
                        {activity.attendance && (
                          <span className="activity-attendance">✓ {activity.attendance}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Session */}
              {selectedStudent.upcomingSession && (
                <div className="upcoming-session">
                  <h4>📅 Upcoming Session</h4>
                  <p>{selectedStudent.upcomingSession}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="modal-secondary-btn" onClick={() => handleSendMessage(selectedStudent)}>
                💬 Send Message
              </button>
              <button className="modal-secondary-btn" onClick={() => handleScheduleMeeting(selectedStudent)}>
                📅 Schedule Session
              </button>
              <button className="modal-secondary-btn" onClick={() => handleViewProgress(selectedStudent)}>
                📊 View Full Progress
              </button>
              <button className="modal-close-btn" onClick={() => setShowStudentModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Session Modal */}
      {showScheduleModal && scheduledStudent && (
        <div className="modal-overlay">
          <div className="modal-content schedule-modal">
            <div className="modal-header" style={{ borderBottomColor: selectedSubjects.find(s => s.name === scheduledStudent.subject)?.color || '#48bb78' }}>
              <h3>Schedule Session with {scheduledStudent.name}</h3>
              <button className="modal-close" onClick={() => setShowScheduleModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="student-info-summary">
                <div className="summary-avatar" style={{ 
                  backgroundColor: selectedSubjects.find(s => s.name === scheduledStudent.subject)?.bgColor || '#f0fdf4',
                  color: selectedSubjects.find(s => s.name === scheduledStudent.subject)?.color || '#48bb78'
                }}>
                  {scheduledStudent.avatar}
                </div>
                <div className="summary-info">
                  <h4>{scheduledStudent.name}</h4>
                  <p>{scheduledStudent.subject}</p>
                  <span className="student-email">{scheduledStudent.email}</span>
                </div>
              </div>
              
              <form className="schedule-form" onSubmit={(e) => { e.preventDefault(); handleCreateSession(); }}>
                <div className="form-group">
                  <label>Session Title *</label>
                  <input
                    type="text"
                    value={newSession.title}
                    onChange={(e) => setNewSession({...newSession, title: e.target.value})}
                    required
                    placeholder="e.g., Algebra Review Session"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      value={newSession.date}
                      onChange={(e) => setNewSession({...newSession, date: e.target.value})}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Time *</label>
                    <input
                      type="time"
                      value={newSession.time}
                      onChange={(e) => setNewSession({...newSession, time: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Duration (hours)</label>
                    <select
                      value={newSession.duration}
                      onChange={(e) => setNewSession({...newSession, duration: e.target.value})}
                    >
                      <option value="0.5">30 minutes</option>
                      <option value="1">1 hour</option>
                      <option value="1.5">1.5 hours</option>
                      <option value="2">2 hours</option>
                      <option value="2.5">2.5 hours</option>
                      <option value="3">3 hours</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    value={newSession.subject}
                    disabled
                    className="disabled-input"
                  />
                </div>
                
                <div className="session-details-preview">
                  <h4>Session Details Preview</h4>
                  <div className="preview-item">
                    <span className="preview-label">Student:</span>
                    <span className="preview-value">{scheduledStudent.name}</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Email:</span>
                    <span className="preview-value">{scheduledStudent.email}</span>
                  </div>
                  {newSession.date && newSession.time && (
                    <>
                      <div className="preview-item">
                        <span className="preview-label">Date & Time:</span>
                        <span className="preview-value">{new Date(newSession.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {newSession.time}</span>
                      </div>
                      <div className="preview-item">
                        <span className="preview-label">Duration:</span>
                        <span className="preview-value">{newSession.duration} hour{newSession.duration !== '1' ? 's' : ''}</span>
                      </div>
                    </>
                  )}
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="modal-cancel-btn" onClick={() => setShowScheduleModal(false)}>
                Cancel
              </button>
              <button 
                className="modal-create-btn" 
                onClick={handleCreateSession}
                style={{ backgroundColor: selectedSubjects.find(s => s.name === scheduledStudent.subject)?.color || '#48bb78' }}
              >
                Create Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Session Modal */}
      {showJoinModal && selectedSession && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header" style={{ borderBottomColor: selectedSession.color }}>
              <h3>Join Session</h3>
              <button className="modal-close" onClick={() => setShowJoinModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="session-details">
                <div className="session-detail-item">
                  <span className="detail-label">Subject:</span>
                  <span className="detail-value" style={{ color: selectedSession.color }}>
                    {selectedSession.subject}
                  </span>
                </div>
                <div className="session-detail-item">
                  <span className="detail-label">Topic:</span>
                  <span className="detail-value">{selectedSession.topic}</span>
                </div>
                <div className="session-detail-item">
                  <span className="detail-label">Time:</span>
                  <span className="detail-value">{selectedSession.date}, {selectedSession.time}</span>
                </div>
                <div className="session-detail-item">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">{selectedSession.type}</span>
                </div>
                <div className="session-detail-item">
                  <span className="detail-label">Participants:</span>
                  <span className="detail-value">{selectedSession.attendees?.join(', ')}</span>
                </div>
              </div>
              
              <div className="meeting-info">
                <h4>Meeting Information</h4>
                <p>You'll be redirected to Google Meet to start this session.</p>
                <div className="meeting-link-box">
                  <span className="link-label">Meeting Link:</span>
                  <a href={selectedSession.meetingLink} target="_blank" rel="noopener noreferrer">
                    {selectedSession.meetingLink}
                  </a>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-cancel-btn" onClick={() => setShowJoinModal(false)}>
                Cancel
              </button>
              <button 
                className="modal-join-btn" 
                onClick={handleStartMeeting}
                style={{ backgroundColor: selectedSession.color }}
              >
                Start Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <div className="logout-modal-icon"></div>
            <h3>Sign Out</h3>
            <p>Are you sure you want to sign out?</p>
            <div className="logout-modal-actions">
              <button className="logout-modal-cancel" onClick={cancelLogout}>
                Cancel
              </button>
              <button className="logout-modal-confirm" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo-area">
            <span className="logo-icon">📚</span>
            <span className="logo-text">Grade<span>12</span>Central</span>
          </div>
          <span className="role-indicator tutor">Tutor</span>
        </div>

        <div className="header-right">
          <div className="subject-indicators">
            {selectedSubjects.map(subject => (
              <span 
                key={subject.id} 
                className="subject-indicator"
                style={{ backgroundColor: subject.bgColor, color: subject.color }}
              >
                {subject.icon} {subject.name}
              </span>
            ))}
            
            <button 
              onClick={handleChangeSubjects}
              className="edit-subjects-indicator"
              title="Change Subjects"
              type="button"
            >
              ✏️ Edit Subjects
            </button>
          </div>

          <div className="user-menu">
            <div className="user-avatar" style={{ backgroundColor: selectedSubjects[0]?.color || '#48bb78' }}>
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="user-details">
              <span className="user-fullname">{user.firstName} {user.lastName}</span>
              <span className="user-role">Tutor</span>
            </div>
            
            <button 
              onClick={confirmLogout} 
              className="signout-button-enhanced" 
              title="Sign Out"
              type="button"
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Welcome Banner */}
        <div className="welcome-banner">
          <div className="banner-content">
            <h1>Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, {user.firstName}! 👋</h1>
            <p>Here's what's happening with your {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} today.</p>
          </div>
          <div className="banner-stats">
            <div className="banner-stat">
              <span className="stat-number">{students.length}</span>
              <span className="stat-label">Active Students</span>
            </div>
            <div className="banner-stat">
              <span className="stat-number">12</span>
              <span className="stat-label">Quizzes</span>
            </div>
            <div className="banner-stat">
              <span className="stat-number">85%</span>
              <span className="stat-label">Avg. Score</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
            type="button"
          >
            Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
            type="button"
          >
            My Students
          </button>
          <button 
            className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
            type="button"
          >
            Schedule
          </button>
          <button 
            className={`tab-button ${activeTab === 'materials' ? 'active' : ''}`}
            onClick={() => setActiveTab('materials')}
            type="button"
          >
            Materials
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <>
              {/* Schedule Preview */}
              <section className="content-section">
                <div className="section-header">
                  <h2>Today's Schedule</h2>
                  <button className="view-link" onClick={() => setActiveTab('schedule')}>View Full Schedule →</button>
                </div>
                <div className="schedule-grid">
                  {schedule.filter(item => item.date === 'Today').map(item => (
                    <div key={item.id} className="schedule-card" style={{ borderLeftColor: item.color }}>
                      <div className="schedule-card-time">{item.time}</div>
                      <div className="schedule-card-content">
                        <h3>{item.subject}</h3>
                        <p>{item.type} • {item.students}</p>
                        <small className="session-topic">{item.topic}</small>
                      </div>
                      <button 
                        className="schedule-card-action" 
                        style={{ backgroundColor: item.color }}
                        onClick={() => handleJoinSession(item)}
                        type="button"
                      >
                        Join
                      </button>
                    </div>
                  ))}
                  {schedule.filter(item => item.date === 'Today').length === 0 && (
                    <div className="empty-state">
                      <p>No sessions scheduled for today</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Students Preview */}
              <section className="content-section">
                <div className="section-header">
                  <h2>Recent Students</h2>
                  <button className="view-link" onClick={() => setActiveTab('students')}>View All →</button>
                </div>
                <div className="students-grid">
                  {students.slice(0, 4).map(student => {
                    const subject = selectedSubjects.find(s => s.name === student.subject);
                    return (
                      <div key={student.id} className="student-card" onClick={() => handleViewStudent(student)}>
                        <div className="student-card-avatar" style={{ backgroundColor: subject?.bgColor || '#f0fdf4' }}>
                          <span style={{ color: subject?.color || '#48bb78' }}>{student.avatar}</span>
                        </div>
                        <div className="student-card-info">
                          <h4>{student.name}</h4>
                          <p>{student.subject}</p>
                          <div className="progress-indicator">
                            <div className="progress-bar-bg">
                              <div className="progress-bar-fill" style={{ width: `${student.progress}%`, backgroundColor: subject?.color || '#48bb78' }}></div>
                            </div>
                            <span className="progress-text">{student.progress}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Quick Actions */}
              <section className="content-section">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
                  <button className="action-card" onClick={() => navigateTo('/tutor/quizzes')} type="button">
                    <div className="action-icon-wrapper" style={{ backgroundColor: selectedSubjects[0]?.bgColor || '#f0fdf4' }}>
                      <span style={{ color: selectedSubjects[0]?.color || '#48bb78' }}>📝</span>
                    </div>
                    <h3>Create Quiz</h3>
                    <p>Design practice questions</p>
                  </button>

                  <button 
                    className="action-card" 
                    onClick={() => {
                      setActiveTab('materials');
                      setShowUploadForm(true);
                    }} 
                    type="button"
                  >
                    <div className="action-icon-wrapper" style={{ backgroundColor: selectedSubjects[1]?.bgColor || '#f0fdf4' }}>
                      <span style={{ color: selectedSubjects[1]?.color || '#48bb78' }}>📄</span>
                    </div>
                    <h3>Upload Material</h3>
                    <p>Share study guides</p>
                  </button>

                  <button className="action-card" onClick={() => {
                    if (students.length > 0) {
                      handleScheduleMeeting(students[0]);
                    } else {
                      alert('Please add students first');
                    }
                  }} type="button">
                    <div className="action-icon-wrapper" style={{ backgroundColor: selectedSubjects[2]?.bgColor || '#f0fdf4' }}>
                      <span style={{ color: selectedSubjects[2]?.color || '#48bb78' }}>📅</span>
                    </div>
                    <h3>Schedule Session</h3>
                    <p>Plan tutoring sessions</p>
                  </button>

                  <button className="action-card" onClick={() => navigateTo('/tutor/feedback')} type="button">
                    <div className="action-icon-wrapper" style={{ backgroundColor: selectedSubjects[0]?.bgColor || '#f0fdf4' }}>
                      <span style={{ color: selectedSubjects[0]?.color || '#48bb78' }}>💬</span>
                    </div>
                    <h3>Feedback</h3>
                    <p>Review responses</p>
                  </button>
                </div>
              </section>
            </>
          )}

          {activeTab === 'students' && (
            <section className="content-section full-width">
              <h2>My Students</h2>
              <div className="students-table-container">
                <table className="students-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Subject</th>
                      <th>Progress</th>
                      <th>Last Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => {
                      const subject = selectedSubjects.find(s => s.name === student.subject);
                      return (
                        <tr key={student.id}>
                          <td>
                            <div className="student-info-cell">
                              <div className="student-avatar-small" style={{ backgroundColor: subject?.bgColor || '#f0fdf4', color: subject?.color || '#48bb78' }}>
                                {student.avatar}
                              </div>
                              <div>
                                <div className="student-name">{student.name}</div>
                                <div className="student-email">{student.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="subject-tag-small" style={{ backgroundColor: subject?.bgColor || '#f0fdf4', color: subject?.color || '#48bb78' }}>
                              {subject?.icon} {student.subject}
                            </span>
                          </td>
                          <td>
                            <div className="progress-cell">
                              <div className="progress-bar-small">
                                <div className="progress-fill-small" style={{ width: `${student.progress}%`, backgroundColor: subject?.color || '#48bb78' }}></div>
                              </div>
                              <span className="progress-value">{student.progress}%</span>
                            </div>
                          </td>
                          <td>{student.lastActive}</td>
                          <td>
                            <div className="action-buttons-cell">
                              <button 
                                className="table-action-btn view-btn" 
                                style={{ color: subject?.color || '#48bb78', borderColor: subject?.color || '#48bb78' }}
                                onClick={() => handleViewStudent(student)}
                                type="button"
                              >
                                View
                              </button>
                              <button 
                                className="table-action-btn message-btn" 
                                style={{ color: '#3b82f6', borderColor: '#3b82f6' }}
                                onClick={() => handleSendMessage(student)}
                                title="Send Message"
                                type="button"
                              >
                                💬
                              </button>
                              <button 
                                className="table-action-btn schedule-btn" 
                                style={{ color: '#f59e0b', borderColor: '#f59e0b' }}
                                onClick={() => handleScheduleMeeting(student)}
                                title="Schedule Session"
                                type="button"
                              >
                                📅
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'schedule' && (
            <section className="content-section full-width">
              <h2>Full Schedule</h2>
              <div className="schedule-container">
                {Object.entries(groupScheduleByDate()).map(([date, items]) => (
                  <div key={date} className="schedule-date-group">
                    <h3 className="date-header">{date}</h3>
                    <div className="schedule-list">
                      {items.map(item => (
                        <div key={item.id} className="schedule-list-item" style={{ borderLeftColor: item.color }}>
                          <div className="schedule-item-time">{item.time}</div>
                          <div className="schedule-item-details">
                            <h4>{item.subject}</h4>
                            <p className="schedule-item-topic">{item.topic}</p>
                            <div className="schedule-item-meta">
                              <span className="schedule-item-type" style={{ backgroundColor: item.color + '20', color: item.color }}>
                                {item.type}
                              </span>
                              <span className="schedule-item-students">👥 {item.students}</span>
                            </div>
                          </div>
                          <button 
                            className="schedule-item-join"
                            style={{ backgroundColor: item.color }}
                            onClick={() => handleJoinSession(item)}
                            type="button"
                          >
                            Join
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'materials' && (
            <div className="material-container-inline">
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              {showUploadForm && (
                <div className="upload-form-container">
                  <div className="upload-form-header">
                    <h2>Upload New Material</h2>
                    <button onClick={() => setShowUploadForm(false)} className="close-form-btn">×</button>
                  </div>
                  <form onSubmit={handleSubmit} className="upload-form">
                    <div className="form-group">
                      <label>Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter material title"
                      />
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Describe what this material is about"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Subject *</label>
                        <select
                          name="subjectId"
                          value={formData.subjectId}
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            const selectedSubject = subjects.find(s => s.id.toString() === selectedId);
                            setFormData(prev => ({ 
                              ...prev, 
                              subjectId: selectedId,
                              subjectName: selectedSubject?.name || ''
                            }));
                          }}
                          required
                          className="subject-select"
                        >
                          <option value="">Select a subject</option>
                          {subjects.map(subject => (
                            <option key={subject.id} value={subject.id}>
                              {subject.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Topic</label>
                        <input
                          type="text"
                          name="topic"
                          value={formData.topic}
                          onChange={handleInputChange}
                          placeholder="e.g., Algebra, Grammar, etc."
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Tags (comma-separated)</label>
                      <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleInputChange}
                        placeholder="e.g., beginner, advanced, practice"
                      />
                    </div>

                    <div className="form-group">
                      <label>File *</label>
                      <input
                        type="file"
                        id="file-input"
                        name="file"
                        onChange={handleFileChange}
                        required
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.jpg,.jpeg,.png"
                      />
                      <small>Supported: PDF, DOC, DOCX, PPT, PPTX, MP4, JPG, PNG (Max 100MB)</small>
                    </div>

                    <button type="submit" className="submit-btn" disabled={uploading}>
                      {uploading ? 'Uploading...' : 'Upload Material'}
                    </button>
                  </form>
                </div>
              )}

              <div className="materials-list">
                <div className="materials-header">
                  <h2>Your Materials ({materials.length})</h2>
                  {!showUploadForm && (
                    <button onClick={() => setShowUploadForm(true)} className="upload-new-btn">
                      + Upload New Material
                    </button>
                  )}
                </div>
                {materials.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📚</div>
                    <p>No materials uploaded yet</p>
                    <button onClick={() => setShowUploadForm(true)} className="empty-upload-btn">
                      Upload Your First Material
                    </button>
                  </div>
                ) : (
                  <div className="materials-grid">
                    {materials.map(material => (
                      <div key={material.id} className="material-card-item">
                        <div className="material-icon">{getFileIcon(material.materialType)}</div>
                        <div className="material-info">
                          <h3>{material.title}</h3>
                          <p>{material.description || 'No description'}</p>
                          <div className="material-meta">
                            <span className="material-type-badge">{material.materialType}</span>
                            <span>{formatFileSize(material.fileSize)}</span>
                            <span>👁️ {material.views || 0}</span>
                            <span>⬇️ {material.downloads || 0}</span>
                          </div>
                          {material.tags && material.tags.length > 0 && (
                            <div className="material-tags">
                              {material.tags.map((tag, idx) => (
                                <span key={idx} className="tag">#{tag}</span>
                              ))}
                            </div>
                          )}
                          <div className="material-actions">
                            <a href={`http://localhost:8080${material.fileUrl}`} target="_blank" rel="noopener noreferrer" className="view-btn">
                              View
                            </a>
                            <button onClick={() => handleDeleteMaterial(material.id)} className="delete-btn">
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TutorDashboard;