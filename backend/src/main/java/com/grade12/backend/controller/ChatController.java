package com.grade12.backend.controller;

import com.grade12.backend.dto.ChatMessageDTO;
import com.grade12.backend.dto.SendMessageRequest;
import com.grade12.backend.dto.UnreadCountDTO;
import com.grade12.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ChatController {
    
    private final ChatService chatService;
    
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody SendMessageRequest request) {
        try {
            ChatMessageDTO message = chatService.sendMessage(request);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/conversation")
    public ResponseEntity<?> getConversation(
            @RequestParam Long studentId,
            @RequestParam Long tutorId,
            @RequestParam Long subjectId) {
        try {
            List<ChatMessageDTO> messages = chatService.getConversation(studentId, tutorId, subjectId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/mark-read")
    public ResponseEntity<?> markMessagesAsRead(
            @RequestParam Long studentId,
            @RequestParam Long tutorId,
            @RequestParam Long subjectId,
            @RequestParam String readerType) {
        try {
            chatService.markMessagesAsRead(studentId, tutorId, subjectId, readerType);
            return ResponseEntity.ok(Map.of("message", "Messages marked as read"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/unread/tutor/{tutorId}")
    public ResponseEntity<?> getUnreadCountForTutor(@PathVariable Long tutorId) {
        try {
            UnreadCountDTO unreadData = chatService.getUnreadCountForTutor(tutorId);
            return ResponseEntity.ok(unreadData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/unread/student/{studentId}")
    public ResponseEntity<?> getUnreadCountForStudent(@PathVariable Long studentId) {
        try {
            Long count = chatService.getUnreadCountForStudent(studentId);
            return ResponseEntity.ok(Map.of("unreadCount", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}