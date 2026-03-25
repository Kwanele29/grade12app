package com.grade12.backend.service;

import com.grade12.backend.dto.ChatMessageDTO;
import com.grade12.backend.model.User;
import com.grade12.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {
    
    private final UserRepository userRepository;
    
    public void notifyNewMessage(ChatMessageDTO message, Long recipientId) {
        User recipient = userRepository.findById(recipientId).orElse(null);
        if (recipient != null && recipient.isNotificationEnabled()) {
            System.out.println("🔔 NEW MESSAGE NOTIFICATION:");
            System.out.println("   To: " + recipient.getEmail());
            System.out.println("   From: " + (message.getSenderType().equals("STUDENT") ? 
                message.getStudentName() : message.getTutorName()));
            System.out.println("   Subject: " + message.getSubjectName());
            System.out.println("   Message: " + message.getMessage());
            System.out.println("   Time: " + message.getFormattedTime());
        }
    }
    
    public void markNotificationChecked(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            user.setLastNotificationCheck(java.time.LocalDateTime.now());
            userRepository.save(user);
        }
    }
    
    public boolean hasNewNotifications(Long userId, java.time.LocalDateTime lastCheck) {
        return true;
    }
}