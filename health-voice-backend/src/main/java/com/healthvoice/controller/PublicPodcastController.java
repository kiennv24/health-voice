package com.healthvoice.controller;

import com.healthvoice.dto.response.ApiResponse;
import com.healthvoice.dto.response.PodcastResponse;
import com.healthvoice.service.PatientPodcastService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping({"/api/public/podcasts", "/api/podcasts"})
@RequiredArgsConstructor
public class PublicPodcastController {

    private final PatientPodcastService patientPodcastService;

    /**
     * Lấy danh sách Podcast công khai cho bệnh nhân & độc giả
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<PodcastResponse>>> getPodcasts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PodcastResponse> result = patientPodcastService.getPublicPodcasts(category, keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success("Tải danh sách podcast thành công", result));
    }

    /**
     * Lấy top 5 podcast được nghe nhiều nhất
     */
    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<PodcastResponse>>> getFeaturedPodcasts() {
        List<PodcastResponse> list = patientPodcastService.getFeaturedPodcasts();
        return ResponseEntity.ok(ApiResponse.success("Tải podcast nổi bật thành công", list));
    }

    /**
     * Xem chi tiết bài viết Podcast theo Slug & Tăng lượt xem
     */
    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<PodcastResponse>> getPodcastBySlug(@PathVariable String slug) {
        PodcastResponse podcast = patientPodcastService.getPodcastBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success("Tải bài viết thành công", podcast));
    }

    /**
     * Ghi nhận lượt nghe Podcast
     */
    @PostMapping("/{id}/track-listen")
    public ResponseEntity<ApiResponse<Void>> trackListen(@PathVariable Long id) {
        patientPodcastService.trackListen(id);
        return ResponseEntity.ok(ApiResponse.success("Đã ghi nhận lượt nghe", null));
    }

    /**
     * Đổi giọng đọc FPT.AI (Bắc / Trung / Nam)
     */
    @PostMapping("/{id}/voice")
    public ResponseEntity<ApiResponse<PodcastResponse>> regenerateVoice(
            @PathVariable Long id,
            @RequestParam String voiceCode) {
        PodcastResponse updated = patientPodcastService.regenerateVoice(id, voiceCode);
        return ResponseEntity.ok(ApiResponse.success("Đã chuyển đổi giọng đọc FPT.AI thành công", updated));
    }
}

