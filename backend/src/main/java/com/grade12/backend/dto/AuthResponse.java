package com.grade12.backend.dto;  // Make sure this is correct

import com.grade12.backend.model.User;  // Change from com.example to com.grade12
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String refreshToken;
    private User user;  // This should now work
    private String message;
    
    public AuthResponse(String token, String refreshToken, User user) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.user = user;
        this.message = "Authentication successful";
    }
}