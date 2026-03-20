package com.grade12.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
public class QuizQuestion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 1000)
    private String question;
    
    @Column(name = "option_a", nullable = false)
    private String optionA;
    
    @Column(name = "option_b", nullable = false)
    private String optionB;
    
    @Column(name = "option_c")
    private String optionC;
    
    @Column(name = "option_d")
    private String optionD;
    
    @Column(name = "correct_option")
    private Integer correctOption;
    
    private Integer marks;
    
    @ManyToOne
    @JoinColumn(name = "quiz_id")
    @JsonIgnore
    private Quiz quiz;  // Changed from TutorQuiz to Quiz
}