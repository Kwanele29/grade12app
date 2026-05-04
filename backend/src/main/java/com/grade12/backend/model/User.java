package com.grade12.backend.model;

import jakarta.persistence.*;
<<<<<<< HEAD
import lombok.Data;
=======
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
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
    
    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = false)
<<<<<<< HEAD
    @JsonIgnore
    private String password;
    
    @Column(name = "first_name")
    private String firstName;
    
    @Column(name = "last_name")
    private String lastName;
    
    private String category; // "tutor" or "student"
    
    // OAuth2 fields
=======
    private String lastName;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    private String password;
    
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
    @Column(name = "google_id")
    private String googleId;
    
    private String picture;
    
    @Column(name = "auth_provider")
    private String authProvider; // "google" or "local"
    
    @Column(name = "email_verified")
    private Boolean emailVerified = false;
    
<<<<<<< HEAD
    // Password reset fields
=======
    @Column(name = "status")
    private String status = "active";
    
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
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
<<<<<<< HEAD
        
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
=======
        lastNotificationCheck = LocalDateTime.now();
        if (notificationEnabled == null) {
            notificationEnabled = true;
        }
        if (status == null) {
            status = "active";
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
<<<<<<< HEAD
    // Helper methods
=======
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getGoogleId() { return googleId; }
    public void setGoogleId(String googleId) { this.googleId = googleId; }
    
    public String getPicture() { return picture; }
    public void setPicture(String picture) { this.picture = picture; }
    
    public String getAuthProvider() { return authProvider; }
    public void setAuthProvider(String authProvider) { this.authProvider = authProvider; }
    
    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getResetToken() { return resetToken; }
    public void setResetToken(String resetToken) { this.resetToken = resetToken; }
    
    public LocalDateTime getResetTokenExpiry() { return resetTokenExpiry; }
    public void setResetTokenExpiry(LocalDateTime resetTokenExpiry) { this.resetTokenExpiry = resetTokenExpiry; }
    
    public LocalDateTime getLastNotificationCheck() { return lastNotificationCheck; }
    public void setLastNotificationCheck(LocalDateTime lastNotificationCheck) { this.lastNotificationCheck = lastNotificationCheck; }
    
    public Boolean getNotificationEnabled() { return notificationEnabled; }
    public void setNotificationEnabled(Boolean notificationEnabled) { this.notificationEnabled = notificationEnabled; }
    
    public List<Quiz> getQuizzes() { return quizzes; }
    public void setQuizzes(List<Quiz> quizzes) { this.quizzes = quizzes; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
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