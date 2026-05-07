package com.grade12.backend.controller;

import com.grade12.backend.model.User;
import com.grade12.backend.repository.UserRepository;
import com.grade12.backend.repository.StudentSubjectRepository;
import com.grade12.backend.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private StudentSubjectRepository studentSubjectRepository;
    
    @Autowired
    private QuizRepository quizRepository;
    
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // GET all users (ONLY show active users, not soft-deleted)
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> allUsers = userRepository.findAll();
        // Filter out soft-deleted users (deleted = true) - using isDeleted()
        List<User> activeUsers = allUsers.stream()
                .filter(user -> !user.isDeleted())
                .collect(Collectors.toList());
        // Remove passwords from response for security
        activeUsers.forEach(user -> user.setPassword(null));
        System.out.println("📋 Retrieved " + activeUsers.size() + " active users");
        return ResponseEntity.ok(activeUsers);
    }

    // GET single user by ID
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent() && !user.get().isDeleted()) {
            user.get().setPassword(null);
            return ResponseEntity.ok(user.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "User not found"));
        }
    }

    // CREATE new user
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> userData) {
        try {
            String email = userData.get("email");
            
            // Check if user already exists and not deleted
            Optional<User> existingUser = userRepository.findByEmail(email);
            if (existingUser.isPresent() && !existingUser.get().isDeleted()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "User with this email already exists"));
            }
            
            // Create new user
            User user = new User();
            user.setFirstName(userData.get("firstName"));
            user.setLastName(userData.get("lastName"));
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(userData.get("password")));
            user.setCategory(userData.get("category"));
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            user.setDeleted(false);
            
            User savedUser = userRepository.save(user);
            savedUser.setPassword(null);
            
            System.out.println("✅ Created new user: " + email + " (ID: " + savedUser.getId() + ")");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create user: " + e.getMessage()));
        }
    }

    // UPDATE user
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, String> userData) {
        try {
            Optional<User> existingUser = userRepository.findById(id);
            if (!existingUser.isPresent() || existingUser.get().isDeleted()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
            }
            
            User user = existingUser.get();
            user.setFirstName(userData.get("firstName"));
            user.setLastName(userData.get("lastName"));
            user.setEmail(userData.get("email"));
            user.setCategory(userData.get("category"));
            user.setUpdatedAt(LocalDateTime.now());
            
            User updatedUser = userRepository.save(user);
            updatedUser.setPassword(null);
            
            System.out.println("✏️ Updated user: " + user.getEmail() + " (ID: " + id + ")");
            
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update user: " + e.getMessage()));
        }
    }

    // DELETE user - HARD DELETE (permanently remove from database)
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            System.out.println("🗑️ HARD DELETE requested for user ID: " + id);
            
            Optional<User> userOptional = userRepository.findById(id);
            if (!userOptional.isPresent()) {
                System.out.println("❌ User not found with ID: " + id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
            }
            
            User userToDelete = userOptional.get();
            String userCategory = userToDelete.getCategory();
            String userEmail = userToDelete.getEmail();
            
            System.out.println("📧 Deleting user: " + userEmail + " (Category: " + userCategory + ")");
            
            // Delete related records based on user type
            int relatedDeleted = 0;
            try {
                if ("student".equals(userCategory)) {
                    studentSubjectRepository.deleteByStudentId(id);
                    System.out.println("   ✅ Deleted student-subject relationships for student ID: " + id);
                    relatedDeleted++;
                }
                
                if ("tutor".equals(userCategory)) {
                    quizRepository.deleteByTutorId(id);
                    System.out.println("   ✅ Deleted quizzes for tutor ID: " + id);
                    relatedDeleted++;
                }
            } catch (Exception relatedError) {
                System.out.println("   ⚠️ Warning while deleting related records: " + relatedError.getMessage());
            }
            
            // HARD DELETE - Permanently remove user from database
            userRepository.deleteById(id);
            System.out.println("✅ HARD DELETE successful! User permanently removed from database: " + userEmail);
            
            // Verify deletion
            boolean stillExists = userRepository.findById(id).isPresent();
            if (!stillExists) {
                System.out.println("✅ Verification: User ID " + id + " no longer exists in database");
            }
            
            return ResponseEntity.ok(Map.of(
                "message", "User permanently deleted from database",
                "deletedUser", userEmail,
                "userId", id,
                "relatedDeleted", relatedDeleted
            ));
            
        } catch (Exception e) {
            System.err.println("❌ Error during hard delete: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete user: " + e.getMessage()));
        }
    }
}