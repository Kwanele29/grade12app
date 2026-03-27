package com.grade12.backend.controller;

import com.grade12.backend.model.Material;
import com.grade12.backend.service.MaterialService;
import com.grade12.backend.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/materials")
@CrossOrigin(origins = "http://localhost:3000")
public class MaterialController {
    
    @Autowired
    private MaterialService materialService;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @PostMapping("/upload")
    public ResponseEntity<?> uploadMaterial(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("subjectId") Long subjectId,
            @RequestParam("topic") String topic,
            @RequestParam("tags") String tags,
            @RequestParam("tutorId") Long tutorId) {
        
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Please select a file"));
            }
            
            // Validate file size (100MB max)
            if (file.getSize() > 100 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "File size must be less than 100MB"));
            }
            
            // Upload file to storage
            String fileUrl = fileStorageService.storeFile(file, tutorId);
            long fileSize = file.getSize();
            
            // Determine material type based on file extension
            String materialType = getMaterialType(file.getOriginalFilename());
            
            // Create material object
            Material material = new Material();
            material.setTitle(title);
            material.setDescription(description);
            material.setMaterialType(materialType);
            material.setFileUrl(fileUrl);
            material.setFileSize(fileSize);
            material.setTopic(topic);
            material.setTags(tags.split(","));
            
            // Save material with tutor and subject
            Material savedMaterial = materialService.createMaterial(material, tutorId, subjectId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Material uploaded successfully");
            response.put("material", savedMaterial);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload material: " + e.getMessage()));
        }
    }
    
    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<?> getMaterialsByTutor(@PathVariable Long tutorId) {
        try {
            List<Material> materials = materialService.findByTutorId(tutorId);
            return ResponseEntity.ok(materials);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch materials: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{materialId}")
    public ResponseEntity<?> deleteMaterial(@PathVariable Long materialId) {
        try {
            materialService.delete(materialId);
            return ResponseEntity.ok(Map.of("message", "Material deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete material: " + e.getMessage()));
        }
    }
    
    @PostMapping("/{materialId}/view")
    public ResponseEntity<?> incrementViewCount(@PathVariable Long materialId) {
        try {
            materialService.incrementViews(materialId);
            return ResponseEntity.ok(Map.of("message", "View count incremented"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to increment view count: " + e.getMessage()));
        }
    }
    
    @PostMapping("/{materialId}/download")
    public ResponseEntity<?> incrementDownloadCount(@PathVariable Long materialId) {
        try {
            materialService.incrementDownloads(materialId);
            return ResponseEntity.ok(Map.of("message", "Download count incremented"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to increment download count: " + e.getMessage()));
        }
    }
    
    private String getMaterialType(String filename) {
        if (filename == null) return "other";
        
        String extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        switch (extension) {
            case "pdf": return "pdf";
            case "doc": case "docx": return "document";
            case "ppt": case "pptx": return "presentation";
            case "mp4": case "mov": case "avi": case "mkv": return "video";
            case "jpg": case "jpeg": case "png": case "gif": return "image";
            case "txt": return "text";
            default: return "other";
        }
    }
}