package com.grade12.backend.controller;

import com.grade12.backend.dto.*;
import com.grade12.backend.model.Quiz;
import com.grade12.backend.model.StudentSubject;
import com.grade12.backend.model.User;
import com.grade12.backend.repository.UserRepository;
import com.grade12.backend.repository.StudentSubjectRepository;
import com.grade12.backend.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class QuizController {
    
    private final QuizService quizService;
    private final UserRepository userRepository;
    private final StudentSubjectRepository studentSubjectRepository;
    
<<<<<<< HEAD
    // ==================== TUTOR QUIZ ENDPOINTS ====================
=======
    // ==================== TUTOR QUIZ ENDPOINTS (YOUR WORKING CODE) ====================
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
    
    @PostMapping("/upload")
    public ResponseEntity<?> uploadQuiz(@RequestBody QuizUploadDTO uploadDTO) {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String email = userDetails.getUsername();
            
            System.out.println("=== UPLOADING QUIZ ===");
            System.out.println("Tutor email: " + email);
            System.out.println("Title: " + uploadDTO.getTitle());
            System.out.println("Subject ID: " + uploadDTO.getSubjectId());
            System.out.println("Questions: " + uploadDTO.getQuestions().size());
            
            Quiz savedQuiz = quizService.uploadQuiz(email, uploadDTO);
            
            System.out.println("Quiz saved with ID: " + savedQuiz.getId());
            System.out.println("=====================");
            
            return ResponseEntity.ok(savedQuiz);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/tutor/quizzes")
    public ResponseEntity<?> getMyQuizzes() {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String email = userDetails.getUsername();
            
            System.out.println("=== FETCHING MY QUIZZES ===");
            System.out.println("Tutor email: " + email);
            
            List<Quiz> quizzes = quizService.getQuizzesByTutorEmail(email);
            
            System.out.println("Found " + quizzes.size() + " quizzes");
            System.out.println("=====================");
            
            return ResponseEntity.ok(quizzes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/tutor/students")
    public ResponseEntity<?> getMyStudents() {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String email = userDetails.getUsername();
            
            System.out.println("=== FETCHING STUDENTS FOR TUTOR ===");
            System.out.println("Tutor email: " + email);
            
            List<StudentWithSubjectDTO> students = quizService.getStudentsByTutorEmail(email);
            
            System.out.println("Found " + students.size() + " students");
            System.out.println("====================================");
            
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    // ==================== STUDENT QUIZ ENDPOINTS ====================
    
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
    
    /**
     * NEW ENDPOINT: Fetch a single quiz by ID (including its questions)
     * Used when a student clicks "Start Quiz"
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getQuizById(@PathVariable Long id) {
        try {
            System.out.println("Fetching quiz by ID: " + id);
            Quiz quiz = quizService.getQuizById(id);
            if (quiz == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(quiz);
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
    
    // ==================== DEBUG ENDPOINTS ====================
    
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
    
    @GetMapping("/debug/student-subjects")
    public ResponseEntity<?> debugAllStudentSubjects() {
        try {
            List<StudentSubject> all = studentSubjectRepository.findAll();
            System.out.println("=== ALL STUDENT-SUBJECT RELATIONSHIPS ===");
            System.out.println("Total: " + all.size());
            
            List<Map<String, Object>> result = new ArrayList<>();
            for (StudentSubject ss : all) {
                Map<String, Object> item = new HashMap<>();
                item.put("studentId", ss.getStudent().getId());
                item.put("studentEmail", ss.getStudent().getEmail());
                item.put("studentName", ss.getStudent().getFirstName() + " " + ss.getStudent().getLastName());
                item.put("subjectId", ss.getSubject().getId());
                item.put("subjectName", ss.getSubject().getName());
                item.put("progress", ss.getProgress());
                item.put("grade", ss.getGrade());
                result.add(item);
                
                System.out.println("Student: " + ss.getStudent().getEmail() + 
                                   ", Subject: " + ss.getSubject().getName());
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/debug/auth-info")
    public ResponseEntity<?> debugAuthInfo() {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String email = userDetails.getUsername();
            
            User tutor = userRepository.findByEmail(email).orElse(null);
            
            Map<String, Object> debug = new HashMap<>();
            debug.put("authenticated", true);
            debug.put("email", email);
            debug.put("tutorExists", tutor != null);
            
            if (tutor != null) {
                debug.put("tutorId", tutor.getId());
                debug.put("tutorCategory", tutor.getCategory());
                debug.put("tutorName", tutor.getFirstName() + " " + tutor.getLastName());
            }
            
            return ResponseEntity.ok(debug);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}