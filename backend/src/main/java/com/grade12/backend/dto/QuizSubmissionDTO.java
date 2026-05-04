package com.grade12.backend.dto;

<<<<<<< HEAD
import java.util.Map;

public class QuizSubmissionDTO {
=======
import lombok.Data;
import java.util.Map;
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734

    private Long studentId;
    private Long quizId;
    private Map<Long, Integer> answers;
<<<<<<< HEAD

    public QuizSubmissionDTO() {}

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getQuizId() { return quizId; }
    public void setQuizId(Long quizId) { this.quizId = quizId; }

    public Map<Long, Integer> getAnswers() { return answers; }
    public void setAnswers(Map<Long, Integer> answers) { this.answers = answers; }
=======
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
}