import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
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
<<<<<<< HEAD
=======
  const [showQuizModal, setShowQuizModal] = useState(false);
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showSubjectChangeModal, setShowSubjectChangeModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
<<<<<<< HEAD

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledStudent, setScheduledStudent] = useState(null);
  const [newSession, setNewSession] = useState({
    title: '', date: '', time: '', duration: '60', subject: '', studentId: null, studentName: ''
  });
  const [sessionError, setSessionError] = useState('');

=======
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  
  // Materials state (from Boity)
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
  const [uploading, setUploading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // ✅ materialType instead of uploadMode
  const [formData, setFormData] = useState({
    title: '', description: '', subjectId: '', subjectName: '',
    topic: '', tags: '', file: null, videoLink: '',
    materialType: 'paper'   // 'paper', 'note', 'video'
  });

  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState('');
<<<<<<< HEAD
  const [success, setSuccess] = useState('');

  const fileInputRef = useRef(null);

  // ─── Data fetching ────────────────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    const formatDateGroup = (dateStr) => {
      const inputDate = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const inputDateOnly = new Date(inputDate);
      inputDateOnly.setHours(0, 0, 0, 0);
      if (inputDateOnly.getTime() === today.getTime()) return 'Today';
      if (inputDateOnly.getTime() === tomorrow.getTime()) return 'Tomorrow';
      return inputDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (dateStr) =>
      new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const transformSession = (session) => {
      const subjectColors = {
        'Mathematics': '#667eea', 'English': '#48bb78',
        'Physics': '#ed8936', 'Chemistry': '#9f7aea',
        'Biology': '#38b2ac', 'History': '#f687b3',
      };
      const subjectName = session.subjectName || 'General';
      return {
        id: session.id,
        date: formatDateGroup(session.startTime),
        time: formatTime(session.startTime),
        subject: subjectName,
        topic: session.topic || session.title,
        type: session.sessionType || 'LIVE',
        students: `${session.currentStudents || 0}/${session.maxStudents || 10}`,
        meetingLink: session.meetingLink,
        color: subjectColors[subjectName] || '#718096',
        startTime: session.startTime,
      };
    };

    try {
      const dashboardRes = await api.get('/tutor/dashboard');
      const dashboardData = dashboardRes.data;
      setUser(dashboardData.tutor);

      let subjs = dashboardData.tutor?.subjects || [];
      if (subjs.length === 0) {
        const stored = localStorage.getItem(`tutor_subjects_${dashboardData.tutor?.id}`);
        if (stored) subjs = JSON.parse(stored);
      }
      setSelectedSubjects(subjs);
      setStudents(dashboardData.students || []);

      const sessionsRes = await api.get('/sessions');
      const transformed = (sessionsRes.data || []).map(transformSession);
      transformed.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      setSchedule(transformed);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Could not load dashboard data. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);
=======
  const [materialSuccess, setMaterialSuccess] = useState('');
  
  // Chat state
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedChatStudent, setSelectedChatStudent] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [unreadMessagesData, setUnreadMessagesData] = useState([]);
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
    } catch (err) {
      console.error('Failed to load subjects:', err);
    }
  }, []);

<<<<<<< HEAD
  const fetchMaterials = useCallback(async (tutorId) => {
    try {
      const res = await api.get(`/materials/tutor/${tutorId}`);
      setMaterials(res.data);
    } catch (err) {
      console.error('Failed to load materials:', err);
      setMaterials([]);
    }
  }, []);
=======
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 0,
    marks: 1
  });
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734

  // Load user and subjects
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
<<<<<<< HEAD
    if (!userData || !token) { navigate('/login'); return; }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.category !== 'tutor') { navigate('/login'); return; }
    setUser(parsedUser);
    fetchDashboard();
    fetchSubjects();
  }, [navigate, fetchDashboard, fetchSubjects]);

  useEffect(() => {
    if (user && activeTab === 'materials') fetchMaterials(user.id);
  }, [user, activeTab, fetchMaterials]);

  // ─── Form handlers ────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
