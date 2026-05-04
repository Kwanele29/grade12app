package com.grade12.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UnreadCountDTO {
    private Long totalUnread;
    private List<SubjectUnreadDTO> subjects;
}