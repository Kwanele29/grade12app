package com.grade12.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.Map;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private Map<String, Object> user;
}