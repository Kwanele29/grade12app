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
    private UserRepository userRepository;
    
    @Autowired
    private SubjectRepository subjectRepository;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    public List<Material> findByTutorId(Long tutorId) {
        return materialRepository.findByTutorIdOrderByUploadedAtDesc(tutorId);
    }
    
    public Material findById(Long id) {
        return materialRepository.findById(id).orElse(null);
    }
    
    @Transactional
    public Material createMaterial(Material material, Long tutorId, Long subjectId) {
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
        
        return materialRepository.save(material);
    }
    
    @Transactional
    public void delete(Long id) throws Exception {
        Material material = findById(id);
        if (material != null) {
            if (material.getFileUrl() != null && !material.getFileUrl().isEmpty()) {
                try {
                    fileStorageService.deleteFile(material.getFileUrl());
                } catch (IOException e) {
                    System.err.println("Error deleting file: " + e.getMessage());
                }
            }
            materialRepository.deleteById(id);
        }
    }
    
    public List<Material> searchByTitle(Long tutorId, String keyword) {
        return materialRepository.searchByTitle(tutorId, keyword);
    }
    
    public List<Material> getRecentMaterials(Long tutorId) {
        return materialRepository.findTop10ByTutorIdOrderByUploadedAtDesc(tutorId);
    }
    
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