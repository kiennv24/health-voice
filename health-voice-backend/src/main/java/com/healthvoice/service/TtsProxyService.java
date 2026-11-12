package com.healthvoice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthvoice.entity.AudioCache;
import com.healthvoice.repository.AudioCacheRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TtsProxyService {

    private final WebClient webClient;
    private final AudioCacheRepository audioCacheRepository;
    private final ObjectMapper objectMapper;

    @Value("${tts.service.url:http://localhost:8000}")
    private String ttsServiceUrl;

    public record TtsProxyResult(
            String audioUrl,
            String normalizedText,
            long latencyMs,
            long fileSizeBytes,
            double durationSeconds,
            String engine,
            boolean isCached
    ) {}

    private String computeHash(String text, String voiceCode, double speed) {
        try {
            String raw = text + "|" + voiceCode + "|" + speed;
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            log.warn("Lỗi tính hash SHA-256, dùng hashCode thay thế: {}", e.getMessage());
            String raw = text + "|" + voiceCode + "|" + speed;
            return String.valueOf(raw.hashCode());
        }
    }

    public TtsProxyResult synthesize(String text, String voiceCode, double speed, String apiKey) {
        long startMs = System.currentTimeMillis();
        String textHash = computeHash(text, voiceCode, speed);

        // Kiểm tra cache trước khi gọi TTS service
        Optional<AudioCache> cached = audioCacheRepository.findByTextHash(textHash);
        if (cached.isPresent()) {
            AudioCache cache = cached.get();
            cache.setHitCount(cache.getHitCount() + 1);
            audioCacheRepository.save(cache);
            log.info("Cache HIT: hash={}, hitCount={}", textHash.substring(0, 16), cache.getHitCount());
            return new TtsProxyResult(
                    cache.getAudioUrl(),
                    text,
                    System.currentTimeMillis() - startMs,
                    cache.getFileSize() != null ? cache.getFileSize() : 0L,
                    cache.getDurationSeconds() != null ? cache.getDurationSeconds() : 0.0,
                    cache.getEngineUsed(),
                    true
            );
        }

        // Gọi Python TTS microservice
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("text", text);
            requestBody.put("voice", voiceCode);
            requestBody.put("speed", speed);
            requestBody.put("normalize", true);
            if (apiKey != null && !apiKey.isBlank()) {
                requestBody.put("api_key", apiKey);
            }

            String responseBody = webClient.post()
                    .uri(ttsServiceUrl + "/api/v1/tts/synthesize")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(180))
                    .block();

            JsonNode root = objectMapper.readTree(responseBody);
            String audioUrl = root.path("audio_url").asText();
            String normalizedText = root.path("normalized_text").asText(text);
            long fileSizeBytes = root.path("file_size_bytes").asLong(0L);
            double durationSeconds = root.path("duration_seconds").asDouble(5.0);
            String engineUsed = root.path("engine").asText("unknown");

            // Chuyển URL tương đối sang tuyệt đối (trỏ vào TTS service)
            String absoluteAudioUrl = audioUrl.startsWith("http") ? audioUrl : (ttsServiceUrl + audioUrl);

            // Lưu kết quả vào cache
            AudioCache newCache = AudioCache.builder()
                    .textHash(textHash)
                    .audioUrl(absoluteAudioUrl)
                    .voiceCode(voiceCode)
                    .speed(speed)
                    .fileSize(fileSizeBytes)
                    .durationSeconds(durationSeconds)
                    .engineUsed(engineUsed)
                    .hitCount(0L)
                    .build();
            audioCacheRepository.save(newCache);

            long latencyMs = System.currentTimeMillis() - startMs;
            log.info("TTS tổng hợp thành công: engine={}, latency={}ms, size={}bytes", engineUsed, latencyMs, fileSizeBytes);

            return new TtsProxyResult(absoluteAudioUrl, normalizedText, latencyMs, fileSizeBytes, durationSeconds, engineUsed, false);

        } catch (WebClientResponseException e) {
            log.error("Dịch vụ TTS trả về lỗi HTTP: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Dịch vụ TTS trả lỗi: " + e.getStatusCode() + " - " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            log.error("Không thể kết nối dịch vụ TTS: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể kết nối dịch vụ tổng hợp giọng nói: " + e.getMessage(), e);
        }
    }
}
