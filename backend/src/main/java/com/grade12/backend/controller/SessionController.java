package com.grade12.backend.controller;

import com.grade12.backend.dto.CreateSessionRequest;
import com.grade12.backend.dto.SessionResponseDTO;
import com.grade12.backend.model.Tutor;
import com.grade12.backend.model.User;  // ← ADD THIS IMPORT
import com.grade12.backend.repository.TutorRepository;
import com.grade12.backend.repository.UserRepository;
import com.grade12.backend.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;
    private final UserRepository userRepository;
    private final TutorRepository tutorRepository;

    @PostMapping
    public ResponseEntity<?> createSession(@RequestBody CreateSessionRequest request,
                                           @AuthenticationPrincipal UserDetails currentUser) {
        try {
            Long tutorId = getTutorIdFromUserDetails(currentUser);
            SessionResponseDTO created = sessionService.createSession(tutorId, request);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getMySessions(@AuthenticationPrincipal UserDetails currentUser) {
        try {
            Long tutorId = getTutorIdFromUserDetails(currentUser);
            List<SessionResponseDTO> sessions = sessionService.getSessionsForTutor(tutorId);
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<?> deleteSession(@PathVariable Long sessionId,
                                           @AuthenticationPrincipal UserDetails currentUser) {
        try {
            Long tutorId = getTutorIdFromUserDetails(currentUser);
            sessionService.deleteSession(sessionId, tutorId);
            return ResponseEntity.ok(Map.of("message", "Session deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private Long getTutorIdFromUserDetails(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Tutor tutor = tutorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Tutor not found"));
        return tutor.getId();
    }
}