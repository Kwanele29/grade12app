package com.grade12.backend.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizResultDTO {
    private String studentName;
    private String quizTitle;
    private String subjectName;
    private Integer obtainedMarks;
    private Integer totalMarks;
    private Integer percentage;
    private String completedAt;
}