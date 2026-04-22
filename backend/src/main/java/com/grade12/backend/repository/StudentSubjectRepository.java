package com.grade12.backend.repository;

import com.grade12.backend.model.StudentSubject;
import com.grade12.backend.model.User;
import com.grade12.backend.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentSubjectRepository extends JpaRepository<StudentSubject, Long> {
    List<StudentSubject> findByStudent(User student);
    List<StudentSubject> findBySubject(Subject subject);
    Optional<StudentSubject> findByStudentAndSubject(User student, Subject subject);
    Long countBySubject(Subject subject);
    List<StudentSubject> findBySubjectId(Long subjectId);
}