package com.grade12.backend.service;

import com.grade12.backend.dto.ChatMessageDTO;
import com.grade12.backend.dto.SendMessageRequest;
import com.grade12.backend.dto.SubjectUnreadDTO;
import com.grade12.backend.dto.UnreadCountDTO;
import com.grade12.backend.model.ChatMessage;
import com.grade12.backend.model.User;
import com.grade12.backend.model.Subject;
import com.grade12.backend.repository.ChatMessageRepository;
import com.grade12.backend.repository.UserRepository;
import com.grade12.backend.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {
    
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    
    @Transactional
    public ChatMessageDTO sendMessage(SendMessageRequest request) {
        try {
            User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + request.getStudentId()));
            
            User tutor = userRepository.findById(request.getTutorId())
                .orElseThrow(() -> new RuntimeException("Tutor not found with ID: " + request.getTutorId()));
            
            Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found with ID: " + request.getSubjectId()));
            
            ChatMessage chatMessage = new ChatMessage();
            chatMessage.setStudent(student);
            chatMessage.setTutor(tutor);
            chatMessage.setSubject(subject);
            chatMessage.setMessage(request.getMessage());
            chatMessage.setSenderType(request.getSenderType());
            chatMessage.setRead(false);
            chatMessage.setCreatedAt(LocalDateTime.now());
            
            ChatMessage saved = chatMessageRepository.save(chatMessage);
            System.out.println("✅ Message sent: " + request.getSenderType() + " -> " + request.getMessage());
            return convertToDTO(saved);
            
        } catch (Exception e) {
            System.err.println("❌ Error sending message: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send message: " + e.getMessage());
        }
    }
    
    @Transactional(readOnly = true)
    public List<ChatMessageDTO> getConversation(Long studentId, Long tutorId, Long subjectId) {
        try {
            List<ChatMessage> messages = chatMessageRepository.findConversation(studentId, tutorId, subjectId);
            return messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("❌ Error getting conversation: " + e.getMessage());
            return new ArrayList<>();
        }
    }
    
    @Transactional
    public void markMessagesAsRead(Long studentId, Long tutorId, Long subjectId, String readerType) {
        try {
            List<ChatMessage> messages = chatMessageRepository.findConversation(studentId, tutorId, subjectId);
            
            if ("STUDENT".equals(readerType)) {
                messages.stream()
                    .filter(m -> "TUTOR".equals(m.getSenderType()) && !m.isRead())
                    .forEach(m -> m.setRead(true));
            } else if ("TUTOR".equals(readerType)) {
                messages.stream()
                    .filter(m -> "STUDENT".equals(m.getSenderType()) && !m.isRead())
                    .forEach(m -> m.setRead(true));
            }
            
            chatMessageRepository.saveAll(messages);
            System.out.println("✅ Messages marked as read for " + readerType);
            
        } catch (Exception e) {
            System.err.println("❌ Error marking messages as read: " + e.getMessage());
        }
    }
    
    @Transactional(readOnly = true)
    public UnreadCountDTO getUnreadCountForTutor(Long tutorId) {
        try {
            Long totalUnread = chatMessageRepository.countUnreadMessagesForTutor(tutorId);
            List<ChatMessage> unreadMessages = chatMessageRepository.findUnreadMessagesForTutor(tutorId);
            
            if (unreadMessages == null || unreadMessages.isEmpty()) {
                UnreadCountDTO result = new UnreadCountDTO();
                result.setTotalUnread(0L);
                result.setSubjects(new ArrayList<>());
                return result;
            }
            
            // Group messages by subject
            Map<Subject, List<ChatMessage>> groupedBySubject = unreadMessages.stream()
                .collect(Collectors.groupingBy(ChatMessage::getSubject));
            
            List<SubjectUnreadDTO> subjects = new ArrayList<>();
            
            for (Map.Entry<Subject, List<ChatMessage>> entry : groupedBySubject.entrySet()) {
                Subject subject = entry.getKey();
                List<ChatMessage> subjectMessages = entry.getValue();
                
                SubjectUnreadDTO dto = new SubjectUnreadDTO();
                dto.setSubjectId(subject.getId());
                dto.setSubjectName(subject.getName() != null ? subject.getName() : "Unknown Subject");
                dto.setSubjectIcon(subject.getIconUrl() != null ? subject.getIconUrl() : "📚");
                dto.setSubjectColor(subject.getColor() != null ? subject.getColor() : "#3b82f6");
                dto.setUnreadCount((long) subjectMessages.size());
                if (!subjectMessages.isEmpty()) {
                    dto.setLastMessage(convertToDTO(subjectMessages.get(0)));
                }
                subjects.add(dto);
            }
            
            UnreadCountDTO result = new UnreadCountDTO();
            result.setTotalUnread(totalUnread != null ? totalUnread : 0L);
            result.setSubjects(subjects);
            return result;
            
        } catch (Exception e) {
            System.err.println("❌ Error getting unread count for tutor: " + e.getMessage());
            e.printStackTrace();
            UnreadCountDTO result = new UnreadCountDTO();
            result.setTotalUnread(0L);
            result.setSubjects(new ArrayList<>());
            return result;
        }
    }
    
    @Transactional(readOnly = true)
    public Long getUnreadCountForStudent(Long studentId) {
        try {
            Long count = chatMessageRepository.countUnreadMessagesForStudent(studentId);
            return count != null ? count : 0L;
        } catch (Exception e) {
            System.err.println("❌ Error getting unread count for student: " + e.getMessage());
            return 0L;
        }
    }
    
    private ChatMessageDTO convertToDTO(ChatMessage message) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setId(message.getId());
        dto.setStudentId(message.getStudent().getId());
        dto.setStudentName(message.getStudent().getFirstName() + " " + message.getStudent().getLastName());
        dto.setTutorId(message.getTutor().getId());
        dto.setTutorName(message.getTutor().getFirstName() + " " + message.getTutor().getLastName());
        dto.setSubjectId(message.getSubject().getId());
        dto.setSubjectName(message.getSubject().getName());
        dto.setMessage(message.getMessage());
        dto.setSenderType(message.getSenderType());
        dto.setRead(message.isRead());
        dto.setCreatedAt(message.getCreatedAt());
        dto.setFormattedTime(message.getCreatedAt().format(TIME_FORMATTER));
        return dto;
    }
}