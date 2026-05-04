package com.grade12.backend.service;

import com.grade12.backend.model.Material;
import com.grade12.backend.model.Tutor;
import com.grade12.backend.model.Subject;
import com.grade12.backend.repository.MaterialRepository;
import com.grade12.backend.repository.TutorRepository;
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
    private TutorRepository tutorRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private FileStorageService fileStorageService;

    // ─── Queries ─────────────────────────────────────────────────────────────

    public List<Material> findByTutorId(Long tutorId) {
        return materialRepository.findByTutorId(tutorId);
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

        return materialRepository.save(material);
    }

    @Transactional
    public void delete(Long id) throws Exception {
        Material material = findById(id);
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