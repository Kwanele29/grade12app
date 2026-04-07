package com.grade12.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
public class QuizResultsDTO {
    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private Double score;
    private Double percentage;
    private Integer correctAnswers;
    private Integer totalQuestions;
    private Integer totalMarks;
    private Integer timeTaken;
    private Boolean passed;
    private String message;
    private LocalDateTime completedAt;
    private List<QuestionResultDTO> questionResults;
    
    @Data
    @NoArgsConstructor
    public static class QuestionResultDTO {
        private Long questionId;
        private String question;
        private String userAnswer;
        private String correctAnswer;
        private Boolean isCorrect;
        private Integer marksEarned;
        private Integer totalMarks;
        private String explanation;
        
        // Getters and setters
        public Long getQuestionId() {
            return questionId;
        }
        
        public void setQuestionId(Long questionId) {
            this.questionId = questionId;
        }
        
        public String getQuestion() {
            return question;
        }
        
        public void setQuestion(String question) {
            this.question = question;
        }
        
        public String getUserAnswer() {
            return userAnswer;
        }
        
        public void setUserAnswer(String userAnswer) {
            this.userAnswer = userAnswer;
        }
        
        public String getCorrectAnswer() {
            return correctAnswer;
        }
        
        public void setCorrectAnswer(String correctAnswer) {
            this.correctAnswer = correctAnswer;
        }
        
        public Boolean getIsCorrect() {
            return isCorrect;
        }
        
        public void setIsCorrect(Boolean isCorrect) {
            this.isCorrect = isCorrect;
        }
        
        public Integer getMarksEarned() {
            return marksEarned;
        }
        
        public void setMarksEarned(Integer marksEarned) {
            this.marksEarned = marksEarned;
        }
        
        public Integer getTotalMarks() {
            return totalMarks;
        }
        
        public void setTotalMarks(Integer totalMarks) {
            this.totalMarks = totalMarks;
        }
        
        public String getExplanation() {
            return explanation;
        }
        
        public void setExplanation(String explanation) {
            this.explanation = explanation;
        }
    }
    
    // Getters and setters for main class
    public Long getAttemptId() {
        return attemptId;
    }
    
    public void setAttemptId(Long attemptId) {
        this.attemptId = attemptId;
    }
    
    public Long getQuizId() {
        return quizId;
    }
    
    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }
    
    public String getQuizTitle() {
        return quizTitle;
    }
    
    public void setQuizTitle(String quizTitle) {
        this.quizTitle = quizTitle;
    }
    
    public Double getScore() {
        return score;
    }
    
    public void setScore(Double score) {
        this.score = score;
    }
    
    public Double getPercentage() {
        return percentage;
    }
    
    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }
    
    public Integer getCorrectAnswers() {
        return correctAnswers;
    }
    
    public void setCorrectAnswers(Integer correctAnswers) {
        this.correctAnswers = correctAnswers;
    }
    
    public Integer getTotalQuestions() {
        return totalQuestions;
    }
    
    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }
    
    public Integer getTotalMarks() {
        return totalMarks;
    }
    
    public void setTotalMarks(Integer totalMarks) {
        this.totalMarks = totalMarks;
    }
    
    public Integer getTimeTaken() {
        return timeTaken;
    }
    
    public void setTimeTaken(Integer timeTaken) {
        this.timeTaken = timeTaken;
    }
    
    public Boolean getPassed() {
        return passed;
    }
    
    public void setPassed(Boolean passed) {
        this.passed = passed;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
    
    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
    
    public List<QuestionResultDTO> getQuestionResults() {
        return questionResults;
    }
    
    public void setQuestionResults(List<QuestionResultDTO> questionResults) {
        this.questionResults = questionResults;
    }
}