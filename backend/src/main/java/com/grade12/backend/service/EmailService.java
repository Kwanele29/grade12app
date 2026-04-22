package com.grade12.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

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
            message.setFrom("grade12central@gmail.com");
            
            mailSender.send(message);
            System.out.println("✅ Email sent successfully to: " + to);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to: " + to);
            System.err.println("   Error type: " + e.getClass().getName());
            System.err.println("   Error message: " + e.getMessage());
            e.printStackTrace();
            System.err.println("Email sending failed but continuing application execution");
        }
    }
    
    // NEW METHOD: Send quiz completion email to student
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
            message.setFrom("grade12central@gmail.com");
            
            mailSender.send(message);
            System.out.println("✅ Quiz completion email sent successfully to: " + to);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send quiz completion email to: " + to);
            System.err.println("   Error: " + e.getMessage());
            // Don't throw exception - quiz submission still works even if email fails
        }
    }
}