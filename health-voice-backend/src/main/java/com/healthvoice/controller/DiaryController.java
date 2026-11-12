package com.healthvoice.controller;

import com.healthvoice.dto.response.ApiResponse;
import com.healthvoice.entity.HealthDiary;
import com.healthvoice.service.HealthDiaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/diaries", "/api/v1/diaries"})
@RequiredArgsConstructor
public class DiaryController {

    private final HealthDiaryService diaryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<HealthDiary>>> getDiaries(
            @RequestParam(required = false) Long userId) {
        List<HealthDiary> list = diaryService.getDiaries(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách nhật ký sức khỏe thành công", list));
    }

    @PostMapping("/process")
    public ResponseEntity<ApiResponse<HealthDiary>> processVoiceDiary(
            @RequestBody Map<String, Object> payload) {
        String transcript = (String) payload.getOrDefault("transcript", payload.getOrDefault("text", ""));
        Long userId = payload.containsKey("userId") && payload.get("userId") != null
                ? Long.parseLong(payload.get("userId").toString())
                : null;
        String voiceCode = (String) payload.getOrDefault("voiceCode", "thuminh");

        HealthDiary diary = diaryService.processVoiceDiary(transcript, userId, voiceCode);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Bóc tách chỉ số và đưa ra khuyến nghị thành công", diary));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDiary(@PathVariable Long id) {
        diaryService.deleteDiary(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa bản ghi nhật ký thành công", null));
    }
}

