package com.grade12.backend.service;

import java.util.Map;
import java.util.HashMap;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.grade12.backend.dto.*;
import com.grade12.backend.model.*;
import com.grade12.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {
    
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final StudentSubjectRepository studentSubjectRepository;
    private final ObjectMapper objectMapper;
    
    // Upload quiz with tutor email (from authentication)
    @Transactional
    public Quiz uploadQuiz(String tutorEmail, QuizUploadDTO uploadDTO) {
        User tutor = userRepository.findByEmail(tutorEmail)
            .orElseThrow(() -> new RuntimeException("Tutor not found with email: " + tutorEmail));
        
        if (!"tutor".equalsIgnoreCase(tutor.getCategory())) {
            throw new RuntimeException("User is not a tutor. Category: " + tutor.getCategory());
        }
        
        Subject subject = subjectRepository.findById(uploadDTO.getSubjectId())
            .orElseThrow(() -> new RuntimeException("Subject not found with ID: " + uploadDTO.getSubjectId()));
        
        System.out.println("Saving quiz for tutor: " + tutor.getEmail() + ", subject: " + subject.getName());
        
        Quiz quiz = new Quiz();
        quiz.setTitle(uploadDTO.getTitle());
        quiz.setDescription(uploadDTO.getDescription());
        quiz.setSubject(subject);
        quiz.setTutor(tutor);
        quiz.setTimeLimitMinutes(uploadDTO.getTimeLimitMinutes());
        quiz.setDifficulty(uploadDTO.getDifficulty());
        quiz.setTotalQuestions(uploadDTO.getQuestions().size());
        quiz.setTotalMarks(uploadDTO.getQuestions().stream()
            .mapToInt(QuizUploadDTO.QuestionDTO::getMarks).sum());
        
        List<QuizQuestion> questions = uploadDTO.getQuestions().stream()
            .map(qDTO -> {
                QuizQuestion question = new QuizQuestion();
                question.setQuestion(qDTO.getQuestion());
                question.setOptionA(qDTO.getOptionA());
                question.setOptionB(qDTO.getOptionB());
                question.setOptionC(qDTO.getOptionC());
                question.setOptionD(qDTO.getOptionD());
                question.setCorrectOption(qDTO.getCorrectOption());
                question.setMarks(qDTO.getMarks());
                question.setQuiz(quiz);
                return question;
            })
            .collect(Collectors.toList());
        
        quiz.setQuestions(questions);
        Quiz savedQuiz = quizRepository.save(quiz);
        System.out.println("Quiz saved with ID: " + savedQuiz.getId());
        
        return savedQuiz;
    }
    
    // Upload quiz with tutor ID (legacy method for backward compatibility)
    @Transactional
    public Quiz uploadQuiz(Long tutorId, QuizUploadDTO uploadDTO) {
        User tutor = userRepository.findById(tutorId)
            .orElseThrow(() -> new RuntimeException("Tutor not found with ID: " + tutorId));
        return uploadQuiz(tutor.getEmail(), uploadDTO);
    }
    
    // Get quizzes by tutor email (from authentication)
    public List<Quiz> getQuizzesByTutorEmail(String tutorEmail) {
        User tutor = userRepository.findByEmail(tutorEmail)
            .orElseThrow(() -> new RuntimeException("Tutor not found with email: " + tutorEmail));
        
        List<Quiz> quizzes = quizRepository.findByTutor(tutor);
        System.out.println("Found " + quizzes.size() + " quizzes for tutor: " + tutorEmail);
        return quizzes;
    }
    
    // Get quizzes by tutor ID (legacy method)
    public List<Quiz> getQuizzesByTutor(Long tutorId) {
        User tutor = userRepository.findById(tutorId)
            .orElseThrow(() -> new RuntimeException("Tutor not found with ID: " + tutorId));
        
        List<Quiz> quizzes = quizRepository.findByTutor(tutor);
        System.out.println("Found " + quizzes.size() + " quizzes for tutor ID: " + tutorId);
        return quizzes;
    }
    
    // Get students by tutor email (from authentication)
    public List<StudentWithSubjectDTO> getStudentsByTutorEmail(String tutorEmail) {
        User tutor = userRepository.findByEmail(tutorEmail)
            .orElseThrow(() -> new RuntimeException("Tutor not found with email: " + tutorEmail));
        
        System.out.println("Getting students for tutor email: " + tutorEmail);
        return getStudentsByTutor(tutor.getId());
    }
    
    // Get students by tutor ID
    public List<StudentWithSubjectDTO> getStudentsByTutor(Long tutorId) {
        User tutor = userRepository.findById(tutorId)
            .orElseThrow(() -> new RuntimeException("Tutor not found with ID: " + tutorId));
        
        System.out.println("=== Getting students for tutor ID: " + tutorId);
        System.out.println("Tutor: " + tutor.getEmail());
        
        // Get ALL student-subject relationships
        List<StudentSubject> allStudentSubjects = studentSubjectRepository.findAll();
        System.out.println("Total student-subject relationships in database: " + allStudentSubjects.size());
        
        List<StudentWithSubjectDTO> result = new ArrayList<>();
        
        for (StudentSubject ss : allStudentSubjects) {
            try {
                StudentWithSubjectDTO dto = new StudentWithSubjectDTO();
                dto.setStudentId(ss.getStudent().getId());
                dto.setStudentName(ss.getStudent().getFirstName() + " " + ss.getStudent().getLastName());
                dto.setStudentEmail(ss.getStudent().getEmail());
                dto.setSubjectId(ss.getSubject().getId());
                dto.setSubjectName(ss.getSubject().getName());
                dto.setSubjectIcon(ss.getSubject().getIconUrl() != null ? ss.getSubject().getIconUrl() : "📚");
                dto.setSubjectColor(ss.getSubject().getColor() != null ? ss.getSubject().getColor() : "#3b82f6");
                dto.setProgress(ss.getProgress() != null ? ss.getProgress() : 0);
                dto.setGrade(ss.getGrade() != null ? ss.getGrade() : "N/A");
                dto.setLastActive(ss.getUpdatedAt() != null ? ss.getUpdatedAt().toString() : 
                                 (ss.getCreatedAt() != null ? ss.getCreatedAt().toString() : "Recently"));
                
                result.add(dto);
                System.out.println("  Added: " + ss.getStudent().getEmail() + " - " + ss.getSubject().getName());
            } catch (Exception e) {
                System.err.println("Error processing student-subject: " + e.getMessage());
            }
        }
        
        System.out.println("Total students found: " + result.size());
        return result;
    }
    
    // Get all quizzes for students
    public List<QuizResponseDTO> getAllQuizzesForStudents() {
        List<Quiz> quizzes = quizRepository.findAll();
        System.out.println("Total quizzes in database: " + quizzes.size());
        
        return quizzes.stream()
            .map(quiz -> {
                String subjectName = quiz.getSubject() != null ? quiz.getSubject().getName() : "General";
                String subjectIcon = quiz.getSubject() != null && quiz.getSubject().getIconUrl() != null ? 
                    quiz.getSubject().getIconUrl() : "📚";
                String subjectColor = quiz.getSubject() != null && quiz.getSubject().getColor() != null ? 
                    quiz.getSubject().getColor() : "#3b82f6";
                String tutorName = quiz.getTutor() != null ? 
                    quiz.getTutor().getFirstName() + " " + quiz.getTutor().getLastName() : "Unknown Tutor";
                
                return QuizResponseDTO.builder()
                    .id(quiz.getId())
                    .title(quiz.getTitle())
                    .description(quiz.getDescription())
                    .subjectName(subjectName)
                    .subjectIcon(subjectIcon)
                    .subjectColor(subjectColor)
                    .tutorName(tutorName)
                    .totalQuestions(quiz.getTotalQuestions())
                    .totalMarks(quiz.getTotalMarks())
                    .timeLimitMinutes(quiz.getTimeLimitMinutes())
                    .difficulty(quiz.getDifficulty())
                    .questions(quiz.getQuestions() != null ? quiz.getQuestions().stream()
                        .map(q -> QuizResponseDTO.QuestionDTO.builder()
                            .id(q.getId())
                            .question(q.getQuestion())
                            .optionA(q.getOptionA())
                            .optionB(q.getOptionB())
                            .optionC(q.getOptionC())
                            .optionD(q.getOptionD())
                            .marks(q.getMarks())
                            .build())
                        .collect(Collectors.toList()) : new ArrayList<>())
                    .build();
            })
            .collect(Collectors.toList());
    }
    
    // Submit quiz and calculate results
    @Transactional
    public QuizResultDTO submitQuiz(QuizSubmissionDTO submission) {
        User student = userRepository.findById(submission.getStudentId())
            .orElseThrow(() -> new RuntimeException("Student not found with ID: " + submission.getStudentId()));
        
        Quiz quiz = quizRepository.findById(submission.getQuizId())
            .orElseThrow(() -> new RuntimeException("Quiz not found with ID: " + submission.getQuizId()));
        
        List<QuizQuestion> questions = questionRepository.findByQuizId(quiz.getId());
        
        int totalMarks = 0;
        int obtainedMarks = 0;
        
        for (QuizQuestion q : questions) {
            totalMarks += q.getMarks();
            
            Integer userAnswer = submission.getAnswers().get(q.getId());
            if (userAnswer != null && userAnswer.equals(q.getCorrectOption())) {
                obtainedMarks += q.getMarks();
            }
        }
        
        int percentage = (totalMarks > 0) ? (obtainedMarks * 100) / totalMarks : 0;
        
        System.out.println("Quiz submitted - Student: " + student.getEmail());
        System.out.println("Quiz: " + quiz.getTitle());
        System.out.println("Obtained: " + obtainedMarks + "/" + totalMarks);
        System.out.println("Percentage: " + percentage + "%");
        
        return QuizResultDTO.builder()
            .studentName(student.getFirstName() + " " + student.getLastName())
            .quizTitle(quiz.getTitle())
            .subjectName(quiz.getSubject() != null ? quiz.getSubject().getName() : "General")
            .obtainedMarks(obtainedMarks)
            .totalMarks(totalMarks)
            .percentage(percentage)
            .completedAt(LocalDateTime.now().toString())
            .build();
    }
    
    // Get all quizzes (debugging)
    public List<Quiz> getAllQuizzes() {
        List<Quiz> quizzes = quizRepository.findAll();
        System.out.println("Debug - All quizzes in database: " + quizzes.size());
        for (Quiz quiz : quizzes) {
            System.out.println("  Quiz ID: " + quiz.getId() + 
                             ", Title: " + quiz.getTitle() + 
                             ", Tutor: " + (quiz.getTutor() != null ? quiz.getTutor().getEmail() : "null") +
                             ", Subject: " + (quiz.getSubject() != null ? quiz.getSubject().getName() : "null"));
        }
        return quizzes;
    }
    
    // Get all student-subject relationships (debugging)
    public List<StudentSubject> getAllStudentSubjects() {
        List<StudentSubject> all = studentSubjectRepository.findAll();
        System.out.println("Total student-subject relationships: " + all.size());
        for (StudentSubject ss : all) {
            System.out.println("  Student: " + (ss.getStudent() != null ? ss.getStudent().getEmail() : "null") + 
                             ", Subject: " + (ss.getSubject() != null ? ss.getSubject().getName() : "null"));
        }
        return all;
    }
    
    // Get quizzes by subject
    public List<Quiz> getQuizzesBySubject(Long subjectId) {
        List<Quiz> quizzes = quizRepository.findBySubjectId(subjectId);
        System.out.println("Found " + quizzes.size() + " quizzes for subject ID: " + subjectId);
        return quizzes;
    }
    
    // Get quiz details with questions
    public Quiz getQuizWithQuestions(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
            .orElseThrow(() -> new RuntimeException("Quiz not found with ID: " + quizId));
        
        if (quiz.getQuestions() != null) {
            quiz.getQuestions().size();
        }
        
        return quiz;
    }
    
    // ADD THIS METHOD - Get quiz by ID (for email notification)
    public Quiz getQuizById(Long quizId) {
        return quizRepository.findById(quizId)
            .orElse(null);
    }
    
    // Delete quiz
    @Transactional
    public void deleteQuiz(String tutorEmail, Long quizId) {
        User tutor = userRepository.findByEmail(tutorEmail)
            .orElseThrow(() -> new RuntimeException("Tutor not found with email: " + tutorEmail));
        
        Quiz quiz = quizRepository.findById(quizId)
            .orElseThrow(() -> new RuntimeException("Quiz not found with ID: " + quizId));
        
        if (!quiz.getTutor().getId().equals(tutor.getId())) {
            throw new RuntimeException("You don't have permission to delete this quiz");
        }
        
        quizRepository.delete(quiz);
        System.out.println("Quiz deleted: " + quizId + " by tutor: " + tutorEmail);
    }
    
    // Update quiz
    @Transactional
    public Quiz updateQuiz(String tutorEmail, Long quizId, QuizUploadDTO updateDTO) {
        User tutor = userRepository.findByEmail(tutorEmail)
            .orElseThrow(() -> new RuntimeException("Tutor not found with email: " + tutorEmail));
        
        Quiz existingQuiz = quizRepository.findById(quizId)
            .orElseThrow(() -> new RuntimeException("Quiz not found with ID: " + quizId));
        
        if (!existingQuiz.getTutor().getId().equals(tutor.getId())) {
            throw new RuntimeException("You don't have permission to update this quiz");
        }
        
        existingQuiz.setTitle(updateDTO.getTitle());
        existingQuiz.setDescription(updateDTO.getDescription());
        existingQuiz.setTimeLimitMinutes(updateDTO.getTimeLimitMinutes());
        existingQuiz.setDifficulty(updateDTO.getDifficulty());
        
        if (updateDTO.getQuestions() != null && !updateDTO.getQuestions().isEmpty()) {
            List<QuizQuestion> oldQuestions = questionRepository.findByQuizId(quizId);
            questionRepository.deleteAll(oldQuestions);
            
            List<QuizQuestion> newQuestions = updateDTO.getQuestions().stream()
                .map(qDTO -> {
                    QuizQuestion question = new QuizQuestion();
                    question.setQuestion(qDTO.getQuestion());
                    question.setOptionA(qDTO.getOptionA());
                    question.setOptionB(qDTO.getOptionB());
                    question.setOptionC(qDTO.getOptionC());
                    question.setOptionD(qDTO.getOptionD());
                    question.setCorrectOption(qDTO.getCorrectOption());
                    question.setMarks(qDTO.getMarks());
                    question.setQuiz(existingQuiz);
                    return question;
                })
                .collect(Collectors.toList());
            
            existingQuiz.setQuestions(newQuestions);
            existingQuiz.setTotalQuestions(newQuestions.size());
            existingQuiz.setTotalMarks(newQuestions.stream().mapToInt(QuizQuestion::getMarks).sum());
        }
        
        Quiz updatedQuiz = quizRepository.save(existingQuiz);
        System.out.println("Quiz updated: " + quizId + " by tutor: " + tutorEmail);
        
        return updatedQuiz;
    }
    
    // Get quiz statistics
    public Map<String, Object> getQuizStatistics(String tutorEmail, Long quizId) {
        User tutor = userRepository.findByEmail(tutorEmail)
            .orElseThrow(() -> new RuntimeException("Tutor not found with email: " + tutorEmail));
        
        Quiz quiz = quizRepository.findById(quizId)
            .orElseThrow(() -> new RuntimeException("Quiz not found with ID: " + quizId));
        
        if (!quiz.getTutor().getId().equals(tutor.getId())) {
            throw new RuntimeException("You don't have permission to view statistics for this quiz");
        }
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("quizId", quiz.getId());
        stats.put("quizTitle", quiz.getTitle());
        stats.put("totalQuestions", quiz.getTotalQuestions());
        stats.put("totalMarks", quiz.getTotalMarks());
        stats.put("message", "Add QuizAttempt table to track student attempts");
        
        return stats;
    }
}