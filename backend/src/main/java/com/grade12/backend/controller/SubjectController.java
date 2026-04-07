package com.grade12.backend.controller;

import com.grade12.backend.model.Subject;
import com.grade12.backend.model.User;
import com.grade12.backend.repository.SubjectRepository;
import com.grade12.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subjects")
@CrossOrigin(origins = "http://localhost:3000")
public class SubjectController {
    
    @Autowired
    private SubjectRepository subjectRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<?> getAllSubjects() {
        try {
            List<Subject> subjects = subjectRepository.findAll();
            List<Map<String, Object>> result = new ArrayList<>();
            
            for (Subject subject : subjects) {
                Map<String, Object> subjectMap = new HashMap<>();
                subjectMap.put("id", subject.getId());
                subjectMap.put("name", subject.getName());
                subjectMap.put("iconUrl", subject.getIconUrl());
                subjectMap.put("color", subject.getColor());
                subjectMap.put("bgColor", subject.getBgColor());
                subjectMap.put("description", subject.getDescription());
                subjectMap.put("tutorId", subject.getTutorId());
                
                if (subject.getTutorId() != null) {
                    User tutor = userRepository.findById(subject.getTutorId()).orElse(null);
                    if (tutor != null) {
                        subjectMap.put("tutorName", tutor.getFirstName() + " " + tutor.getLastName());
                        subjectMap.put("tutorEmail", tutor.getEmail());
                    } else {
                        subjectMap.put("tutorName", "Not Assigned");
                    }
                } else {
                    subjectMap.put("tutorName", "Not Assigned");
                }
                
                result.add(subjectMap);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getSubjectById(@PathVariable Long id) {
        return subjectRepository.findById(id)
                .map(subject -> {
                    Map<String, Object> subjectMap = new HashMap<>();
                    subjectMap.put("id", subject.getId());
                    subjectMap.put("name", subject.getName());
                    subjectMap.put("iconUrl", subject.getIconUrl());
                    subjectMap.put("color", subject.getColor());
                    subjectMap.put("bgColor", subject.getBgColor());
                    subjectMap.put("tutorId", subject.getTutorId());
                    
                    if (subject.getTutorId() != null) {
                        userRepository.findById(subject.getTutorId()).ifPresent(tutor -> {
                            subjectMap.put("tutorName", tutor.getFirstName() + " " + tutor.getLastName());
                        });
                    } else {
                        subjectMap.put("tutorName", "Not Assigned");
                    }
                    
                    return ResponseEntity.ok(subjectMap);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public Subject createSubject(@RequestBody Subject subject) {
        return subjectRepository.save(subject);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Subject> updateSubject(@PathVariable Long id, @RequestBody Subject subjectDetails) {
        return subjectRepository.findById(id)
                .map(subject -> {
                    subject.setName(subjectDetails.getName());
                    subject.setDescription(subjectDetails.getDescription());
                    subject.setIconUrl(subjectDetails.getIconUrl());
                    subject.setColor(subjectDetails.getColor());
                    subject.setBgColor(subjectDetails.getBgColor());
                    subject.setTutorId(subjectDetails.getTutorId());
                    return ResponseEntity.ok(subjectRepository.save(subject));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSubject(@PathVariable Long id) {
        return subjectRepository.findById(id)
                .map(subject -> {
                    subjectRepository.delete(subject);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}