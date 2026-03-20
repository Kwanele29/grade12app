package com.grade12.backend.controller;

import com.grade12.backend.dto.*;
import com.grade12.backend.model.Quiz;
import com.grade12.backend.model.StudentSubject;
import com.grade12.backend.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class QuizController {
    
    private final QuizService quizService;
    
    @PostMapping("/upload")
    public ResponseEntity<?> uploadQuiz(@RequestBody QuizUploadDTO uploadDTO) {
        try {
            Long tutorId = 1L;
            
            System.out.println("=== UPLOADING QUIZ ===");
            System.out.println("Title: " + uploadDTO.getTitle());
            System.out.println("Subject ID: " + uploadDTO.getSubjectId());
            System.out.println("Questions: " + uploadDTO.getQuestions().size());
            
            Quiz savedQuiz = quizService.uploadQuiz(tutorId, uploadDTO);
            
            System.out.println("Quiz saved with ID: " + savedQuiz.getId());
            System.out.println("=====================");
            
            return ResponseEntity.ok(savedQuiz);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<?> getQuizzesByTutor(@PathVariable Long tutorId) {
        try {
            System.out.println("Fetching quizzes for tutor ID: " + tutorId);
            List<Quiz> quizzes = quizService.getQuizzesByTutor(tutorId);
            System.out.println("Found " + quizzes.size() + " quizzes");
            return ResponseEntity.ok(quizzes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/student/all")
    public ResponseEntity<?> getAllQuizzesForStudents() {
        try {
            System.out.println("Fetching all quizzes for students");
            List<QuizResponseDTO> quizzes = quizService.getAllQuizzesForStudents();
            System.out.println("Found " + quizzes.size() + " quizzes");
            return ResponseEntity.ok(quizzes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @PostMapping("/submit")
    public ResponseEntity<?> submitQuiz(@RequestBody QuizSubmissionDTO submission) {
        try {
            System.out.println("=== SUBMITTING QUIZ ===");
            System.out.println("Student ID: " + submission.getStudentId());
            System.out.println("Quiz ID: " + submission.getQuizId());
            System.out.println("Answers: " + submission.getAnswers());
            
            QuizResultDTO result = quizService.submitQuiz(submission);
            
            System.out.println("Result: " + result.getPercentage() + "%");
            System.out.println("=====================");
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/debug/all")
    public ResponseEntity<?> debugAllQuizzes() {
        try {
            List<Quiz> quizzes = quizService.getAllQuizzes();
            System.out.println("DEBUG - All quizzes: " + quizzes.size());
            return ResponseEntity.ok(quizzes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/tutor/{tutorId}/students")
    public ResponseEntity<?> getStudentsByTutorSubjects(@PathVariable Long tutorId) {
        try {
            System.out.println("=== FETCHING STUDENTS FOR TUTOR ===");
            System.out.println("Tutor ID: " + tutorId);
            
            List<StudentWithSubjectDTO> students = quizService.getStudentsByTutor(tutorId);
            
            System.out.println("Found " + students.size() + " students across subjects");
            System.out.println("====================================");
            
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    // NEW: Debug endpoint to see all student-subject relationships
    @GetMapping("/debug/student-subjects")
    public ResponseEntity<?> debugAllStudentSubjects() {
        try {
            List<StudentSubject> all = quizService.getAllStudentSubjects();
            System.out.println("=== ALL STUDENT-SUBJECT RELATIONSHIPS ===");
            for (StudentSubject ss : all) {
                System.out.println("Student: " + ss.getStudent().getEmail() + 
                                   ", Subject: " + ss.getSubject().getName() +
                                   ", Progress: " + ss.getProgress() +
                                   ", Grade: " + ss.getGrade());
            }
            return ResponseEntity.ok(all);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}