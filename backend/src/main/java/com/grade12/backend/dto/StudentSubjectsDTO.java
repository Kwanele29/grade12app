package com.grade12.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class StudentSubjectsDTO {
    private Long studentId;
    private List<Long> subjectIds;
}