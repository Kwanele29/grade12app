package com.grade12.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateSessionRequest {

    private String title;
    private String topic;
    private String description;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime startTime;

    private Integer duration;
    private Long subjectId;
    private String sessionType;
    private Integer maxStudents;
    private String meetingProvider;
    
    // ✅ new field: tutor can provide their own meeting link
    private String customMeetingLink;
}