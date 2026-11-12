package com.healthvoice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePodcastRequest {
    private String title;
    private String category;
    private String summary;
    private String content;
    private String thumbnailUrl;
    private String defaultVoice;
    private String status;
}

