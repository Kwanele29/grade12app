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
    
    Optional<QuizAttempt> findByQuizIdAndStudentIdAndStatus(Long quizId, Long studentId, String status);
    
    List<QuizAttempt> findByQuizId(Long quizId);
    
    List<QuizAttempt> findByStudentId(Long studentId);
    
    @Query("SELECT qa FROM QuizAttempt qa WHERE qa.quiz.id = :quizId AND qa.status = :status ORDER BY qa.percentage DESC")
    List<QuizAttempt> findTop10ByQuizIdAndStatusOrderByPercentageDesc(@Param("quizId") Long quizId, @Param("status") String status);
    
    @Query("SELECT AVG(qa.percentage) FROM QuizAttempt qa WHERE qa.quiz.id = :quizId AND qa.status = 'COMPLETED'")
    Double getAveragePercentageByQuizId(@Param("quizId") Long quizId);
    
    @Query("SELECT COUNT(qa) FROM QuizAttempt qa WHERE qa.quiz.id = :quizId AND qa.status = 'COMPLETED'")
    Integer getCompletedAttemptsCount(@Param("quizId") Long quizId);
    
    boolean existsByQuizIdAndStudentIdAndStatus(Long quizId, Long studentId, String status);
}