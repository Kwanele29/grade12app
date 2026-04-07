package com.grade12.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Arrays;

@Entity
@Table(name = "materials")
public class Material {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "tutor_id", nullable = false)
    private User tutor;  // Using User instead of Tutor
    
    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;
    
    @Column(name = "material_type")
    private String materialType; // pdf, document, presentation, video, image, etc.
    
    @Column(name = "file_url")
    private String fileUrl;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    private String topic;
    
    @Column(columnDefinition = "TEXT")
    private String tags; // Store as JSON or comma-separated
    
    private String status; // draft, published, archived
    
    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;
    
    private Integer downloads = 0;
    
    private Integer views = 0;
    
    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
        if (downloads == null) downloads = 0;
        if (views == null) views = 0;
        if (status == null) status = "published";
    }
    
    // Helper method to get tags as array
    public String[] getTags() {
        if (tags == null || tags.isEmpty()) return new String[0];
        return tags.split(",");
    }
    
    public void setTags(String[] tags) {
        if (tags == null || tags.length == 0) {
            this.tags = null;
        } else {
            this.tags = String.join(",", tags);
        }
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public User getTutor() { return tutor; }
    public void setTutor(User tutor) { this.tutor = tutor; }
    
    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }
    
    public String getMaterialType() { return materialType; }
    public void setMaterialType(String materialType) { this.materialType = materialType; }
    
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    
    public String getTagsAsString() { return tags; }
    public void setTagsAsString(String tags) { this.tags = tags; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    
    public Integer getDownloads() { return downloads; }
    public void setDownloads(Integer downloads) { this.downloads = downloads; }
    
    public Integer getViews() { return views; }
    public void setViews(Integer views) { this.views = views; }
}