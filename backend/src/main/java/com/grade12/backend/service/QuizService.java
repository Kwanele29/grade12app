package com.grade12.backend.service;

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
    
    @Transactional
    public Quiz uploadQuiz(Long tutorId, QuizUploadDTO uploadDTO) {
        User tutor = userRepository.findById(tutorId)
            .orElseThrow(() -> new RuntimeException("Tutor not found with ID: " + tutorId));
        
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
    
    public List<Quiz> getQuizzesByTutor(Long tutorId) {
        User tutor = userRepository.findById(tutorId)
            .orElseThrow(() -> new RuntimeException("Tutor not found with ID: " + tutorId));
        
        List<Quiz> quizzes = quizRepository.findByTutor(tutor);
        System.out.println("Found " + quizzes.size() + " quizzes for tutor ID: " + tutorId);
        
        return quizzes;
    }
    
    public List<QuizResponseDTO> getAllQuizzesForStudents() {
        List<Quiz> quizzes = quizRepository.findAll();
        System.out.println("Total quizzes in database: " + quizzes.size());
        
        return quizzes.stream()
            .map(quiz -> {
                String subjectName = quiz.getSubject() != null ? quiz.getSubject().getName() : "General";
                String subjectIcon = quiz.getSubject() != null ? quiz.getSubject().getIconUrl() : "📚";
                String subjectColor = quiz.getSubject() != null ? quiz.getSubject().getColor() : "#3b82f6";
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
                        .collect(Collectors.toList()) : List.of())
                    .build();
            })
            .collect(Collectors.toList());
    }
    
    @Transactional
    public QuizResultDTO submitQuiz(QuizSubmissionDTO submission) {
        User student = userRepository.findById(submission.getStudentId())
            .orElseThrow(() -> new RuntimeException("Student not found"));
        
        Quiz quiz = quizRepository.findById(submission.getQuizId())
            .orElseThrow(() -> new RuntimeException("Quiz not found"));
        
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
    
    public List<Quiz> getAllQuizzes() {
        List<Quiz> quizzes = quizRepository.findAll();
        System.out.println("Debug - All quizzes in database: " + quizzes.size());
        return quizzes;
    }

    // UPDATED: This method now shows students for ALL subjects (not just ones with quizzes)
    public List<StudentWithSubjectDTO> getStudentsByTutor(Long tutorId) {
        User tutor = userRepository.findById(tutorId)
            .orElseThrow(() -> new RuntimeException("Tutor not found"));
        
        System.out.println("=== Getting students for tutor ID: " + tutorId);
        System.out.println("Tutor: " + tutor.getEmail());
        
        // Get ALL subjects (for now, until we have tutor-subject mapping)
        // You can modify this to get subjects the tutor teaches if you have that mapping
        List<Subject> allSubjects = subjectRepository.findAll();
        System.out.println("Total subjects in system: " + allSubjects.size());
        
        List<StudentWithSubjectDTO> result = new ArrayList<>();
        
        for (Subject subject : allSubjects) {
            List<StudentSubject> studentSubjects = studentSubjectRepository.findBySubject(subject);
            System.out.println("Subject: " + subject.getName() + " - Students enrolled: " + studentSubjects.size());
            
            for (StudentSubject ss : studentSubjects) {
                StudentWithSubjectDTO dto = new StudentWithSubjectDTO();
                dto.setStudentId(ss.getStudent().getId());
                dto.setStudentName(ss.getStudent().getFirstName() + " " + ss.getStudent().getLastName());
                dto.setStudentEmail(ss.getStudent().getEmail());
                dto.setSubjectId(subject.getId());
                dto.setSubjectName(subject.getName());
                dto.setSubjectIcon(subject.getIconUrl());
                dto.setSubjectColor(subject.getColor());
                dto.setProgress(ss.getProgress() != null ? ss.getProgress() : 0);
                dto.setGrade(ss.getGrade() != null ? ss.getGrade() : "N/A");
                dto.setLastActive(ss.getUpdatedAt() != null ? ss.getUpdatedAt().toString() : 
                                 (ss.getCreatedAt() != null ? ss.getCreatedAt().toString() : "Recently"));
                
                result.add(dto);
            }
        }
        
        System.out.println("Total students found: " + result.size());
        return result;
    }
    
    // New method to get all student-subject relationships for debugging
    public List<StudentSubject> getAllStudentSubjects() {
        return studentSubjectRepository.findAll();
    }
}