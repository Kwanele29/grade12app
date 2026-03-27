package com.grade12.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_tutor")
public class StudentTutor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
    
    @ManyToOne
    @JoinColumn(name = "tutor_id", nullable = false)
    private Tutor tutor;
    
    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;
    
    private Double progress = 0.0;
    private Integer totalSessions = 0;
    private Integer completedQuizzes = 0;
    private Double averageScore = 0.0;
    private LocalDateTime lastActive;
    private LocalDateTime joinedDate;
    
    @Column(columnDefinition = "json")
    private String strengths;
    
    @Column(columnDefinition = "json")
    private String weaknesses;
    
    @Column(columnDefinition = "json")
    private String recentActivity;
    
    private String status = "ACTIVE";
    
    // Constructors
    public StudentTutor() {}
    
    public StudentTutor(Student student, Tutor tutor) {
        this.student = student;
        this.tutor = tutor;
        this.joinedDate = LocalDateTime.now();
        this.lastActive = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Student getStudent() {
        return student;
    }
    
    public void setStudent(Student student) {
        this.student = student;
    }
    
    public Tutor getTutor() {
        return tutor;
    }
    
    public void setTutor(Tutor tutor) {
        this.tutor = tutor;
    }
    
    public Subject getSubject() {
        return subject;
    }
    
    public void setSubject(Subject subject) {
        this.subject = subject;
    }
    
    public Double getProgress() {
        return progress;
    }
    
    public void setProgress(Double progress) {
        this.progress = progress;
    }
    
    public Integer getTotalSessions() {
        return totalSessions;
    }
    
    public void setTotalSessions(Integer totalSessions) {
        this.totalSessions = totalSessions;
    }
    
    public Integer getCompletedQuizzes() {
        return completedQuizzes;
    }
    
    public void setCompletedQuizzes(Integer completedQuizzes) {
        this.completedQuizzes = completedQuizzes;
    }
    
    public Double getAverageScore() {
        return averageScore;
    }
    
    public void setAverageScore(Double averageScore) {
        this.averageScore = averageScore;
    }
    
    public LocalDateTime getLastActive() {
        return lastActive;
    }
    
    public void setLastActive(LocalDateTime lastActive) {
        this.lastActive = lastActive;
    }
    
    public LocalDateTime getJoinedDate() {
        return joinedDate;
    }
    
    public void setJoinedDate(LocalDateTime joinedDate) {
        this.joinedDate = joinedDate;
    }
    
    public String getStrengths() {
        return strengths;
    }
    
    public void setStrengths(String strengths) {
        this.strengths = strengths;
    }
    
    public String getWeaknesses() {
        return weaknesses;
    }
    
    public void setWeaknesses(String weaknesses) {
        this.weaknesses = weaknesses;
    }
    
    public String getRecentActivity() {
        return recentActivity;
    }
    
    public void setRecentActivity(String recentActivity) {
        this.recentActivity = recentActivity;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
}