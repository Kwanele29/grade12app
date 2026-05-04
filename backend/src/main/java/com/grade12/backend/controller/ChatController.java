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

    // Accepts frontend payload: { senderId, receiverId, content, timestamp, ... }
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> payload) {
        try {
            SendMessageRequest request = new SendMessageRequest();
            // Map frontend fields to backend expected fields
            request.setStudentId(Long.valueOf(payload.get("senderId").toString()));
            request.setTutorId(Long.valueOf(payload.get("receiverId").toString()));
            // If subjectId is not sent, default to 1 (or fetch from relation)
            Long subjectId = payload.containsKey("subjectId") ? 
                Long.valueOf(payload.get("subjectId").toString()) : 1L;
            request.setSubjectId(subjectId);
            request.setMessage(payload.get("content").toString());
            // Determine sender type based on role (tutor or student)
            // For now assume tutor is sending
            request.setSenderType("TUTOR");
            
            ChatMessageDTO message = chatService.sendMessage(request);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/chat/conversation?studentId=X&tutorId=Y&subjectId=Z
    @GetMapping("/conversation")
    public ResponseEntity<?> getConversation(
            @RequestParam Long studentId,
            @RequestParam Long tutorId,
            @RequestParam(required = false) Long subjectId) {
        try {
            if (subjectId == null) subjectId = 1L;
            List<ChatMessageDTO> messages = chatService.getConversation(studentId, tutorId, subjectId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // POST /api/chat/mark-read with JSON body: { studentId, tutorId, subjectId, readerType }
    @PostMapping("/mark-read")
    public ResponseEntity<?> markMessagesAsRead(@RequestBody Map<String, Object> payload) {
        try {
            Long studentId = Long.valueOf(payload.get("studentId").toString());
            Long tutorId = Long.valueOf(payload.get("tutorId").toString());
            Long subjectId = Long.valueOf(payload.get("subjectId").toString());
            String readerType = payload.get("readerType").toString();
            chatService.markMessagesAsRead(studentId, tutorId, subjectId, readerType);
            return ResponseEntity.ok(Map.of("message", "Messages marked as read"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get unread count for a tutor (no change)
    @GetMapping("/unread/tutor/{tutorId}")
    public ResponseEntity<?> getUnreadCountForTutor(@PathVariable Long tutorId) {
        try {
            UnreadCountDTO unreadData = chatService.getUnreadCountForTutor(tutorId);
            return ResponseEntity.ok(unreadData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get unread count for a student
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