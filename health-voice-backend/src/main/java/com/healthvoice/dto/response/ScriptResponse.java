package com.healthvoice.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScriptResponse {

    private Long id;
    private String title;
    private String summaryText;
    private String rawContent;
    private String normalizedContent;
    private Long categoryId;
    private String categoryName;
    private Long authorId;
    private String authorName;
    private String doctorName;
    private String status;

    // Thông tin Audio Record liên kết (nếu có)
    private Long audioId;
    private String audioFileName;
    private String audioUrl;
    private Integer durationSeconds;
    private Long listenCount;
    private Double averageMosScore;
    private Integer voiceId;
    private String voiceName;
    private String voiceCode;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
}
