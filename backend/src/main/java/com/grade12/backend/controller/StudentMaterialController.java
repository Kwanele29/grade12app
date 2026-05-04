package com.grade12.backend.controller;

import com.grade12.backend.model.Material;
import com.grade12.backend.model.StudentSubject;
import com.grade12.backend.model.User;
import com.grade12.backend.repository.MaterialRepository;
import com.grade12.backend.repository.StudentSubjectRepository;
import com.grade12.backend.repository.UserRepository;
import com.grade12.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class StudentMaterialController {

    private final MaterialRepository materialRepository;
    private final StudentSubjectRepository studentSubjectRepository;
    private final UserRepository userRepository;

    @GetMapping("/materials")
    public ResponseEntity<?> getMyMaterials(@AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            User student = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

            // Get all subject IDs the student is enrolled in
            List<Long> subjectIds = studentSubjectRepository.findByStudent(student)
                .stream()
                .map(ss -> ss.getSubject().getId())
                .collect(Collectors.toList());

            if (subjectIds.isEmpty()) {
                return ResponseEntity.ok(new ArrayList<>());
            }

            // Fetch materials that belong to those subjects
            List<Material> materials = materialRepository.findBySubjectIdIn(subjectIds);
            return ResponseEntity.ok(materials);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}