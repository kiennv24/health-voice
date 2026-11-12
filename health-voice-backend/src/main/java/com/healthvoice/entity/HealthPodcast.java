package com.healthvoice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "health_podcasts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthPodcast {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    @Column(nullable = false, length = 50)
    private String category; // TIM_MACH, THAN_KINH, CO_XUONG_KHOP, DINH_DUONG, SO_CUU

    @Column(columnDefinition = "TEXT", nullable = false)
    private String summary;

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String content;

    @Column(name = "thumbnail_url", columnDefinition = "TEXT", nullable = false)
    private String thumbnailUrl;

    @Column(name = "default_voice", length = 30)
    @Builder.Default
    private String defaultVoice = "banmai";

    @Column(name = "audio_url", columnDefinition = "TEXT")
    private String audioUrl;

    @Column(name = "audio_duration_seconds")
    @Builder.Default
    private Integer audioDurationSeconds = 0;

    @Column(length = 20)
    @Builder.Default
    private String status = "PUBLISHED"; // DRAFT, PUBLISHED, ARCHIVED

    @Column(name = "views_count")
    @Builder.Default
    private Integer viewsCount = 0;

    @Column(name = "listen_count")
    @Builder.Default
    private Integer listenCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

