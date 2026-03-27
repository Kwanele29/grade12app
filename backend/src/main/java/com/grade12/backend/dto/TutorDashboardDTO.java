package com.grade12.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
public class TutorDashboardDTO {
    private TutorInfo tutor;
    private List<StudentInfo> students;
    private List<SessionInfo> todaySessions;
    private List<SessionInfo> upcomingSessions;
    private Stats stats;
    private List<RecentActivity> recentActivities;
    
    @Data
    @NoArgsConstructor
    public static class TutorInfo {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private List<Map<String, Object>> subjects;
        private Integer totalStudents;
        private Integer totalSessions;
        private Integer totalQuizzes;
        private Double rating;
        private String profilePicture;
        private Boolean isVerified;
        
        public TutorInfo(com.grade12.backend.model.Tutor tutor, com.grade12.backend.model.User user) {
            this.id = tutor.getId();
            this.firstName = user.getFirstName();
            this.lastName = user.getLastName();
            this.email = user.getEmail();
            this.subjects = tutor.getSubjects();
            this.totalStudents = tutor.getTotalStudents() != null ? tutor.getTotalStudents() : 0;
            this.totalSessions = tutor.getTotalSessions() != null ? tutor.getTotalSessions() : 0;
            this.totalQuizzes = tutor.getTotalQuizzes() != null ? tutor.getTotalQuizzes() : 0;
            this.rating = tutor.getAverageRating() != null ? tutor.getAverageRating() : 0.0;
            this.profilePicture = tutor.getProfilePicture();
            this.isVerified = tutor.getIsVerified() != null ? tutor.getIsVerified() : false;
        }
    }
    
    @Data
    @NoArgsConstructor
    public static class StudentInfo {
        private Long id;
        private String name;
        private String avatar;
        private String email;
        private String phone;
        private String subject;
        private Double progress;
        private String lastActive;
        private Integer grade;
        private String school;
        private String joinDate;
        private Integer totalSessions;
        private Double averageScore;
        private Integer completedQuizzes;
        private String upcomingSession;
        private List<String> strengths;
        private List<String> weaknesses;
        private List<Map<String, Object>> recentActivity;
        
        // Getters and setters (add these if Lombok still not working)
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getAvatar() { return avatar; }
        public void setAvatar(String avatar) { this.avatar = avatar; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        
        public Double getProgress() { return progress; }
        public void setProgress(Double progress) { this.progress = progress; }
        
        public String getLastActive() { return lastActive; }
        public void setLastActive(String lastActive) { this.lastActive = lastActive; }
        
        public Integer getGrade() { return grade; }
        public void setGrade(Integer grade) { this.grade = grade; }
        
        public String getSchool() { return school; }
        public void setSchool(String school) { this.school = school; }
        
        public String getJoinDate() { return joinDate; }
        public void setJoinDate(String joinDate) { this.joinDate = joinDate; }
        
        public Integer getTotalSessions() { return totalSessions; }
        public void setTotalSessions(Integer totalSessions) { this.totalSessions = totalSessions; }
        
        public Double getAverageScore() { return averageScore; }
        public void setAverageScore(Double averageScore) { this.averageScore = averageScore; }
        
        public Integer getCompletedQuizzes() { return completedQuizzes; }
        public void setCompletedQuizzes(Integer completedQuizzes) { this.completedQuizzes = completedQuizzes; }
        
        public String getUpcomingSession() { return upcomingSession; }
        public void setUpcomingSession(String upcomingSession) { this.upcomingSession = upcomingSession; }
        
        public List<String> getStrengths() { return strengths; }
        public void setStrengths(List<String> strengths) { this.strengths = strengths; }
        
        public List<String> getWeaknesses() { return weaknesses; }
        public void setWeaknesses(List<String> weaknesses) { this.weaknesses = weaknesses; }
        
        public List<Map<String, Object>> getRecentActivity() { return recentActivity; }
        public void setRecentActivity(List<Map<String, Object>> recentActivity) { this.recentActivity = recentActivity; }
    }
    
    @Data
    @NoArgsConstructor
    public static class SessionInfo {
        private Long id;
        private String sessionId;
        private String time;
        private String subject;
        private String type;
        private String students;
        private String color;
        private String date;
        private String meetingLink;
        private String topic;
        private List<String> attendees;
        
        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
        
        public String getTime() { return time; }
        public void setTime(String time) { this.time = time; }
        
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        
        public String getStudents() { return students; }
        public void setStudents(String students) { this.students = students; }
        
        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }
        
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        
        public String getMeetingLink() { return meetingLink; }
        public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }
        
        public String getTopic() { return topic; }
        public void setTopic(String topic) { this.topic = topic; }
        
        public List<String> getAttendees() { return attendees; }
        public void setAttendees(List<String> attendees) { this.attendees = attendees; }
    }
    
    @Data
    @NoArgsConstructor
    public static class Stats {
        private Integer studentsCount;
        private Integer quizzesCount;
        private Integer averageScore;
        private Integer sessionsThisWeek;
        private Integer materialsCount;
        private Double rating;
        private Integer completedSessions;
        private Integer pendingReviews;
        
        // Getters and setters
        public Integer getStudentsCount() { return studentsCount; }
        public void setStudentsCount(Integer studentsCount) { this.studentsCount = studentsCount; }
        
        public Integer getQuizzesCount() { return quizzesCount; }
        public void setQuizzesCount(Integer quizzesCount) { this.quizzesCount = quizzesCount; }
        
        public Integer getAverageScore() { return averageScore; }
        public void setAverageScore(Integer averageScore) { this.averageScore = averageScore; }
        
        public Integer getSessionsThisWeek() { return sessionsThisWeek; }
        public void setSessionsThisWeek(Integer sessionsThisWeek) { this.sessionsThisWeek = sessionsThisWeek; }
        
        public Integer getMaterialsCount() { return materialsCount; }
        public void setMaterialsCount(Integer materialsCount) { this.materialsCount = materialsCount; }
        
        public Double getRating() { return rating; }
        public void setRating(Double rating) { this.rating = rating; }
        
        public Integer getCompletedSessions() { return completedSessions; }
        public void setCompletedSessions(Integer completedSessions) { this.completedSessions = completedSessions; }
        
        public Integer getPendingReviews() { return pendingReviews; }
        public void setPendingReviews(Integer pendingReviews) { this.pendingReviews = pendingReviews; }
    }
    
    @Data
    @NoArgsConstructor
    public static class RecentActivity {
        private String date;
        private String type;
        private String subject;
        private String description;
        private String status;
        
        // Getters and setters
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
    
    // Getters and setters for main class
    public TutorInfo getTutor() { return tutor; }
    public void setTutor(TutorInfo tutor) { this.tutor = tutor; }
    
    public List<StudentInfo> getStudents() { return students; }
    public void setStudents(List<StudentInfo> students) { this.students = students; }
    
    public List<SessionInfo> getTodaySessions() { return todaySessions; }
    public void setTodaySessions(List<SessionInfo> todaySessions) { this.todaySessions = todaySessions; }
    
    public List<SessionInfo> getUpcomingSessions() { return upcomingSessions; }
    public void setUpcomingSessions(List<SessionInfo> upcomingSessions) { this.upcomingSessions = upcomingSessions; }
    
    public Stats getStats() { return stats; }
    public void setStats(Stats stats) { this.stats = stats; }
    
    public List<RecentActivity> getRecentActivities() { return recentActivities; }
    public void setRecentActivities(List<RecentActivity> recentActivities) { this.recentActivities = recentActivities; }
}