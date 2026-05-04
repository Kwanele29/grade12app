package com.grade12.backend.dto;

import java.util.Map;

public class QuizSubmissionDTO {

    private Long studentId;
    private Long quizId;
    private Map<Long, Integer> answers;

    public QuizSubmissionDTO() {}

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getQuizId() { return quizId; }
    public void setQuizId(Long quizId) { this.quizId = quizId; }

    public Map<Long, Integer> getAnswers() { return answers; }
    public void setAnswers(Map<Long, Integer> answers) { this.answers = answers; }
}