package com.grade12.backend.controller;

import com.grade12.backend.dto.*;
import com.grade12.backend.service.AdminReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminReportController {

    @Autowired
    private AdminReportService adminReportService;

    // REMOVED duplicate /stats endpoint (already in AdminController)

    @GetMapping("/reports/user-distribution")
    public ResponseEntity<List<UserDistributionDTO>> getUserDistribution(@RequestParam(defaultValue = "week") String range) {
        return ResponseEntity.ok(adminReportService.getUserDistribution(range));
    }

    @GetMapping("/reports/activity")
    public ResponseEntity<List<ActivityDataDTO>> getDailyActivity(@RequestParam(defaultValue = "week") String range) {
        return ResponseEntity.ok(adminReportService.getDailyActivity(range));
    }

    @GetMapping("/reports/top-performers")
    public ResponseEntity<List<TopPerformerDTO>> getTopPerformers() {
        return ResponseEntity.ok(adminReportService.getTopPerformers());
    }

    @GetMapping("/reports/user-trend")
    public ResponseEntity<TrendDataDTO> getUserTrend(@RequestParam(defaultValue = "week") String range) {
        return ResponseEntity.ok(adminReportService.getUserTrend(range));
    }

    @GetMapping("/reports/progress-distribution")
    public ResponseEntity<List<ProgressDistributionDTO>> getProgressDistribution() {
        return ResponseEntity.ok(adminReportService.getProgressDistribution());
    }

    @GetMapping("/reports/popular-content")
    public ResponseEntity<List<PopularContentDTO>> getPopularContent() {
        return ResponseEntity.ok(adminReportService.getPopularContent());
    }

    @GetMapping("/reports/weekly-uploads")
    public ResponseEntity<List<WeeklyUploadsDTO>> getWeeklyUploads(@RequestParam(defaultValue = "week") String range) {
        return ResponseEntity.ok(adminReportService.getWeeklyUploads(range));
    }

    @GetMapping("/reports/subject-stats")
    public ResponseEntity<List<SubjectStatDTO>> getSubjectStats() {
        return ResponseEntity.ok(adminReportService.getSubjectStats());
    }

    @GetMapping("/reports/quiz-performance")
    public ResponseEntity<List<QuizPerformanceDTO>> getQuizPerformance() {
        return ResponseEntity.ok(adminReportService.getQuizPerformance());
    }

    @GetMapping("/reports/subject-scores")
    public ResponseEntity<List<SubjectStatDTO>> getSubjectScores() {
        return ResponseEntity.ok(adminReportService.getSubjectScores());
    }
}