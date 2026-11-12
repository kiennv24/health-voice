package com.healthvoice.controller;

import com.healthvoice.dto.request.AdviceTemplateRequest;
import com.healthvoice.dto.request.LexiconRequest;
import com.healthvoice.dto.response.ApiResponse;
import com.healthvoice.entity.AdviceTemplate;
import com.healthvoice.entity.MedicalLexicon;
import com.healthvoice.entity.User;
import com.healthvoice.repository.UserRepository;
import com.healthvoice.service.AdviceTemplateService;
import com.healthvoice.service.LexiconService;
import com.healthvoice.service.TtsProxyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/doctor")
@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
@RequiredArgsConstructor
public class DoctorController {

    private final AdviceTemplateService adviceTemplateService;
    private final LexiconService lexiconService;
    private final TtsProxyService ttsProxyService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsernameIgnoreCase(auth.getName())
                .or(() -> userRepository.findByUsername(auth.getName()))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin Bác sĩ: " + auth.getName()));
    }

    // =========================================================================
    // 1. Phác đồ dặn dò y tế mẫu (Advice Templates)
    // =========================================================================

    @GetMapping("/templates")
    public ResponseEntity<ApiResponse<List<AdviceTemplate>>> getMyTemplates() {
        User doctor = getCurrentUser();
        List<AdviceTemplate> list = adviceTemplateService.getDoctorTemplates(doctor.getId());
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phác đồ thành công", list));
    }

    @GetMapping("/templates/public")
    public ResponseEntity<ApiResponse<List<AdviceTemplate>>> getPublicTemplates() {
        List<AdviceTemplate> list = adviceTemplateService.getPublicTemplates();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phác đồ mẫu công khai thành công", list));
    }

    @PostMapping("/templates")
    public ResponseEntity<ApiResponse<AdviceTemplate>> createTemplate(@Valid @RequestBody AdviceTemplateRequest request) {
        User doctor = getCurrentUser();
        AdviceTemplate created = adviceTemplateService.createTemplate(request, doctor.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo phác đồ dặn dò mới thành công", created));
    }

    @PutMapping("/templates/{id}")
    public ResponseEntity<ApiResponse<AdviceTemplate>> updateTemplate(
            @PathVariable Long id,
            @Valid @RequestBody AdviceTemplateRequest request) {
        User doctor = getCurrentUser();
        AdviceTemplate updated = adviceTemplateService.updateTemplate(id, request, doctor.getId());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật phác đồ dặn dò thành công", updated));
    }

    @DeleteMapping("/templates/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTemplate(@PathVariable Long id) {
        User doctor = getCurrentUser();
        adviceTemplateService.deleteTemplate(id, doctor.getId());
        return ResponseEntity.ok(ApiResponse.success("Xóa phác đồ thành công", null));
    }

    // =========================================================================
    // 2. Thử nghiệm giọng đọc & chuẩn hóa ngữ âm lâm sàng
    // =========================================================================

    @PostMapping("/tts/preview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> previewSpeech(@RequestBody Map<String, Object> payload) {
        String text = (String) payload.getOrDefault("text", "");
        String voice = (String) payload.getOrDefault("voice", "banmai");
        double speed = payload.containsKey("speed") ? Double.parseDouble(payload.get("speed").toString()) : 0.0;
        String apiKey = (String) payload.getOrDefault("apiKey", null);

        if (text == null || text.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Văn bản thử nghiệm không được để trống"));
        }

        TtsProxyService.TtsProxyResult result = ttsProxyService.synthesize(text, voice, speed, apiKey);

        Map<String, Object> response = new HashMap<>();
        response.put("originalText", text);
        response.put("normalizedText", result.normalizedText());
        response.put("audioUrl", result.audioUrl());
        response.put("voiceCode", voice);
        response.put("speed", speed);
        response.put("latencyMs", result.latencyMs());
        response.put("fileSizeBytes", result.fileSizeBytes());
        response.put("engineUsed", result.engine());
        response.put("isCached", result.isCached());

        return ResponseEntity.ok(ApiResponse.success("Tổng hợp và nghe thử giọng đọc thành công", response));
    }

    // =========================================================================
    // 3. Từ điển phát âm y khoa (Medical Lexicon)
    // =========================================================================

    @GetMapping("/lexicon")
    public ResponseEntity<ApiResponse<List<MedicalLexicon>>> getLexiconList() {
        List<MedicalLexicon> list = lexiconService.getAllActive();
        return ResponseEntity.ok(ApiResponse.success("Lấy từ điển phát âm thành công", list));
    }

    @PostMapping("/lexicon")
    public ResponseEntity<ApiResponse<MedicalLexicon>> addLexicon(@Valid @RequestBody LexiconRequest request) {
        User doctor = getCurrentUser();
        MedicalLexicon created = lexiconService.createEntry(request, doctor.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thêm quy chuẩn phát âm y khoa thành công", created));
    }

    @PutMapping("/lexicon/{id}")
    public ResponseEntity<ApiResponse<MedicalLexicon>> updateLexicon(
            @PathVariable Long id,
            @Valid @RequestBody LexiconRequest request) {
        MedicalLexicon updated = lexiconService.updateEntry(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật quy chuẩn từ điển thành công", updated));
    }

    @DeleteMapping("/lexicon/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLexicon(@PathVariable Long id) {
        lexiconService.deleteEntry(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa mục từ điển", null));
    }

    @PostMapping("/lexicon/reload")
    public ResponseEntity<ApiResponse<Map<String, Object>>> reloadLexiconToTts() {
        Map<String, Object> result = lexiconService.syncWithTtsService();
        return ResponseEntity.ok(ApiResponse.success("Đồng bộ từ điển lên Python TTS Engine thành công", result));
    }
}

