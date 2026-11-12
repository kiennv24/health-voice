package com.healthvoice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audio_cache")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AudioCache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "text_hash", nullable = false, unique = true, length = 64)
    private String textHash;

    @Column(name = "audio_url", nullable = false, length = 500)
    private String audioUrl;

    @Column(name = "voice_code", length = 50)
    private String voiceCode;

    @Column
    private Double speed;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "hit_count")
    @Builder.Default
    private Long hitCount = 0L;

    @Column(name = "duration_seconds")
    private Double durationSeconds;

    @Column(name = "engine_used", length = 50)
    private String engineUsed;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
