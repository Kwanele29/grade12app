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
            // Don't throw exception - just log the error so the app doesn't crash
            System.err.println("Email sending failed but continuing application execution");
        }
    }
}