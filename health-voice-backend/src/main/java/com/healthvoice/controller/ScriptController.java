package com.healthvoice.controller;

import com.healthvoice.dto.request.ScriptCreateRequest;
import com.healthvoice.dto.request.ScriptUpdateRequest;
import com.healthvoice.dto.response.ApiResponse;
import com.healthvoice.dto.response.ScriptResponse;
import com.healthvoice.entity.AudioRecord;
import com.healthvoice.service.MedicalScriptService;
import com.healthvoice.service.TextNormalizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/scripts", "/api/v1/scripts"})
@RequiredArgsConstructor
public class ScriptController {

    private final MedicalScriptService medicalScriptService;
    private final TextNormalizationService textNormalizationService;

    /**
     * Chuẩn hóa văn bản y tế trực tiếp từ chuỗi thô (Xem trước trước khi sinh audio)
     */
    @PostMapping("/normalize")
    public ResponseEntity<ApiResponse<Map<String, String>>> normalizeRawText(
            @RequestBody Map<String, String> payload) {
        String raw = payload.getOrDefault("rawContent", payload.getOrDefault("rawText", payload.getOrDefault("text", "")));
        String normalized = textNormalizationService.normalizeMedicalText(raw);
        Map<String, String> result = Map.of(
                "rawContent", raw,
                "normalizedContent", normalized
        );
        return ResponseEntity.ok(ApiResponse.success("Chuẩn hóa văn bản y tế thành công", result));
    }

    /**
     * Tạo mới kịch bản tư vấn sức khỏe
     */
    @PostMapping
    public ResponseEntity<?> createScript(@Valid @RequestBody ScriptCreateRequest request) {
        ScriptResponse response = medicalScriptService.createScript(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo kịch bản y tế thành công", response));
    }

    /**
     * Lấy danh sách kịch bản (phân trang và tìm kiếm theo từ khóa)
     */
    @GetMapping
    public ResponseEntity<?> getScripts(
            @RequestParam(required = false) String keyword,
            @PageableDefault(page = 0, size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<ScriptResponse> result;
        if (keyword != null && !keyword.isBlank()) {
            result = medicalScriptService.searchScripts(keyword.trim(), pageable);
        } else {
            result = medicalScriptService.getAllScripts(pageable);
        }

        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách kịch bản thành công", result));
    }

    /**
     * Lấy danh sách các bài viết đã xuất bản (PUBLISHED)
     */
    @GetMapping("/published")
    public ResponseEntity<?> getPublishedScripts() {
        List<ScriptResponse> list = medicalScriptService.getPublishedScripts();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách bài viết đã xuất bản", list));
    }

    /**
     * Lấy chi tiết kịch bản theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getScriptById(@PathVariable Long id) {
        ScriptResponse response = medicalScriptService.getScriptById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin kịch bản thành công", response));
    }

    /**
     * Cập nhật kịch bản theo ID
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateScript(
            @PathVariable Long id,
            @RequestBody ScriptUpdateRequest request) {
        ScriptResponse response = medicalScriptService.updateScript(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật kịch bản thành công", response));
    }

    /**
     * Chuẩn hóa nội dung kịch bản theo ID
     */
    @PostMapping("/{id}/normalize")
    public ResponseEntity<?> normalizeScript(@PathVariable Long id) {
        ScriptResponse response = medicalScriptService.normalizeScriptContent(id);
        return ResponseEntity.ok(ApiResponse.success("Chuẩn hóa kịch bản thành công", response));
    }

    /**
     * Tổng hợp âm thanh FPT.AI cho kịch bản
     */
    @PostMapping("/{id}/tts")
    public ResponseEntity<?> synthesizeAudioForScript(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        Integer voiceConfigId = Integer.parseInt(payload.get("voiceConfigId").toString());
        Double speed = payload.containsKey("speed") ? Double.parseDouble(payload.get("speed").toString()) : 0.0;

        AudioRecord audio = medicalScriptService.generatePodcastAudio(id, voiceConfigId, speed);
        return ResponseEntity.ok(ApiResponse.success("Tổng hợp giọng nói FPT.AI thành công", audio));
    }

    /**
     * Xuất bản bài viết kịch bản y khoa
     */
    @PostMapping("/{id}/publish")
    public ResponseEntity<?> publishScript(@PathVariable Long id) {
        ScriptResponse response = medicalScriptService.publishScript(id);
        return ResponseEntity.ok(ApiResponse.success("Xuất bản bài viết thành công", response));
    }

    /**
     * Xóa kịch bản
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteScript(@PathVariable Long id) {
        medicalScriptService.deleteScript(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa kịch bản thành công", null));
    }
}
