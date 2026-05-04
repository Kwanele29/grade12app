package com.grade12.backend.dto;

import java.util.List;

public class QuizUploadDTO {

    private String title;
    private String description;
    private Long subjectId;
    private Integer timeLimitMinutes;
    private String difficulty;
    private List<QuestionDTO> questions;

    public QuizUploadDTO() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public Integer getTimeLimitMinutes() { return timeLimitMinutes; }
    public void setTimeLimitMinutes(Integer timeLimitMinutes) { this.timeLimitMinutes = timeLimitMinutes; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public List<QuestionDTO> getQuestions() { return questions; }
    public void setQuestions(List<QuestionDTO> questions) { this.questions = questions; }

    // ===================== INNER CLASS: QuestionDTO =====================
    public static class QuestionDTO {
        private String question;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private Integer correctOption;
        private Integer marks;

        public QuestionDTO() {}

        public String getQuestion() { return question; }
        public void setQuestion(String question) { this.question = question; }

        public String getOptionA() { return optionA; }
        public void setOptionA(String optionA) { this.optionA = optionA; }

        public String getOptionB() { return optionB; }
        public void setOptionB(String optionB) { this.optionB = optionB; }

        public String getOptionC() { return optionC; }
        public void setOptionC(String optionC) { this.optionC = optionC; }

        public String getOptionD() { return optionD; }
        public void setOptionD(String optionD) { this.optionD = optionD; }

        public Integer getCorrectOption() { return correctOption; }
        public void setCorrectOption(Integer correctOption) { this.correctOption = correctOption; }

        public Integer getMarks() { return marks; }
        public void setMarks(Integer marks) { this.marks = marks; }
    }
}