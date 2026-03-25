package com.grade12.backend.dto;

import lombok.Data;
import java.util.Map;

@Data
public class QuizSubmissionDTO {
    private Long studentId;
    private Long quizId;
    private Map<Long, Integer> answers;
}