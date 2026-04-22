package com.grade12.backend.service;

import com.grade12.backend.model.Subject;
import com.grade12.backend.model.User;
import com.grade12.backend.repository.SubjectRepository;
import com.grade12.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubjectService {
    
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }
    
    public Subject getSubjectById(Long id) {
        return subjectRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Subject not found"));
    }
    
    public User getTutorForSubject(Long subjectId) {
        Subject subject = getSubjectById(subjectId);
        if (subject.getTutorId() != null) {
            return userRepository.findById(subject.getTutorId())
                .orElseThrow(() -> new RuntimeException("Tutor not found"));
        }
        throw new RuntimeException("No tutor assigned to this subject");
    }
    
    public List<Map<String, Object>> getAllSubjectsWithTutors() {
        List<Subject> subjects = getAllSubjects();
        return subjects.stream().map(subject -> {
            Map<String, Object> subjectWithTutor = new HashMap<>();
            subjectWithTutor.put("id", subject.getId());
            subjectWithTutor.put("name", subject.getName());
            subjectWithTutor.put("icon", subject.getIconUrl());
            subjectWithTutor.put("color", subject.getColor());
            subjectWithTutor.put("bgColor", subject.getBgColor());
            
            if (subject.getTutorId() != null) {
                userRepository.findById(subject.getTutorId()).ifPresent(tutor -> {
                    subjectWithTutor.put("tutorId", tutor.getId());
                    subjectWithTutor.put("tutorName", tutor.getFirstName() + " " + tutor.getLastName());
                    subjectWithTutor.put("tutorEmail", tutor.getEmail());
                });
            }
            
            return subjectWithTutor;
        }).collect(Collectors.toList());
    }
}