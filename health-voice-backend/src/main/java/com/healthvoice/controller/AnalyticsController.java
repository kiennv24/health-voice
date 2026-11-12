package com.healthvoice.controller;

import com.healthvoice.dto.response.ApiResponse;
import com.healthvoice.entity.FeedbackRating;
import com.healthvoice.service.RatingAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AnalyticsController {

    private final RatingAnalyticsService ratingAnalyticsService;

    /**
     * Lấy báo cáo thống kê cho trang Quản trị Hệ thống (Admin Portal)
     */
    @GetMapping({"/analytics/dashboard", "/admin/analytics"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardAnalytics() {
        Map<String, Object> data = ratingAnalyticsService.getOverallAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Lấy dữ liệu thống kê thành công", data));
    }

    /**
     * Gửi điểm đánh giá MOS (1 - 5 sao) cho bản ghi Audio
     */
    @PostMapping({"/analytics/ratings", "/audios/{audioId}/ratings", "/audios/{audioId}/rating"})
    public ResponseEntity<ApiResponse<FeedbackRating>> submitMosRating(
            @PathVariable(required = false) Long audioId,
            @RequestBody Map<String, Object> payload) {

        Long targetAudioId = audioId != null
                ? audioId
                : Long.valueOf(payload.getOrDefault("audioRecordId", payload.get("audioId")).toString());

        int score = Integer.parseInt(payload.getOrDefault("mosScore", payload.getOrDefault("score", payload.getOrDefault("ratingScore", 5))).toString());
        String comment = (String) payload.getOrDefault("comment", "");

        Long userId = payload.containsKey("userId") && payload.get("userId") != null
                ? Long.valueOf(payload.get("userId").toString())
                : null;

        FeedbackRating saved = ratingAnalyticsService.submitRating(targetAudioId, userId, score, comment);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đánh giá MOS thành công", saved));
    }

    /**
     * Lấy danh sách đánh giá của kịch bản
     */
    @GetMapping("/analytics/scripts/{scriptId}/ratings")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getScriptRatings(@PathVariable Long scriptId) {
        Map<String, Object> details = ratingAnalyticsService.getScriptRatingDetails(scriptId);
        return ResponseEntity.ok(ApiResponse.success("Lấy đánh giá kịch bản thành công", details));
    }
}
