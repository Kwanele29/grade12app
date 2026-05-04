package com.grade12.backend.controller;

import com.grade12.backend.dto.TutorDashboardDTO;
import com.grade12.backend.model.*;
import com.grade12.backend.repository.*;
import com.grade12.backend.service.CustomUserDetailsService;
import com.grade12.backend.service.FileStorageService;
import com.grade12.backend.service.JwtService;
import com.grade12.backend.service.TutorService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
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
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public TutorController(
            TutorRepository tutorRepository,
            UserRepository userRepository,
            StudentTutorRepository studentTutorRepository,
            SessionRepository sessionRepository,
            QuizRepository quizRepository,
            MaterialRepository materialRepository,
            SubjectRepository subjectRepository,
            TutorService tutorService,
            FileStorageService fileStorageService,
            JwtService jwtService,
            CustomUserDetailsService userDetailsService) {
        this.tutorRepository = tutorRepository;
        this.userRepository = userRepository;
        this.studentTutorRepository = studentTutorRepository;
        this.sessionRepository = sessionRepository;
        this.quizRepository = quizRepository;
        this.materialRepository = materialRepository;
        this.subjectRepository = subjectRepository;
        this.tutorService = tutorService;
        this.fileStorageService = fileStorageService;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    // ============================== JWT HELPER ==============================

    private String extractEmailFromRequest(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
            String token = authHeader.substring(7);
            String email = jwtService.extractUsername(token);
            if (email == null) return null;
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            return jwtService.isTokenValid(token, userDetails) ? email : null;
        } catch (Exception e) {
            System.out.println("❌ Token extraction failed: " + e.getMessage());
            return null;
        }
    }

    private User getUserFromRequest(HttpServletRequest request) {
        String email = extractEmailFromRequest(request);
        if (email == null) return null;
        return userRepository.findByEmail(email).orElse(null);
    }

    private Tutor getOrCreateTutor(User user) {
        return tutorRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    System.out.println("⚠️ No tutor record found for userId: " + user.getId() + " — creating one");
                    Tutor newTutor = new Tutor();
                    newTutor.setUser(user);
                    return tutorRepository.save(newTutor);
                });
    }

    // ============================== ENDPOINTS ==============================

    @PostMapping("/subjects")
    public ResponseEntity<?> saveSubjects(HttpServletRequest request,
                                          @RequestBody Map<String, Object> req) {
        try {
            User user = getUserFromRequest(request);
            if (user == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

            Tutor tutor = getOrCreateTutor(user);

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> subjects = (List<Map<String, Object>>) req.get("subjects");

            if (subjects == null || subjects.isEmpty())
                return ResponseEntity.badRequest().body(Map.of("message", "No subjects provided"));

            for (Map<String, Object> subject : subjects) {
                Long subjectId = ((Number) subject.get("id")).longValue();
                if (!subjectRepository.existsById(subjectId))
                    return ResponseEntity.badRequest().body(Map.of("message", "Invalid subject ID: " + subjectId));
            }

            tutor.setSubjects(subjects);
            Tutor savedTutor = tutorRepository.save(tutor);
            return ResponseEntity.ok(Map.of("message", "Subjects saved successfully", "subjects", savedTutor.getSubjects()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to save subjects: " + e.getMessage()));
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(HttpServletRequest request) {
        try {
            User user = getUserFromRequest(request);
            if (user == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

            Tutor tutor = getOrCreateTutor(user);

            TutorDashboardDTO dto = new TutorDashboardDTO();
            dto.setTutor(new TutorDashboardDTO.TutorInfo(tutor, user));

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

            // Load all upcoming sessions
            List<Session> allUpcoming = sessionRepository
                    .findByTutorIdAndStartTimeAfterOrderByStartTimeAsc(
                            tutor.getId(),
                            LocalDateTime.now().minusDays(1)
                    );

            List<TutorDashboardDTO.SessionInfo> allSessionInfos = allUpcoming.stream()
                    .map(this::convertToSessionInfo)
                    .collect(Collectors.toList());

            List<TutorDashboardDTO.SessionInfo> todayInfos = allSessionInfos.stream()
                    .filter(s -> "Today".equals(s.getDate()))
                    .collect(Collectors.toList());

            dto.setTodaySessions(todayInfos);
            dto.setUpcomingSessions(allSessionInfos.stream().limit(10).collect(Collectors.toList()));
            dto.setTodaySessions(allSessionInfos); // for schedule tab

            // Stats
            TutorDashboardDTO.Stats stats = new TutorDashboardDTO.Stats();
            stats.setStudentsCount(studentTutors.size());
            stats.setQuizzesCount((int) quizRepository.countByTutor(user));
            stats.setAverageScore(calculateAverageScore(studentTutors));
            stats.setSessionsThisWeek(getSessionsThisWeek(tutor.getId()));
            stats.setMaterialsCount((int) materialRepository.countByTutorId(tutor.getId()));
            stats.setRating(tutor.getAverageRating());
            stats.setCompletedSessions(sessionRepository.countByTutorIdAndStatus(tutor.getId(), "COMPLETED"));
            stats.setPendingReviews(0);
            dto.setStats(stats);

            dto.setRecentActivities(getRecentActivities(user));

            System.out.println("✅ Dashboard loaded for: " + user.getEmail()
                    + " | sessions: " + allSessionInfos.size());
            return ResponseEntity.ok(dto);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to load dashboard: " + e.getMessage()));
        }
    }

    @GetMapping("/students")
    public ResponseEntity<?> getStudents(HttpServletRequest request) {
        try {
            User user = getUserFromRequest(request);
            if (user == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

            Tutor tutor = tutorRepository.findByUserId(user.getId())
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

    @GetMapping("/{tutorId}/students")
    public ResponseEntity<?> getStudentsForMessages(@PathVariable Long tutorId) {
        try {
            Tutor tutor = tutorRepository.findById(tutorId)
                    .orElseThrow(() -> new RuntimeException("Tutor not found with id: " + tutorId));

            List<StudentTutor> studentTutors = studentTutorRepository.findByTutorId(tutor.getId());
            List<Map<String, Object>> students = studentTutors.stream()
                    .map(st -> {
                        Student student = st.getStudent();
                        User studentUser = student.getUser();
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", student.getId());
                        map.put("firstName", studentUser.getFirstName());
                        map.put("lastName", studentUser.getLastName());
                        map.put("email", studentUser.getEmail());
                        map.put("subject", st.getSubject().getName());
                        map.put("progress", st.getProgress());
                        map.put("lastMessage", "No messages yet");
                        map.put("unreadCount", 0);
                        return map;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(students);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/schedule")
    public ResponseEntity<?> getSchedule(HttpServletRequest request) {
        try {
            User user = getUserFromRequest(request);
            if (user == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

            Tutor tutor = tutorRepository.findByUserId(user.getId())
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
                        sessionMap.put("color", "#48bb78");
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
    public ResponseEntity<?> createSession(HttpServletRequest request,
                                           @RequestBody Map<String, Object> body) {
        try {
            User user = getUserFromRequest(request);
            if (user == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

            Tutor tutor = tutorRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Tutor not found"));

            Session session = new Session();
            session.setSessionId("SESS_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            session.setTitle((String) body.get("title"));
            session.setTopic((String) body.get("topic"));
            session.setDescription((String) body.get("description"));
            session.setTutor(tutor);

            if (body.get("subjectId") != null) {
                Long subjectId = ((Number) body.get("subjectId")).longValue();
                subjectRepository.findById(subjectId).ifPresent(session::setSubject);
            }

            String startTimeStr = (String) body.get("startTime");
            LocalDateTime startTime = LocalDateTime.parse(
                    startTimeStr.replace("Z", "").replace(".000", "")
            );
            session.setStartTime(startTime);

            Integer duration = body.get("duration") != null
                    ? ((Number) body.get("duration")).intValue() : 60;
            session.setDuration(duration);
            session.setEndTime(startTime.plusMinutes(duration));

            session.setSessionType(body.get("sessionType") != null
                    ? (String) body.get("sessionType") : "LIVE");
            session.setMaxStudents(body.get("maxStudents") != null
                    ? ((Number) body.get("maxStudents")).intValue() : 10);
            session.setMeetingProvider(body.get("meetingProvider") != null
                    ? (String) body.get("meetingProvider") : "GOOGLE_MEET");

            // ✅ FIXED: Working meeting links (no random strings)
            String provider = session.getMeetingProvider();
            String meetingLink;
            if ("ZOOM".equalsIgnoreCase(provider)) {
                meetingLink = "https://zoom.us/start";
            } else {
                meetingLink = "https://meet.google.com/new";
            }
            session.setMeetingLink(meetingLink);
            session.setStatus("SCHEDULED");
            session.setCurrentStudents(0);

            sessionRepository.save(session);

            System.out.println("✅ Session created via TutorController by: " + user.getEmail());
            return ResponseEntity.ok(Map.of("message", "Session created successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to create session: " + e.getMessage()));
        }
    }

    @PostMapping("/materials")
    public ResponseEntity<?> uploadMaterial(
            HttpServletRequest request,
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("subjectId") Long subjectId,
            @RequestParam("topic") String topic,
            @RequestParam("tags") String tags) {
        try {
            User user = getUserFromRequest(request);
            if (user == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

            Tutor tutor = tutorRepository.findByUserId(user.getId())
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

            return ResponseEntity.ok(Map.of("message", "Material uploaded successfully", "fileUrl", fileUrl));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to upload material: " + e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(HttpServletRequest request,
                                           @RequestBody Map<String, Object> body) {
        try {
            User user = getUserFromRequest(request);
            if (user == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

            Tutor tutor = tutorRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Tutor not found"));

            if (body.containsKey("qualification")) tutor.setQualification((String) body.get("qualification"));
            if (body.containsKey("specialization")) tutor.setSpecialization((String) body.get("specialization"));
            if (body.containsKey("yearsOfExperience")) tutor.setYearsOfExperience((Integer) body.get("yearsOfExperience"));
            if (body.containsKey("bio")) tutor.setBio((String) body.get("bio"));
            if (body.containsKey("isAvailable")) tutor.setIsAvailable((Boolean) body.get("isAvailable"));
            tutorRepository.save(tutor);

            return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to update profile: " + e.getMessage()));
        }
    }

    @GetMapping("/debug")
    public ResponseEntity<?> debug(HttpServletRequest request) {
        try {
            User user = getUserFromRequest(request);
            if (user == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
            Optional<Tutor> tutorOpt = tutorRepository.findByUserId(user.getId());
            if (tutorOpt.isEmpty()) {
                return ResponseEntity.ok(Map.of("userId", user.getId(), "email", user.getEmail(), "tutorExists", false));
            }
            Tutor tutor = tutorOpt.get();
            return ResponseEntity.ok(Map.of(
                    "userId", user.getId(), "email", user.getEmail(),
                    "tutorId", tutor.getId(), "tutorExists", true,
                    "subjects", tutor.getSubjects() != null ? tutor.getSubjects() : List.of()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ============================== HELPER METHODS ==============================

    private String getMaterialType(String filename) {
        if (filename == null) return "other";
        String extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        return switch (extension) {
            case "pdf" -> "pdf";
            case "doc", "docx" -> "document";
            case "ppt", "pptx" -> "presentation";
            case "mp4", "mov", "avi", "mkv" -> "video";
            case "jpg", "jpeg", "png", "gif", "webp" -> "image";
            case "txt" -> "text";
            case "zip", "rar", "7z" -> "archive";
            default -> "other";
        };
    }

    private String getInitials(User user) {
        return (user.getFirstName().charAt(0) + "" + user.getLastName().charAt(0)).toUpperCase();
    }

    private String getSubjectName(Subject subject) {
        return subject != null ? subject.getName() : "General";
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
        if (start == null) return "";
        String startStr = start.format(DateTimeFormatter.ofPattern("HH:mm"));
        if (end == null) return startStr;
        return startStr + " - " + end.format(DateTimeFormatter.ofPattern("HH:mm"));
    }

    private String getUpcomingSession(Tutor tutor, Student student) {
        return "No upcoming sessions";
    }

    private List<String> parseJsonList(String json) {
        if (json == null || json.isEmpty()) return new ArrayList<>();
        return Arrays.asList(json.replace("[", "").replace("]", "").split(","));
    }

    private List<Map<String, Object>> parseRecentActivity(String json) {
        if (json == null || json.isEmpty()) return new ArrayList<>();
        return new ArrayList<>();
    }

    private TutorDashboardDTO.SessionInfo convertToSessionInfo(Session session) {
        TutorDashboardDTO.SessionInfo info = new TutorDashboardDTO.SessionInfo();
        info.setId(session.getId());
        info.setSessionId(session.getSessionId());
        info.setTitle(session.getTitle());
        info.setTopic(session.getTopic() != null ? session.getTopic() : session.getTitle());
        info.setSubject(getSubjectName(session.getSubject()));
        info.setTime(formatTimeRange(session.getStartTime(), session.getEndTime()));
        info.setType(session.getSessionType() != null ? session.getSessionType() : "LIVE");
        info.setStudents((session.getCurrentStudents() != null ? session.getCurrentStudents() : 0)
                + "/" + (session.getMaxStudents() != null ? session.getMaxStudents() : 10) + " students");
        info.setMeetingLink(session.getMeetingLink());
        info.setAttendees(parseJsonList(session.getAttendees()));
        info.setStatus(session.getStatus());

        LocalDate sessionDate = session.getStartTime().toLocalDate();
        LocalDate today = LocalDate.now();
        if (sessionDate.isEqual(today)) {
            info.setDate("Today");
        } else if (sessionDate.isEqual(today.plusDays(1))) {
            info.setDate("Tomorrow");
        } else {
            info.setDate(session.getStartTime().format(DateTimeFormatter.ofPattern("dd MMM yyyy")));
        }

        info.setColor("#667eea");
        return info;
    }

    private Integer calculateAverageScore(List<StudentTutor> studentTutors) {
        if (studentTutors == null || studentTutors.isEmpty()) return 0;
        double sum = 0.0;
        int count = 0;
        for (StudentTutor st : studentTutors) {
            Double score = st.getAverageScore();
            if (score != null) { sum += score; count++; }
        }
        return count > 0 ? (int) Math.round(sum / count) : 0;
    }

    private Integer getSessionsThisWeek(Long tutorId) {
        LocalDateTime startOfWeek = LocalDateTime.now()
                .minusDays(LocalDateTime.now().getDayOfWeek().getValue() - 1);
        LocalDateTime endOfWeek = startOfWeek.plusDays(7);
        return sessionRepository.countByTutorIdAndStartTimeBetween(tutorId, startOfWeek, endOfWeek);
    }

    private List<TutorDashboardDTO.RecentActivity> getRecentActivities(User tutorUser) {
        List<TutorDashboardDTO.RecentActivity> activities = new ArrayList<>();

        Tutor tutor = tutorRepository.findByUser(tutorUser)
                .orElseThrow(() -> new RuntimeException("Tutor not found"));

        List<Session> recentSessions = sessionRepository.findTop5ByTutorIdOrderByStartTimeDesc(tutor.getId());
        for (Session session : recentSessions) {
            TutorDashboardDTO.RecentActivity activity = new TutorDashboardDTO.RecentActivity();
            activity.setDate(formatDate(session.getStartTime()));
            activity.setType("Session");
            activity.setSubject(getSubjectName(session.getSubject()));
            activity.setDescription(session.getTitle());
            activity.setStatus(session.getStatus());
            activities.add(activity);
        }

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
}