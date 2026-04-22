package com.grade12.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "subjects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Subject {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String name;
    
    private String code;
    
    @Column(length = 2000)
    private String description;
    
    @Column(name = "icon_url")
    private String iconUrl;
    
    private String color;
    
    @Column(name = "bg_color")
    private String bgColor;
    
    @Column(name = "tutor_id")
    private Long tutorId;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("subject")
    private List<Material> materials = new ArrayList<>();
    
    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("subject")
    private List<Quiz> quizzes = new ArrayList<>();
    
    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("subject")
    private List<StudentSubject> studentSubjects = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        
        // Set default color if not provided
        if (color == null) {
            color = "#3b82f6";
        }
        
        // Set default icon if not provided
        if (iconUrl == null) {
            iconUrl = "📚";
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Helper methods
    public void addMaterial(Material material) {
        materials.add(material);
        material.setSubject(this);
    }
    
    public void removeMaterial(Material material) {
        materials.remove(material);
        material.setSubject(null);
    }
    
    public void addQuiz(Quiz quiz) {
        quizzes.add(quiz);
        quiz.setSubject(this);
    }
    
    public void removeQuiz(Quiz quiz) {
        quizzes.remove(quiz);
        quiz.setSubject(null);
    }
    
    public int getTotalQuizzes() {
        return quizzes != null ? quizzes.size() : 0;
    }
    
    public int getTotalMaterials() {
        return materials != null ? materials.size() : 0;
    }
    
    public int getTotalStudents() {
        return studentSubjects != null ? studentSubjects.size() : 0;
    }
}