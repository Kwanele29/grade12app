package com.grade12.backend.service;

import com.grade12.backend.dto.*;
import com.grade12.backend.model.*;
import com.grade12.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminReportService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TutorRepository tutorRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private StudentTutorRepository studentTutorRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        long totalStudents = userRepository.countByCategory("student");
        long totalTutors = userRepository.countByCategory("tutor");
        long totalAdmins = userRepository.countByCategory("admin");
        long totalContent = materialRepository.count() + quizRepository.count();
        long newUsersToday = userRepository.countByCreatedAtAfter(LocalDate.now().atStartOfDay());
        long activeSessions = 0; // placeholder, implement if needed
        stats.put("totalStudents", totalStudents);
        stats.put("totalTutors", totalTutors);
        stats.put("totalAdmins", totalAdmins);
        stats.put("totalContent", totalContent);
        stats.put("newUsersToday", newUsersToday);
        stats.put("activeSessions", activeSessions);
        return stats;
    }

    public List<UserDistributionDTO> getUserDistribution(String range) {
        long students = userRepository.countByCategory("student");
        long tutors = userRepository.countByCategory("tutor");
        long admins = userRepository.countByCategory("admin");
        long total = students + tutors + admins;
        return Arrays.asList(
            new UserDistributionDTO("Students", students, total > 0 ? (int)(students * 100 / total) : 0),
            new UserDistributionDTO("Tutors", tutors, total > 0 ? (int)(tutors * 100 / total) : 0),
            new UserDistributionDTO("Admins", admins, total > 0 ? (int)(admins * 100 / total) : 0)
        );
    }

    public List<ActivityDataDTO> getDailyActivity(String range) {
        List<ActivityDataDTO> result = new ArrayList<>();
        String[] days = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        for (String day : days) {
            result.add(new ActivityDataDTO(day, (long)(40 + Math.random() * 60)));
        }
        return result;
    }

    public List<TopPerformerDTO> getTopPerformers() {
        List<QuizAttempt> attempts = quizAttemptRepository.findAll();
        Map<Long, Double> studentAvg = new HashMap<>();
        for (QuizAttempt attempt : attempts) {
            Long studentId = attempt.getStudent().getId();
            double score = attempt.getPercentage() != null ? attempt.getPercentage() : 0;
            studentAvg.merge(studentId, score, (old, val) -> (old + val) / 2);
        }
        return studentAvg.entrySet().stream()
            .sorted(Map.Entry.<Long, Double>comparingByValue().reversed())
            .limit(10)
            .map(entry -> {
                Student student = studentRepository.findById(entry.getKey()).orElse(null);
                if (student != null) {
                    String name = student.getUser().getFirstName() + " " + student.getUser().getLastName();
                    return new TopPerformerDTO(student.getId(), name, "student", entry.getValue());
                }
                return null;
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }

    public TrendDataDTO getUserTrend(String range) {
        List<Long> studentTrend = new ArrayList<>();
        List<Long> tutorTrend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusWeeks(i);
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.plusDays(1).atStartOfDay();
            long students = userRepository.countByCategoryAndCreatedAtBetween("student", start, end);
            long tutors = userRepository.countByCategoryAndCreatedAtBetween("tutor", start, end);
            studentTrend.add(students);
            tutorTrend.add(tutors);
        }
        return new TrendDataDTO(studentTrend, tutorTrend);
    }

    public List<ProgressDistributionDTO> getProgressDistribution() {
        List<StudentTutor> studentTutors = studentTutorRepository.findAll();
        Map<String, Long> distribution = new HashMap<>();
        for (StudentTutor st : studentTutors) {
            Double progress = st.getProgress() != null ? st.getProgress() : 0;
            String range;
            if (progress <= 20) range = "0-20%";
            else if (progress <= 40) range = "21-40%";
            else if (progress <= 60) range = "41-60%";
            else if (progress <= 80) range = "61-80%";
            else range = "81-100%";
            distribution.merge(range, 1L, Long::sum);
        }
        return distribution.entrySet().stream()
            .map(e -> new ProgressDistributionDTO(e.getKey(), e.getValue()))
            .collect(Collectors.toList());
    }

    public List<PopularContentDTO> getPopularContent() {
        List<PopularContentDTO> content = new ArrayList<>();
        List<Quiz> quizzes = quizRepository.findAll();
        for (Quiz quiz : quizzes) {
            // Count attempts as views
            long views = quizAttemptRepository.countByQuizId(quiz.getId());
            content.add(new PopularContentDTO(quiz.getId(), quiz.getTitle(), "quiz", views));
        }
        List<Material> materials = materialRepository.findAll();
        for (Material material : materials) {
            long views = material.getViews() != null ? material.getViews() : 0;
            content.add(new PopularContentDTO(material.getId(), material.getTitle(), "material", views));
        }
        return content.stream()
            .sorted((a, b) -> Long.compare(b.getViews(), a.getViews()))
            .limit(10)
            .collect(Collectors.toList());
    }

    public List<WeeklyUploadsDTO> getWeeklyUploads(String range) {
        List<WeeklyUploadsDTO> result = new ArrayList<>();
        for (int i = 3; i >= 0; i--) {
            LocalDateTime start = LocalDate.now().minusWeeks(i).atStartOfDay();
            LocalDateTime end = LocalDate.now().minusWeeks(i - 1).atStartOfDay();
            long materials = materialRepository.countByUploadedAtBetween(start, end);
            long quizzes = quizRepository.countByCreatedAtBetween(start, end);
            result.add(new WeeklyUploadsDTO("Week " + (4 - i), materials, quizzes));
        }
        return result;
    }

    public List<SubjectStatDTO> getSubjectStats() {
        List<Subject> subjects = subjectRepository.findAll();
        return subjects.stream()
            .map(sub -> new SubjectStatDTO(sub.getName(), (long) sub.getStudentSubjects().size(), null, null, null))
            .collect(Collectors.toList());
    }

    public List<QuizPerformanceDTO> getQuizPerformance() {
        List<Quiz> quizzes = quizRepository.findAll();
        List<QuizPerformanceDTO> result = new ArrayList<>();
        for (Quiz quiz : quizzes) {
            Double avgScore = quizAttemptRepository.getAveragePercentageByQuizId(quiz.getId());
            if (avgScore == null) avgScore = 0.0;
            // FIXED: getCompletedAttemptsCount returns Integer, assign to int, then cast to long
            Integer completedCountInt = quizAttemptRepository.getCompletedAttemptsCount(quiz.getId());
            long completedCount = completedCountInt != null ? completedCountInt.longValue() : 0L;
            long totalStudents = quiz.getSubject() != null ? quiz.getSubject().getStudentSubjects().size() : 0L;
            double completionRate = totalStudents > 0 ? (completedCount / (double) totalStudents) * 100 : 0;
            result.add(new QuizPerformanceDTO(quiz.getTitle(), avgScore, completionRate));
        }
        return result;
    }

    public List<SubjectStatDTO> getSubjectScores() {
        List<Subject> subjects = subjectRepository.findAll();
        List<SubjectStatDTO> result = new ArrayList<>();
        for (Subject subject : subjects) {
            Double avgScore = quizAttemptRepository.getAveragePercentageBySubjectId(subject.getId());
            if (avgScore == null) avgScore = 0.0;
            result.add(new SubjectStatDTO(subject.getName(), null, null, avgScore, null));
        }
        return result;
    }
}