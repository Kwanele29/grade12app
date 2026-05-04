package com.grade12.backend.service;

import com.grade12.backend.model.Material;
import com.grade12.backend.model.User;
import com.grade12.backend.model.Subject;
import com.grade12.backend.repository.MaterialRepository;
import com.grade12.backend.repository.UserRepository;
import com.grade12.backend.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MaterialService {

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
<<<<<<< HEAD
    private TutorRepository tutorRepository;

=======
    private UserRepository userRepository;
    
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private FileStorageService fileStorageService;

    // ─── Queries ─────────────────────────────────────────────────────────────

    public List<Material> findByTutorId(Long tutorId) {
        return materialRepository.findByTutorIdOrderByUploadedAtDesc(tutorId);
    }

    public Material findById(Long id) {
        return materialRepository.findById(id).orElse(null);
    }

    public List<Material> searchByTitle(Long tutorId, String keyword) {
        return materialRepository.searchByTitle(tutorId, keyword);
    }

    public List<Material> getRecentMaterials(Long tutorId) {
        return materialRepository.findTop10ByTutorIdOrderByUploadedAtDesc(tutorId);
    }

    // ─── Write operations ────────────────────────────────────────────────────

    @Transactional
    public Material createMaterial(Material material, Long tutorId, Long subjectId) {
<<<<<<< HEAD
        Tutor tutor = tutorRepository.findById(tutorId)
                .orElseThrow(() -> new RuntimeException("Tutor not found with id: " + tutorId));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found with id: " + subjectId));

        material.setTutor(tutor);
        material.setSubject(subject);
        material.setUploadedAt(LocalDateTime.now());
        material.setUpdatedAt(LocalDateTime.now());
        material.setDownloads(0);
        material.setViews(0);
        material.setStatus("published");

=======
        User tutor = userRepository.findById(tutorId)
                .orElseThrow(() -> new RuntimeException("Tutor not found with id: " + tutorId));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found with id: " + subjectId));
        
        material.setTutor(tutor);
        material.setSubject(subject);
        material.setUploadedAt(LocalDateTime.now());
        if (material.getDownloads() == null) material.setDownloads(0);
        if (material.getViews() == null) material.setViews(0);
        if (material.getStatus() == null) material.setStatus("published");
        
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
        return materialRepository.save(material);
    }

    @Transactional
    public void delete(Long id) throws Exception {
        Material material = findById(id);
<<<<<<< HEAD
        if (material == null) return;

        // ✅ Only attempt to delete a physical file when one actually exists.
        //    Video-link materials have a null fileUrl, so we skip file deletion
        //    for them — FileStorageService is never called unnecessarily.
        String fileUrl = material.getFileUrl();
        if (fileUrl != null && !fileUrl.isBlank()) {
            try {
                fileStorageService.deleteFile(fileUrl);
            } catch (IOException e) {
                // Log but don't block the DB record from being removed
                System.err.println("Warning: could not delete file '" + fileUrl + "': " + e.getMessage());
=======
        if (material != null) {
            if (material.getFileUrl() != null && !material.getFileUrl().isEmpty()) {
                try {
                    fileStorageService.deleteFile(material.getFileUrl());
                } catch (IOException e) {
                    System.err.println("Error deleting file: " + e.getMessage());
                }
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
            }
        }

        materialRepository.deleteById(id);
    }

    // ─── Counters ────────────────────────────────────────────────────────────

    @Transactional
    public void incrementViews(Long materialId) {
        Material material = findById(materialId);
        if (material != null) {
            material.setViews(material.getViews() + 1);
            materialRepository.save(material);
        }
    }

    @Transactional
    public void incrementDownloads(Long materialId) {
        Material material = findById(materialId);
        if (material != null) {
            material.setDownloads(material.getDownloads() + 1);
            materialRepository.save(material);
        }
    }
}