=======
    
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
      
      const savedSubjects = localStorage.getItem(`tutor_subjects_${parsedUser.id}`);
      if (savedSubjects) {
        const subjects = JSON.parse(savedSubjects);
        setSelectedSubjects(subjects);
      } else {
        navigate('/tutor/subject-selection');
      }
      
      fetchDashboardData();
      loadMockSchedule(parsedUser, savedSubjects ? JSON.parse(savedSubjects) : []);
      fetchSubjects();
      
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Poll for unread messages every 10 seconds
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Fetch materials when user is loaded and materials tab is active
  useEffect(() => {
    if (user && activeTab === 'materials') {
      fetchMaterials(user.id);
    }
  }, [user, activeTab]);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/chat/unread/tutor/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.totalUnread || 0);
        setUnreadMessagesData(data.subjects || []);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      setDebugInfo('Fetching dashboard data...');
      
      const [studentsData, quizzesData] = await Promise.all([
        fetchMyStudents(),
        fetchMyQuizzes()
      ]);
      
      setStudents(studentsData);
      setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
      
      const stats = {};
      studentsData.forEach(student => {
        const key = student.subjectId;
        if (!stats[key]) {
          stats[key] = {
            subjectId: student.subjectId,
            subjectName: student.subjectName,
            subjectIcon: student.subjectIcon,
            subjectColor: student.subjectColor,
            count: 0
          };
        }
        stats[key].count++;
      });
      
      setSubjectStats(Object.values(stats));
      setDebugInfo(`Found ${studentsData.length} students and ${quizzesData.length} quizzes`);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDebugInfo(`Error: ${error.message}`);
      
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  };

  const fetchMyStudents = async () => {
    try {
      const data = await authFetch('/quizzes/tutor/students');
      console.log('Students fetched:', data);
      return data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  };

  const fetchMyQuizzes = async () => {
    try {
      const data = await authFetch('/quizzes/tutor/quizzes');
      console.log('Quizzes fetched:', data);
      return data;
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      throw error;
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/subjects`);
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setSubjects(response.data);
      } else {
        setSubjects([
          { id: 1, name: 'Mathematics', icon: '📐', color: '#3b82f6', bgColor: '#eff6ff' },
          { id: 2, name: 'Physical Science', icon: '⚛️', color: '#10b981', bgColor: '#f0fdf4' },
          { id: 3, name: 'English', icon: '📝', color: '#f59e0b', bgColor: '#fffbeb' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchMaterials = async (tutorId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/materials/tutor/${tutorId}`);
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const loadMockSchedule = (user, subjects) => {
    if (subjects.length > 0) {
      const mockSchedule = [
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
          attendees: ['Thabo M.', 'Sipho D.', '+6 more']
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
          date: 'Tomorrow',
          sessionId: 'sess_003',
          meetingLink: 'https://meet.google.com/lmn-opqr-stu',
          topic: 'Poetry Analysis',
          attendees: ['Nomsa Z.', '+4 more']
        }
      ].filter(item => item.subject);
      setSchedule(mockSchedule);
    }
  };

  const checkAllStudentSubjects = async () => {
    try {
      setDebugInfo('Checking database...');
      const data = await authFetch('/quizzes/debug/student-subjects');
      console.log('All student-subject relationships:', data);
      alert(`Found ${data.length} student-subject relationships. Check console for details.`);
      setDebugInfo(`Found ${data.length} student-subject entries`);
      await fetchDashboardData();
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    }
  };

  const debugAuthInfo = async () => {
    try {
      const data = await authFetch('/quizzes/debug/auth-info');
      console.log('Auth Info:', data);
      alert(JSON.stringify(data, null, 2));
      setDebugInfo(`Auth: ${data.email}, Category: ${data.tutorCategory}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    }
  };

  // Chat function - Open chat with student
  const handleOpenChat = (student) => {
    setSelectedChatStudent(student);
    setShowChatModal(true);
    setTimeout(() => fetchUnreadCount(), 1000);
  };

  const handleSendMessage = (student) => {
    handleOpenChat(student);
  };

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

  const handleScheduleMeeting = (student) => {
    alert(`📅 Schedule a session with ${student.studentName}\n\nThis feature will be available soon!`);
  };

  const handleViewProgress = (student) => {
    alert(`📊 Viewing detailed progress for ${student.studentName}\n\nThis feature will be available soon!`);
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

  const confirmLogout = () => setShowLogoutConfirm(true);
  const cancelLogout = () => setShowLogoutConfirm(false);

  const handleChangeSubjects = () => {
    if (user && window.confirm('Changing subjects will reset your dashboard data. Continue?')) {
      localStorage.removeItem(`tutor_subjects_${user.id}`);
      navigate('/tutor/subject-selection');
    }
  };

  // Materials functions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
<<<<<<< HEAD
    if (file && file.size > 100 * 1024 * 1024) {
      setError('File size must be less than 100MB');
      setTimeout(() => setError(''), 3000);
      e.target.value = '';
      return;
    }
    setFormData(prev => ({ ...prev, file }));
  };

  const handleMaterialTypeChange = (e) => {
    const newType = e.target.value;
    setFormData(prev => ({
      ...prev,
      materialType: newType,
      file: null,
      videoLink: '',
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', subjectId: '', subjectName: '',
      topic: '', tags: '', file: null, videoLink: '',
      materialType: 'paper',
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Title is required.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (!formData.subjectId) {
      setError('Subject is required.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (formData.materialType === 'video') {
      if (!formData.videoLink.trim()) {
        setError('Please enter a video link.');
        setTimeout(() => setError(''), 3000);
        return;
      }
    } else {
      if (!formData.file) {
        setError('Please select a file.');
        setTimeout(() => setError(''), 3000);
        return;
      }
    }

    const truncatedDescription = (formData.description || '').substring(0, 255);

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('title', formData.title.trim());
    uploadData.append('description', truncatedDescription);
    uploadData.append('subjectId', Number(formData.subjectId));
    uploadData.append('topic', formData.topic || '');
    uploadData.append('tags', formData.tags || '');
    uploadData.append('tutorId', user.id);
    uploadData.append('materialType', formData.materialType);

    if (formData.materialType === 'video') {
      uploadData.append('videoLink', formData.videoLink.trim());
    } else {
      uploadData.append('file', formData.file);
    }

    try {
      await api.post('/materials/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Material uploaded successfully!');
      resetForm();
      setShowUploadForm(false);
      await fetchMaterials(user.id);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Upload failed';
      setError(msg);
=======
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

  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError('');
    setMaterialSuccess('');

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

      setMaterialSuccess('Material uploaded successfully!');
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
      
      setTimeout(() => setMaterialSuccess(''), 3000);
    } catch (error) {
      console.error('Error uploading material:', error);
      setError(error.response?.data?.error || 'Failed to upload material');
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
<<<<<<< HEAD
    if (!window.confirm('Delete this material?')) return;
    try {
      await api.delete(`/materials/${materialId}`);
      setSuccess('Deleted');
      fetchMaterials(user.id);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Delete failed');
=======
    if (!window.confirm('Are you sure you want to delete this material?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/materials/${materialId}`);
      setMaterialSuccess('Material deleted successfully');
      fetchMaterials(user.id);
      setTimeout(() => setMaterialSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting material:', error);
      setError('Failed to delete material');
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
      setTimeout(() => setError(''), 3000);
    }
  };

<<<<<<< HEAD
  // ─── Schedule helpers ─────────────────────────────────────────────────────
  const groupScheduleByDate = () => {
    const grouped = {};
    schedule.forEach(item => {
      if (!grouped[item.date]) grouped[item.date] = [];
      grouped[item.date].push(item);
    });
    const order = { 'Today': 0, 'Tomorrow': 1 };
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      const aO = order[a] !== undefined ? order[a] : 2;
      const bO = order[b] !== undefined ? order[b] : 2;
      if (aO !== bO) return aO - bO;
      return new Date(a) - new Date(b);
    });
    const out = {};
    sortedDates.forEach(d => { out[d] = grouped[d]; });
    return out;
  };

  const handleJoinSession = (session) => { setSelectedSession(session); setShowJoinModal(true); };
  const handleStartMeeting = () => { if (selectedSession?.meetingLink) window.open(selectedSession.meetingLink, '_blank'); setShowJoinModal(false); };
  const handleSendMessage = (student) => navigate('/tutor/messages', { state: { selectedStudent: student } });
  const handleViewStudent = (student) => { setSelectedStudent(student); setShowStudentModal(true); };
  const handleLogout = () => { localStorage.clear(); navigate('/login'); };
  const confirmLogout = () => setShowLogoutConfirm(true);
  const cancelLogout = () => setShowLogoutConfirm(false);
  const navigateTo = (path) => navigate(path);
  const handleChangeSubjects = () => setShowSubjectChangeModal(true);
  const cancelSubjectChange = () => setShowSubjectChangeModal(false);
  const getMinDate = () => new Date().toISOString().split('T')[0];

  const confirmSubjectChange = () => {
    localStorage.removeItem(`tutor_subjects_${user.id}`);
    setShowSubjectChangeModal(false);
    navigate('/tutor/subject-selection');
  };

  const handleScheduleMeeting = (student) => {
    setScheduledStudent(student);
    setSessionError('');
    setNewSession({
      title: `${student.subject} Session - ${student.name}`,
      date: '', time: '', duration: '60',
      subject: student.subject, studentId: student.id, studentName: student.name,
    });
    setShowScheduleModal(true);
  };

  const handleCreateSession = async () => {
    setSessionError('');
    if (!newSession.date) { setSessionError('Please select a date'); return; }
    if (!newSession.time) { setSessionError('Please select a time'); return; }
    if (!newSession.duration || parseInt(newSession.duration) < 15) { setSessionError('Duration must be at least 15 minutes'); return; }
=======
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

  // Quiz functions
  const handleQuizFormChange = (e) => {
    const { name, value } = e.target;
    setQuizForm(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion(prev => ({ ...prev, [name]: value }));
  };

  const addQuestion = () => {
    if (!currentQuestion.question || !currentQuestion.optionA || !currentQuestion.optionB) {
      alert('Please fill in at least the question and first two options');
      return;
    }

    setQuizForm(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion, id: Date.now() }]
    }));

    setCurrentQuestion({
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 0,
      marks: 1
    });
  };

  const removeQuestion = (questionId) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const submitQuiz = async () => {
    if (!quizForm.title || !quizForm.subjectId || quizForm.questions.length === 0) {
      alert('Please fill in all required fields and add at least one question');
      return;
    }

    setIsSubmitting(true);
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734

    try {
      const payload = {
        title: newSession.title.trim(),
        topic: newSession.subject,
        description: `Session with ${newSession.studentName}`,
        startTime: `${newSession.date}T${newSession.time}:00.000Z`,
        duration: parseInt(newSession.duration, 10),
        sessionType: 'LIVE',
        maxStudents: 1,
        meetingProvider: 'GOOGLE_MEET',
        subjectId: null,
      };
      await api.post('/sessions', payload);
      setShowScheduleModal(false);
      await fetchDashboard();
      setSuccess('Session scheduled successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to create session';
      setSessionError(msg);
    }
  };

  // ─── Loading / auth guard ─────────────────────────────────────────────────
  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!user) return null;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="tutor-dashboard-pro">
