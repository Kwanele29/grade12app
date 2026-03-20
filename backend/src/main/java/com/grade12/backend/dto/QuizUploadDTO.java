package com.grade12.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class QuizUploadDTO {
    private String title;
    private String description;
    private Long subjectId;
    private Integer timeLimitMinutes;
    private String difficulty;
    private List<QuestionDTO> questions;
    
    @Data
    public static class QuestionDTO {
        private String question;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private Integer correctOption;
        private Integer marks;
    }
}