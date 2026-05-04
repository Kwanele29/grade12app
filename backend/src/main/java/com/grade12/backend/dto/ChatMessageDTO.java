package com.grade12.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long tutorId;
    private String tutorName;
    private Long subjectId;
    private String subjectName;
    private String message;
    private String senderType;
    private boolean isRead;
    private LocalDateTime createdAt;
    private String formattedTime;
}