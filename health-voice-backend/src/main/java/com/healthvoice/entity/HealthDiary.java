package com.healthvoice.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "health_diaries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HealthDiary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "log_date")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime logDate;

    @Column(name = "raw_transcript", columnDefinition = "TEXT", nullable = false)
    private String rawTranscript;

    @Column(name = "audio_path", length = 500)
    private String audioPath;

    @Column(name = "systolic_bp")
    private Integer systolicBp; // Huyết áp tâm thu (mmHg)

    @Column(name = "diastolic_bp")
    private Integer diastolicBp; // Huyết áp tâm trương (mmHg)

    @Column(name = "heart_rate")
    private Integer heartRate; // Nhịp tim (bpm)

    @Column(name = "blood_glucose")
    private Float bloodGlucose; // Đường huyết (mmol/L)

    @Column(columnDefinition = "TEXT")
    private String symptoms; // Triệu chứng

    @Column(name = "alert_level", length = 20)
    @Builder.Default
    private String alertLevel = "NORMAL"; // NORMAL, WARNING, DANGER

    @Column(name = "doctor_advice", columnDefinition = "TEXT")
    private String doctorAdvice; // Lời dặn dò y tế tự động

    @Column(name = "advice_audio_path", length = 500)
    private String adviceAudioPath;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.logDate == null) {
            this.logDate = LocalDateTime.now();
        }
    }
}

