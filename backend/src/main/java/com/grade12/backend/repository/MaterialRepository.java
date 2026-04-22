package com.grade12.backend.repository;

import com.grade12.backend.model.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {
    
    @Query("SELECT m FROM Material m WHERE m.tutor.id = :tutorId")
    List<Material> findByTutorId(@Param("tutorId") Long tutorId);
    
    @Query("SELECT COUNT(m) FROM Material m WHERE m.tutor.id = :tutorId")
    Integer countByTutorId(@Param("tutorId") Long tutorId);
    
    @Query("SELECT m FROM Material m WHERE m.tutor.id = :tutorId AND m.subject.id = :subjectId")
    List<Material> findByTutorIdAndSubjectId(@Param("tutorId") Long tutorId, @Param("subjectId") Long subjectId);
    
    @Query("SELECT m FROM Material m WHERE m.tutor.id = :tutorId AND m.status = :status")
    List<Material> findByTutorIdAndStatus(@Param("tutorId") Long tutorId, @Param("status") String status);
    
    @Query(value = "SELECT * FROM materials m WHERE m.tutor_id = :tutorId ORDER BY m.uploaded_at DESC LIMIT 10", nativeQuery = true)
    List<Material> findTop10ByTutorIdOrderByUploadedAtDesc(@Param("tutorId") Long tutorId);
    
    @Query("SELECT m FROM Material m WHERE m.tutor.id = :tutorId AND LOWER(m.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Material> searchByTitle(@Param("tutorId") Long tutorId, @Param("keyword") String keyword);

 List<Material> findBySubjectId(Long subjectId);
}
