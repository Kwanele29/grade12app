package com.grade12.backend.service;

import com.grade12.backend.model.User;
import com.grade12.backend.model.Quiz;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    public void sendPasswordResetEmail(String to, String resetLink) {
        try {
            System.out.println("📧 Attempting to send email to: " + to);
            System.out.println("   Reset link: " + resetLink);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Grade 12 Central - Password Reset Request");
            message.setText(
                "Hello,\n\n" +
                "We received a request to reset your password for your Grade 12 Central account.\n\n" +
                "Click the link below to reset your password:\n" +
                resetLink + "\n\n" +
                "This link will expire in 1 hour.\n\n" +
                "If you didn't request this, please ignore this email.\n\n" +
                "Best regards,\n" +
                "Grade 12 Central Team"
            );
            message.setFrom("kwanelemyeni78@gmail.com");
            
            mailSender.send(message);
            System.out.println("✅ Email sent successfully to: " + to);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to: " + to);
            System.err.println("   Error message: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    // Simple text version for quiz completion (kept for compatibility)
    public void sendQuizCompletionEmail(String to, String studentName, String quizTitle, int score, int totalMarks) {
        try {
            int percentage = (score * 100) / totalMarks;
            String gradeMessage = percentage >= 80 ? "Excellent! 🌟" : 
                                  percentage >= 60 ? "Good job! 👍" : 
                                  "Keep practicing! 💪";
            
            System.out.println("📧 Sending quiz completion email to: " + to);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("🎉 Quiz Completed: " + quizTitle);
            message.setText(
                "Hello " + studentName + ",\n\n" +
                "You have successfully completed the quiz: " + quizTitle + "\n\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                "📊 YOUR RESULTS:\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                "   Score: " + score + " / " + totalMarks + "\n" +
                "   Percentage: " + percentage + "%\n" +
                "   " + gradeMessage + "\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                "Keep up the great work! Continue practicing to improve your results.\n\n" +
                "Best regards,\n" +
                "Grade 12 Central Team"
            );
            message.setFrom("kwanelemyeni78@gmail.com");
            
            mailSender.send(message);
            System.out.println("✅ Quiz completion email sent successfully to: " + to);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send quiz completion email to: " + to);
            System.err.println("   Error: " + e.getMessage());
        }
    }
    
    // NEW: Enhanced HTML quiz result email with grade and detailed feedback
    public void sendQuizResultEmail(User student, Quiz quiz, int obtainedMarks, int totalMarks, 
                                     int percentage, String grade, String feedback) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            String subject = "📊 Quiz Results: " + quiz.getTitle();
            
            String htmlContent = buildQuizResultEmailHTML(student, quiz, obtainedMarks, totalMarks, 
                                                           percentage, grade, feedback);
            
            helper.setTo(student.getEmail());
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            helper.setFrom("kwanelemyeni78@gmail.com");
            
            mailSender.send(mimeMessage);
            System.out.println("✅ HTML quiz result email sent to: " + student.getEmail());
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send HTML quiz result email: " + e.getMessage());
            // Fallback to plain text email
            sendQuizCompletionEmail(student.getEmail(), student.getFirstName() + " " + student.getLastName(), 
                                    quiz.getTitle(), obtainedMarks, totalMarks);
        }
    }
    
    private String buildQuizResultEmailHTML(User student, Quiz quiz, int obtainedMarks, int totalMarks,
                                             int percentage, String grade, String feedback) {
        
        String subjectName = quiz.getSubject() != null ? quiz.getSubject().getName() : "General";
        String dateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy, HH:mm"));
        String gradeClass = getGradeClass(percentage);
        
        return 
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset='UTF-8'>" +
            "<style>" +
            "body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }" +
            ".container { max-width: 550px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }" +
            ".header { background: linear-gradient(135deg, #1F2833, #0B0C10); padding: 25px; text-align: center; }" +
            ".header h1 { color: #66FCF1; margin: 0; font-size: 24px; }" +
            ".header p { color: #C5C6C7; margin: 5px 0 0; }" +
            ".content { padding: 25px; }" +
            ".student-info { background: #f0f0f0; padding: 15px; border-radius: 10px; margin-bottom: 20px; }" +
            ".score-card { background: linear-gradient(135deg, #66FCF1, #45A29E); padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px; }" +
            ".score-number { font-size: 48px; font-weight: bold; color: #0B0C10; margin: 10px 0; }" +
            ".score-label { color: #0B0C10; font-size: 14px; }" +
            ".details-table { width: 100%; margin-bottom: 20px; border-collapse: collapse; }" +
            ".details-table td { padding: 10px; border-bottom: 1px solid #ddd; }" +
            ".details-table td:first-child { font-weight: bold; width: 40%; }" +
            ".grade-box { text-align: center; padding: 15px; border-radius: 10px; margin: 15px 0; }" +
            ".grade-A { background: #d4edda; color: #155724; }" +
            ".grade-B { background: #d4edda; color: #155724; }" +
            ".grade-C { background: #fff3cd; color: #856404; }" +
            ".grade-D { background: #fff3cd; color: #856404; }" +
            ".grade-F { background: #f8d7da; color: #721c24; }" +
            ".feedback { background: #e8f4f8; padding: 15px; border-radius: 10px; margin: 20px 0; }" +
            ".footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }" +
            ".button { background: #66FCF1; color: #0B0C10; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }" +
            "</style>" +
            "</head>" +
            "<body>" +
            "<div class='container'>" +
            "<div class='header'>" +
            "<h1>📊 Quiz Results</h1>" +
            "<p>Grade 12 Central</p>" +
            "</div>" +
            "<div class='content'>" +
            "<div class='student-info'>" +
            "<strong>Hello " + student.getFirstName() + " " + student.getLastName() + "!</strong><br>" +
            "You have completed the quiz: <strong>" + quiz.getTitle() + "</strong><br>" +
            "Subject: " + subjectName + " | Date: " + dateTime +
            "</div>" +
            "<div class='score-card'>" +
            "<div class='score-label'>Your Score</div>" +
            "<div class='score-number'>" + obtainedMarks + " / " + totalMarks + "</div>" +
            "<div class='score-label'>(" + percentage + "%)</div>" +
            "</div>" +
            "<table class='details-table'>" +
            "<tr><td>📝 Quiz Title</td><td>" + quiz.getTitle() + "</td></tr>" +
            "<tr><td>📚 Subject</td><td>" + subjectName + "</td></tr>" +
            "<tr><td>📊 Obtained Marks</td><td>" + obtainedMarks + "</td></tr>" +
            "<tr><td>🎯 Total Marks</td><td>" + totalMarks + "</td></tr>" +
            "<tr><td>📈 Percentage</td><td>" + percentage + "%</td></tr>" +
            "<tr><td>⭐ Grade</td><td>" + grade + "</td></tr>" +
            "</table>" +
            "<div class='grade-box grade-" + gradeClass + "'>" +
            "<strong>Grade: " + grade + "</strong>" +
            "</div>" +
            "<div class='feedback'>" +
            "<strong>💡 Feedback:</strong><br>" +
            feedback +
            "</div>" +
            "<div style='text-align: center;'>" +
            "<a href='http://localhost:3000/student-dashboard' class='button'>📚 Go to Dashboard</a>" +
            "</div>" +
            "</div>" +
            "<div class='footer'>" +
            "<p>This is an automated message from Grade 12 Central. Please do not reply to this email.</p>" +
            "<p>&copy; 2024 Grade 12 Central. All rights reserved.</p>" +
            "</div>" +
            "</div>" +
            "</body>" +
            "</html>";
    }
    
    private String getGradeClass(int percentage) {
        if (percentage >= 70) return "A";
        if (percentage >= 60) return "C";
        return "F";
    }
}