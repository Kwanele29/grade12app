package com.grade12.backend.repository;

import com.grade12.backend.model.Quiz;
import com.grade12.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByTutor(User tutor);
    List<Quiz> findBySubjectId(Long subjectId);
    
    // Delete all quizzes for a specific tutor
    @Modifying
    @Transactional
    @Query("DELETE FROM Quiz q WHERE q.tutor.id = :tutorId")
    void deleteByTutorId(@Param("tutorId") Long tutorId);
}