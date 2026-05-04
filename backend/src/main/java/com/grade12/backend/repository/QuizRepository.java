package com.grade12.backend.repository;

import com.grade12.backend.model.Quiz;
import com.grade12.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    
    // Existing methods
    List<Quiz> findByTutor(User tutor);
    List<Quiz> findBySubjectId(Long subjectId);
    long countByTutor(User tutor);
    List<Quiz> findTop5ByTutorOrderByCreatedAtDesc(User tutor);
    
    // Count quizzes created between two dates (for weekly uploads)
    @Query("SELECT COUNT(q) FROM Quiz q WHERE q.createdAt BETWEEN :start AND :end")
    long countByCreatedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    /**
     * Fetch a single quiz by ID including its questions.
     * This uses JOIN FETCH to eagerly load the questions collection
     * and avoid LazyInitializationException.
     */
    @Query("SELECT q FROM Quiz q LEFT JOIN FETCH q.questions WHERE q.id = :id")
    Optional<Quiz> findByIdWithQuestions(@Param("id") Long id);
}