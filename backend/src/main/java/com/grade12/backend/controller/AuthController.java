package com.grade12.backend.controller;

import com.grade12.backend.dto.AuthResponse;
import com.grade12.backend.dto.LoginRequest;
import com.grade12.backend.dto.RegisterRequest;
import com.grade12.backend.model.User;
import com.grade12.backend.repository.UserRepository;
import com.grade12.backend.service.JwtService;
import com.grade12.backend.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            // Check if email already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().body(new AuthResponse(null, null, null, "Email already registered"));
            }

            // Create new user
            User user = new User();
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setAuthProvider("local");
            user.setEmailVerified(true);
            
            // Set the category (this is the important part!)
            if (request.getCategory() != null && !request.getCategory().isEmpty()) {
                user.setCategory(request.getCategory());
            } else {
                user.setCategory("student"); // Default category if none provided
            }

            // Save user to database
            userRepository.save(user);
            
            System.out.println("✅ User registered successfully: " + user.getEmail());
            System.out.println("   Category: " + user.getCategory());
            System.out.println("   Name: " + user.getFirstName() + " " + user.getLastName());

            // Generate tokens
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            String token = jwtService.generateToken(userDetails);
            String refreshToken = jwtService.generateRefreshToken(userDetails);

            return ResponseEntity.ok(new AuthResponse(token, refreshToken, user));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new AuthResponse(null, null, null, "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // Authenticate user
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            // Get user details
            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Generate tokens
            String token = jwtService.generateToken(userDetails);
            String refreshToken = jwtService.generateRefreshToken(userDetails);

            System.out.println("✅ User logged in successfully: " + user.getEmail());
            System.out.println("   Category: " + user.getCategory());

            return ResponseEntity.ok(new AuthResponse(token, refreshToken, user));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new AuthResponse(null, null, null, "Invalid email or password"));
        }
    }

    @GetMapping("/oauth2/success")
    public ResponseEntity<?> oauth2Success(@RequestParam String email) {
        try {
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            
            String token = jwtService.generateToken(userDetails);
            String refreshToken = jwtService.generateRefreshToken(userDetails);
            
            System.out.println("✅ OAuth2 login successful: " + user.getEmail());
            System.out.println("   Category: " + user.getCategory());
            
            return ResponseEntity.ok(new AuthResponse(token, refreshToken, user));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new AuthResponse(null, null, null, "OAuth2 authentication failed"));
        }
    }
    
    // Optional: Get user by ID
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
    
    // Optional: Get all users by category
    @GetMapping("/users/category/{category}")
    public ResponseEntity<?> getUsersByCategory(@PathVariable String category) {
        try {
            // You'll need to add this method to your UserRepository
            // List<User> users = userRepository.findByCategory(category);
            // return ResponseEntity.ok(users);
            return ResponseEntity.ok("Endpoint ready - add repository method");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get users");
        }
    }
}