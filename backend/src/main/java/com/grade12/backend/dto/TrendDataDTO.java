package com.grade12.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrendDataDTO {
    private List<Long> students;
    private List<Long> tutors;
}