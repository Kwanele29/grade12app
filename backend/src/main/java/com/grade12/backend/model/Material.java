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
<<<<<<< HEAD

    @Column(length = 1000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_id", nullable = false)
    @JsonIgnoreProperties({"materials", "password", "resetToken", "resetTokenExpiryDate"})
    private Tutor tutor;

    @ManyToOne(fetch = FetchType.LAZY)
=======
    
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "tutor_id", nullable = false)
    private User tutor;  // Using User instead of Tutor
    
    @ManyToOne
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
    @JoinColumn(name = "subject_id")
    private Subject subject;
<<<<<<< HEAD

    private String materialType;
    private String fileUrl;
    private String thumbnailUrl;
    private Long fileSize;

    private Integer downloads = 0;
    private Integer views = 0;

    private String topic;

    // ✅ NEW: stores an external video link (YouTube, Vimeo, etc.)
    @Column(name = "video_link", length = 500)
    private String videoLink;

    @Convert(converter = StringArrayConverter.class)
    private String[] tags;

    private String status;

    private LocalDateTime uploadedAt;
    private LocalDateTime updatedAt;

    public Material() {}

    // ─── Getters & Setters ───────────────────────────────────────────────────

=======
    
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
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
<<<<<<< HEAD

    public Tutor getTutor() { return tutor; }
    public void setTutor(Tutor tutor) { this.tutor = tutor; }

=======
    
    public User getTutor() { return tutor; }
    public void setTutor(User tutor) { this.tutor = tutor; }
    
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }

    public String getMaterialType() { return materialType; }
    public void setMaterialType(String materialType) { this.materialType = materialType; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
<<<<<<< HEAD

    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public Integer getDownloads() { return downloads; }
    public void setDownloads(Integer downloads) { this.downloads = downloads; }

    public Integer getViews() { return views; }
    public void setViews(Integer views) { this.views = views; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    // ✅ NEW getter/setter for videoLink
    public String getVideoLink() { return videoLink; }
    public void setVideoLink(String videoLink) { this.videoLink = videoLink; }

    public String[] getTags() { return tags; }
    public void setTags(String[] tags) { this.tags = tags; }

=======
    
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    
    public String getTagsAsString() { return tags; }
    public void setTagsAsString(String tags) { this.tags = tags; }
    
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
<<<<<<< HEAD

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getSubjectName() {
        return subject != null ? subject.getName() : null;
    }

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
        updatedAt  = LocalDateTime.now();
        if (downloads == null) downloads = 0;
        if (views     == null) views     = 0;
        if (status    == null) status    = "published";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

// ─── String[] <-> CSV converter ─────────────────────────────────────────────
@Converter
class StringArrayConverter implements AttributeConverter<String[], String> {

    private static final String SEPARATOR = ",";

    @Override
    public String convertToDatabaseColumn(String[] attribute) {
        if (attribute == null || attribute.length == 0) return "";
        return String.join(SEPARATOR, attribute);
    }

    @Override
    public String[] convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) return new String[0];
        return dbData.split(SEPARATOR);
    }
=======
    
    public Integer getDownloads() { return downloads; }
    public void setDownloads(Integer downloads) { this.downloads = downloads; }
    
    public Integer getViews() { return views; }
    public void setViews(Integer views) { this.views = views; }
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
}