package com.grade12.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Question {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String question;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private Integer correctOption; // 0, 1, 2, 3
    private Integer marks;
    
    @ManyToOne
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;
}