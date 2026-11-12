package com.healthvoice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "triage_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TriageRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "rule_code", length = 50, nullable = false, unique = true)
    private String ruleCode;

    @Column(name = "category", length = 50, nullable = false)
    private String category;

    @Column(name = "trigger_keywords", columnDefinition = "TEXT", nullable = false)
    private String triggerKeywords;

    @Column(name = "risk_level", length = 20, nullable = false)
    private String riskLevel; // EMERGENCY, HIGH, MEDIUM, LOW

    @Column(name = "priority")
    @Builder.Default
    private Integer priority = 1;

    @Column(name = "advice_text", columnDefinition = "TEXT", nullable = false)
    private String adviceText;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

