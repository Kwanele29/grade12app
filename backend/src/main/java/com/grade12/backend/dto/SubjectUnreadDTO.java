package com.grade12.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubjectUnreadDTO {
    private Long subjectId;
    private String subjectName;
    private String subjectIcon;
    private String subjectColor;
    private Long unreadCount;
    private ChatMessageDTO lastMessage;
}