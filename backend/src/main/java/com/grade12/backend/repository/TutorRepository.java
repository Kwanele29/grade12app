package com.grade12.backend.repository;

import com.grade12.backend.model.Tutor;
import com.grade12.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TutorRepository extends JpaRepository<Tutor, Long> {
    
    // Find tutor by user email
    @Query("SELECT t FROM Tutor t WHERE t.user.email = :email")
    Optional<Tutor> findByEmail(@Param("email") String email);
    
    // Find tutor by user ID
    @Query("SELECT t FROM Tutor t WHERE t.user.id = :userId")
    Optional<Tutor> findByUserId(@Param("userId") Long userId);
    
    // Find by user object
    Optional<Tutor> findByUser(User user);
}