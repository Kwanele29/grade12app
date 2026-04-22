package com.grade12.backend.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EnvConfig {
    
    static {
        try {
            // Load .env file from the backend folder
            Dotenv dotenv = Dotenv.configure()
                .directory("./")
                .ignoreIfMissing()
                .load();
            
            dotenv.entries().forEach(entry -> {
                System.setProperty(entry.getKey(), entry.getValue());
            });
            System.out.println("✅ Environment variables loaded from .env file");
        } catch (Exception e) {
            System.out.println("⚠️ No .env file found, using system environment variables");
        }
    }
}