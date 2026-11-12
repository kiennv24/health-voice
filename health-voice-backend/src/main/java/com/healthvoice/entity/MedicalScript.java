package com.healthvoice.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "medical_scripts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MedicalScript {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "summary_text", columnDefinition = "TEXT")
    private String summaryText;

    @Column(name = "raw_content", columnDefinition = "LONGTEXT", nullable = false)
    private String rawContent;

    @Column(name = "normalized_content", columnDefinition = "LONGTEXT")
    private String normalizedContent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    @Column(name = "status", length = 30, nullable = false)
    @Builder.Default
    private String status = "DRAFT"; // DRAFT, PROCESSED, PUBLISHED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public User getAuthor() {
        return this.doctor;
    }

    public void setAuthor(User author) {
        this.doctor = author;
    }
}
