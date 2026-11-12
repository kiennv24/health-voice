package com.healthvoice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PreviewTtsRequest {

    @NotBlank(message = "Đoạn văn bản phát âm thử không được để trống")
    private String text;

    private String voiceCode; // banmai, thuminh, leminh, giahuy, myan
}

