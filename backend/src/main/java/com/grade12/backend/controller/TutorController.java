package com.grade12.backend.controller;

import com.grade12.backend.dto.TutorDashboardDTO;
import com.grade12.backend.model.*;
import com.grade12.backend.repository.*;
import com.grade12.backend.security.UserPrincipal;
import com.grade12.backend.service.FileStorageService;
import com.grade12.backend.service.TutorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tutor")
@PreAuthorize("hasRole('TUTOR')")
@CrossOrigin(origins = "http://localhost:3000")
public class TutorController {
    
    private final TutorRepository tutorRepository;
    private final UserRepository userRepository;
    private final StudentTutorRepository studentTutorRepository;
    private final SessionRepository sessionRepository;
    private final QuizRepository quizRepository;
    private final MaterialRepository materialRepository;
    private final SubjectRepository subjectRepository;
    private final TutorService tutorService;
    private final FileStorageService fileStorageService;
    
    public TutorController(
            TutorRepository tutorRepository,
            UserRepository userRepository,
            StudentTutorRepository studentTutorRepository,
            SessionRepository sessionRepository,
            QuizRepository quizRepository,
            MaterialRepository materialRepository,
            SubjectRepository subjectRepository,
            TutorService tutorService,
            FileStorageService fileStorageService) {
        this.tutorRepository = tutorRepository;
        this.userRepository = userRepository;
        this.studentTutorRepository = studentTutorRepository;
        this.sessionRepository = sessionRepository;
        this.quizRepository = quizRepository;
        this.materialRepository = materialRepository;
        this.subjectRepository = subjectRepository;
        this.tutorService = tutorService;
        this.fileStorageService = fileStorageService;
    }
    
