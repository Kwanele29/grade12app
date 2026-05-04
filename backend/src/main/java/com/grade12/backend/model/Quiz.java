package com.grade12.backend.model;

import jakarta.persistence.*;
<<<<<<< HEAD
=======
import lombok.Data;
import lombok.NoArgsConstructor;
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "quizzes")
<<<<<<< HEAD
=======
@Data
@NoArgsConstructor
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;
<<<<<<< HEAD

    private String description;

=======
    
    private String description;
    
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
    @Column(name = "total_questions")
    private Integer totalQuestions;

    @Column(name = "total_marks")
    private Integer totalMarks;

    @Column(name = "time_limit_minutes")
    private Integer timeLimitMinutes;

    private String difficulty;
<<<<<<< HEAD

    @Column(nullable = false)
    private String status = "DRAFT";

    @Column(name = "deadline_date")
    private LocalDateTime deadlineDate;

    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;

=======
    
    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;
    
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
    @ManyToOne
    @JoinColumn(name = "tutor_id")
    @JsonIgnore
    private User tutor;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Question> questions;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
<<<<<<< HEAD

    public Quiz() {}

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = "DRAFT";
=======
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(Integer totalQuestions) { this.totalQuestions = totalQuestions; }

    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }

    public Integer getTimeLimitMinutes() { return timeLimitMinutes; }
    public void setTimeLimitMinutes(Integer timeLimitMinutes) { this.timeLimitMinutes = timeLimitMinutes; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getDeadlineDate() { return deadlineDate; }
    public void setDeadlineDate(LocalDateTime deadlineDate) { this.deadlineDate = deadlineDate; }

    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }

    public User getTutor() { return tutor; }
    public void setTutor(User tutor) { this.tutor = tutor; }

    public List<Question> getQuestions() { return questions; }
    public void setQuestions(List<Question> questions) { this.questions = questions; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}