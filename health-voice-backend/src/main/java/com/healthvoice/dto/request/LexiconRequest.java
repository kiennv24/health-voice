package com.healthvoice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LexiconRequest {

    @NotBlank
    private String rawTerm;

    @NotBlank
    private String phoneticReplacement;

    private String category = "THUAT_NGU";
}
