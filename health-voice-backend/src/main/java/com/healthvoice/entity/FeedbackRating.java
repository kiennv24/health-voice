package com.healthvoice.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "feedback_ratings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class FeedbackRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audio_record_id", nullable = false)
    private AudioRecord audioRecord;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "mos_score", nullable = false)
    private Integer mosScore;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public AudioRecord getAudio() {
        return this.audioRecord;
    }

    public void setAudio(AudioRecord audio) {
        this.audioRecord = audio;
    }

    public Integer getRatingScore() {
        return this.mosScore;
    }

    public void setRatingScore(Integer ratingScore) {
        this.mosScore = ratingScore;
    }
}
