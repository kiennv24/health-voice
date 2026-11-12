package com.healthvoice.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScriptUpdateRequest {

    @Size(max = 255, message = "Tiêu đề không được vượt quá 255 ký tự")
    private String title;

    private String rawContent;

    private String normalizedContent;

    private Long categoryId;

    private String status; // DRAFT, NORMALIZED, CONVERTED
}
