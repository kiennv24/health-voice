package com.healthvoice.controller;

import com.healthvoice.dto.response.ApiResponse;
import com.healthvoice.entity.AudioRecord;
import com.healthvoice.entity.VoiceConfig;
import com.healthvoice.repository.VoiceConfigRepository;
import com.healthvoice.service.AudioRecordService;
import com.healthvoice.service.TextNormalizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller Studio xử lý chuẩn hóa và tổng hợp giọng nói AI FPT.AI
 */
@Slf4j
@RestController
@RequestMapping({"/api/voice-studio", "/api/v1/voice-studio"})
@RequiredArgsConstructor
public class VoiceStudioController {

    private final AudioRecordService audioRecordService;
    private final TextNormalizationService textNormalizationService;
    private final VoiceConfigRepository voiceConfigRepository;

    /**
     * Chuẩn hóa văn bản kịch bản y khoa
     * Endpoint: POST /api/voice-studio/normalize
     */
    @PostMapping("/normalize")
    public ResponseEntity<ApiResponse<Map<String, Object>>> normalizeScript(@RequestBody Map<String, Object> request) {
        String rawText = (String) request.getOrDefault("rawText", request.getOrDefault("text", ""));
        if (rawText == null || rawText.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Nội dung thô không được để trống"));
        }

        String normalized = textNormalizationService.normalizeMedicalText(rawText);

        Map<String, Object> response = new HashMap<>();
        response.put("rawText", rawText);
        response.put("normalizedText", normalized);
        response.put("wordCount", normalized.split("\\s+").length);

        return ResponseEntity.ok(ApiResponse.success("Chuẩn hóa thuật ngữ y khoa thành công", response));
    }

    /**
     * Tổng hợp kịch bản thành giọng nói AI qua Cloud API FPT.AI
     * Endpoint: POST /api/voice-studio/tts hoặc POST /api/voice-studio/generate
     */
    @PostMapping({"/tts", "/generate"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> synthesizeSpeech(@RequestBody Map<String, Object> payload) {
        Long scriptId = Long.parseLong(payload.get("scriptId").toString());
        Integer voiceConfigId = Integer.parseInt(payload.get("voiceConfigId").toString());
        Double speed = payload.containsKey("speed") ? Double.parseDouble(payload.get("speed").toString()) : 0.0;
        String customText = payload.containsKey("customText") ? (String) payload.get("customText") : null;

        log.info("Nhận yêu cầu tổng hợp TTS: ScriptID={}, VoiceConfigID={}, Speed={}, CustomTextLength={}", 
                scriptId, voiceConfigId, speed, (customText != null ? customText.length() : 0));
        AudioRecord audio = audioRecordService.generateAudioForScript(scriptId, voiceConfigId, speed, customText);

        Map<String, Object> data = new HashMap<>();
        data.put("audioId", audio.getId());
        data.put("id", audio.getId());
        data.put("scriptId", scriptId);
        data.put("fileName", audio.getFilePath());
        data.put("filePath", audio.getFilePath());
        data.put("streamUrl", "/api/audio/stream/" + audio.getId());
        data.put("durationSeconds", audio.getDurationSeconds());
        data.put("status", audio.getStatus());
        data.put("fileSize", audio.getFileSize());

        return ResponseEntity.ok(ApiResponse.success("Tổng hợp giọng đọc FPT.AI thành công", data));
    }

    /**
     * Lấy danh sách cấu hình giọng đọc FPT.AI đang hoạt động
     */
    @GetMapping({"/voices", "/api/voices"})
    public ResponseEntity<ApiResponse<List<VoiceConfig>>> getAvailableVoices() {
        List<VoiceConfig> voices = voiceConfigRepository.findByIsActiveTrue();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách giọng đọc FPT.AI thành công", voices));
    }
}
