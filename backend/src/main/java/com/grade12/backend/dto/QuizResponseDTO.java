package com.grade12.backend.dto;

import java.util.List;

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

    public QuizResponseDTO() {}

    // Static builder factory method to replace @Builder
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final QuizResponseDTO dto = new QuizResponseDTO();

        public Builder id(Long id) { dto.id = id; return this; }
        public Builder title(String title) { dto.title = title; return this; }
        public Builder description(String description) { dto.description = description; return this; }
        public Builder subjectName(String subjectName) { dto.subjectName = subjectName; return this; }
        public Builder subjectIcon(String subjectIcon) { dto.subjectIcon = subjectIcon; return this; }
        public Builder subjectColor(String subjectColor) { dto.subjectColor = subjectColor; return this; }
        public Builder tutorName(String tutorName) { dto.tutorName = tutorName; return this; }
        public Builder totalQuestions(Integer totalQuestions) { dto.totalQuestions = totalQuestions; return this; }
        public Builder totalMarks(Integer totalMarks) { dto.totalMarks = totalMarks; return this; }
        public Builder timeLimitMinutes(Integer timeLimitMinutes) { dto.timeLimitMinutes = timeLimitMinutes; return this; }
        public Builder difficulty(String difficulty) { dto.difficulty = difficulty; return this; }
        public Builder questions(List<QuestionDTO> questions) { dto.questions = questions; return this; }
        public QuizResponseDTO build() { return dto; }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getSubjectIcon() { return subjectIcon; }
    public void setSubjectIcon(String subjectIcon) { this.subjectIcon = subjectIcon; }

    public String getSubjectColor() { return subjectColor; }
    public void setSubjectColor(String subjectColor) { this.subjectColor = subjectColor; }

    public String getTutorName() { return tutorName; }
    public void setTutorName(String tutorName) { this.tutorName = tutorName; }

    public Integer getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(Integer totalQuestions) { this.totalQuestions = totalQuestions; }

    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }

    public Integer getTimeLimitMinutes() { return timeLimitMinutes; }
    public void setTimeLimitMinutes(Integer timeLimitMinutes) { this.timeLimitMinutes = timeLimitMinutes; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public List<QuestionDTO> getQuestions() { return questions; }
    public void setQuestions(List<QuestionDTO> questions) { this.questions = questions; }

    // ===================== INNER CLASS: QuestionDTO =====================
    public static class QuestionDTO {
        private Long id;
        private String question;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private Integer marks;

        public QuestionDTO() {}

        public static QuestionBuilder builder() { return new QuestionBuilder(); }

        public static class QuestionBuilder {
            private final QuestionDTO dto = new QuestionDTO();

            public QuestionBuilder id(Long id) { dto.id = id; return this; }
            public QuestionBuilder question(String question) { dto.question = question; return this; }
            public QuestionBuilder optionA(String optionA) { dto.optionA = optionA; return this; }
            public QuestionBuilder optionB(String optionB) { dto.optionB = optionB; return this; }
            public QuestionBuilder optionC(String optionC) { dto.optionC = optionC; return this; }
            public QuestionBuilder optionD(String optionD) { dto.optionD = optionD; return this; }
            public QuestionBuilder marks(Integer marks) { dto.marks = marks; return this; }
            public QuestionDTO build() { return dto; }
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

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

        public Integer getMarks() { return marks; }
        public void setMarks(Integer marks) { this.marks = marks; }
    }
}