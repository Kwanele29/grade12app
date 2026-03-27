package com.grade12.backend.repository;

import com.grade12.backend.model.StudentTutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentTutorRepository extends JpaRepository<StudentTutor, Long> {
    List<StudentTutor> findByTutorId(Long tutorId);
    List<StudentTutor> findByStudentId(Long studentId);
    Optional<StudentTutor> findByTutorIdAndStudentId(Long tutorId, Long studentId);
    boolean existsByTutorIdAndStudentId(Long tutorId, Long studentId);
    void deleteByTutorIdAndStudentId(Long tutorId, Long studentId);
    Long countByTutorId(Long tutorId);
}