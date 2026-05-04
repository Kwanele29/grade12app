package com.grade12.backend.controller;

import com.grade12.backend.model.Material;
import com.grade12.backend.repository.MaterialRepository;
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

    @Autowired
    private MaterialRepository materialRepository;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadMaterial(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("subjectId") Long subjectId,
<<<<<<< HEAD
            @RequestParam("topic") String topic,
            @RequestParam("tags") String tags,
            @RequestParam("tutorId") Long tutorId,
            @RequestParam(value = "videoLink", required = false) String videoLink,
            @RequestParam("materialType") String materialType) {   // ✅ NEW: explicit type from dropdown

=======
            @RequestParam(value = "topic", required = false) String topic,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestParam("tutorId") Long tutorId) {
        
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
        try {
            boolean hasFile = file != null && !file.isEmpty();
            boolean hasLink = videoLink != null && !videoLink.isBlank();

            // Validation for Video type
            if ("video".equals(materialType)) {
                if (!hasLink) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Video lessons require a video link"));
                }
            } else { // paper or note
                if (!hasFile) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Past Papers and Study Notes require a file"));
                }
                if (file.getSize() > 100L * 1024 * 1024) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "File size must be less than 100MB"));
                }
            }

            Material material = new Material();
            material.setTitle(title);
<<<<<<< HEAD
            material.setDescription(description);
            material.setTopic(topic);
            material.setTags(tags != null ? tags.split(",") : new String[0]);
            material.setMaterialType(materialType);   // ✅ store exactly what tutor selected

            if ("video".equals(materialType)) {
                material.setVideoLink(videoLink.trim());
                material.setFileSize(0L);
                material.setFileUrl(null);
            } else {
                String fileUrl = fileStorageService.storeFile(file, tutorId);
                material.setFileUrl(fileUrl);
                material.setFileSize(file.getSize());
                material.setVideoLink(null);
            }

=======
            material.setDescription(description != null ? description : "");
            material.setMaterialType(materialType);
            material.setFileUrl(fileUrl);
            material.setFileSize(fileSize);
            material.setTopic(topic != null ? topic : "");
            if (tags != null && !tags.isEmpty()) {
                material.setTags(tags.split(","));
            }
            
            // Save material with tutor and subject
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
            Material savedMaterial = materialService.createMaterial(material, tutorId, subjectId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Material uploaded successfully");
            response.put("material", savedMaterial);
<<<<<<< HEAD
=======
            response.put("fileUrl", fileUrl);
            
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload material: " + e.getMessage()));
        }
    }

    // ✅ ADDED: Get materials by tutor ID (missing endpoint)
    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<?> getMaterialsByTutor(@PathVariable Long tutorId) {
        try {
            List<Material> materials = materialService.findByTutorId(tutorId);
            return ResponseEntity.ok(materials);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<?> getMaterialsBySubject(@PathVariable Long subjectId) {
        try {
            List<Material> materials = materialRepository.findBySubjectId(subjectId);
            return ResponseEntity.ok(materials);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // getMaterialType helper no longer used for setting type, but keep for other uses
    private String getMaterialType(String filename) {
        if (filename == null) return "other";
        String ext = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        switch (ext) {
            case "pdf": return "pdf";
            case "doc": case "docx": return "document";
            case "ppt": case "pptx": return "presentation";
            case "mp4": case "mov": case "avi": case "mkv": return "video";
            case "jpg": case "jpeg": case "png": case "gif": case "webp": return "image";
            case "txt": return "text";
            default: return "other";
        }
    }
}