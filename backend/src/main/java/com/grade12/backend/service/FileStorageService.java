package com.grade12.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {
    
    @Value("${file.upload-dir}")
    private String uploadDir;
    
    @PostConstruct
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("Created upload directory: " + uploadPath.toAbsolutePath());
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize upload directory", e);
        }
    }
    
    public String storeFile(MultipartFile file, Long tutorId) throws IOException {
        // Create tutor-specific directory
        Path tutorUploadPath = Paths.get(uploadDir, "tutor_" + tutorId);
        if (!Files.exists(tutorUploadPath)) {
            Files.createDirectories(tutorUploadPath);
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID().toString() + extension;
        
        // Save file
        Path filePath = tutorUploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        // Return the relative URL for accessing the file
        return "/uploads/tutor_" + tutorId + "/" + filename;
    }
    
    public void deleteFile(String fileUrl) throws IOException {
        if (fileUrl != null && !fileUrl.isEmpty()) {
            String relativePath = fileUrl.substring("/uploads/".length());
            Path filePath = Paths.get(uploadDir, relativePath);
            Files.deleteIfExists(filePath);
        }
    }
}