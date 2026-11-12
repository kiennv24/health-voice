package com.healthvoice.dto.response;

import com.healthvoice.entity.HealthPodcast;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PodcastResponse {

    private Long id;
    private String title;
    private String slug;
    private String category;
    private String categoryDisplayName;
    private String summary;
    private String content;
    private String thumbnailUrl;
    private String defaultVoice;
    private String audioUrl;
    private Integer audioDurationSeconds;
    private String status;
    private Integer viewsCount;
    private Integer listenCount;
    private Long authorId;
    private String authorName;
    private String authorRole;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PodcastResponse fromEntity(HealthPodcast podcast) {
        if (podcast == null) return null;
        return PodcastResponse.builder()
                .id(podcast.getId())
                .title(podcast.getTitle())
                .slug(podcast.getSlug())
                .category(podcast.getCategory())
                .categoryDisplayName(com.healthvoice.entity.PodcastCategory.getDisplayNameOrCode(podcast.getCategory()))
                .summary(podcast.getSummary())
                .content(podcast.getContent())
                .thumbnailUrl(podcast.getThumbnailUrl())
                .defaultVoice(podcast.getDefaultVoice())
                .audioUrl(podcast.getAudioUrl())
                .audioDurationSeconds(podcast.getAudioDurationSeconds())
                .status(podcast.getStatus())
                .viewsCount(podcast.getViewsCount())
                .listenCount(podcast.getListenCount())
                .authorId(podcast.getAuthor() != null ? podcast.getAuthor().getId() : null)
                .authorName(podcast.getAuthor() != null ? podcast.getAuthor().getFullName() : "Bác sĩ Chuyên khoa")
                .authorRole(podcast.getAuthor() != null && podcast.getAuthor().getRole() != null ? podcast.getAuthor().getRole().getName() : "ROLE_DOCTOR")
                .createdAt(podcast.getCreatedAt())
                .updatedAt(podcast.getUpdatedAt())
                .build();
    }
}

