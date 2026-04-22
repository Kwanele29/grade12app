package com.grade12.backend.controller;

import com.grade12.backend.dto.UserCreateRequest;
import com.grade12.backend.dto.UserUpdateRequest;
import com.grade12.backend.model.User;
import com.grade12.backend.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('admin')")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // Dashboard Statistics
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // Get Recent Activity
    @GetMapping("/recent-activity")
    public ResponseEntity<List<Map<String, Object>>> getRecentActivity() {
        return ResponseEntity.ok(adminService.getRecentActivity());
    }

    // ==================== USER MANAGEMENT ====================
    
    // Get all users with filtering
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(adminService.getAllUsers(category, search));
    }

    // Get user by ID
    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    // Create new user
    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody UserCreateRequest request) {
        return ResponseEntity.ok(adminService.createUser(request));
    }

    // Update user
    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(adminService.updateUser(id, request));
    }

    // Delete user
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    // Toggle user status (activate/deactivate)
    @PatchMapping("/users/{id}/status")
    public ResponseEntity<User> toggleUserStatus(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleUserStatus(id));
    }

    // Reset user password
    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<?> resetUserPassword(@PathVariable Long id) {
        adminService.resetUserPassword(id);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    // ==================== SYSTEM SETTINGS ====================
    
    // Get all settings
    @GetMapping("/settings")
    public ResponseEntity<Map<String, Object>> getSettings() {
        return ResponseEntity.ok(adminService.getSettings());
    }

    // Update general settings
    @PutMapping("/settings/general")
    public ResponseEntity<Map<String, Object>> updateGeneralSettings(@RequestBody Map<String, Object> settings) {
        return ResponseEntity.ok(adminService.updateGeneralSettings(settings));
    }

    // Update security settings
    @PutMapping("/settings/security")
    public ResponseEntity<Map<String, Object>> updateSecuritySettings(@RequestBody Map<String, Object> settings) {
        return ResponseEntity.ok(adminService.updateSecuritySettings(settings));
    }

    // Update notification settings
    @PutMapping("/settings/notifications")
    public ResponseEntity<Map<String, Object>> updateNotificationSettings(@RequestBody Map<String, Object> settings) {
        return ResponseEntity.ok(adminService.updateNotificationSettings(settings));
    }

    // Update system settings
    @PutMapping("/settings/system")
    public ResponseEntity<Map<String, Object>> updateSystemSettings(@RequestBody Map<String, Object> settings) {
        return ResponseEntity.ok(adminService.updateSystemSettings(settings));
    }
}