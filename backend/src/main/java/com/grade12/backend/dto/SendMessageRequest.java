package com.grade12.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {
    private Long studentId;
    private Long tutorId;
    private Long subjectId;
    private String message;
    private String senderType; // "STUDENT" or "TUTOR"
}