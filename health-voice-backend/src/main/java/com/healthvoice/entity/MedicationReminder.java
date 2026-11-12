package com.healthvoice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "medication_reminders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationReminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "medicine_name", length = 100, nullable = false)
    private String medicineName;

    @Column(name = "dosage", length = 100, nullable = false)
    private String dosage;

    @Column(name = "reminder_time", nullable = false)
    private LocalTime reminderTime;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "voice_code", length = 30)
    @Builder.Default
    private String voiceCode = "banmai";

    @Column(name = "audio_url", columnDefinition = "TEXT")
    private String audioUrl;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "last_triggered_date")
    private LocalDate lastTriggeredDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

