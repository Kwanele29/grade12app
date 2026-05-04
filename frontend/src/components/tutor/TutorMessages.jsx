import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import api from '../../services/api';
import './TutorMessages.css';

const TutorMessages = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const stompClient = useRef(null);
  const messagesEndRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const formatMessageTime = useCallback((timestamp) => {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }, []);

  // Mark messages as read - FIXED to match backend
  const markMessagesAsRead = useCallback(async (studentId) => {
    if (!user) return;
    try {
      await api.post('/chat/mark-read', {
        studentId: studentId,
        tutorId: user.id,
        subjectId: 1, // Replace with actual subjectId if available
        readerType: 'TUTOR'
      });
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, unread: 0 } : s))
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [user]);

  // WebSocket connection (optional, but we keep it)
  const connectWebSocket = useCallback(() => {
    if (!user) return;
    const socket = new SockJS(`${process.env.REACT_APP_WS_URL || 'http://localhost:8080'}/ws`);
    stompClient.current = Stomp.over(socket);
    stompClient.current.debug = () => {};

    stompClient.current.connect(
      { Authorization: `Bearer ${localStorage.getItem('token')}` },
      () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
        console.log('WebSocket connected');
        // ... subscriptions (optional)
      },
      (error) => {
        console.error('WebSocket connection failed:', error);
        setIsConnected(false);
        if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
        const delay = Math.min(30000, 1000 * Math.pow(2, reconnectAttempts.current));
        reconnectAttempts.current++;
        reconnectTimer.current = setTimeout(() => connectWebSocket(), delay);
      }
    );
  }, [user]);

  const sendTypingIndicator = useCallback((isTyping) => {
    if (!selectedStudent || !isConnected) return;
    stompClient.current.send('/app/typing', {}, JSON.stringify({
      senderId: user.id,
      receiverId: selectedStudent.id,
      typing: isTyping
    }));
  }, [selectedStudent, isConnected, user]);

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (!isConnected) return;
    if (typingTimeout) clearTimeout(typingTimeout);
    sendTypingIndicator(true);
    setTypingTimeout(setTimeout(() => sendTypingIndicator(false), 2000));
  };

  // Load conversation - FIXED to use query params
  const loadConversation = useCallback(async (studentId) => {
    if (!user) return;
    try {
      const response = await api.get('/chat/conversation', {
        params: {
          studentId: studentId,
          tutorId: user.id,
          subjectId: 1
        }
      });
      const formatted = response.data.map((msg) => ({
        id: msg.id,
        studentId: msg.studentId,
        text: msg.message,
        time: formatMessageTime(msg.createdAt),
        isFromMe: msg.senderType === 'TUTOR',
        timestamp: msg.createdAt,
        status: 'sent'
      }));
      setMessages(formatted);
      markMessagesAsRead(studentId);
    } catch (error) {
      console.error('Error loading conversation:', error);
      setMessages([]);
    }
  }, [user, formatMessageTime, markMessagesAsRead]);

  // Fetch students (unchanged)
  const fetchStudents = useCallback(async (tutorId) => {
    try {
      const response = await api.get(`/tutor/${tutorId}/students`);
      if (response.data && response.data.length) {
        const formatted = response.data.map((student) => ({
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          email: student.email,
          avatar: `${student.firstName?.[0]}${student.lastName?.[0]}`,
          lastMessage: student.lastMessage || 'No messages yet',
          time: student.lastMessageTime ? formatMessageTime(student.lastMessageTime) : '',
          unread: student.unreadCount || 0,
          online: student.online || false,
          subject: student.subject || 'General',
        }));
        setStudents(formatted);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [formatMessageTime]);

  // Send message - REST only (simpler, reliable)
  const sendMessage = useCallback(async (textMessage) => {
    if (!textMessage.trim() || !selectedStudent) return null;

    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const payload = {
      senderId: user.id,
      receiverId: selectedStudent.id,
      content: textMessage,
      timestamp: new Date().toISOString(),
    };

    const newMessage = {
      id: tempId,
      studentId: selectedStudent.id,
      text: textMessage,
      time: 'Just now',
      isFromMe: true,
      timestamp: new Date().toISOString(),
      status: 'sending',
    };
    setMessages((prev) => [...prev, newMessage]);

    try {
      const response = await api.post('/chat/send', payload);
      const savedMsg = response.data;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                id: savedMsg.id,
                status: 'sent',
                timestamp: savedMsg.createdAt,
                time: formatMessageTime(savedMsg.createdAt),
              }
            : msg
        )
      );
      return savedMsg;
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, status: 'failed' } : msg
        )
      );
      return null;
    }
  }, [selectedStudent, user, formatMessageTime]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedStudent) return;
    const text = message.trim();
    setMessage('');
    sendTypingIndicator(false);
    await sendMessage(text);
  };

  const retryFailedMessage = async (tempId, originalText) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    await sendMessage(originalText);
  };

  const handleSelectStudent = useCallback((student) => {
    setSelectedStudent(student);
    setTyping(false);
    loadConversation(student.id);
  }, [loadConversation]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBackToDashboard = () => navigate('/tutor-dashboard');

  // Load user data
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    try {
      const parsed = JSON.parse(userData);
      if (parsed.category !== 'tutor') {
        navigate('/login');
        return;
      }
      setUser(parsed);
      fetchStudents(parsed.id);
    } catch (err) {
      console.error(err);
      navigate('/login');
    }
  }, [navigate, fetchStudents]);

  // Connect WebSocket (optional)
  useEffect(() => {
    if (user && !stompClient.current?.connected) {
      connectWebSocket();
    }
    return () => {
      if (stompClient.current?.connected) stompClient.current.disconnect();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [user, connectWebSocket]);

  useEffect(() => {
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [typingTimeout]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading conversations...</p>
      </div>
    );
  }

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="messages-container">
      <div className="messages-card">
        <div className="messages-header">
          <button onClick={handleBackToDashboard} className="back-btn">
            ← Back to Dashboard
          </button>
          <h1>Messages</h1>
          <div className="header-stats">
            <span className={`connection-dot ${isConnected ? 'online' : 'offline'}`}></span>
            <span>{students.filter((s) => s.online).length} online</span>
            <span>{students.reduce((sum, s) => sum + (s.unread || 0), 0)} unread</span>
          </div>
        </div>

        <div className="messages-content">
          {/* Students List */}
          <div className="students-list">
            <div className="students-list-header">
              <h3>Students ({students.length})</h3>
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="students-scroll">
              {filteredStudents.length === 0 ? (
                <div className="no-students">
                  {searchTerm ? 'No students match your search' : 'No students found'}
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className={`student-item ${selectedStudent?.id === student.id ? 'active' : ''}`}
                    onClick={() => handleSelectStudent(student)}
                  >
                    <div
                      className="student-avatar"
                      style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
                    >
                      {student.avatar}
                      {student.online && <span className="online-dot"></span>}
                    </div>
                    <div className="student-info">
                      <div className="student-name">
                        {student.name}
                        {student.unread > 0 && <span className="unread-badge">{student.unread}</span>}
                      </div>
                      <div className="student-last-message">{student.lastMessage}</div>
                      <div className="student-time">{student.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="chat-area">
            {selectedStudent ? (
              <>
                <div className="chat-header">
                  <div className="chat-header-info">
                    <div
                      className="student-avatar large"
                      style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
                    >
                      {selectedStudent.avatar}
                    </div>
                    <div>
                      <h3>{selectedStudent.name}</h3>
                      <div className="student-details">
                        <span className="student-subject">{selectedStudent.subject}</span>
                        
                      </div>
                    </div>
                  </div>
                </div>

                <div className="messages-list">
                  {messages.length === 0 ? (
                    <div className="no-messages">
                      <div className="no-messages-icon">💬</div>
                      <p>No messages yet</p>
                      <p className="no-messages-sub">Send a message to start the conversation</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className={`message ${msg.isFromMe ? 'sent' : 'received'}`}>
                        <div className="message-bubble">
                          <div className="message-text">{msg.text}</div>
                          <div className="message-meta">
                            <span className="message-time">{msg.time}</span>
                            {msg.isFromMe && msg.status === 'sending' && (
                              <span className="message-status sending">⏎ Sending...</span>
                            )}
                            {msg.isFromMe && msg.status === 'sent' && (
                              <span className="message-status sent">✓ Sent</span>
                            )}
                            {msg.isFromMe && msg.status === 'failed' && (
                              <button
                                className="message-retry"
                                onClick={() => retryFailedMessage(msg.id, msg.text)}
                              >
                                ⟳ Retry
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {typing && (
                    <div className="typing-indicator">
                      <span>{selectedStudent.name} is typing...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="message-input-area">
                  <textarea
                    value={message}
                    onChange={handleTyping}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${selectedStudent.name}...`}
                    rows="3"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="send-btn"
                    disabled={!message.trim()}
                  >
                    Send Message
                  </button>
                </div>
               
              </>
            ) : (
              <div className="no-student-selected">
                <div className="no-student-icon">💬</div>
                <h3>Select a student to start messaging</h3>
                <p>Choose a student from the list to begin your conversation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorMessages;