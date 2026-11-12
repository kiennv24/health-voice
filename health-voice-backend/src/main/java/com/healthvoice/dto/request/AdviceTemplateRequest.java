package com.healthvoice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdviceTemplateRequest {

    @NotBlank
    private String title;

    private String category;

    @NotBlank
    private String content;

    private String voiceCode = "banmai";

    private Boolean isPublic = false;
}
