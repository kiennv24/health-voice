package com.healthvoice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "voice_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoiceConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "voice_name", nullable = false, length = 100)
    private String voiceName;

    @Column(name = "voice_code", nullable = false, unique = true, length = 100)
    private String voiceCode;

    @Column(nullable = false, length = 10)
    private String gender; // MALE, FEMALE

    @Column(nullable = false, length = 50)
    private String region; // Bac, Trung, Nam

    @Column(name = "default_speed")
    @Builder.Default
    private Float defaultSpeed = 1.0f;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
