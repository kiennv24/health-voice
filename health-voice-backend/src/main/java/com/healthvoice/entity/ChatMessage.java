package com.healthvoice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ConsultationSession session;

    @Column(name = "sender_type", length = 20)
    private String senderType; // PATIENT, BOT, DOCTOR

    @Column(name = "raw_content", columnDefinition = "TEXT")
    private String rawContent;

    @Column(name = "normalized_content", columnDefinition = "TEXT")
    private String normalizedContent;

    @Column(name = "audio_url", length = 500)
    private String audioUrl;

    @Column(name = "voice_code", length = 50)
    private String voiceCode;

    @Column(name = "latency_ms")
    @Builder.Default
    private Integer latencyMs = 0;

    @Column(name = "is_cached")
    @Builder.Default
    private Boolean isCached = false;

    @Column(name = "risk_level", length = 20)
    @Builder.Default
    private String riskLevel = "LOW";

    @Column(name = "rule_code", length = 50)
    private String ruleCode;

    @Column(name = "quick_replies", columnDefinition = "TEXT")
    private String quickReplies;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
