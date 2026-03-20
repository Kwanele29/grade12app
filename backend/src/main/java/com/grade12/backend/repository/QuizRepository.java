package com.grade12.backend.repository;

import com.grade12.backend.model.Quiz;
import com.grade12.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByTutor(User tutor);
    List<Quiz> findBySubjectId(Long subjectId);
}