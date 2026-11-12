package com.healthvoice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "advice_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AdviceTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 100)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "audio_url", length = 500)
    private String audioUrl;

    @Column(name = "voice_code", length = 50)
    private String voiceCode;

    @Column(name = "is_public")
    @Builder.Default
    private Boolean isPublic = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
