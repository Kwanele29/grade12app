package com.grade12.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
public class Question {
    
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
    private Integer correctOption; // 0=A, 1=B, 2=C, 3=D
    
    private Integer marks;
    
    @Column(length = 1000)
    private String explanation;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id")
    @JsonIgnore
    private Quiz quiz;
    
    // Convenience constructor
    public Question(String question, Integer correctOption, Integer marks) {
        this.question = question;
        this.correctOption = correctOption;
        this.marks = marks;
    }
}