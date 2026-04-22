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

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Format message time
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

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (studentId) => {
    if (!user) return;
    
    try {
      await api.post('/chat/mark-read', {
        senderId: studentId,
        receiverId: user.id
      });
      
      // Update unread count in students list
      setStudents(prev => prev.map(s => 
        s.id === studentId ? { ...s, unread: 0 } : s
      ));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [user]);

  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    if (!user) return;
    
    const socket = new SockJS('http://localhost:8080/ws');
    stompClient.current = Stomp.over(socket);
    
    stompClient.current.connect({}, () => {
      setIsConnected(true);
      console.log('WebSocket connected');
      
      // Subscribe to user's personal queue for messages
      stompClient.current.subscribe(`/user/${user.id}/queue/messages`, (message) => {
        const receivedMessage = JSON.parse(message.body);
        console.log('Received message:', receivedMessage);
        
        // Update messages if this is for the selected student
        setMessages(prev => {
          if (selectedStudent && receivedMessage.senderId === selectedStudent.id) {
            const newMessages = [...prev, {
              id: receivedMessage.id || Date.now(),
              studentId: receivedMessage.senderId,
              text: receivedMessage.content,
              time: formatMessageTime(receivedMessage.timestamp),
              isFromMe: false,
              timestamp: receivedMessage.timestamp
            }];
            
            // Mark as read
            markMessagesAsRead(selectedStudent.id);
            return newMessages;
          }
          return prev;
        });
        
        // Update last message in students list
        setStudents(prev => prev.map(s => 
          s.id === receivedMessage.senderId 
            ? { 
                ...s, 
                lastMessage: receivedMessage.content, 
                time: formatMessageTime(receivedMessage.timestamp),
                unread: selectedStudent?.id === s.id ? 0 : (s.unread || 0) + 1
              }
            : s
        ));
      });
      
      // Subscribe to typing notifications
      stompClient.current.subscribe(`/user/${user.id}/queue/typing`, (typingEvent) => {
        const event = JSON.parse(typingEvent.body);
        if (selectedStudent && event.senderId === selectedStudent.id) {
          setTyping(event.typing);
          // Clear typing indicator after 3 seconds
          if (event.typing) {
            setTimeout(() => setTyping(false), 3000);
          }
        }
      });
    });
  }, [user, selectedStudent, formatMessageTime, markMessagesAsRead]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((isTyping) => {
    if (!selectedStudent || !isConnected) return;
    
    stompClient.current.send('/app/typing', {}, JSON.stringify({
      senderId: user.id,
      receiverId: selectedStudent.id,
      typing: isTyping
    }));
  }, [selectedStudent, isConnected, user]);

  // Handle typing
  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (!isConnected) return;
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    sendTypingIndicator(true);
    
    setTypingTimeout(setTimeout(() => {
      sendTypingIndicator(false);
    }, 2000));
  };

  // Load conversation history from API (NO MOCK)
  const loadConversation = useCallback(async (studentId) => {
    if (!user) return;
    
    try {
      const response = await api.get(`/chat/conversation/${user.id}/${studentId}`);
      const formattedMessages = response.data.map(msg => ({
        id: msg.id,
        studentId: msg.senderId === studentId ? studentId : user.id,
        text: msg.content,
        time: formatMessageTime(msg.timestamp),
        isFromMe: msg.senderId === user.id,
        timestamp: msg.timestamp
      }));
      setMessages(formattedMessages);
      
      // Mark messages as read
      markMessagesAsRead(studentId);
    } catch (error) {
      console.error('Error loading conversation:', error);
      setMessages([]);
    }
  }, [user, formatMessageTime, markMessagesAsRead]);

  // Fetch students from API (NO MOCK)
  const fetchStudents = useCallback(async (tutorId) => {
    try {
      const response = await api.get(`/tutor/${tutorId}/students`);
      if (response.data && response.data.length > 0) {
        const formattedStudents = response.data.map(student => ({
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          email: student.email,
          avatar: `${student.firstName?.[0]}${student.lastName?.[0]}`,
          lastMessage: student.lastMessage || 'No messages yet',
          time: student.lastMessageTime ? formatMessageTime(student.lastMessageTime) : '',
          unread: student.unreadCount || 0,
          online: student.online || false,
          subject: student.subject || 'General'
        }));
        setStudents(formattedStudents);
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

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || !selectedStudent || !isConnected) return;

    const chatMessage = {
      senderId: user.id.toString(),
      senderName: `${user.firstName} ${user.lastName}`,
      receiverId: selectedStudent.id.toString(),
      receiverName: selectedStudent.name,
      content: message,
      messageType: 'TEXT',
      timestamp: new Date().toISOString(),
      isRead: false
    };

    // Send via WebSocket
    stompClient.current.send('/app/send', {}, JSON.stringify(chatMessage));
    
    // Add to local messages
    const newMessage = {
      id: Date.now(),
      studentId: selectedStudent.id,
      text: message,
      time: 'Just now',
      isFromMe: true,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Update last message in student list
    setStudents(prev => prev.map(s => 
      s.id === selectedStudent.id 
        ? { ...s, lastMessage: message, time: 'Just now', unread: 0 }
        : s
    ));
    
    setMessage('');
    sendTypingIndicator(false);
  }, [message, selectedStudent, isConnected, user, sendTypingIndicator]);

  // Handle student selection
  const handleSelectStudent = useCallback((student) => {
    setSelectedStudent(student);
    setTyping(false);
    loadConversation(student.id);
  }, [loadConversation]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleBackToDashboard = useCallback(() => {
    navigate('/tutor-dashboard');
  }, [navigate]);

  // Load user data
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
      fetchStudents(parsedUser.id);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate, fetchStudents]);

  // Connect to WebSocket when user is loaded
  useEffect(() => {
    if (user && !stompClient.current?.connected) {
      connectWebSocket();
    }
    
    // Cleanup on unmount
    return () => {
      if (stompClient.current && stompClient.current.connected) {
        stompClient.current.disconnect();
        setIsConnected(false);
      }
    };
  }, [user, connectWebSocket]);

  // Clear typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  if (loading) {
    return <div className="loading-container">Loading messages from database...</div>;
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            <span>{students.filter(s => s.online).length} online</span>
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
                  {searchTerm ? 'No students match your search' : 'No students found in the database'}
                </div>
              ) : (
                filteredStudents.map(student => (
                  <div 
                    key={student.id} 
                    className={`student-item ${selectedStudent?.id === student.id ? 'active' : ''}`}
                    onClick={() => handleSelectStudent(student)}
                  >
                    <div className="student-avatar" style={{ background: `linear-gradient(135deg, #667eea, #764ba2)` }}>
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
                    <div className="student-avatar large" style={{ background: `linear-gradient(135deg, #667eea, #764ba2)` }}>
                      {selectedStudent.avatar}
                    </div>
                    <div>
                      <h3>{selectedStudent.name}</h3>
                      <div className="student-details">
                        <span className="student-subject">{selectedStudent.subject}</span>
                        <span className={`status ${selectedStudent.online ? 'online' : 'offline'}`}>
                          {selectedStudent.online ? '● Online' : '● Offline'}
                        </span>
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
                    messages.map((msg, index) => (
                      <div key={msg.id || index} className={`message ${msg.isFromMe ? 'sent' : 'received'}`}>
                        <div className="message-bubble">
                          <div className="message-text">{msg.text}</div>
                          <div className="message-time">{msg.time}</div>
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
                    disabled={!message.trim() || !isConnected}
                  >
                    Send Message
                  </button>
                </div>
                {!isConnected && (
                  <div className="connection-warning">
                    ⚠️ Connecting to chat server...
                  </div>
                )}
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