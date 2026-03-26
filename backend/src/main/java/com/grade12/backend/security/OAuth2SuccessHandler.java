package com.grade12.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grade12.backend.model.User;
import com.grade12.backend.repository.UserRepository;
import com.grade12.backend.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = (String) oAuth2User.getAttributes().get("email");
        String name = (String) oAuth2User.getAttributes().get("name");
        String picture = (String) oAuth2User.getAttributes().get("picture");

        // Split name into first and last
        String[] nameParts = name != null ? name.split(" ", 2) : new String[]{"", ""};
        String firstName = nameParts[0];
        String lastName = nameParts.length > 1 ? nameParts[1] : "";

        // Check if user exists
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user == null) {
            // Create new user
            user = new User();
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setPicture(picture);
            user.setAuthProvider("google");
            user.setEmailVerified(true);
            user.setCategory("student"); // Default category
            user = userRepository.save(user);
            System.out.println("✅ New user created via Google OAuth2: " + email);
        } else {
            // Update existing user's Google info if needed
            if (user.getGoogleId() == null) {
                user.setPicture(picture);
                user.setAuthProvider("google");
                userRepository.save(user);
            }
            System.out.println("✅ Existing user logged in via Google: " + email);
        }

        // Generate JWT token
        String token = jwtService.generateToken(email);
        String refreshToken = jwtService.generateRefreshToken(email);

        // Create user data object
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("firstName", user.getFirstName());
        userData.put("lastName", user.getLastName());
        userData.put("email", user.getEmail());
        userData.put("category", user.getCategory());
        userData.put("picture", user.getPicture() != null ? user.getPicture() : "");

        // Convert to JSON string
        String userJson = objectMapper.writeValueAsString(userData);
        
        // URL encode the JSON string to safely pass in URL
        String encodedUserJson = URLEncoder.encode(userJson, StandardCharsets.UTF_8.toString());

        // Redirect to frontend with token and user data
        String redirectUrl = String.format("http://localhost:3000/login?token=%s&refreshToken=%s&user=%s",
                token, refreshToken, encodedUserJson);

        System.out.println("✅ OAuth2 login successful for: " + email);
        System.out.println("Redirect URL: " + redirectUrl);
        System.out.println("User JSON: " + userJson);

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}