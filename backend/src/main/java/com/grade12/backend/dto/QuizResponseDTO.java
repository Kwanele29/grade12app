package com.grade12.backend.dto;

import lombok.Data;
import lombok.Builder;
import java.util.List;

@Data
@Builder
public class QuizResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String subjectName;
    private String subjectIcon;
    private String subjectColor;
    private String tutorName;
    private Integer totalQuestions;
    private Integer totalMarks;
    private Integer timeLimitMinutes;
    private String difficulty;
    private List<QuestionDTO> questions;
    
    @Data
    @Builder
    public static class QuestionDTO {
        private Long id;
        private String question;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private Integer marks;
    }
}