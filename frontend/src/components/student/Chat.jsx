import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Chat.css';

const Chat = ({ studentId, tutorId, subjectId, subjectName, tutorName, studentName, onClose, userRole }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('token');

  // Determine sender type based on role
  const senderType = userRole === 'tutor' ? 'TUTOR' : 'STUDENT';

  // Memoize markMessagesAsRead first since it's used in loadMessages
  const markMessagesAsRead = useCallback(async () => {
    try {
      const readerType = userRole === 'tutor' ? 'TUTOR' : 'STUDENT';
      await fetch(
        `http://localhost:8080/api/chat/mark-read?studentId=${studentId}&tutorId=${tutorId}&subjectId=${subjectId}&readerType=${readerType}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [studentId, tutorId, subjectId, token, userRole]);

  // Memoize loadMessages to prevent unnecessary re-renders
  const loadMessages = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/chat/conversation?studentId=${studentId}&tutorId=${tutorId}&subjectId=${subjectId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        
        // Mark messages as read based on user role
        await markMessagesAsRead();
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [studentId, tutorId, subjectId, token, markMessagesAsRead]);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load messages when component mounts or dependencies change
  useEffect(() => {
    if (studentId && tutorId && subjectId) {
      loadMessages();
    }
  }, [studentId, tutorId, subjectId, loadMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!studentId || !tutorId || !subjectId) return;
    
    const interval = setInterval(() => {
      loadMessages();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [studentId, tutorId, subjectId, loadMessages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setIsSending(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/chat/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId,
          tutorId,
          subjectId,
          message: newMessage,
          senderType: senderType
        })
      });
      
      if (response.ok) {
        setNewMessage('');
        await loadMessages();
      } else {
        const error = await response.json();
        alert('Failed to send message: ' + error.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Determine who is the other person
  const otherPersonName = userRole === 'tutor' ? studentName : tutorName;
  const otherPersonRole = userRole === 'tutor' ? 'Student' : 'Tutor';

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chat-modal-header">
          <div className="chat-tutor-info">
            <div className="tutor-avatar">
              {otherPersonName?.charAt(0) || (userRole === 'tutor' ? 'S' : 'T')}
            </div>
            <div>
              <h3>{otherPersonName}</h3>
              <p className="chat-subject">{subjectName} • {otherPersonRole}</p>
            </div>
          </div>
          <button className="close-chat-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="chat-messages-container">
          {messages.length === 0 ? (
            <div className="empty-chat">
              <span className="empty-chat-icon">💬</span>
              <p>No messages yet. Start a conversation!</p>
              <p className="empty-chat-sub">Ask questions about {subjectName}</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message ${msg.senderType === senderType ? 'sent' : 'received'}`}
              >
                <div className="message-sender-name">
                  {msg.senderType === 'TUTOR' ? tutorName : studentName}
                </div>
                <div className="message-bubble">
                  <p className="message-text">{msg.message}</p>
                  <span className="message-time">{msg.formattedTime || msg.createdAt?.substring(11, 16)}</span>
                </div>
                {msg.senderType === senderType && (
                  <div className="message-status">
                    {msg.read ? '✓✓' : '✓'}
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <textarea
            className="chat-input"
            placeholder={`Type your message to ${otherPersonName}...`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending}
            rows="3"
          />
          <button 
            className="send-message-btn" 
            onClick={sendMessage}
            disabled={isSending || !newMessage.trim()}
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;