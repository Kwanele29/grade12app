package com.grade12.backend.repository;

import com.grade12.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    
    // Get all non-deleted users
    List<User> findByDeletedFalse();
    
    // Get users by category that are not deleted
    List<User> findByCategoryAndDeletedFalse(String category);
}