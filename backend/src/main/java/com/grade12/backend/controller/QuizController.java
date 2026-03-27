package com.grade12.backend.controller;

import com.grade12.backend.model.*;
import com.grade12.backend.repository.*;
import com.grade12.backend.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "http://localhost:3000")
public class QuizController {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final StudentRepository studentRepository;
    private final QuestionRepository questionRepository;

    public QuizController(QuizRepository quizRepository, 
                          QuizAttemptRepository quizAttemptRepository,
                          StudentRepository studentRepository,
                          QuestionRepository questionRepository) {
        this.quizRepository = quizRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.studentRepository = studentRepository;
        this.questionRepository = questionRepository;
    }

    @GetMapping("/{quizId}/take")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> takeQuiz(@PathVariable Long quizId,
                                       @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            // Fetch quiz with questions using JOIN FETCH to avoid LazyInitializationException
            Quiz quiz = quizRepository.findByIdWithQuestions(quizId)
                    .orElseThrow(() -> new RuntimeException("Quiz not found"));

            // Check if quiz is published
            if (!"PUBLISHED".equals(quiz.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Quiz is not available"));
            }

            // Check deadline
            if (quiz.getDeadlineDate() != null && quiz.getDeadlineDate().isBefore(LocalDateTime.now())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Quiz deadline has passed"));
            }

            // Get student
            Student student = studentRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            // Check if student has already attempted
            Optional<QuizAttempt> existingAttempt = quizAttemptRepository
                    .findByQuizIdAndStudentIdAndStatus(quizId, student.getId(), "COMPLETED");
            
            if (existingAttempt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "You have already completed this quiz"));
            }

            // Create or get in-progress attempt
            QuizAttempt attempt = quizAttemptRepository
                    .findByQuizIdAndStudentIdAndStatus(quizId, student.getId(), "IN_PROGRESS")
                    .orElseGet(() -> {
                        QuizAttempt newAttempt = new QuizAttempt();
                        newAttempt.setQuiz(quiz);
                        newAttempt.setStudent(student);
                        newAttempt.setStatus("IN_PROGRESS");
                        newAttempt.setStartedAt(LocalDateTime.now());
                        newAttempt.setTotalQuestions(quiz.getTotalQuestions());
                        return quizAttemptRepository.save(newAttempt);
                    });

            // Prepare quiz data for frontend
            Map<String, Object> quizData = new HashMap<>();
            quizData.put("id", quiz.getId());
            quizData.put("title", quiz.getTitle());
            quizData.put("description", quiz.getDescription());
            quizData.put("duration", quiz.getDuration());
            quizData.put("totalQuestions", quiz.getTotalQuestions());

            // Get questions from the quiz object (now it has the relationship)
            List<Question> quizQuestions = quiz.getQuestions();
            
            List<Map<String, Object>> questions = new ArrayList<>();
            for (Question question : quizQuestions) {
                Map<String, Object> q = new HashMap<>();
                q.put("id", question.getId());
                q.put("question", question.getQuestion());
                
                List<String> options = Arrays.asList(
                    question.getOptionA(),
                    question.getOptionB(),
                    question.getOptionC(),
                    question.getOptionD()
                );
                q.put("options", options);
                
                questions.add(q);
            }
            
            // Shuffle questions if needed
            if (quiz.getShuffleQuestions() != null && quiz.getShuffleQuestions()) {
                Collections.shuffle(questions);
            }
            
            quizData.put("questions", questions);
            quizData.put("attemptId", attempt.getId());

