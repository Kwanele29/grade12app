package com.grade12.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubjectStatDTO {
    private String name;
    private Long count;      // for distribution
    private Integer percentage; // optional
    private Double score;    // for academic tab
    private Long totalStudents; // optional
}