    @PostMapping("/subjects")
    public ResponseEntity<?> saveSubjects(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody Map<String, Object> request) {
        try {
            Long userId = currentUser.getId();
            Tutor tutor = tutorRepository.findByUserId(userId)
                    .orElseGet(() -> {
                        Tutor newTutor = new Tutor();
                        User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                        newTutor.setUser(user);
                        return tutorRepository.save(newTutor);
                    });
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> subjects = (List<Map<String, Object>>) request.get("subjects");
            
            for (Map<String, Object> subject : subjects) {
                Long subjectId = ((Number) subject.get("id")).longValue();
                if (!subjectRepository.existsById(subjectId)) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Invalid subject ID: " + subjectId));
                }
            }
            
            tutor.setSubjects(subjects);
            tutorRepository.save(tutor);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Subjects saved successfully");
            response.put("subjects", tutor.getSubjects());
            System.out.println("✅ Subjects saved for tutor: " + currentUser.getEmail() + " - " + subjects.size() + " subjects");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to save subjects: " + e.getMessage()));
        }
    }
    
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(@AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            Long userId = currentUser.getId();
            Tutor tutor = tutorRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Tutor not found"));
            User user = tutor.getUser();
            TutorDashboardDTO dto = new TutorDashboardDTO();
            
            // Tutor info
            TutorDashboardDTO.TutorInfo tutorInfo = new TutorDashboardDTO.TutorInfo(tutor, user);
            dto.setTutor(tutorInfo);
            
            // Students
            List<StudentTutor> studentTutors = studentTutorRepository.findByTutorId(tutor.getId());
            List<TutorDashboardDTO.StudentInfo> students = studentTutors.stream()
                    .map(st -> {
                        Student student = st.getStudent();
                        User studentUser = student.getUser();
                        TutorDashboardDTO.StudentInfo info = new TutorDashboardDTO.StudentInfo();
                        info.setId(student.getId());
                        info.setName(studentUser.getFirstName() + " " + studentUser.getLastName());
                        info.setAvatar(getInitials(studentUser));
                        info.setEmail(studentUser.getEmail());
                        info.setPhone(student.getPhone());
                        info.setSubject(getSubjectName(st.getSubject()));
                        info.setProgress(st.getProgress());
                        info.setLastActive(getLastActiveText(st.getLastActive()));
                        info.setGrade(student.getGrade());
                        info.setSchool(student.getSchool());
                        info.setJoinDate(formatDate(st.getJoinedDate()));
                        info.setTotalSessions(st.getTotalSessions());
                        info.setAverageScore(st.getAverageScore());
                        info.setCompletedQuizzes(st.getCompletedQuizzes());
                        info.setUpcomingSession(getUpcomingSession(tutor, student));
                        info.setStrengths(parseJsonList(st.getStrengths()));
                        info.setWeaknesses(parseJsonList(st.getWeaknesses()));
                        info.setRecentActivity(parseRecentActivity(st.getRecentActivity()));
                        return info;
                    })
                    .collect(Collectors.toList());
            dto.setStudents(students);
            
            // Today's sessions
            LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
            LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
            List<Session> todaySessions = sessionRepository.findByTutorIdAndStartTimeBetween(tutor.getId(), startOfDay, endOfDay);
            dto.setTodaySessions(todaySessions.stream().map(this::convertToSessionInfo).collect(Collectors.toList()));
            
            // Upcoming sessions
            List<Session> upcomingSessions = sessionRepository.findByTutorIdAndStartTimeAfterOrderByStartTimeAsc(tutor.getId(), LocalDateTime.now());
            dto.setUpcomingSessions(upcomingSessions.stream().limit(10).map(this::convertToSessionInfo).collect(Collectors.toList()));
            
            // Stats – FIXED: use countByTutor(User) instead of countByTutorId
            TutorDashboardDTO.Stats stats = new TutorDashboardDTO.Stats();
            stats.setStudentsCount(studentTutors.size());
            stats.setQuizzesCount((int) quizRepository.countByTutor(tutor.getUser()));
            stats.setAverageScore(calculateAverageScore(studentTutors));
            stats.setSessionsThisWeek(getSessionsThisWeek(tutor.getId()));
            stats.setMaterialsCount(materialRepository.countByTutorId(tutor.getId()));
            stats.setRating(tutor.getAverageRating());
            stats.setCompletedSessions(sessionRepository.countByTutorIdAndStatus(tutor.getId(), "COMPLETED"));
            stats.setPendingReviews(0);
            dto.setStats(stats);
            
            // Recent activities – pass the User object
            dto.setRecentActivities(getRecentActivities(tutor.getUser()));
            
            System.out.println("✅ Dashboard loaded for tutor: " + currentUser.getEmail() + " with " + students.size() + " students");
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to load dashboard: " + e.getMessage()));
        }
    }
    
    @GetMapping("/students")
    public ResponseEntity<?> getStudents(@AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            Long userId = currentUser.getId();
            Tutor tutor = tutorRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Tutor not found"));
            List<StudentTutor> studentTutors = studentTutorRepository.findByTutorId(tutor.getId());
            List<Map<String, Object>> students = studentTutors.stream()
                    .map(st -> {
                        Student student = st.getStudent();
                        User studentUser = student.getUser();
                        Map<String, Object> studentMap = new HashMap<>();
                        studentMap.put("id", student.getId());
                        studentMap.put("name", studentUser.getFirstName() + " " + studentUser.getLastName());
                        studentMap.put("email", studentUser.getEmail());
                        studentMap.put("phone", student.getPhone());
                        studentMap.put("grade", student.getGrade());
                        studentMap.put("school", student.getSchool());
                        studentMap.put("subject", getSubjectName(st.getSubject()));
                        studentMap.put("progress", st.getProgress());
                        studentMap.put("lastActive", getLastActiveText(st.getLastActive()));
                        studentMap.put("avatar", getInitials(studentUser));
                        studentMap.put("totalSessions", st.getTotalSessions());
                        studentMap.put("averageScore", st.getAverageScore());
                        studentMap.put("completedQuizzes", st.getCompletedQuizzes());
                        studentMap.put("strengths", parseJsonList(st.getStrengths()));
                        studentMap.put("weaknesses", parseJsonList(st.getWeaknesses()));
                        studentMap.put("recentActivity", parseRecentActivity(st.getRecentActivity()));
                        return studentMap;
                    })
                    .collect(Collectors.toList());
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to load students: " + e.getMessage()));
        }
    }
    
    @GetMapping("/schedule")
    public ResponseEntity<?> getSchedule(@AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            Long userId = currentUser.getId();
            Tutor tutor = tutorRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Tutor not found"));
            List<Session> sessions = sessionRepository.findByTutorIdOrderByStartTimeAsc(tutor.getId());
            List<Map<String, Object>> schedule = sessions.stream()
                    .map(session -> {
                        Map<String, Object> sessionMap = new HashMap<>();
                        sessionMap.put("id", session.getId());
                        sessionMap.put("sessionId", session.getSessionId());
                        sessionMap.put("title", session.getTitle());
                        sessionMap.put("topic", session.getTopic());
                        sessionMap.put("subject", getSubjectName(session.getSubject()));
                        sessionMap.put("date", formatDate(session.getStartTime()));
                        sessionMap.put("time", formatTimeRange(session.getStartTime(), session.getEndTime()));
                        sessionMap.put("type", session.getSessionType());
                        sessionMap.put("students", session.getCurrentStudents() + "/" + session.getMaxStudents() + " students");
                        sessionMap.put("meetingLink", session.getMeetingLink());
                        sessionMap.put("status", session.getStatus());
                        sessionMap.put("attendees", parseJsonList(session.getAttendees()));
                        
                        Optional<Map<String, Object>> subjectOpt = tutor.getSubjects().stream()
                                .filter(s -> s.get("name").equals(getSubjectName(session.getSubject())))
                                .findFirst();
                        sessionMap.put("color", subjectOpt.map(s -> s.get("color")).orElse("#48bb78"));
                        return sessionMap;
                    })
                    .collect(Collectors.toList());
            return ResponseEntity.ok(schedule);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to load schedule: " + e.getMessage()));
        }
    }
    
    @PostMapping("/sessions")
    public ResponseEntity<?> createSession(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody Map<String, Object> request) {
        try {
            Long userId = currentUser.getId();
            Tutor tutor = tutorRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Tutor not found"));
            Session session = new Session();
            session.setSessionId(generateSessionId());
            session.setTitle((String) request.get("title"));
            session.setTopic((String) request.get("topic"));
            session.setDescription((String) request.get("description"));
            session.setTutor(tutor);
            Long subjectId = ((Number) request.get("subjectId")).longValue();
            session.setSubject(subjectRepository.findById(subjectId)
                    .orElseThrow(() -> new RuntimeException("Subject not found")));
            session.setStartTime(LocalDateTime.parse((String) request.get("startTime")));
            session.setEndTime(LocalDateTime.parse((String) request.get("endTime")));
            session.setSessionType((String) request.get("sessionType"));
            session.setMaxStudents((Integer) request.get("maxStudents"));
            session.setMeetingLink((String) request.get("meetingLink"));
            session.setMeetingProvider((String) request.get("meetingProvider"));
            session.setStatus("SCHEDULED");
            session.setCreatedAt(LocalDateTime.now());
            sessionRepository.save(session);
            return ResponseEntity.ok(Map.of("message", "Session created successfully", "session", session));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to create session: " + e.getMessage()));
        }
    }
    
    @PostMapping("/materials")
    public ResponseEntity<?> uploadMaterial(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("subjectId") Long subjectId,
            @RequestParam("topic") String topic,
            @RequestParam("tags") String tags) {
        try {
            Long userId = currentUser.getId();
            Tutor tutor = tutorRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Tutor not found"));
            String fileUrl = fileStorageService.storeFile(file, tutor.getId());
            Material material = new Material();
            material.setTitle(title);
            material.setDescription(description);
            material.setTutor(tutor);
            material.setSubject(subjectRepository.findById(subjectId)
                    .orElseThrow(() -> new RuntimeException("Subject not found")));
            material.setMaterialType(getMaterialType(file.getOriginalFilename()));
            material.setFileUrl(fileUrl);
            material.setFileSize(file.getSize());
            material.setTopic(topic);
            material.setTags(tags.split(","));
            material.setStatus("published");
            material.setUploadedAt(LocalDateTime.now());
            material.setDownloads(0);
            material.setViews(0);
            materialRepository.save(material);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Material uploaded successfully");
            response.put("material", material);
            response.put("fileUrl", fileUrl);
            System.out.println("✅ Material uploaded: " + title + " by tutor: " + currentUser.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to upload material: " + e.getMessage()));
        }
    }
    
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody Map<String, Object> request) {
        try {
            Long userId = currentUser.getId();
            Tutor tutor = tutorRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Tutor not found"));
            if (request.containsKey("qualification")) tutor.setQualification((String) request.get("qualification"));
            if (request.containsKey("specialization")) tutor.setSpecialization((String) request.get("specialization"));
            if (request.containsKey("yearsOfExperience")) tutor.setYearsOfExperience((Integer) request.get("yearsOfExperience"));
            if (request.containsKey("bio")) tutor.setBio((String) request.get("bio"));
            if (request.containsKey("isAvailable")) tutor.setIsAvailable((Boolean) request.get("isAvailable"));
            tutorRepository.save(tutor);
            return ResponseEntity.ok(Map.of("message", "Profile updated successfully", "tutor", tutor));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to update profile: " + e.getMessage()));
        }
    }
    
    // Helper methods
    private String getMaterialType(String filename) {
        if (filename == null) return "other";
        String extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        switch (extension) {
            case "pdf": return "pdf";
            case "doc": case "docx": return "document";
            case "ppt": case "pptx": return "presentation";
            case "mp4": case "mov": case "avi": case "mkv": return "video";
            case "jpg": case "jpeg": case "png": case "gif": case "webp": return "image";
            case "txt": return "text";
            case "zip": case "rar": case "7z": return "archive";
            default: return "other";
        }
    }
    
    private String getInitials(User user) {
        return (user.getFirstName().charAt(0) + "" + user.getLastName().charAt(0)).toUpperCase();
    }
    
    private String getSubjectName(Subject subject) {
        return subject != null ? subject.getName() : "";
    }
    
    private String getLastActiveText(LocalDateTime lastActive) {
        if (lastActive == null) return "Never";
        long minutes = java.time.Duration.between(lastActive, LocalDateTime.now()).toMinutes();
        if (minutes < 1) return "Just now";
        if (minutes < 60) return minutes + " minutes ago";
        if (minutes < 1440) return (minutes / 60) + " hours ago";
        return (minutes / 1440) + " days ago";
    }
    
    private String formatDate(LocalDateTime date) {
        if (date == null) return "";
        return date.format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
    }
    
    private String formatTimeRange(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) return "";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        return start.format(formatter) + " - " + end.format(formatter);
    }
    
    private String getUpcomingSession(Tutor tutor, Student student) {
        return "No upcoming sessions";
    }
    
    private List<String> parseJsonList(String json) {
        if (json == null || json.isEmpty()) return new ArrayList<>();
        // TODO: implement JSON parsing if needed
        return new ArrayList<>();
    }
    
    private List<Map<String, Object>> parseRecentActivity(String json) {
        if (json == null || json.isEmpty()) return new ArrayList<>();
        return new ArrayList<>();
    }
    
    private TutorDashboardDTO.SessionInfo convertToSessionInfo(Session session) {
        TutorDashboardDTO.SessionInfo info = new TutorDashboardDTO.SessionInfo();
        info.setId(session.getId());
        info.setSessionId(session.getSessionId());
        info.setTopic(session.getTopic());
        info.setSubject(getSubjectName(session.getSubject()));
        info.setTime(formatTimeRange(session.getStartTime(), session.getEndTime()));
        info.setType(session.getSessionType());
        info.setStudents(session.getCurrentStudents() + "/" + session.getMaxStudents() + " students");
        info.setDate(formatDate(session.getStartTime()));
        info.setMeetingLink(session.getMeetingLink());
        info.setAttendees(parseJsonList(session.getAttendees()));
        return info;
    }
    
    private Integer calculateAverageScore(List<StudentTutor> studentTutors) {
        if (studentTutors == null || studentTutors.isEmpty()) return 0;
        double sum = 0.0;
        int count = 0;
        for (StudentTutor st : studentTutors) {
            Double score = st.getAverageScore();
            if (score != null) {
                sum += score;
                count++;
            }
        }
        return count > 0 ? (int) Math.round(sum / count) : 0;
    }
    
    private Integer getSessionsThisWeek(Long tutorId) {
        LocalDateTime startOfWeek = LocalDateTime.now().minusDays(LocalDateTime.now().getDayOfWeek().getValue() - 1);
        LocalDateTime endOfWeek = startOfWeek.plusDays(7);
        return sessionRepository.countByTutorIdAndStartTimeBetween(tutorId, startOfWeek, endOfWeek);
    }
    
    // FIXED: Accept User object and use correct QuizRepository methods
    private List<TutorDashboardDTO.RecentActivity> getRecentActivities(User tutorUser) {
        List<TutorDashboardDTO.RecentActivity> activities = new ArrayList<>();
        
        // Get recent sessions (still uses tutorId)
        Tutor tutor = tutorRepository.findByUser(tutorUser)
                .orElseThrow(() -> new RuntimeException("Tutor not found"));
        Long tutorId = tutor.getId();
        
        List<Session> recentSessions = sessionRepository.findTop5ByTutorIdOrderByStartTimeDesc(tutorId);
        for (Session session : recentSessions) {
            TutorDashboardDTO.RecentActivity activity = new TutorDashboardDTO.RecentActivity();
            activity.setDate(formatDate(session.getStartTime()));
            activity.setType("Session");
            activity.setSubject(getSubjectName(session.getSubject()));
            activity.setDescription(session.getTitle());
            activity.setStatus(session.getStatus());
            activities.add(activity);
        }
        
        // Get recent quizzes – FIXED: use findTop5ByTutorOrderByCreatedAtDesc with User
        List<Quiz> recentQuizzes = quizRepository.findTop5ByTutorOrderByCreatedAtDesc(tutorUser);
        for (Quiz quiz : recentQuizzes) {
            TutorDashboardDTO.RecentActivity activity = new TutorDashboardDTO.RecentActivity();
            activity.setDate(formatDate(quiz.getCreatedAt()));
            activity.setType("Quiz");
            activity.setSubject(getSubjectName(quiz.getSubject()));
            activity.setDescription(quiz.getTitle());
            activity.setStatus(quiz.getStatus());
            activities.add(activity);
        }
        
        activities.sort((a, b) -> b.getDate().compareTo(a.getDate()));
        return activities.stream().limit(10).collect(Collectors.toList());
    }
    
    private String generateSessionId() {
        return "SESS_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);
    }
}