package com.grade12.backend.service;

import com.grade12.backend.dto.CreateSessionRequest;
import com.grade12.backend.dto.SessionResponseDTO;
import com.grade12.backend.model.Session;
import com.grade12.backend.model.Subject;
import com.grade12.backend.model.Tutor;
import com.grade12.backend.repository.SessionRepository;
import com.grade12.backend.repository.SubjectRepository;
import com.grade12.backend.repository.TutorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final TutorRepository tutorRepository;
    private final SubjectRepository subjectRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a");

    @Transactional
    public SessionResponseDTO createSession(Long tutorId, CreateSessionRequest request) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new RuntimeException("Session title is required");
        }
        if (request.getStartTime() == null) {
            throw new RuntimeException("Start time is required");
        }
        if (request.getDuration() == null || request.getDuration() <= 0) {
            throw new RuntimeException("A valid duration is required");
        }

        Tutor tutor = tutorRepository.findById(tutorId)
                .orElseThrow(() -> new RuntimeException("Tutor not found"));

        Subject subject = null;
        if (request.getSubjectId() != null) {
            subject = subjectRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new RuntimeException("Subject not found"));
        }

        Session session = new Session();
        session.setSessionId(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        session.setTitle(request.getTitle().trim());
        session.setTopic(request.getTopic());
        session.setDescription(request.getDescription());
        session.setTutor(tutor);
        session.setSubject(subject);
        session.setStartTime(request.getStartTime());
        session.setDuration(request.getDuration());
        session.setEndTime(request.getStartTime().plusMinutes(request.getDuration()));
        session.setSessionType(request.getSessionType() != null ? request.getSessionType() : "LIVE");
        session.setMaxStudents(request.getMaxStudents() != null ? request.getMaxStudents() : 10);
        session.setCurrentStudents(0);
        session.setStatus("SCHEDULED");

        String provider = request.getMeetingProvider() != null ? request.getMeetingProvider() : "GOOGLE_MEET";
        session.setMeetingProvider(provider);
        session.setMeetingLink(generateMeetingLink(provider, session.getSessionId()));

        Session saved = sessionRepository.save(session);
        return convertToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<SessionResponseDTO> getSessionsForTutor(Long tutorId) {
        return sessionRepository.findByTutorIdOrderByStartTimeAsc(tutorId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteSession(Long sessionId, Long tutorId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        if (!session.getTutor().getId().equals(tutorId)) {
            throw new RuntimeException("Unauthorized");
        }
        sessionRepository.delete(session);
    }

    /**
     * Generates a meeting link.
     *
     * For Google Meet: We cannot pre-create real Meet rooms without the Google Calendar API.
     * Instead, we use https://meet.new which always creates a fresh real room on click.
     * To give each session a "unique" feel, we append the sessionId as a memo parameter
     * (Google ignores unknown params and still opens a new room).
     *
     * For production: integrate Google Calendar API to create real unique Meet links.
     */
    private String generateMeetingLink(String provider, String sessionId) {
        if ("ZOOM".equalsIgnoreCase(provider)) {
            return "https://zoom.us/start/videomeeting";
        } else {
            // meet.new always creates a valid, real Google Meet room
            return "https://meet.new";
        }
    }

    private SessionResponseDTO convertToDTO(Session session) {
        SessionResponseDTO dto = new SessionResponseDTO();
        dto.setId(session.getId());
        dto.setSessionId(session.getSessionId());
        dto.setTitle(session.getTitle());
        dto.setTopic(session.getTopic());
        dto.setDescription(session.getDescription());
        dto.setTutorId(session.getTutor().getId());
        dto.setTutorName(session.getTutor().getUser().getFirstName() + " "
                + session.getTutor().getUser().getLastName());
        if (session.getSubject() != null) {
            dto.setSubjectId(session.getSubject().getId());
            dto.setSubjectName(session.getSubject().getName());
        }
        dto.setStartTime(session.getStartTime());
        dto.setEndTime(session.getEndTime());
        dto.setDuration(session.getDuration());
        dto.setSessionType(session.getSessionType());
        dto.setMaxStudents(session.getMaxStudents());
        dto.setCurrentStudents(session.getCurrentStudents());
        dto.setMeetingLink(session.getMeetingLink());
        dto.setMeetingProvider(session.getMeetingProvider());
        dto.setStatus(session.getStatus());
        dto.setFormattedDate(session.getStartTime().format(DATE_FORMATTER));
        dto.setFormattedTime(session.getStartTime().format(TIME_FORMATTER));
        return dto;
    }
}