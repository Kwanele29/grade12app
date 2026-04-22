package com.grade12.backend.repository;

import com.grade12.backend.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    
    List<Subject> findByTutorId(Long tutorId);
    
    List<Subject> findByNameContainingIgnoreCase(String name);
    
    @Query("SELECT DISTINCT s FROM Subject s JOIN s.studentSubjects ss WHERE ss.student.id = :studentId")
    List<Subject> findByStudentId(@Param("studentId") Long studentId);
    
    Optional<Subject> findByName(String name);
    
    long countByTutorId(Long tutorId);
    
    @Query("SELECT s FROM Subject s WHERE s.tutorId IS NULL OR s.tutorId = 0")
    List<Subject> findUnassignedSubjects();
    
    @Query("SELECT s, SIZE(s.quizzes) FROM Subject s WHERE s.tutorId = :tutorId")
    List<Object[]> findSubjectsWithQuizCountByTutorId(@Param("tutorId") Long tutorId);
    
    @Query("SELECT DISTINCT s FROM Subject s WHERE SIZE(s.quizzes) > 0")
    List<Subject> findSubjectsWithQuizzes();
    
    // Now this query works because Quiz has 'status' and 'deadlineDate'
    @Query("SELECT DISTINCT s FROM Subject s JOIN s.quizzes q WHERE q.status = 'PUBLISHED' AND (q.deadlineDate IS NULL OR q.deadlineDate >= CURRENT_TIMESTAMP)")
    List<Subject> findSubjectsWithAvailableQuizzes();
    
    @Query("SELECT s FROM Subject s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Subject> searchByKeyword(@Param("keyword") String keyword);
    
    @Query("SELECT s, SIZE(s.studentSubjects) FROM Subject s WHERE s.tutorId = :tutorId")
    List<Object[]> findSubjectsWithStudentCountByTutorId(@Param("tutorId") Long tutorId);
    
    @Query("SELECT s FROM Subject s ORDER BY SIZE(s.studentSubjects) DESC")
    List<Subject> findPopularSubjects();
    
    boolean existsByNameIgnoreCase(String name);
}