package com.grade12.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PopularContentDTO {
    private Long id;
    private String title;
    private String type; // "quiz" or "material"
    private Long views;
}