package com.grade12.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SessionResponseDTO {
    private Long id;
    private String sessionId;
    private String title;
    private String topic;
    private String description;
    private Long tutorId;
    private String tutorName;
    private Long subjectId;
    private String subjectName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer duration;
    private String sessionType;
    private Integer maxStudents;
    private Integer currentStudents;
    private String meetingLink;
    private String meetingProvider;
    private String status;
    private String formattedDate;
    private String formattedTime;
}