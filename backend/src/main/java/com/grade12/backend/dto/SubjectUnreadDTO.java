package com.grade12.backend.dto;

import lombok.Data;

@Data
public class SubjectUnreadDTO {
    private Long subjectId;
    private String subjectName;
    private String subjectIcon;
    private String subjectColor;
    private Long unreadCount;
    private ChatMessageDTO lastMessage;
}