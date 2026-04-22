package com.grade12.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "quizzes")
@Data
@NoArgsConstructor
public class Quiz {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    private String description;
    
    @Column(name = "total_questions")
    private Integer totalQuestions;
    
    @Column(name = "total_marks")
    private Integer totalMarks;
    
    @Column(name = "time_limit_minutes")
    private Integer timeLimitMinutes;
    
    private String difficulty;
    
    // NEW: status field (DRAFT, PUBLISHED, ARCHIVED)
    @Column(nullable = false)
    private String status = "DRAFT";
    
    // NEW: deadline date for quiz availability
    @Column(name = "deadline_date")
    private LocalDateTime deadlineDate;
    
    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;
    
    @ManyToOne
    @JoinColumn(name = "tutor_id")
    @JsonIgnore
    private User tutor;
    
    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Question> questions;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = "DRAFT";
    }
}