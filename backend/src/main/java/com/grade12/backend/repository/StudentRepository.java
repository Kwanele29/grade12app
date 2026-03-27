package com.grade12.backend.repository;

import com.grade12.backend.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    
    Optional<Student> findByUserId(Long userId);
    
    @Query("SELECT s FROM Student s WHERE s.user.id = :userId")
    Optional<Student> findStudentByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(s) FROM Student s WHERE s.grade = :grade")
    Long countByGrade(@Param("grade") Integer grade);
}