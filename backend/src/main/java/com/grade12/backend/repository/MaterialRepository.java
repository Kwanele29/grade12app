package com.grade12.backend.repository;

import com.grade12.backend.model.Material;
import com.grade12.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {
    
<<<<<<< HEAD
    List<Material> findByTutorId(Long tutorId);
    List<Material> findBySubjectId(Long subjectId);
    
    // ✅ Add this method to fix the TutorController error
    long countByTutorId(Long tutorId);
=======
    List<Material> findByTutor(User tutor);
    
    @Query("SELECT m FROM Material m WHERE m.tutor.id = :tutorId")
    List<Material> findByTutorId(@Param("tutorId") Long tutorId);
    
    @Query("SELECT m FROM Material m WHERE m.tutor.id = :tutorId ORDER BY m.uploadedAt DESC")
    List<Material> findByTutorIdOrderByUploadedAtDesc(@Param("tutorId") Long tutorId);
    
    List<Material> findBySubjectId(Long subjectId);
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
    
    // Other required methods (already discussed)
    long countByUploadedAtBetween(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT m FROM Material m WHERE m.tutor.id = :tutorId AND LOWER(m.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Material> searchByTitle(@Param("tutorId") Long tutorId, @Param("keyword") String keyword);
    
    List<Material> findTop10ByTutorIdOrderByUploadedAtDesc(Long tutorId);
    
    @Query("SELECT m FROM Material m WHERE m.subject.id IN :subjectIds")
    List<Material> findBySubjectIdIn(@Param("subjectIds") List<Long> subjectIds);
}