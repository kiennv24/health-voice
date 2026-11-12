package com.healthvoice.util;

import com.healthvoice.service.TextNormalizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Tiện ích chuẩn hóa nội dung văn bản y tế trước khi đưa vào TTS Engine
 */
@Component
@RequiredArgsConstructor
public class MedicalTextNormalizer {

    private final TextNormalizationService textNormalizationService;

    public String normalize(String text) {
        return textNormalizationService.normalize(text);
    }
}