            return ResponseEntity.ok(quizData);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to load quiz: " + e.getMessage()));
        }
    }

    @PostMapping("/{quizId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> submitQuiz(@PathVariable Long quizId,
                                         @AuthenticationPrincipal UserPrincipal currentUser,
                                         @RequestBody Map<String, Object> submission) {
        try {
            Quiz quiz = quizRepository.findByIdWithQuestions(quizId)
                    .orElseThrow(() -> new RuntimeException("Quiz not found"));

            Student student = studentRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            QuizAttempt attempt = quizAttemptRepository
                    .findByQuizIdAndStudentIdAndStatus(quizId, student.getId(), "IN_PROGRESS")
                    .orElseThrow(() -> new RuntimeException("No active attempt found"));

            @SuppressWarnings("unchecked")
            Map<Long, String> answers = (Map<Long, String>) submission.get("answers");

            // Get questions from the quiz
            List<Question> questions = quiz.getQuestions();
            
            // Calculate results
            int totalMarks = 0;
            int earnedMarks = 0;
            int correctCount = 0;
            List<Map<String, Object>> questionResults = new ArrayList<>();

            for (Question question : questions) {
                String userAnswer = answers.get(question.getId());
                boolean isCorrect = false;
                int marksEarned = 0;

                if (userAnswer != null) {
                    String correctAnswer = getCorrectAnswerText(question);
                    if (correctAnswer.equals(userAnswer)) {
                        isCorrect = true;
                        marksEarned = question.getMarks();
                        correctCount++;
                    }
                    earnedMarks += marksEarned;
                }
                totalMarks += question.getMarks();

                Map<String, Object> qResult = new HashMap<>();
                qResult.put("questionId", question.getId());
                qResult.put("question", question.getQuestion());
                qResult.put("userAnswer", userAnswer);
                qResult.put("correctAnswer", getCorrectAnswerText(question));
                qResult.put("isCorrect", isCorrect);
                qResult.put("marksEarned", marksEarned);
                qResult.put("totalMarks", question.getMarks());
                qResult.put("explanation", question.getExplanation());
                
                questionResults.add(qResult);
            }

            double percentage = totalMarks > 0 ? (earnedMarks * 100.0) / totalMarks : 0;
            
            // Update attempt
            attempt.setScore((double) earnedMarks);
            attempt.setPercentage(percentage);
            attempt.setCorrectAnswers(correctCount);
            attempt.setCompletedAt(LocalDateTime.now());
            attempt.setStatus("COMPLETED");
            
            // Calculate time taken
            long timeTaken = java.time.Duration.between(attempt.getStartedAt(), attempt.getCompletedAt()).getSeconds();
            attempt.setTimeTaken((int) timeTaken);
            
            // Store answers as JSON
            attempt.setAnswers(mapToJson(answers));
            
            quizAttemptRepository.save(attempt);

            // Update quiz stats
            List<QuizAttempt> allAttempts = quizAttemptRepository.findByQuizId(quizId);
            double avgScore = allAttempts.stream()
                    .mapToDouble(QuizAttempt::getPercentage)
                    .average()
                    .orElse(0.0);
            quiz.setAverageScore(avgScore);
            quiz.setTotalAttempts(allAttempts.size());
            quizRepository.save(quiz);

            // Prepare results
            Map<String, Object> results = new HashMap<>();
            results.put("attemptId", attempt.getId());
            results.put("score", earnedMarks);
            results.put("totalMarks", totalMarks);
            results.put("percentage", Math.round(percentage));
            results.put("correctAnswers", correctCount);
            results.put("totalQuestions", quiz.getTotalQuestions());
            results.put("timeTaken", timeTaken);
            results.put("questionResults", questionResults);
            
            // Check if passed
            boolean passed = percentage >= quiz.getPassingScore();
            results.put("passed", passed);
            results.put("message", passed ? "Congratulations! You passed the quiz!" : "You did not pass this time. Keep practicing!");

            return ResponseEntity.ok(results);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to submit quiz: " + e.getMessage()));
        }
    }

    @GetMapping("/{quizId}/results")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getQuizResults(@PathVariable Long quizId,
                                             @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            Student student = studentRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            QuizAttempt attempt = quizAttemptRepository
                    .findByQuizIdAndStudentIdAndStatus(quizId, student.getId(), "COMPLETED")
                    .orElseThrow(() -> new RuntimeException("No completed attempt found"));

            return ResponseEntity.ok(parseResults(attempt));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to get results: " + e.getMessage()));
        }
    }

    @GetMapping("/{quizId}/leaderboard")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getLeaderboard(@PathVariable Long quizId) {
        try {
            List<QuizAttempt> attempts = quizAttemptRepository
                    .findTop10ByQuizIdAndStatusOrderByPercentageDesc(quizId, "COMPLETED");
            
            List<Map<String, Object>> leaderboard = new ArrayList<>();
            for (QuizAttempt attempt : attempts) {
                Map<String, Object> entry = new HashMap<>();
                entry.put("studentName", attempt.getStudent().getUser().getFirstName() + " " + 
                                        attempt.getStudent().getUser().getLastName());
                entry.put("score", attempt.getScore());
                entry.put("percentage", attempt.getPercentage());
                entry.put("completedAt", attempt.getCompletedAt());
                entry.put("timeTaken", attempt.getTimeTaken());
                leaderboard.add(entry);
            }
            
            return ResponseEntity.ok(leaderboard);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to load leaderboard: " + e.getMessage()));
        }
    }

    // Helper methods
    private String getCorrectAnswerText(Question question) {
        Integer correctOption = question.getCorrectOption();
        if (correctOption == null) return "";
        
        switch (correctOption) {
            case 0: return question.getOptionA();
            case 1: return question.getOptionB();
            case 2: return question.getOptionC();
            case 3: return question.getOptionD();
            default: return "";
        }
    }

    private String mapToJson(Map<Long, String> map) {
        if (map == null || map.isEmpty()) return "{}";
        
        StringBuilder json = new StringBuilder("{");
        int i = 0;
        for (Map.Entry<Long, String> entry : map.entrySet()) {
            if (i++ > 0) json.append(",");
            json.append("\"").append(entry.getKey()).append("\":\"")
                .append(entry.getValue().replace("\"", "\\\"")).append("\"");
        }
        json.append("}");
        return json.toString();
    }

    private Map<String, Object> parseResults(QuizAttempt attempt) {
        Map<String, Object> results = new HashMap<>();
        results.put("attemptId", attempt.getId());
        results.put("score", attempt.getScore());
        results.put("percentage", attempt.getPercentage());
        results.put("correctAnswers", attempt.getCorrectAnswers());
        results.put("totalQuestions", attempt.getTotalQuestions());
        results.put("timeTaken", attempt.getTimeTaken());
        results.put("completedAt", attempt.getCompletedAt());
        return results;
    }
}