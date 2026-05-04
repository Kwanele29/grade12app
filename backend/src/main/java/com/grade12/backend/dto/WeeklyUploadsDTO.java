package com.grade12.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyUploadsDTO {
    private String week;
    private Long materials;
    private Long quizzes;
}