package com.grade12.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grade12.backend.model.Tutor;
import com.grade12.backend.model.User;
import com.grade12.backend.repository.TutorRepository;
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
    private final TutorRepository tutorRepository;  // ADD THIS
    private final ObjectMapper objectMapper;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = (String) oAuth2User.getAttributes().get("email");
        String name = (String) oAuth2User.getAttributes().get("name");
        String picture = (String) oAuth2User.getAttributes().get("picture");

        String[] nameParts = name != null ? name.split(" ", 2) : new String[]{"", ""};
        String firstName = nameParts[0];
        String lastName = nameParts.length > 1 ? nameParts[1] : "";

        User user = userRepository.findByEmail(email).orElse(null);
        boolean isNewUser = false;

        if (user == null) {
            // Determine role based on email domain
            String category = email.endsWith("@tutor.com") ? "tutor" : "student";
            user = new User();
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setPicture(picture);
            user.setAuthProvider("google");
            user.setEmailVerified(true);
            user.setCategory(category);
            user = userRepository.save(user);
            isNewUser = true;
            System.out.println("✅ New user created via Google OAuth2: " + email + " as " + category);
        } else {
            System.out.println("✅ Existing user logged in via Google: " + email);
        }

        // If user is a tutor and no Tutor record exists, create one
        if ("tutor".equals(user.getCategory())) {
            Tutor tutor = tutorRepository.findByUser(user).orElse(null);
            if (tutor == null) {
                tutor = new Tutor();
                tutor.setUser(user);
                tutorRepository.save(tutor);
                System.out.println("✅ Created Tutor record for user: " + email);
            }
        }

        String token = jwtService.generateToken(email);
        String refreshToken = jwtService.generateRefreshToken(email);

        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("firstName", user.getFirstName());
        userData.put("lastName", user.getLastName());
        userData.put("email", user.getEmail());
        userData.put("category", user.getCategory());
        userData.put("picture", user.getPicture() != null ? user.getPicture() : "");

        String userJson = objectMapper.writeValueAsString(userData);
        String encodedUserJson = URLEncoder.encode(userJson, StandardCharsets.UTF_8.toString());

        String redirectUrl = String.format("http://localhost:3000/login?token=%s&refreshToken=%s&user=%s",
                token, refreshToken, encodedUserJson);

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}