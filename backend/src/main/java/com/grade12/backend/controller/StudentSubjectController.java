package com.grade12.backend.controller;

import com.grade12.backend.dto.StudentSubjectsDTO;
import com.grade12.backend.service.StudentSubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class StudentSubjectController {
    
    private final StudentSubjectService studentSubjectService;
    
    @PostMapping("/subjects")
    public ResponseEntity<?> saveStudentSubjects(@RequestBody StudentSubjectsDTO dto) {
        try {
            System.out.println("=== SAVING STUDENT SUBJECTS ===");
            System.out.println("Student ID: " + dto.getStudentId());
            System.out.println("Subject IDs: " + dto.getSubjectIds());
            
            studentSubjectService.saveStudentSubjects(dto.getStudentId(), dto.getSubjectIds());
            
            System.out.println("Subjects saved successfully");
            System.out.println("============================");
            
            return ResponseEntity.ok("Subjects saved successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/subjects/{studentId}")
    public ResponseEntity<?> getStudentSubjects(@PathVariable Long studentId) {
        try {
            return ResponseEntity.ok(studentSubjectService.getStudentSubjects(studentId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}