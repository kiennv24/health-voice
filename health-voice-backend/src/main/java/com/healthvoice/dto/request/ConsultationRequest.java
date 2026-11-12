package com.healthvoice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ConsultationRequest {

    @NotBlank
    private String symptomText;

    private String voiceCode = "banmai";

    private Double speed = 0.0;

    private Long sessionId; // null = tạo session mới
}
