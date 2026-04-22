package com.grade12.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    @JsonIgnore
    private String password;
    
    @Column(name = "first_name")
    private String firstName;
    
    @Column(name = "last_name")
    private String lastName;
    
    private String category; // "tutor" or "student"
    
    // OAuth2 fields
    @Column(name = "google_id")
    private String googleId;
    
    private String picture;
    
    @Column(name = "auth_provider")
    private String authProvider; // "google" or "local"
    
    @Column(name = "email_verified")
    private Boolean emailVerified = false;
    
    // Password reset fields
    @Column(name = "reset_token")
    @JsonIgnore
    private String resetToken;
    
    @Column(name = "reset_token_expiry")
    private LocalDateTime resetTokenExpiry;
    
    // Notification settings
    @Column(name = "last_notification_check")
    private LocalDateTime lastNotificationCheck;
    
    @Column(name = "notification_enabled")
    private Boolean notificationEnabled = true;
    
    // Relationships
    @OneToMany(mappedBy = "tutor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Quiz> quizzes;
    
    // REMOVE THIS DIRECT MAPPING - it's causing the error
    // @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // @JsonIgnore
    // private List<QuizAttempt> quizAttempts;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Student studentProfile;
    
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<StudentSubject> enrolledSubjects;
    
    // Timestamps
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        
        if (emailVerified == null) {
            emailVerified = false;
        }
        if (authProvider == null) {
            authProvider = "local";
        }
        if (notificationEnabled == null) {
            notificationEnabled = true;
        }
        if (lastNotificationCheck == null) {
            lastNotificationCheck = LocalDateTime.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Helper methods
    public String getFullName() {
        return (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "");
    }
    
    public boolean isNotificationEnabled() {
        return notificationEnabled != null && notificationEnabled;
    }
    
    public boolean isEmailVerified() {
        return emailVerified != null && emailVerified;
    }
    
    public boolean isTutor() {
        return "tutor".equalsIgnoreCase(category);
    }
    
    public boolean isStudent() {
        return "student".equalsIgnoreCase(category);
    }
    
    public boolean isOAuth2User() {
        return "google".equalsIgnoreCase(authProvider);
    }
    
    public boolean hasValidResetToken() {
        return resetToken != null && 
               resetTokenExpiry != null && 
               resetTokenExpiry.isAfter(LocalDateTime.now());
    }
    
    public void clearResetToken() {
        this.resetToken = null;
        this.resetTokenExpiry = null;
    }
    
    public void updateLastNotificationCheck() {
        this.lastNotificationCheck = LocalDateTime.now();
    }
    
    // Helper method to get quiz attempts through student profile
    public List<QuizAttempt> getQuizAttempts() {
        if (studentProfile != null) {
            return studentProfile.getQuizAttempts();
        }
        return null;
    }
}