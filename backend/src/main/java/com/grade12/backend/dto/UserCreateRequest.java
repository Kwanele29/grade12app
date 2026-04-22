package com.grade12.backend.dto;

import lombok.Data;

@Data
public class UserCreateRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String category;
}