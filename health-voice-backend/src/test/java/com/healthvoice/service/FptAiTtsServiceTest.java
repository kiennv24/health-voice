package com.healthvoice.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.File;

import static org.junit.jupiter.api.Assertions.*;

class FptAiTtsServiceTest {

    @Test
    @DisplayName("Kiểm thử tổng hợp FPT.AI TTS và lưu file MP3")
    void testSynthesizeAndSaveAudio() {
        FptAiTtsService service = new FptAiTtsService();
        ReflectionTestUtils.setField(service, "apiUrl", "https://api.fpt.ai/hmi/tts/v5");
        ReflectionTestUtils.setField(service, "apiKey", "QT2SnOFWi3P4pekGKV1TkuzQAKJUcNgZ");
        ReflectionTestUtils.setField(service, "uploadDir", "./uploads/audios");

        String testText = "Chào mừng quý vị đến với nền tảng Health Voice.";
        FptAiTtsService.TtsResult result = service.synthesizeAndSaveAudio(testText, "banmai", 0.0);

        assertNotNull(result);
        assertNotNull(result.getFileName());
        assertTrue(result.getFileSize() > 0);
        System.out.println("Generated file: " + result.getFileName() + " (" + result.getFileSize() + " bytes)");

        File savedFile = new File("./uploads/audios/" + result.getFileName());
        assertTrue(savedFile.exists(), "Tệp âm thanh MP3 vật lý phải tồn tại trên ổ cứng");
    }
}

