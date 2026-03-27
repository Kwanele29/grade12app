package com.grade12.backend.repository;

import com.grade12.backend.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    
    List<Quiz> findByTutorId(Long tutorId);
    
    @Query("SELECT COUNT(q) FROM Quiz q WHERE q.tutor.id = :tutorId")
    Integer countByTutorId(@Param("tutorId") Long tutorId);
    
    List<Quiz> findTop5ByTutorIdOrderByCreatedAtDesc(Long tutorId);
    
    @Query("SELECT q FROM Quiz q WHERE q.tutor.id = :tutorId AND q.status = :status")
    List<Quiz> findByTutorIdAndStatus(@Param("tutorId") Long tutorId, @Param("status") String status);
    
    @Query("SELECT AVG(q.averageScore) FROM Quiz q WHERE q.tutor.id = :tutorId")
    Double getAverageQuizScoreByTutorId(@Param("tutorId") Long tutorId);
    
    // Add this method to fetch quiz with questions
    @Query("SELECT DISTINCT q FROM Quiz q LEFT JOIN FETCH q.questions WHERE q.id = :quizId")
    Optional<Quiz> findByIdWithQuestions(@Param("quizId") Long quizId);
    
    // Fetch all quizzes with their questions
    @Query("SELECT DISTINCT q FROM Quiz q LEFT JOIN FETCH q.questions WHERE q.tutor.id = :tutorId")
    List<Quiz> findByTutorIdWithQuestions(@Param("tutorId") Long tutorId);
}