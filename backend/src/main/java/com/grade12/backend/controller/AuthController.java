package com.grade12.backend.controller;

import com.grade12.backend.dto.AuthResponse;
import com.grade12.backend.dto.LoginRequest;
import com.grade12.backend.dto.RegisterRequest;
import com.grade12.backend.model.User;
import com.grade12.backend.repository.UserRepository;
import com.grade12.backend.service.JwtService;
import com.grade12.backend.service.CustomUserDetailsService;
import com.grade12.backend.service.EmailVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationService emailVerificationService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "Email already registered",
                    "requiresVerification", false
                ));
            }

            User user = new User();
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setAuthProvider("local");
            user.setEmailVerified(false);
            
            if (request.getCategory() != null && !request.getCategory().isEmpty()) {
                user.setCategory(request.getCategory());
            } else {
                user.setCategory("student");
            }

            userRepository.save(user);
            
            System.out.println("✅ User registered successfully: " + user.getEmail());
            System.out.println("   Category: " + user.getCategory());

            emailVerificationService.sendVerificationEmail(user);

            return ResponseEntity.ok(Map.of(
                "message", "Registration successful! Please check your email to verify your account.",
                "email", user.getEmail(),
                "requiresVerification", true
            ));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Registration failed: " + e.getMessage(),
                "requiresVerification", false
            ));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

            if (!user.isEmailVerified()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "Please verify your email before logging in.",
                    "requiresVerification", true,
                    "email", user.getEmail()
                ));
            }

            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
            String token = jwtService.generateToken(userDetails);

            System.out.println("✅ User logged in successfully: " + user.getEmail());

            return ResponseEntity.ok(new AuthResponse(token, null, user));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Invalid email or password",
                "requiresVerification", false
            ));
        }
    }

    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        try {
            boolean verified = emailVerificationService.verifyEmail(token);
            
            if (verified) {
                String redirectUrl = "http://localhost:3000/login?verified=true";
                return ResponseEntity.status(HttpStatus.FOUND)
                        .header("Location", redirectUrl)
                        .build();
            } else {
                String redirectUrl = "http://localhost:3000/login?verified=false&error=Invalid or expired verification link";
                return ResponseEntity.status(HttpStatus.FOUND)
                        .header("Location", redirectUrl)
                        .build();
            }
        } catch (Exception e) {
            String redirectUrl = "http://localhost:3000/login?verified=false&error=" + e.getMessage();
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", redirectUrl)
                    .build();
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            emailVerificationService.resendVerificationEmail(email);
            return ResponseEntity.ok(Map.of(
                "message", "Verification email sent successfully."
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }

    @GetMapping("/oauth2/success")
    public ResponseEntity<?> oauth2Success(@RequestParam String email) {
        try {
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
            if (!user.isEmailVerified()) {
                user.setEmailVerified(true);
                userRepository.save(user);
            }
            
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            String token = jwtService.generateToken(userDetails);
            
            System.out.println("✅ OAuth2 login successful: " + user.getEmail());
            
            return ResponseEntity.ok(new AuthResponse(token, null, user));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new AuthResponse("OAuth2 authentication failed"));
        }
    }
    
    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("User not found");
        }
    }
}