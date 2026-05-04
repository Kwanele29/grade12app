package com.grade12.backend.repository;

import com.grade12.backend.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    
    // Find by quiz ID and student ID and status
    Optional<QuizAttempt> findByQuizIdAndStudentIdAndStatus(Long quizId, Long studentId, String status);
    
    // Check if exists by quiz ID, student ID, and status
    boolean existsByQuizIdAndStudentIdAndStatus(Long quizId, Long studentId, String status);
    
    // Find by student ID
    List<QuizAttempt> findByStudentId(Long studentId);
    
    // Find by quiz ID
    List<QuizAttempt> findByQuizId(Long quizId);
    
    // Find top 10 by quiz ID and status ordered by percentage descending
    @Query("SELECT qa FROM QuizAttempt qa WHERE qa.quiz.id = :quizId AND qa.status = :status ORDER BY qa.percentage DESC")
    List<QuizAttempt> findTop10ByQuizIdAndStatusOrderByPercentageDesc(@Param("quizId") Long quizId, @Param("status") String status);
    
    // Get average percentage by quiz ID
    @Query("SELECT AVG(qa.percentage) FROM QuizAttempt qa WHERE qa.quiz.id = :quizId AND qa.status = 'COMPLETED'")
    Double getAveragePercentageByQuizId(@Param("quizId") Long quizId);
    
    // Get completed attempts count by quiz ID
    @Query("SELECT COUNT(qa) FROM QuizAttempt qa WHERE qa.quiz.id = :quizId AND qa.status = 'COMPLETED'")
    Integer getCompletedAttemptsCount(@Param("quizId") Long quizId);
    
    // Find by student and quiz
    Optional<QuizAttempt> findByStudentIdAndQuizId(Long studentId, Long quizId);
    
    // Find all attempts for a student with a specific status
    List<QuizAttempt> findByStudentIdAndStatus(Long studentId, String status);
    
    // Find all attempts for a quiz with a specific status
    List<QuizAttempt> findByQuizIdAndStatus(Long quizId, String status);
    
    // Count attempts by student and quiz
    long countByStudentIdAndQuizId(Long studentId, Long quizId);
    
    // Find the most recent attempt for a student on a quiz
    Optional<QuizAttempt> findTopByStudentIdAndQuizIdOrderByStartedAtDesc(Long studentId, Long quizId);
    
    // Count total attempts for a quiz (all statuses)
    @Query("SELECT COUNT(qa) FROM QuizAttempt qa WHERE qa.quiz.id = :quizId")
    long countByQuizId(@Param("quizId") Long quizId);
    
    // Get average percentage by subject ID (for subject-scores report)
    @Query("SELECT AVG(qa.percentage) FROM QuizAttempt qa WHERE qa.quiz.subject.id = :subjectId AND qa.status = 'COMPLETED'")
    Double getAveragePercentageBySubjectId(@Param("subjectId") Long subjectId);
}