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
                
<<<<<<< HEAD
                // Add tutor name if tutor exists
                if (subject.getTutorId() != null && subject.getTutorId() > 0) {
=======
                if (subject.getTutorId() != null) {
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
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
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
<<<<<<< HEAD
    // Get all subjects with tutors (for the Subjects page)
    @GetMapping("/with-tutors")
    public ResponseEntity<?> getAllSubjectsWithTutors() {
        try {
            List<Subject> subjects = subjectRepository.findAll();
            List<Map<String, Object>> result = new ArrayList<>();
            
            for (Subject subject : subjects) {
                Map<String, Object> subjectMap = new HashMap<>();
                subjectMap.put("id", subject.getId());
                subjectMap.put("name", subject.getName());
                subjectMap.put("icon", subject.getIconUrl() != null ? subject.getIconUrl() : "📚");
                subjectMap.put("color", subject.getColor() != null ? subject.getColor() : "#3b82f6");
                subjectMap.put("bgColor", subject.getBgColor() != null ? subject.getBgColor() : "#eff6ff");
                subjectMap.put("description", subject.getDescription());
                subjectMap.put("tutorId", subject.getTutorId());
                
                // Add tutor name
                if (subject.getTutorId() != null && subject.getTutorId() > 0) {
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
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get subject by ID
=======
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
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
                    subjectMap.put("description", subject.getDescription());
                    subjectMap.put("tutorId", subject.getTutorId());
                    
                    if (subject.getTutorId() != null && subject.getTutorId() > 0) {
                        userRepository.findById(subject.getTutorId()).ifPresent(tutor -> {
                            subjectMap.put("tutorName", tutor.getFirstName() + " " + tutor.getLastName());
                            subjectMap.put("tutorEmail", tutor.getEmail());
                        });
                    } else {
                        subjectMap.put("tutorName", "Not Assigned");
                    }
                    
                    return ResponseEntity.ok(subjectMap);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
<<<<<<< HEAD
    // Get subjects by tutor ID
    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<?> getSubjectsByTutor(@PathVariable Long tutorId) {
        try {
            List<Subject> subjects = subjectRepository.findByTutorId(tutorId);
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
                
                result.add(subjectMap);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Create new subject
=======
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
    @PostMapping
    public ResponseEntity<?> createSubject(@RequestBody Subject subject) {
        try {
            // Validate subject name is not empty
            if (subject.getName() == null || subject.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Subject name cannot be empty"));
            }
            
            // Check if subject already exists
            if (subjectRepository.existsByNameIgnoreCase(subject.getName())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Subject with this name already exists"));
            }
            
            Subject savedSubject = subjectRepository.save(subject);
            return ResponseEntity.ok(savedSubject);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSubject(@PathVariable Long id, @RequestBody Subject subjectDetails) {
        try {
            return subjectRepository.findById(id)
                    .map(subject -> {
                        // Update fields
                        if (subjectDetails.getName() != null) {
                            subject.setName(subjectDetails.getName());
                        }
                        if (subjectDetails.getDescription() != null) {
                            subject.setDescription(subjectDetails.getDescription());
                        }
                        if (subjectDetails.getIconUrl() != null) {
                            subject.setIconUrl(subjectDetails.getIconUrl());
                        }
                        if (subjectDetails.getColor() != null) {
                            subject.setColor(subjectDetails.getColor());
                        }
                        if (subjectDetails.getBgColor() != null) {
                            subject.setBgColor(subjectDetails.getBgColor());
                        }
                        if (subjectDetails.getTutorId() != null) {
                            subject.setTutorId(subjectDetails.getTutorId());
                        }
                        
                        return ResponseEntity.ok(subjectRepository.save(subject));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSubject(@PathVariable Long id) {
<<<<<<< HEAD
        try {
            return subjectRepository.findById(id)
                    .map(subject -> {
                        // Check if subject has quizzes before deletion
                        if (subject.getQuizzes() != null && !subject.getQuizzes().isEmpty()) {
                            return ResponseEntity.badRequest()
                                    .body(Map.of("error", "Cannot delete subject with existing quizzes"));
                        }
                        
                        subjectRepository.delete(subject);
                        return ResponseEntity.ok(Map.of("message", "Subject deleted successfully"));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get subject statistics (number of quizzes, students, etc.)
    @GetMapping("/{id}/stats")
    public ResponseEntity<?> getSubjectStatistics(@PathVariable Long id) {
        try {
            return subjectRepository.findById(id)
                    .map(subject -> {
                        Map<String, Object> stats = new HashMap<>();
                        stats.put("id", subject.getId());
                        stats.put("name", subject.getName());
                        stats.put("totalQuizzes", subject.getQuizzes() != null ? subject.getQuizzes().size() : 0);
                        stats.put("totalStudents", subject.getStudentSubjects() != null ? subject.getStudentSubjects().size() : 0);
                        stats.put("description", subject.getDescription());
                        stats.put("iconUrl", subject.getIconUrl());
                        stats.put("color", subject.getColor());
                        stats.put("bgColor", subject.getBgColor());
                        
                        if (subject.getTutorId() != null && subject.getTutorId() > 0) {
                            userRepository.findById(subject.getTutorId()).ifPresent(tutor -> {
                                stats.put("tutorName", tutor.getFirstName() + " " + tutor.getLastName());
                                stats.put("tutorEmail", tutor.getEmail());
                            });
                        } else {
                            stats.put("tutorName", "Not Assigned");
                        }
                        
                        return ResponseEntity.ok(stats);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Search subjects by name
    @GetMapping("/search")
    public ResponseEntity<?> searchSubjects(@RequestParam String keyword) {
        try {
            List<Subject> subjects = subjectRepository.findByNameContainingIgnoreCase(keyword);
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
                
                if (subject.getTutorId() != null && subject.getTutorId() > 0) {
                    userRepository.findById(subject.getTutorId()).ifPresent(tutor -> {
                        subjectMap.put("tutorName", tutor.getFirstName() + " " + tutor.getLastName());
                    });
                } else {
                    subjectMap.put("tutorName", "Not Assigned");
                }
                
                result.add(subjectMap);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get subjects for a specific student
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getSubjectsByStudent(@PathVariable Long studentId) {
        try {
            List<Subject> subjects = subjectRepository.findByStudentId(studentId);
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
                
                if (subject.getTutorId() != null && subject.getTutorId() > 0) {
                    userRepository.findById(subject.getTutorId()).ifPresent(tutor -> {
                        subjectMap.put("tutorName", tutor.getFirstName() + " " + tutor.getLastName());
                    });
                } else {
                    subjectMap.put("tutorName", "Not Assigned");
                }
                
                result.add(subjectMap);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get unassigned subjects (no tutor)
    @GetMapping("/unassigned")
    public ResponseEntity<?> getUnassignedSubjects() {
        try {
            List<Subject> subjects = subjectRepository.findUnassignedSubjects();
            return ResponseEntity.ok(subjects);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get subjects with available quizzes
    @GetMapping("/with-quizzes")
    public ResponseEntity<?> getSubjectsWithAvailableQuizzes() {
        try {
            List<Subject> subjects = subjectRepository.findSubjectsWithAvailableQuizzes();
            return ResponseEntity.ok(subjects);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
=======
        return subjectRepository.findById(id)
                .map(subject -> {
                    subjectRepository.delete(subject);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
    }
}