<<<<<<< HEAD
      {/* Header */}
=======
      {/* Notification Bell */}
      <div className="notification-bell-container">
        <button 
          className={`notification-bell ${unreadCount > 0 ? 'has-notifications' : ''}`}
          onClick={() => setShowNotificationPanel(!showNotificationPanel)}
        >
          🔔
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>
        
        {showNotificationPanel && unreadCount > 0 && (
          <div className="notification-panel">
            <div className="notification-panel-header">
              <h4>Unread Messages ({unreadCount})</h4>
              <button onClick={() => setShowNotificationPanel(false)}>×</button>
            </div>
            <div className="notification-panel-body">
              {unreadMessagesData.map(subject => {
                const student = students.find(s => s.subjectId === subject.subjectId);
                return (
                  <div key={subject.subjectId} className="notification-item">
                    <div className="notification-avatar" style={{ backgroundColor: subject.subjectColor + '20', color: subject.subjectColor }}>
                      {subject.subjectIcon}
                    </div>
                    <div className="notification-content">
                      <div className="notification-student">{subject.subjectName}</div>
                      <div className="notification-message">
                        {subject.lastMessage?.message?.substring(0, 50)}...
                      </div>
                      <div className="notification-time">{subject.lastMessage?.formattedTime}</div>
                    </div>
                    <button 
                      className="notification-reply-btn"
                      onClick={() => {
                        if (student) {
                          handleOpenChat(student);
                          setShowNotificationPanel(false);
                        }
                      }}
                    >
                      Reply
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {showChatModal && selectedChatStudent && (
        <Chat
          studentId={selectedChatStudent.studentId}
          tutorId={user.id}
          subjectId={selectedChatStudent.subjectId}
          subjectName={selectedChatStudent.subjectName}
          tutorName={user.firstName + ' ' + user.lastName}
          studentName={selectedChatStudent.studentName}
          userRole="tutor"
          onClose={() => {
            setShowChatModal(false);
            fetchUnreadCount();
          }}
        />
      )}

      {showSuccessMessage && (
        <div className="success-toast">
          <span className="success-icon">✅</span> {successMessage}
        </div>
      )}

      {/* Student Details Modal */}
      {showStudentModal && selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-content student-modal">
            <div className="modal-header" style={{ borderBottomColor: selectedSubjects.find(s => s.id === selectedStudent.subjectId)?.color || '#48bb78' }}>
              <h3>Student Profile</h3>
              <button className="modal-close" onClick={() => setShowStudentModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="student-profile-header">
                <div 
                  className="student-profile-avatar"
                  style={{ 
                    backgroundColor: `${selectedStudent.subjectColor}20`,
                    color: selectedStudent.subjectColor
                  }}
                >
                  {selectedStudent.studentName.charAt(0)}
                </div>
                <div className="student-profile-info">
                  <h2>{selectedStudent.studentName}</h2>
                  <p className="student-profile-email">{selectedStudent.studentEmail}</p>
                </div>
                <div className="student-profile-status">
                  <span className="status-badge active">
                    Last active: {selectedStudent.lastActive || 'Recently'}
                  </span>
                </div>
              </div>

              <div className="student-details-grid">
                <div className="detail-card">
                  <h4>Academic Progress</h4>
                  <div className="detail-row">
                    <span className="detail-label">Subject:</span>
                    <span className="detail-value" style={{ color: selectedStudent.subjectColor }}>
                      {selectedStudent.subjectName}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Progress:</span>
                    <span className="detail-value progress-value">{selectedStudent.progress}%</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Grade:</span>
                    <span className="detail-value">{selectedStudent.grade || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="upcoming-session">
                <h4>📅 Next Session</h4>
                <p>Session will be scheduled soon</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-secondary-btn" onClick={() => handleSendMessage(selectedStudent)}>
                💬 Send Message
              </button>
              <button className="modal-secondary-btn" onClick={() => handleScheduleMeeting(selectedStudent)}>
                📅 Schedule Session
              </button>
              <button className="modal-secondary-btn" onClick={() => handleViewProgress(selectedStudent)}>
                📊 View Progress
              </button>
              <button className="modal-close-btn" onClick={() => setShowStudentModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuizModal && (
        <div className="quiz-modal-overlay">
          <div className="quiz-modal">
            <div className="quiz-modal-header">
              <h2>Create New Quiz</h2>
              <button className="close-modal-btn" onClick={() => setShowQuizModal(false)}>×</button>
            </div>
            
            <div className="quiz-modal-body">
              <div className="quiz-form-section">
                <h3>Quiz Details</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Quiz Title *</label>
                    <input type="text" name="title" value={quizForm.title} onChange={handleQuizFormChange} />
                  </div>
                  
                  <div className="form-group">
                    <label>Subject *</label>
                    <select name="subjectId" value={quizForm.subjectId} onChange={handleQuizFormChange}>
                      <option value="">Select Subject</option>
                      {selectedSubjects.map(subject => (
                        <option key={subject.id} value={subject.id}>{subject.icon} {subject.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Time Limit (minutes)</label>
                    <input type="number" name="timeLimitMinutes" value={quizForm.timeLimitMinutes} onChange={handleQuizFormChange} />
                  </div>
                  
                  <div className="form-group">
                    <label>Difficulty</label>
                    <select name="difficulty" value={quizForm.difficulty} onChange={handleQuizFormChange}>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea name="description" value={quizForm.description} onChange={handleQuizFormChange} rows="2" />
                  </div>
                </div>
              </div>

              <div className="quiz-form-section">
                <h3>Add Questions</h3>
                <div className="question-form">
                  <div className="form-group full-width">
                    <label>Question *</label>
                    <input type="text" name="question" value={currentQuestion.question} onChange={handleQuestionChange} />
                  </div>
                  
                  <div className="options-grid">
                    <div className="form-group"><label>Option A *</label><input type="text" name="optionA" value={currentQuestion.optionA} onChange={handleQuestionChange} /></div>
                    <div className="form-group"><label>Option B *</label><input type="text" name="optionB" value={currentQuestion.optionB} onChange={handleQuestionChange} /></div>
                    <div className="form-group"><label>Option C</label><input type="text" name="optionC" value={currentQuestion.optionC} onChange={handleQuestionChange} /></div>
                    <div className="form-group"><label>Option D</label><input type="text" name="optionD" value={currentQuestion.optionD} onChange={handleQuestionChange} /></div>
                  </div>
                  
                  <div className="options-row">
                    <div className="form-group">
                      <label>Correct Option</label>
                      <select name="correctOption" value={currentQuestion.correctOption} onChange={handleQuestionChange}>
                        <option value={0}>A</option>
                        <option value={1}>B</option>
                        <option value={2}>C</option>
                        <option value={3}>D</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Marks</label>
                      <input type="number" name="marks" value={currentQuestion.marks} onChange={handleQuestionChange} />
                    </div>
                    <button className="add-question-btn" onClick={addQuestion}>+ Add Question</button>
                  </div>
                </div>

                {quizForm.questions.length > 0 && (
                  <div className="questions-list">
                    <h4>Questions Added ({quizForm.questions.length})</h4>
                    {quizForm.questions.map((q, index) => (
                      <div key={q.id} className="question-item">
                        <div className="question-number">Q{index + 1}</div>
                        <div className="question-preview">
                          <p>{q.question}</p>
                        </div>
                        <div className="question-actions">
                          <span className="question-marks">{q.marks} mark{q.marks > 1 ? 's' : ''}</span>
                          <button className="remove-question-btn" onClick={() => removeQuestion(q.id)}>×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="quiz-modal-footer">
              <button className="cancel-btn" onClick={() => setShowQuizModal(false)}>Cancel</button>
              <button className="submit-quiz-btn" onClick={submitQuiz} disabled={quizForm.questions.length === 0 || isSubmitting}>
                {isSubmitting ? 'Uploading...' : 'Upload Quiz'}
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
              <button className="logout-modal-cancel" onClick={cancelLogout}>Cancel</button>
              <button className="logout-modal-confirm" onClick={handleLogout}>Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {/* Header - Boity's Design */}
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
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
              <span key={subject.id} className="subject-indicator"
                style={{ backgroundColor: subject.bgColor, color: subject.color }}>
                {subject.icon} {subject.name}
              </span>
            ))}
<<<<<<< HEAD
            <button onClick={handleChangeSubjects} className="edit-subjects-indicator">✏️ Edit Subjects</button>
=======
            <button 
              onClick={handleChangeSubjects}
              className="edit-subjects-indicator"
              title="Change Subjects"
              type="button"
            >
              ✏️ Edit Subjects
            </button>
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
          </div>
          <div className="user-menu">
            <div className="user-avatar">{user.firstName?.[0]}{user.lastName?.[0]}</div>
            <div className="user-details">
              <span className="user-fullname">{user.firstName} {user.lastName}</span>
              <span className="user-role">Tutor</span>
            </div>
<<<<<<< HEAD
            <button onClick={confirmLogout} className="signout-button-enhanced">🚪 Sign Out</button>
=======
            <button 
              onClick={confirmLogout} 
              className="signout-button-enhanced" 
              title="Sign Out"
              type="button"
            >
              🚪 Sign Out
            </button>
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
          </div>
        </div>
      </header>

      <main className="dashboard-main">
<<<<<<< HEAD
=======
        {/* Welcome Banner - Boity's Design */}
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
        <div className="welcome-banner">
          <div className="banner-content">
            <h1>Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, {user.firstName}! 👋</h1>
            <p>Here's what's happening with your {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} today.</p>
          </div>
          <div className="banner-stats">
            <div className="banner-stat"><span className="stat-number">{students.length}</span><span className="stat-label">Active Students</span></div>
            <div className="banner-stat"><span className="stat-number">{materials.length}</span><span className="stat-label">Materials</span></div>
            <div className="banner-stat"><span className="stat-number">{schedule.filter(s => s.date === 'Today').length}</span><span className="stat-label">Today's Sessions</span></div>
          </div>
        </div>

<<<<<<< HEAD
        {success && (
          <div className="error-banner" style={{ background: '#f0fff4', borderColor: '#9ae6b4', color: '#276749' }}>
            ✅ {success}
          </div>
        )}

        <div className="dashboard-tabs">
          {['overview', 'students', 'schedule', 'materials'].map(tab => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' && 'Overview'}
              {tab === 'students' && `My Students (${students.length})`}
              {tab === 'schedule' && `Schedule (${schedule.length})`}
              {tab === 'materials' && `Materials (${materials.length})`}
            </button>
          ))}
=======
        {/* Navigation Tabs - Boity's Design */}
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
            My Students ({students.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'quizzes' ? 'active' : ''}`}
            onClick={() => setActiveTab('quizzes')}
            type="button"
          >
            My Quizzes ({quizzes.length})
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
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
        </div>

        <div className="tab-content">
<<<<<<< HEAD

          {/* OVERVIEW TAB */}
=======
          {/* Overview Tab */}
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
          {activeTab === 'overview' && (
            <>
              <section className="content-section">
<<<<<<< HEAD
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
                      <button className="schedule-card-action" style={{ backgroundColor: item.color }}
                        onClick={() => handleJoinSession(item)}>Join</button>
                    </div>
                  ))}
                  {schedule.filter(item => item.date === 'Today').length === 0 && (
                    <div className="empty-state"><p>No sessions scheduled for today</p></div>
                  )}
                </div>
              </section>

              <section className="content-section">
                <div className="section-header">
                  <h2>Recent Students</h2>
                  <button className="view-link" onClick={() => setActiveTab('students')}>View All →</button>
                </div>
                <div className="students-grid">
                  {students.slice(0, 4).map(student => (
                    <div key={student.id} className="student-card" onClick={() => handleViewStudent(student)}>
                      <div className="student-card-avatar" style={{ backgroundColor: student.bgColor || '#f0fdf4' }}>
                        <span style={{ color: student.color || '#48bb78' }}>{student.avatar}</span>
                      </div>
                      <div className="student-card-info">
                        <h4>{student.name}</h4>
                        <p>{student.subject}</p>
                        <div className="progress-indicator">
                          <div className="progress-bar-bg">
                            <div className="progress-bar-fill"
                              style={{ width: `${student.progress}%`, backgroundColor: student.color || '#48bb78' }}>
                            </div>
=======
                <h2>Students by Subject</h2>
                {subjectStats.length === 0 ? (
                  <div className="empty-state small">
                    <p>No students enrolled yet. Students will appear here when they register and select subjects.</p>
                    <button onClick={checkAllStudentSubjects} className="empty-state-btn-small">Check Database</button>
                  </div>
                ) : (
                  <div className="subject-stats-grid">
                    {subjectStats.map(stat => (
                      <div key={stat.subjectId} className="subject-stat-card" style={{ borderLeftColor: stat.subjectColor }}>
                        <div className="subject-stat-icon" style={{ backgroundColor: `${stat.subjectColor}20`, color: stat.subjectColor }}>
                          {stat.subjectIcon}
                        </div>
                        <div className="subject-stat-info">
                          <h3>{stat.subjectName}</h3>
                          <div className="student-count">
                            <span className="count-number">{stat.count}</span>
                            <span className="count-label">Student{stat.count !== 1 ? 's' : ''}</span>
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
                          </div>
                          <span className="progress-text">{student.progress}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {students.length === 0 && <div className="empty-state"><p>No students assigned yet</p></div>}
                </div>
              </section>

              <section className="content-section">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
<<<<<<< HEAD
                  <button className="action-card" onClick={() => navigateTo('/tutor/quizzes')}>
                    <div className="action-icon-wrapper"><span>📝</span></div>
                    <h3>Create Quiz</h3><p>Design practice questions</p>
                  </button>
                  <button className="action-card" onClick={() => { setActiveTab('materials'); setShowUploadForm(true); }}>
                    <div className="action-icon-wrapper"><span>📄</span></div>
                    <h3>Upload Material</h3><p>Share study guides</p>
                  </button>
                  <button className="action-card" onClick={() => {
                    if (students.length) handleScheduleMeeting(students[0]);
                    else alert('No students yet');
                  }}>
                    <div className="action-icon-wrapper"><span>📅</span></div>
                    <h3>Schedule Session</h3><p>Plan tutoring sessions</p>
                  </button>
                  <button className="action-card" onClick={() => navigateTo('/tutor/feedback')}>
                    <div className="action-icon-wrapper"><span>💬</span></div>
                    <h3>Feedback</h3><p>Review responses</p>
                  </button>
=======
                  <button className="action-card" onClick={() => setShowQuizModal(true)} type="button">
                    <div className="action-icon-wrapper" style={{ backgroundColor: selectedSubjects[0]?.bgColor || '#f0fdf4' }}>
                      <span style={{ color: selectedSubjects[0]?.color || '#48bb78' }}>📝</span>
                    </div>
                    <h3>Create Quiz</h3>
                    <p>Design practice questions</p>
                  </button>

                  <button className="action-card" onClick={() => setActiveTab('students')} type="button">
                    <div className="action-icon-wrapper" style={{ backgroundColor: selectedSubjects[1]?.bgColor || '#f0fdf4' }}>
                      <span style={{ color: selectedSubjects[1]?.color || '#48bb78' }}>👥</span>
                    </div>
                    <h3>View Students</h3>
                    <p>Check all {students.length} student{students.length !== 1 ? 's' : ''}</p>
                  </button>

                  <button className="action-card" onClick={() => {
                    setActiveTab('materials');
                    setShowUploadForm(true);
                  }} type="button">
                    <div className="action-icon-wrapper" style={{ backgroundColor: selectedSubjects[2]?.bgColor || '#f0fdf4' }}>
                      <span style={{ color: selectedSubjects[2]?.color || '#48bb78' }}>📄</span>
                    </div>
                    <h3>Upload Material</h3>
                    <p>Share study guides</p>
                  </button>
                </div>
              </section>

              {/* Today's Schedule Preview */}
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
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
                </div>
              </section>
            </>
          )}

<<<<<<< HEAD
          {/* STUDENTS TAB */}
          {activeTab === 'students' && (
            <section className="content-section full-width">
              <h2>My Students ({students.length})</h2>
              <div className="students-table-container">
                <table className="students-table">
                  <thead>
                    <tr>
                      <th>Student</th><th>Subject</th><th>Progress</th>
                      <th>Last Active</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id}>
                        <td>
                          <div className="student-info-cell">
                            <div className="student-avatar-small">{student.avatar}</div>
                            <div>
                              <div className="student-name">{student.name}</div>
                              <div className="student-email">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="subject-tag-small">{student.icon} {student.subject}</span></td>
                        <td>
                          <div className="progress-cell">
                            <div className="progress-bar-small">
                              <div className="progress-fill-small" style={{ width: `${student.progress}%` }}></div>
                            </div>
                            <span className="progress-value">{student.progress}%</span>
                          </div>
                        </td>
                        <td>{student.lastActive}</td>
                        <td>
                          <div className="action-buttons-cell">
                            <button className="table-action-btn view-btn" onClick={() => handleViewStudent(student)}>View</button>
                            <button className="table-action-btn message-btn" onClick={() => handleSendMessage(student)}>💬</button>
                            <button className="table-action-btn schedule-btn" onClick={() => handleScheduleMeeting(student)}>📅</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr><td colSpan="5" style={{ textAlign: 'center' }}>No students found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* SCHEDULE TAB */}
=======
          {/* Students Tab - Fixed with proper table structure */}
          {activeTab === 'students' && (
            <section className="content-section full-width">
              <div className="section-header">
                <h2>My Students</h2>
                <div className="total-students-badge">
                  Total: {students.length} Student{students.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              {students.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👥</div>
                  <h3>No Students Yet</h3>
                  <p>Students who register and select subjects will appear here.</p>
                  <button className="empty-state-btn" onClick={checkAllStudentSubjects}>
                    Check Database
                  </button>
                </div>
              ) : (
                <div className="students-table-container">
                  <table className="students-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Subject</th>
                        <th>Progress</th>
                        <th>Grade</th>
                        <th>Last Active</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(student => (
                        <tr key={student.studentId}>
                          <td>
                            <div className="student-info-cell">
                              <div className="student-avatar-small" style={{ backgroundColor: student.subjectColor + '20', color: student.subjectColor }}>
                                {student.studentName.charAt(0)}
                              </div>
                              <div>
                                <div className="student-name">{student.studentName}</div>
                                <div className="student-email">{student.studentEmail}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="subject-tag-small" style={{ backgroundColor: student.subjectColor + '20', color: student.subjectColor }}>
                              {student.subjectIcon} {student.subjectName}
                            </span>
                          </td>
                          <td>
                            <div className="progress-cell">
                              <div className="progress-bar-small">
                                <div className="progress-fill-small" style={{ width: `${student.progress || 0}%`, backgroundColor: student.subjectColor }}></div>
                              </div>
                              <span>{student.progress || 0}%</span>
                            </div>
                          </td>
                          <td>
                            <span className={`grade-badge ${(student.grade || 'na').toLowerCase()}`}>
                              {student.grade || 'N/A'}
                            </span>
                          </td>
                          <td>{student.lastActive || 'Recently'}</td>
                          <td>
                            <div className="action-buttons-cell">
                              <button 
                                className="table-action-btn view-btn" 
                                style={{ color: student.subjectColor, borderColor: student.subjectColor }}
                                onClick={() => handleViewStudent(student)}
                                type="button"
                              >
                                View
                              </button>
                              <button 
                                className="table-action-btn chat-btn" 
                                style={{ color: '#667eea', borderColor: '#667eea' }}
                                onClick={() => handleSendMessage(student)}
                                title="Chat with Student"
                                type="button"
                              >
                                💬 Chat
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
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* Quizzes Tab */}
          {activeTab === 'quizzes' && (
            <section className="content-section full-width">
              <div className="section-header">
                <h2>My Quizzes</h2>
                <button className="create-quiz-btn" onClick={() => setShowQuizModal(true)}><span>+</span> Create New Quiz</button>
              </div>
              
              {quizzes.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>No Quizzes Yet</h3>
                  <p>Create your first quiz to help your students practice</p>
                  <button className="empty-state-btn" onClick={() => setShowQuizModal(true)}>Create Quiz</button>
                </div>
              ) : (
                <div className="quizzes-grid">
                  {quizzes.map(quiz => {
                    const subject = selectedSubjects.find(s => s.id === quiz.subject?.id) || 
                                   { name: 'Unknown', icon: '📚', color: '#667eea', bgColor: '#667eea20' };
                    return (
                      <div key={quiz.id} className="quiz-card">
                        <div className="quiz-card-header" style={{ borderLeftColor: subject.color }}>
                          <div className="quiz-subject-icon" style={{ background: subject.bgColor, color: subject.color }}>{subject.icon}</div>
                          <div className="quiz-header-content">
                            <h3>{quiz.title}</h3>
                            <p className="quiz-description">{quiz.description || ''}</p>
                          </div>
                        </div>
                        <div className="quiz-card-body">
                          <div className="quiz-meta">
                            <div className="quiz-meta-item"><span className="meta-label">Questions</span><span className="meta-value">{quiz.totalQuestions || 0}</span></div>
                            <div className="quiz-meta-item"><span className="meta-label">Time</span><span className="meta-value">{quiz.timeLimitMinutes || 30} min</span></div>
                            <div className="quiz-meta-item"><span className="meta-label">Difficulty</span><span className={`difficulty-badge ${(quiz.difficulty || 'medium').toLowerCase()}`}>{quiz.difficulty || 'Medium'}</span></div>
                          </div>
                          <div className="quiz-stats">
                            <div className="stat"><span className="stat-label">Marks</span><span className="stat-value">{quiz.totalMarks || 0}</span></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Schedule Tab */}
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
          {activeTab === 'schedule' && (
            <section className="content-section full-width">
              <h2>Full Schedule ({schedule.length})</h2>
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
                              <span className="schedule-item-type">{item.type}</span>
                              <span className="schedule-item-students">👥 {item.students}</span>
                            </div>
                          </div>
<<<<<<< HEAD
                          <button className="schedule-item-join" style={{ backgroundColor: item.color }}
                            onClick={() => handleJoinSession(item)}>Join</button>
=======
                          <button 
                            className="schedule-item-join"
                            style={{ backgroundColor: item.color }}
                            onClick={() => handleJoinSession(item)}
                            type="button"
                          >
                            Join
                          </button>
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
<<<<<<< HEAD
                {schedule.length === 0 && <div className="empty-state"><p>No sessions scheduled</p></div>}
=======
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
              </div>
            </section>
          )}

<<<<<<< HEAD
          {/* MATERIALS TAB */}
=======
          {/* Materials Tab */}
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
          {activeTab === 'materials' && (
            <div className="material-container-inline">
              {error && <div className="error-message">{error}</div>}
              {materialSuccess && <div className="success-message">{materialSuccess}</div>}

              {showUploadForm && (
                <div className="upload-form-container">
                  <div className="upload-form-header">
                    <h2>Upload New Material</h2>
                    <button onClick={() => { setShowUploadForm(false); resetForm(); }} className="close-form-btn">×</button>
                  </div>
<<<<<<< HEAD

                  <form onSubmit={handleSubmit} className="upload-form">
=======
                  <form onSubmit={handleMaterialSubmit} className="upload-form">
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
                    <div className="form-group">
                      <label>Title *</label>
                      <input type="text" name="title" value={formData.title}
                        onChange={handleInputChange} required placeholder="Enter material title" />
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        name="description" value={formData.description}
                        onChange={handleInputChange} rows="3" maxLength="255"
                        placeholder="Describe what this material is about (max 255 characters)"
                      />
                      <small>{formData.description?.length || 0} / 255 characters</small>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Subject *</label>
                        <select
                          name="subjectId" value={formData.subjectId} required
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            const selected = subjects.find(s => s.id.toString() === selectedId);
                            setFormData(prev => ({ ...prev, subjectId: selectedId, subjectName: selected?.name || '' }));
                          }}
                        >
                          <option value="">Select a subject</option>
                          {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Topic</label>
                        <input type="text" name="topic" value={formData.topic}
                          onChange={handleInputChange} placeholder="e.g., Algebra, Grammar, etc." />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Tags (comma-separated)</label>
                      <input type="text" name="tags" value={formData.tags}
                        onChange={handleInputChange} placeholder="e.g., beginner, advanced, practice" />
                    </div>

                    {/* Material Type Dropdown */}
                    <div className="form-group">
                      <label>Material Type *</label>
                      <select
                        name="materialType"
                        value={formData.materialType}
                        onChange={handleMaterialTypeChange}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      >
                        <option value="paper">📄 Past Paper</option>
                        <option value="note">📝 Study Note</option>
                        <option value="video">🎥 Video Lesson</option>
                      </select>
                    </div>

                    {formData.materialType === 'video' ? (
                      <div className="form-group">
                        <label>Video Link *</label>
                        <input
                          type="url"
                          name="videoLink"
                          value={formData.videoLink}
                          onChange={handleInputChange}
                          placeholder="https://youtube.com/watch?v=..."
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                        <small>Paste a YouTube, Vimeo, or any public video URL</small>
                      </div>
                    ) : (
                      <div className="form-group">
                        <label>File *</label>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.ppt,.pptx"
                        />
                        <small>PDF, DOC, DOCX, PPT, PPTX (Max 100MB)</small>
                      </div>
                    )}

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
                    {materials.map(m => (
                      <div key={m.id} className="material-card-item">
                        <div className="material-icon">
                          {m.materialType === 'video' ? '🎥' : (m.materialType === 'note' ? '📝' : '📄')}
                        </div>
                        <div className="material-info">
                          <h3>{m.title}</h3>
                          <p>{m.description || 'No description'}</p>
                          <div className="material-meta">
                            <span>{m.materialType === 'video' ? 'Video Lesson' : (m.materialType === 'note' ? 'Study Note' : 'Past Paper')}</span>
                            {m.fileSize > 0 && <span>{(m.fileSize / 1024 / 1024).toFixed(2)} MB</span>}
                            <span>👁️ {m.views || 0}</span>
                            <span>⬇️ {m.downloads || 0}</span>
                          </div>
                          <div className="material-actions">
                            {m.videoLink ? (
                              <a href={m.videoLink} target="_blank" rel="noopener noreferrer" className="view-btn">▶ Watch Video</a>
                            ) : (
                              <a href={`http://localhost:8080${m.fileUrl}`} target="_blank" rel="noopener noreferrer" className="view-btn">View</a>
                            )}
                            <button onClick={() => handleDeleteMaterial(m.id)} className="delete-btn">Delete</button>
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

<<<<<<< HEAD
      {/* MODALS */}
      {showLogoutConfirm && (
        <div className="logout-modal-overlay" onClick={cancelLogout}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-icon">🚪</div>
            <h3>Sign Out</h3>
            <p>Are you sure you want to sign out?</p>
            <div className="logout-modal-actions">
              <button onClick={cancelLogout} className="logout-modal-cancel">Cancel</button>
              <button onClick={handleLogout} className="logout-modal-confirm">Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {showSubjectChangeModal && (
        <div className="modal-overlay" onClick={cancelSubjectChange}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Change Subjects</h3>
              <button className="modal-close" onClick={cancelSubjectChange}>×</button>
            </div>
            <div className="modal-body">
              <p>Changing your subjects will reset your dashboard and student assignments.</p>
              <p>Are you sure you want to continue?</p>
            </div>
            <div className="modal-footer">
              <button onClick={cancelSubjectChange} className="modal-cancel-btn">Cancel</button>
              <button onClick={confirmSubjectChange} className="modal-join-btn">Continue</button>
            </div>
          </div>
        </div>
      )}

      {showStudentModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowStudentModal(false)}>
          <div className="modal-content student-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Student Details</h3>
              <button className="modal-close" onClick={() => setShowStudentModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="student-profile-header">
                <div className="student-profile-avatar">{selectedStudent.avatar}</div>
                <div className="student-profile-info">
                  <h2>{selectedStudent.name}</h2>
                  <p className="student-profile-email">{selectedStudent.email}</p>
                  <span className="status-badge">Active</span>
                </div>
              </div>
              <div className="student-details-grid">
                <div className="detail-card">
                  <h4>Academic Info</h4>
                  <div className="detail-row"><span className="detail-label">Subject:</span><span className="detail-value">{selectedStudent.subject}</span></div>
                  <div className="detail-row"><span className="detail-label">Grade:</span><span className="detail-value">{selectedStudent.grade || 'N/A'}</span></div>
                  <div className="detail-row"><span className="detail-label">School:</span><span className="detail-value">{selectedStudent.school || 'N/A'}</span></div>
                </div>
                <div className="detail-card">
                  <h4>Performance</h4>
                  <div className="detail-row"><span className="detail-label">Progress:</span><span className="detail-value progress-value">{selectedStudent.progress}%</span></div>
                  <div className="detail-row"><span className="detail-label">Avg Score:</span><span className="detail-value">{selectedStudent.averageScore || 0}%</span></div>
                  <div className="detail-row"><span className="detail-label">Quizzes Completed:</span><span className="detail-value">{selectedStudent.completedQuizzes || 0}</span></div>
                </div>
              </div>
              {selectedStudent.upcomingSession && selectedStudent.upcomingSession !== 'No upcoming sessions' && (
                <div className="upcoming-session">
                  <h4>📅 Upcoming Session</h4>
                  <p>{selectedStudent.upcomingSession}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => handleSendMessage(selectedStudent)} className="modal-secondary-btn">💬 Send Message</button>
              <button onClick={() => { setShowStudentModal(false); handleScheduleMeeting(selectedStudent); }} className="modal-join-btn">📅 Schedule Session</button>
            </div>
          </div>
        </div>
      )}

      {showScheduleModal && scheduledStudent && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📅 Schedule Session with {scheduledStudent.name}</h3>
              <button className="modal-close" onClick={() => setShowScheduleModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {sessionError && (
                <div style={{
                  background: '#fff5f5', border: '1px solid #feb2b2', color: '#c53030',
                  padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px',
                }}>
                  ⚠️ {sessionError}
                </div>
              )}
              <div className="form-group">
                <label htmlFor="session-title">Session Title</label>
                <input id="session-title" type="text" value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  placeholder="Enter session title" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="session-date">Date *</label>
                  <input id="session-date" type="date" value={newSession.date} min={getMinDate()}
                    onChange={(e) => setNewSession({ ...newSession, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="session-time">Time *</label>
                  <input id="session-time" type="time" value={newSession.time}
                    onChange={(e) => setNewSession({ ...newSession, time: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="session-duration">Duration (minutes) *</label>
                  <input id="session-duration" type="number" min="15" max="480" step="15"
                    value={newSession.duration}
                    onChange={(e) => setNewSession({ ...newSession, duration: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => { setShowScheduleModal(false); setSessionError(''); }} className="modal-cancel-btn">Cancel</button>
              <button onClick={handleCreateSession} className="modal-join-btn">✓ Create Session</button>
            </div>
          </div>
        </div>
      )}

      {showJoinModal && selectedSession && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Join Session</h3>
              <button className="modal-close" onClick={() => setShowJoinModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="session-details">
                <div className="session-detail-item"><span>Subject:</span><strong>{selectedSession.subject}</strong></div>
                <div className="session-detail-item"><span>Time:</span><strong>{selectedSession.time}</strong></div>
                <div className="session-detail-item"><span>Topic:</span><strong>{selectedSession.topic}</strong></div>
              </div>
              <div className="meeting-info">
                <h4>Meeting Link</h4>
                <div className="meeting-link-box">
                  <span className="link-label">Join URL:</span>
                  <a href={selectedSession.meetingLink} target="_blank" rel="noopener noreferrer">
                    {selectedSession.meetingLink || 'No link provided'}
                  </a>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowJoinModal(false)} className="modal-cancel-btn">Cancel</button>
              <button onClick={handleStartMeeting} className="modal-join-btn">Join Meeting</button>
            </div>
          </div>
        </div>
      )}
=======
      {/* Debug Panel */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: '#1e293b', color: 'white', padding: '10px', borderRadius: '5px', fontSize: '12px', zIndex: 9999, maxWidth: '300px' }}>
        <strong>Debug:</strong> {debugInfo}<br/>
        <button onClick={debugAuthInfo} style={{ marginTop: '5px', padding: '4px 8px', fontSize: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', marginRight: '5px' }}>
          Check Auth
        </button>
        <button onClick={checkAllStudentSubjects} style={{ marginTop: '5px', padding: '4px 8px', fontSize: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
          Check DB
        </button>
        <button onClick={() => fetchDashboardData()} style={{ marginTop: '5px', padding: '4px 8px', fontSize: '10px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', marginLeft: '5px' }}>
          Refresh
        </button>
      </div>
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
    </div>
  );
};

export default TutorDashboard;