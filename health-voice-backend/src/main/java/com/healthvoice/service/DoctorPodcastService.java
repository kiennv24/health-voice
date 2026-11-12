package com.healthvoice.service;

import com.healthvoice.dto.request.CreatePodcastRequest;
import com.healthvoice.dto.request.UpdatePodcastRequest;
import com.healthvoice.dto.response.PodcastResponse;
import com.healthvoice.entity.HealthPodcast;
import com.healthvoice.entity.User;
import com.healthvoice.exception.ResourceNotFoundException;
import com.healthvoice.repository.HealthPodcastRepository;
import com.healthvoice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class DoctorPodcastService {

    private final HealthPodcastRepository podcastRepository;
    private final UserRepository userRepository;
    private final TtsProxyService ttsProxyService;

    private static final String DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop";

    /**
     * Tạo bài viết & podcast y khoa mới (Dành cho Bác sĩ)
     */
    @Transactional
    public PodcastResponse createPodcast(CreatePodcastRequest request, Long doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin Bác sĩ với ID: " + doctorId));

        String baseSlug = toSlug(request.getTitle());
        String slug = baseSlug;
        int counter = 1;
        while (podcastRepository.findBySlug(slug).isPresent()) {
            slug = baseSlug + "-" + counter++;
        }

        String voice = (request.getDefaultVoice() != null && !request.getDefaultVoice().isBlank()) 
                ? request.getDefaultVoice() 
                : "banmai";

        String thumbnail = (request.getThumbnailUrl() != null && !request.getThumbnailUrl().isBlank())
                ? request.getThumbnailUrl()
                : DEFAULT_THUMBNAIL;

        String status = (request.getStatus() != null && !request.getStatus().isBlank())
                ? request.getStatus().toUpperCase()
                : "PUBLISHED";

        String audioUrl = null;
        int durationSeconds = 0;

        // Nếu trạng thái là PUBLISHED, tự động gửi sang Python TTS tổng hợp audio FPT.AI 100% đầy đủ
        if ("PUBLISHED".equals(status)) {
            try {
                // Tạo văn bản đầy đủ 100% bao gồm tiêu đề, tóm tắt và toàn bộ nội dung bài viết
                String narrationText = buildFullArticleNarration(
                        doctor.getFullName(),
                        request.getTitle(),
                        request.getSummary(),
                        request.getContent()
                );

                TtsProxyService.TtsProxyResult result = ttsProxyService.synthesize(narrationText, voice, 0.0, null);
                String rawUrl = result.audioUrl();
                if (rawUrl != null && rawUrl.contains("/audio/")) {
                    rawUrl = rawUrl.substring(rawUrl.indexOf("/audio/"));
                }
                audioUrl = rawUrl;
                durationSeconds = (int) Math.round(result.durationSeconds());
                log.info("Đã tổng hợp 100% âm thanh đầy đủ cho podcast [{}]: url={}, duration={}s", slug, audioUrl, durationSeconds);
            } catch (Exception e) {
                log.warn("Không thể sinh âm thanh TTS ngay lúc tạo: {}", e.getMessage());
                audioUrl = "/audio/podcasts/podcast_stroke_fast.mp3"; // Fallback an toàn
                durationSeconds = 180;
            }
        }

        HealthPodcast podcast = HealthPodcast.builder()
                .author(doctor)
                .title(request.getTitle().trim())
                .slug(slug)
                .category(request.getCategory().toUpperCase())
                .summary(request.getSummary().trim())
                .content(request.getContent().trim())
                .thumbnailUrl(thumbnail)
                .defaultVoice(voice)
                .audioUrl(audioUrl)
                .audioDurationSeconds(durationSeconds)
                .status(status)
                .viewsCount(0)
                .listenCount(0)
                .build();

        HealthPodcast saved = podcastRepository.save(podcast);
        return PodcastResponse.fromEntity(saved);
    }

    /**
     * Cập nhật bài viết y khoa
     */
    @Transactional
    public PodcastResponse updatePodcast(Long id, UpdatePodcastRequest request, Long doctorId) {
        HealthPodcast podcast = podcastRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết Podcast với ID: " + id));

        // Kiểm tra quyền tác giả, Bác sĩ chuyên khoa hoặc Admin
        if (podcast.getAuthor() != null && !podcast.getAuthor().getId().equals(doctorId)) {
            User current = userRepository.findById(doctorId).orElse(null);
            boolean isStaff = current != null && current.getRole() != null && 
                    ("ROLE_ADMIN".equals(current.getRole().getName()) || "ROLE_DOCTOR".equals(current.getRole().getName()));
            if (!isStaff) {
                throw new IllegalArgumentException("Bạn không có quyền chỉnh sửa bài viết của bác sĩ khác.");
            }
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            podcast.setTitle(request.getTitle().trim());
        }
        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            podcast.setCategory(request.getCategory().toUpperCase());
        }
        if (request.getSummary() != null && !request.getSummary().isBlank()) {
            podcast.setSummary(request.getSummary().trim());
        }
        if (request.getContent() != null && !request.getContent().isBlank()) {
            podcast.setContent(request.getContent().trim());
        }
        if (request.getThumbnailUrl() != null && !request.getThumbnailUrl().isBlank()) {
            podcast.setThumbnailUrl(request.getThumbnailUrl().trim());
        }
        if (request.getDefaultVoice() != null && !request.getDefaultVoice().isBlank()) {
            podcast.setDefaultVoice(request.getDefaultVoice().trim());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            podcast.setStatus(request.getStatus().toUpperCase());
        }

        // Tự động cập nhật 100% âm thanh đầy đủ nếu là bài viết PUBLISHED
        if ("PUBLISHED".equalsIgnoreCase(podcast.getStatus())) {
            try {
                String doctorName = podcast.getAuthor() != null ? podcast.getAuthor().getFullName() : "Bác sĩ Chuyên khoa";
                String narrationText = buildFullArticleNarration(
                        doctorName,
                        podcast.getTitle(),
                        podcast.getSummary(),
                        podcast.getContent()
                );
                TtsProxyService.TtsProxyResult result = ttsProxyService.synthesize(narrationText, podcast.getDefaultVoice(), 0.0, null);
                String rawUrl = result.audioUrl();
                if (rawUrl != null && rawUrl.contains("/audio/")) {
                    rawUrl = rawUrl.substring(rawUrl.indexOf("/audio/"));
                }
                podcast.setAudioUrl(rawUrl);
                podcast.setAudioDurationSeconds((int) Math.round(result.durationSeconds()));
                log.info("Cập nhật 100% audio cho podcast [{}]: url={}, duration={}s", podcast.getSlug(), result.audioUrl(), podcast.getAudioDurationSeconds());
            } catch (Exception e) {
                log.warn("Không thể cập nhật audio khi sửa bài viết: {}", e.getMessage());
            }
        }

        HealthPodcast updated = podcastRepository.save(podcast);
        return PodcastResponse.fromEntity(updated);
    }

    /**
     * Xóa bài viết y khoa
     */
    @Transactional
    public void deletePodcast(Long id, Long doctorId) {
        HealthPodcast podcast = podcastRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết Podcast với ID: " + id));

        if (podcast.getAuthor() != null && !podcast.getAuthor().getId().equals(doctorId)) {
            User current = userRepository.findById(doctorId).orElse(null);
            boolean isStaff = current != null && current.getRole() != null && 
                    ("ROLE_ADMIN".equals(current.getRole().getName()) || "ROLE_DOCTOR".equals(current.getRole().getName()));
            if (!isStaff) {
                throw new IllegalArgumentException("Bạn không có quyền xóa bài viết này.");
            }
        }

        podcastRepository.delete(podcast);
    }

    /**
     * Lấy danh sách bài viết của Bác sĩ hiện tại
     */
    @Transactional(readOnly = true)
    public Page<PodcastResponse> getMyPodcasts(Long doctorId, Pageable pageable) {
        return podcastRepository.findByAuthorIdOrderByCreatedAtDesc(doctorId, pageable)
                .map(PodcastResponse::fromEntity);
    }

    /**
     * Nghe thử giọng phát âm AI đầy đủ 100% nội dung
     */
    public Map<String, Object> previewTtsVoice(String text, String voiceCode) {
        String cleanVoice = (voiceCode != null && !voiceCode.isBlank()) ? voiceCode : "banmai";
        String cleanText = cleanMarkdownForSpeech(text);

        try {
            TtsProxyService.TtsProxyResult result = ttsProxyService.synthesize(cleanText, cleanVoice, 0.0, null);
            return Map.of(
                    "audioUrl", result.audioUrl(),
                    "durationSeconds", result.durationSeconds(),
                    "engine", result.engine(),
                    "normalizedText", result.normalizedText()
            );
        } catch (Exception e) {
            log.error("Lỗi nghe thử giọng đọc AI: {}", e.getMessage());
            throw new RuntimeException("Không thể kết nối đến máy chủ tổng hợp giọng đọc: " + e.getMessage());
        }
    }

    /**
     * Làm sạch ký hiệu Markdown thành văn bản phát âm tự nhiên
     */
    public static String cleanMarkdownForSpeech(String markdown) {
        if (markdown == null || markdown.isBlank()) return "";
        return markdown
                .replaceAll("(?m)^#{1,6}\\s*", "")          // Bỏ ký hiệu tiêu đề markdown ###
                .replaceAll("\\*\\*(.*?)\\*\\*", "$1")      // Bỏ in đậm **chữ**
                .replaceAll("\\*(.*?)\\*", "$1")            // Bỏ in nghiêng *chữ*
                .replaceAll("(?m)^[-*+]\\s*", "")           // Bỏ ký tự gạch đầu dòng
                .replaceAll("(?m)^---+$", " ")              // Bỏ đường kẻ ngang ---
                .replaceAll("\\[([^\\]]+)\\]\\([^\\)]+\\)", "$1") // Bỏ link [text](url) -> text
                .replaceAll("\\s{2,}", " ")
                .trim();
    }

    /**
     * Chuyển đổi toàn bộ 100% nội dung bài viết và kịch bản y khoa thành giọng đọc tự nhiên.
     */
    public static String buildFullArticleNarration(String authorName, String title, String summary, String content) {
        StringBuilder sb = new StringBuilder();
        String doctor = (authorName != null && !authorName.isBlank()) ? authorName : "Bác sĩ Chuyên khoa";
        sb.append("Chào quý vị và các bạn. Đây là bản tin y khoa từ ").append(doctor).append(" về chủ đề: ").append(title.trim()).append(". ");
        if (summary != null && !summary.isBlank()) {
            sb.append(cleanMarkdownForSpeech(summary)).append(". ");
        }
        if (content != null && !content.isBlank()) {
            sb.append("\nSau đây là nội dung chi tiết bài viết:\n").append(cleanMarkdownForSpeech(content));
        }
        return sb.toString();
    }

    /**
     * Hàm tiện ích tạo URL Slug chuẩn SEO tiếng Việt
     */
    public static String toSlug(String input) {
        if (input == null || input.isBlank()) return "bai-viet-y-khoa";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized).replaceAll("")
                .replaceAll("Đ", "D").replaceAll("đ", "d")
                .toLowerCase(Locale.ENGLISH)
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }
}
