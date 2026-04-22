package com.grade12.backend.service;

import com.grade12.backend.model.*;
import com.grade12.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentSubjectService {
    
    private final StudentSubjectRepository studentSubjectRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    
    @Transactional
    public void saveStudentSubjects(Long studentId, List<Long> subjectIds) {
        User student = userRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found"));
        
        List<StudentSubject> existingSubjects = studentSubjectRepository.findByStudent(student);
        studentSubjectRepository.deleteAll(existingSubjects);
        
        for (Long subjectId : subjectIds) {
            Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found with ID: " + subjectId));
            
            StudentSubject studentSubject = new StudentSubject();
            studentSubject.setStudent(student);
            studentSubject.setSubject(subject);
            studentSubject.setProgress(0);
            studentSubject.setGrade("N/A");
            
            studentSubjectRepository.save(studentSubject);
            System.out.println("Saved student subject: Student " + studentId + " -> Subject " + subjectId);
        }
    }
    
    public List<StudentSubject> getStudentSubjects(Long studentId) {
        User student = userRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found"));
        return studentSubjectRepository.findByStudent(student);
    }
}