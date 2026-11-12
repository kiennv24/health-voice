package com.healthvoice.service;

import com.healthvoice.dto.response.PodcastResponse;
import com.healthvoice.entity.HealthPodcast;
import com.healthvoice.exception.ResourceNotFoundException;
import com.healthvoice.repository.HealthPodcastRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PatientPodcastService {

    private final HealthPodcastRepository podcastRepository;
    private final TtsProxyService ttsProxyService;

    /**
     * Lấy danh sách Podcast công khai theo chuyên khoa & từ khóa tìm kiếm
     */
    @Transactional(readOnly = true)
    public Page<PodcastResponse> getPublicPodcasts(String category, String keyword, Pageable pageable) {
        String cleanCategory = (category != null && !category.equalsIgnoreCase("ALL")) ? category : null;
        String cleanKeyword = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;

        return podcastRepository.searchPublicPodcasts(cleanCategory, cleanKeyword, pageable)
                .map(PodcastResponse::fromEntity);
    }

    /**
     * Lấy chi tiết bài viết Podcast theo Slug & Tăng lượt xem (views_count)
     */
    @Transactional
    public PodcastResponse getPodcastBySlug(String slug) {
        HealthPodcast podcast = podcastRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết Podcast với đường dẫn: " + slug));

        // Tăng lượt xem
        podcastRepository.incrementViewsCount(podcast.getId());
        podcast.setViewsCount(podcast.getViewsCount() + 1);

        return PodcastResponse.fromEntity(podcast);
    }

    /**
     * Ghi nhận lượt nghe Podcast (khi người bệnh bắt đầu nghe audio)
     */
    @Transactional
    public void trackListen(Long podcastId) {
        podcastRepository.incrementListenCount(podcastId);
    }

    /**
     * Đổi giọng đọc FPT.AI (Bắc / Trung / Nam) và tổng hợp lại âm thanh
     */
    @Transactional
    public PodcastResponse regenerateVoice(Long podcastId, String newVoiceCode) {
        HealthPodcast podcast = podcastRepository.findById(podcastId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết Podcast với ID: " + podcastId));

        String cleanVoice = (newVoiceCode != null && !newVoiceCode.isBlank()) ? newVoiceCode : "banmai";

        try {
            String narrationText = DoctorPodcastService.buildFullArticleNarration(
                    podcast.getAuthor() != null ? podcast.getAuthor().getFullName() : "Bác sĩ Chuyên khoa",
                    podcast.getTitle(),
                    podcast.getSummary(),
                    podcast.getContent()
            );

            TtsProxyService.TtsProxyResult result = ttsProxyService.synthesize(narrationText, cleanVoice, 0.0, null);
            podcast.setAudioUrl(result.audioUrl());
            podcast.setDefaultVoice(cleanVoice);
            podcast.setAudioDurationSeconds((int) Math.round(result.durationSeconds()));

            HealthPodcast saved = podcastRepository.save(podcast);
            return PodcastResponse.fromEntity(saved);
        } catch (Exception e) {
            log.warn("Lỗi chuyển đổi giọng đọc FPT.AI: {}", e.getMessage());
            podcast.setDefaultVoice(cleanVoice);
            HealthPodcast saved = podcastRepository.save(podcast);
            return PodcastResponse.fromEntity(saved);
        }
    }

    /**
     * Lấy các podcast nổi bật được nghe nhiều nhất
     */
    @Transactional(readOnly = true)
    public List<PodcastResponse> getFeaturedPodcasts() {
        return podcastRepository.findTop5ByStatusOrderByListenCountDesc("PUBLISHED")
                .stream()
                .map(PodcastResponse::fromEntity)
                .toList();
    }
}

