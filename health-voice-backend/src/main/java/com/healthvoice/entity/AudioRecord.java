package com.healthvoice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audio_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AudioRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "script_id", nullable = false)
    private MedicalScript script;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voice_config_id", nullable = false)
    private VoiceConfig voiceConfig;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "duration_seconds")
    @Builder.Default
    private Integer durationSeconds = 0;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "READY"; // READY, FAILED

    @Column(name = "listen_count", nullable = false)
    @Builder.Default
    private Long listenCount = 0L;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
