package com.healthvoice.controller;

import com.healthvoice.dto.response.ApiResponse;
import com.healthvoice.entity.VoiceConfig;
import com.healthvoice.repository.VoiceConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/voices", "/api/v1/voices", "/api/v1/voice-configs"})
@RequiredArgsConstructor
public class VoiceConfigController {

    private final VoiceConfigRepository voiceConfigRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<VoiceConfig>>> getAllVoices() {
        List<VoiceConfig> voices = voiceConfigRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách cấu hình giọng nói thành công", voices));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<VoiceConfig>>> getActiveVoices() {
        List<VoiceConfig> voices = voiceConfigRepository.findByIsActiveTrue();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách cấu hình giọng nói đang hoạt động thành công", voices));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VoiceConfig>> createVoiceConfig(@RequestBody VoiceConfig config) {
        if (config.getIsActive() == null) config.setIsActive(true);
        if (config.getDefaultSpeed() == null) config.setDefaultSpeed(1.0f);
        VoiceConfig saved = voiceConfigRepository.save(config);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo cấu hình giọng đọc thành công", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VoiceConfig>> updateVoiceConfig(@PathVariable Integer id, @RequestBody VoiceConfig updated) {
        VoiceConfig config = voiceConfigRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy cấu hình giọng: " + id));
        if (updated.getVoiceName() != null) config.setVoiceName(updated.getVoiceName());
        if (updated.getVoiceCode() != null) config.setVoiceCode(updated.getVoiceCode());
        if (updated.getGender() != null) config.setGender(updated.getGender());
        if (updated.getRegion() != null) config.setRegion(updated.getRegion());
        if (updated.getDefaultSpeed() != null) config.setDefaultSpeed(updated.getDefaultSpeed());
        if (updated.getIsActive() != null) config.setIsActive(updated.getIsActive());
        VoiceConfig saved = voiceConfigRepository.save(config);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật cấu hình giọng đọc thành công", saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVoiceConfig(@PathVariable Integer id) {
        voiceConfigRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa cấu hình giọng đọc thành công", null));
    }
}
