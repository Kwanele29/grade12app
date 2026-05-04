package com.grade12.backend.repository;

import com.grade12.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    
    // Count users by category
    long countByCategory(String category);
    
    // Count users registered after a given date
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :date")
    long countByCreatedAtAfter(@Param("date") LocalDateTime date);
    
    // Count users by category and creation date range
    @Query("SELECT COUNT(u) FROM User u WHERE u.category = :category AND u.createdAt BETWEEN :start AND :end")
    long countByCategoryAndCreatedAtBetween(@Param("category") String category,
                                            @Param("start") LocalDateTime start,
                                            @Param("end") LocalDateTime end);
}