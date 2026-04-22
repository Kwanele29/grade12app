package com.grade12.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class UnreadCountDTO {
    private Long totalUnread;
    private List<SubjectUnreadDTO> subjects;
}