package com.grade12.backend.dto;

import lombok.Data;

@Data
public class StudentWithSubjectDTO {
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Long subjectId;
    private String subjectName;
    private String subjectIcon;
    private String subjectColor;
    private Integer progress;
    private String grade;
    private String lastActive;
}