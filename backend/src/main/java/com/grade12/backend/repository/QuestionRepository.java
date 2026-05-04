package com.grade12.backend.repository;

<<<<<<< HEAD
import com.grade12.backend.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
=======
import com.grade12.backend.model.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
<<<<<<< HEAD
public interface QuestionRepository extends JpaRepository<Question, Long> {
    
    /**
     * Find all questions for a specific quiz
     */
    List<Question> findByQuizId(Long quizId);
    
    /**
     * Find all questions for a specific quiz, ordered by ID
     */
    @Query("SELECT q FROM Question q WHERE q.quiz.id = :quizId ORDER BY q.id ASC")
    List<Question> findQuestionsByQuizIdOrdered(@Param("quizId") Long quizId);
    
    /**
     * Count total questions in a quiz
     */
    @Query("SELECT COUNT(q) FROM Question q WHERE q.quiz.id = :quizId")
    Integer countByQuizId(@Param("quizId") Long quizId);
    
    /**
     * Get total marks for all questions in a quiz
     */
    @Query("SELECT COALESCE(SUM(q.marks), 0) FROM Question q WHERE q.quiz.id = :quizId")
    Integer getTotalMarksByQuizId(@Param("quizId") Long quizId);
    
    /**
     * Find a specific question by quiz ID and question order
     */
    @Query("SELECT q FROM Question q WHERE q.quiz.id = :quizId ORDER BY q.id ASC")
    List<Question> findByQuizIdOrderByQuestionNumber(@Param("quizId") Long quizId);
    
    /**
     * Delete all questions for a specific quiz
     */
    @Query("DELETE FROM Question q WHERE q.quiz.id = :quizId")
    void deleteByQuizId(@Param("quizId") Long quizId);
    
    /**
     * Find question by quiz ID and question ID
     */
    Optional<Question> findByQuizIdAndId(Long quizId, Long questionId);
    
    /**
     * Check if a quiz has any questions
     */
    boolean existsByQuizId(Long quizId);
    
    /**
     * Get all questions for a quiz with their answers
     */
    @Query("SELECT q FROM Question q LEFT JOIN FETCH q.quiz WHERE q.quiz.id = :quizId")
    List<Question> findQuestionsWithQuizByQuizId(@Param("quizId") Long quizId);
=======
public interface QuestionRepository extends JpaRepository<QuizQuestion, Long> {
    List<QuizQuestion> findByQuizId(Long quizId);
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
}