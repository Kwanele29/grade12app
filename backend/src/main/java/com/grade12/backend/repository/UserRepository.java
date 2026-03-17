package com.grade12.backend.repository;

import com.grade12.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime; // ADD THIS IMPORT!
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Basic find methods
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    boolean existsByEmail(String email);
    
    // Category-based methods
    List<User> findByCategory(String category);
    Long countByCategory(String category);
    
    // Combined queries
    List<User> findByCategoryAndAuthProvider(String category, String authProvider);
    
    // Find users created after a certain date
    List<User> findByCreatedAtAfter(LocalDateTime date); // Now LocalDateTime is imported
    
    // Custom query using @Query
    @Query("SELECT u FROM User u WHERE u.category = :category AND u.emailVerified = true")
    List<User> findVerifiedUsersByCategory(@Param("category") String category);
    
    // Get statistics by category
    @Query("SELECT u.category, COUNT(u) FROM User u GROUP BY u.category")
    List<Object[]> getUserCountByCategory();
    
    // Search users by name or email
    @Query("SELECT u FROM User u WHERE LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<User> searchUsers(@Param("searchTerm") String searchTerm);
}