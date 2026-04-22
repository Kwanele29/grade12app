package com.grade12.backend.service;

import com.grade12.backend.dto.UserCreateRequest;
import com.grade12.backend.dto.UserUpdateRequest;
import com.grade12.backend.model.User;
import com.grade12.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Dashboard Statistics
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        List<User> allUsers = userRepository.findAll();
        
        long totalStudents = allUsers.stream()
                .filter(u -> "student".equals(u.getCategory()))
                .count();
        
        long totalTutors = allUsers.stream()
                .filter(u -> "tutor".equals(u.getCategory()))
                .count();
        
        long totalAdmins = allUsers.stream()
                .filter(u -> "admin".equals(u.getCategory()))
                .count();
        
        // Get new users today
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        long newUsersToday = allUsers.stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(today))
                .count();
        
        // Get pending approvals (since there's no active field, we can use emailVerified or createdAt)
        long pendingApprovals = allUsers.stream()
                .filter(u -> "tutor".equals(u.getCategory()) && !u.isEmailVerified())
                .count();
        
        stats.put("totalStudents", totalStudents);
        stats.put("totalTutors", totalTutors);
        stats.put("totalAdmins", totalAdmins);
        stats.put("activeSessions", 345);
        stats.put("newUsersToday", newUsersToday);
        stats.put("pendingApprovals", pendingApprovals);
        
        return stats;
    }

    // Get Recent Activity
    public List<Map<String, Object>> getRecentActivity() {
        List<Map<String, Object>> activities = new ArrayList<>();
        
        // Get recent user registrations
        List<User> recentUsers = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null)
                .sorted((u1, u2) -> u2.getCreatedAt().compareTo(u1.getCreatedAt()))
                .limit(10)
                .collect(Collectors.toList());
        
        for (User user : recentUsers) {
            Map<String, Object> activity = new HashMap<>();
            activity.put("time", user.getCreatedAt());
            activity.put("text", "New user registered: " + user.getFullName() + 
                         " (" + capitalize(user.getCategory()) + ")");
            activity.put("type", "user_registration");
            activities.add(activity);
        }
        
        return activities;
    }

    // ==================== USER MANAGEMENT ====================
    
    public List<User> getAllUsers(String category, String search) {
        List<User> users = userRepository.findAll();
        
        if (category != null && !category.isEmpty() && !category.equals("all")) {
            users = users.stream()
                    .filter(u -> u.getCategory() != null && u.getCategory().equals(category))
                    .collect(Collectors.toList());
        }
        
        if (search != null && !search.isEmpty()) {
            users = users.stream()
                    .filter(u -> (u.getFirstName() != null && u.getFirstName().toLowerCase().contains(search.toLowerCase())) ||
                                (u.getLastName() != null && u.getLastName().toLowerCase().contains(search.toLowerCase())) ||
                                (u.getEmail() != null && u.getEmail().toLowerCase().contains(search.toLowerCase())))
                    .collect(Collectors.toList());
        }
        
        return users;
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    @Transactional
    public User createUser(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setCategory(request.getCategory());
        user.setEmailVerified(false);
        user.setAuthProvider("local");
        user.setNotificationEnabled(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(Long id, UserUpdateRequest request) {
        User user = getUserById(id);
        
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getCategory() != null) user.setCategory(request.getCategory());
        
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }

    @Transactional
    public User toggleUserStatus(Long id) {
        User user = getUserById(id);
        // Toggle emailVerified as a proxy for active status
        user.setEmailVerified(!user.isEmailVerified());
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    @Transactional
    public void resetUserPassword(Long id) {
        User user = getUserById(id);
        String defaultPassword = "password123";
        user.setPassword(passwordEncoder.encode(defaultPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    // ==================== SYSTEM SETTINGS ====================
    
    private Map<String, Object> settings = new HashMap<>();
    
    public AdminService() {
        // Initialize default settings
        Map<String, Object> general = new HashMap<>();
        general.put("siteName", "Grade12Central");
        general.put("siteDescription", "Comprehensive learning platform for Grade 12 students");
        general.put("contactEmail", "admin@grade12central.com");
        general.put("timezone", "Africa/Johannesburg");
        general.put("dateFormat", "YYYY-MM-DD");
        
        Map<String, Object> security = new HashMap<>();
        security.put("twoFactorAuth", false);
        security.put("sessionTimeout", 30);
        security.put("passwordExpiry", 90);
        security.put("maxLoginAttempts", 5);
        
        Map<String, Object> notifications = new HashMap<>();
        notifications.put("emailNotifications", true);
        notifications.put("pushNotifications", false);
        notifications.put("dailyDigest", true);
        notifications.put("weeklyReport", true);
        
        Map<String, Object> system = new HashMap<>();
        system.put("maintenanceMode", false);
        system.put("debugMode", false);
        system.put("backupSchedule", "daily");
        system.put("logRetention", 30);
        
        settings.put("general", general);
        settings.put("security", security);
        settings.put("notifications", notifications);
        settings.put("system", system);
    }
    
    public Map<String, Object> getSettings() {
        return settings;
    }
    
    public Map<String, Object> updateGeneralSettings(Map<String, Object> newSettings) {
        Map<String, Object> general = (Map<String, Object>) settings.get("general");
        general.putAll(newSettings);
        settings.put("general", general);
        return settings;
    }
    
    public Map<String, Object> updateSecuritySettings(Map<String, Object> newSettings) {
        Map<String, Object> security = (Map<String, Object>) settings.get("security");
        security.putAll(newSettings);
        settings.put("security", security);
        return settings;
    }
    
    public Map<String, Object> updateNotificationSettings(Map<String, Object> newSettings) {
        Map<String, Object> notifications = (Map<String, Object>) settings.get("notifications");
        notifications.putAll(newSettings);
        settings.put("notifications", notifications);
        return settings;
    }
    
    public Map<String, Object> updateSystemSettings(Map<String, Object> newSettings) {
        Map<String, Object> system = (Map<String, Object>) settings.get("system");
        system.putAll(newSettings);
        settings.put("system", system);
        return settings;
    }
    
    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }
}