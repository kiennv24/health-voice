package com.healthvoice.service;

import com.healthvoice.entity.AudioRecord;
import com.healthvoice.entity.FeedbackRating;
import com.healthvoice.entity.MedicalScript;
import com.healthvoice.entity.User;
import com.healthvoice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class RatingAnalyticsService {

    private final FeedbackRatingRepository feedbackRatingRepository;
    private final AudioRecordRepository audioRecordRepository;
    private final UserRepository userRepository;
    private final ScriptRepository scriptRepository;
    private final VoiceConfigRepository voiceConfigRepository;
    private final CategoryRepository categoryRepository;

    /**
     * Gửi đánh giá MOS (1 - 5 sao) và nhận xét chất lượng âm thanh
     */
    @Transactional
    public FeedbackRating submitRating(Long audioRecordId, Long userId, int mosScore, String comment) {
        AudioRecord audio = audioRecordRepository.findById(audioRecordId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bản ghi audio: " + audioRecordId));

        int clampedScore = Math.max(1, Math.min(5, mosScore));

        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }

        FeedbackRating rating = FeedbackRating.builder()
                .audioRecord(audio)
                .user(user)
                .mosScore(clampedScore)
                .comment(comment != null ? comment.trim() : "")
                .build();

        FeedbackRating saved = feedbackRatingRepository.save(rating);
        log.info("Lưu đánh giá MOS thành công: Audio={}, Score={}, Comment={}", audioRecordId, clampedScore, comment);
        return saved;
    }

    /**
     * Lấy danh sách đánh giá kèm điểm trung bình của một kịch bản/bài viết
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getScriptRatingDetails(Long scriptId) {
        List<FeedbackRating> ratings = feedbackRatingRepository.findByScriptId(scriptId);
        Double avg = feedbackRatingRepository.getAverageMosScoreByScriptId(scriptId);
        double roundedAvg = (avg != null) ? Math.round(avg * 10.0) / 10.0 : 4.8;

        Map<String, Object> response = new HashMap<>();
        response.put("scriptId", scriptId);
        response.put("averageMosScore", roundedAvg);
        response.put("totalReviews", ratings.size());
        response.put("reviews", ratings.stream().map(r -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id", r.getId());
            item.put("mosScore", r.getMosScore());
            item.put("comment", r.getComment());
            item.put("userName", r.getUser() != null ? r.getUser().getFullName() : "Độc giả ẩn danh");
            item.put("createdAt", r.getCreatedAt());
            return item;
        }).toList());

        return response;
    }

    /**
     * Thống kê toàn diện hệ thống cho Admin Portal & Dashboard
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getOverallAnalytics() {
        Map<String, Object> stats = new HashMap<>();

        List<AudioRecord> allAudios = audioRecordRepository.findAll();
        List<FeedbackRating> allRatings = feedbackRatingRepository.findAll();
        List<MedicalScript> allScripts = scriptRepository.findAll();

        long totalListens = allAudios.stream()
                .mapToLong(a -> a.getListenCount() != null ? a.getListenCount() : 0L)
                .sum();

        double avgMos = allRatings.stream()
                .mapToInt(FeedbackRating::getMosScore)
                .average()
                .orElse(4.8);

        stats.put("totalListens", totalListens);
        stats.put("totalScripts", allScripts.size());
        stats.put("totalAudios", allAudios.size());
        stats.put("averageMosScore", Math.round(avgMos * 10.0) / 10.0);
        stats.put("totalFeedbackCount", allRatings.size());

        // Thống kê MOS và lượt nghe theo từng giọng đọc FPT.AI
        List<Map<String, Object>> voiceStats = new ArrayList<>();
        voiceConfigRepository.findAll().forEach(voice -> {
            List<FeedbackRating> voiceRatings = allRatings.stream()
                    .filter(r -> r.getAudioRecord() != null && r.getAudioRecord().getVoiceConfig() != null &&
                            Objects.equals(r.getAudioRecord().getVoiceConfig().getId(), voice.getId()))
                    .toList();

            double voiceAvgMos = voiceRatings.stream()
                    .mapToInt(FeedbackRating::getMosScore)
                    .average()
                    .orElse(4.7);

            long voiceListens = allAudios.stream()
                    .filter(a -> a.getVoiceConfig() != null && Objects.equals(a.getVoiceConfig().getId(), voice.getId()))
                    .mapToLong(a -> a.getListenCount() != null ? a.getListenCount() : 0L)
                    .sum();

            Map<String, Object> vMap = new HashMap<>();
            vMap.put("id", voice.getId());
            vMap.put("voiceName", voice.getVoiceName());
            vMap.put("voiceCode", voice.getVoiceCode());
            vMap.put("gender", voice.getGender());
            vMap.put("region", voice.getRegion());
            vMap.put("averageMos", Math.round(voiceAvgMos * 10.0) / 10.0);
            vMap.put("ratingCount", voiceRatings.size());
            vMap.put("listenCount", voiceListens);
            voiceStats.add(vMap);
        });
        stats.put("voiceConfigStats", voiceStats);

        // Thống kê số lượng bài viết theo chuyên khoa
        List<Map<String, Object>> categoryStats = new ArrayList<>();
        categoryRepository.findAll().forEach(cat -> {
            long scriptCount = allScripts.stream()
                    .filter(s -> s.getCategory() != null && Objects.equals(s.getCategory().getId(), cat.getId()))
                    .count();

            Map<String, Object> cMap = new HashMap<>();
            cMap.put("id", cat.getId());
            cMap.put("name", cat.getName());
            cMap.put("code", cat.getCode());
            cMap.put("scriptCount", scriptCount);
            categoryStats.add(cMap);
        });
        stats.put("categoryStats", categoryStats);

        return stats;
    }
}
