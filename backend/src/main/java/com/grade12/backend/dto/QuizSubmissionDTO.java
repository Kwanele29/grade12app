package com.grade12.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@NoArgsConstructor
public class QuizSubmissionDTO {
    private Long quizId;
    private Long attemptId;
    private Map<Long, String> answers;
    private Integer timeTaken;
    
    // Getters and setters
    public Long getQuizId() {
        return quizId;
    }
    
    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }
    
    public Long getAttemptId() {
        return attemptId;
    }
    
    public void setAttemptId(Long attemptId) {
        this.attemptId = attemptId;
    }
    
    public Map<Long, String> getAnswers() {
        return answers;
    }
    
    public void setAnswers(Map<Long, String> answers) {
        this.answers = answers;
    }
    
    public Integer getTimeTaken() {
        return timeTaken;
    }
    
    public void setTimeTaken(Integer timeTaken) {
        this.timeTaken = timeTaken;
    }
}