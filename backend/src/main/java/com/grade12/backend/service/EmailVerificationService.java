package com.grade12.backend.service;

import com.grade12.backend.model.User;
import com.grade12.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class EmailVerificationService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private UserRepository userRepository;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    public void sendVerificationEmail(User user) {
        try {
            String token = UUID.randomUUID().toString();
            user.setVerificationToken(token);
            user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
            userRepository.save(user);

            String verificationLink = baseUrl + "/api/auth/verify-email?token=" + token;
            
            System.out.println("🔗 Verification link: " + verificationLink);

            // Create HTML email with clickable link
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            String htmlContent = 
                "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'></head>" +
                "<body style='font-family: Arial, sans-serif;'>" +
                "<div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>" +
                "<h2 style='color: #66FCF1;'>Grade 12 Central</h2>" +
                "<h3>Welcome " + user.getFirstName() + " " + user.getLastName() + "!</h3>" +
                "<p>Thank you for registering. Please verify your email address by clicking the button below:</p>" +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "<a href='" + verificationLink + "' style='background-color: #66FCF1; color: #0B0C10; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Verify Email Address</a>" +
                "</div>" +
                "<p>Or copy and paste this link into your browser:</p>" +
                "<p style='background-color: #f4f4f4; padding: 10px; word-break: break-all;'>" + verificationLink + "</p>" +
                "<p>This link will expire in 24 hours.</p>" +
                "<hr>" +
                "<p style='color: #666; font-size: 12px;'>If you did not create an account, please ignore this email.</p>" +
                "</div>" +
                "</body>" +
                "</html>";

            helper.setTo(user.getEmail());
            helper.setSubject("Grade 12 Central - Verify Your Email Address");
            helper.setText(htmlContent, true);
            helper.setFrom("kwanelemyeni78@gmail.com");

            mailSender.send(mimeMessage);
            System.out.println("✅ Verification email sent to: " + user.getEmail());

        } catch (Exception e) {
            System.err.println("❌ Failed to send verification email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public boolean verifyEmail(String token) {
        System.out.println("🔍 Verifying token: " + token);
        
        User user = userRepository.findByVerificationToken(token);
        
        if (user == null) {
            System.out.println("❌ No user found with token");
            return false;
        }

        if (user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            System.out.println("❌ Token expired for: " + user.getEmail());
            return false;
        }

        if (user.isEmailVerified()) {
            System.out.println("⚠️ Email already verified: " + user.getEmail());
            return false;
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        userRepository.save(user);

        System.out.println("✅ Email verified successfully for: " + user.getEmail());
        return true;
    }

    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isEmailVerified()) {
            throw new RuntimeException("Email already verified");
        }

        sendVerificationEmail(user);
    }
}