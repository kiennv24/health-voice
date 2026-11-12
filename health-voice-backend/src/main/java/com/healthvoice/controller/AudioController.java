package com.healthvoice.controller;

import com.healthvoice.dto.response.ApiResponse;
import com.healthvoice.entity.AudioRecord;
import com.healthvoice.entity.FeedbackRating;
import com.healthvoice.entity.User;
import com.healthvoice.exception.ResourceNotFoundException;
import com.healthvoice.repository.AudioRecordRepository;
import com.healthvoice.repository.FeedbackRatingRepository;
import com.healthvoice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping({"/api/audios", "/api/v1/audios"})
public class AudioController {

    private final AudioRecordRepository audioRecordRepository;
    private final FeedbackRatingRepository feedbackRatingRepository;
    private final UserRepository userRepository;

    @Value("${app.storage.audio-dir:./uploads/audio}")
    private String audioStorageDir;

    public AudioController(AudioRecordRepository audioRecordRepository,
                           FeedbackRatingRepository feedbackRatingRepository,
                           UserRepository userRepository) {
        this.audioRecordRepository = audioRecordRepository;
        this.feedbackRatingRepository = feedbackRatingRepository;
        this.userRepository = userRepository;
    }

    /**
     * Endpoint Stream file audio MP3 cho trình phát HTML5 Audio / Wavesurfer.js
     * Cho phép truy cập công khai không cần Token.
     */
    @GetMapping("/stream/{fileName}")
    public ResponseEntity<Resource> streamAudio(@PathVariable String fileName) {
        try {
            Path storagePath = Paths.get(audioStorageDir).toAbsolutePath().normalize();
            Path filePath = storagePath.resolve(fileName).normalize();

            // Kiểm tra an toàn đường dẫn tránh Path Traversal
            if (!filePath.startsWith(storagePath)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            // Tạo thư mục nếu chưa tồn tại
            if (!Files.exists(storagePath)) {
                Files.createDirectories(storagePath);
            }

            Resource resource;
            if (Files.exists(filePath)) {
                resource = new UrlResource(filePath.toUri());
            } else {
                // Nếu file chưa tồn tại thực tế trên ổ cứng (môi trường dev/mock), trả về 404
                log.warn("File audio không tồn tại trên ổ cứng: {}", filePath);
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("audio/mpeg"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .body(resource);

        } catch (MalformedURLException e) {
            log.error("URL file không hợp lệ: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            log.error("Lỗi đọc file audio: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Lấy danh sách tất cả các bản ghi audio đã sinh
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<AudioRecord>>> getAllAudios() {
        List<AudioRecord> records = audioRecordRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách audio thành công", records));
    }

    /**
     * Gửi điểm đánh giá chất lượng giọng nói MOS (1 - 5 sao) và nhận xét
     */
    @PostMapping("/{id}/rating")
    public ResponseEntity<ApiResponse<FeedbackRating>> sendRating(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {

        AudioRecord audio = audioRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AudioRecord", "id", id));

        int ratingScore = Integer.parseInt(payload.getOrDefault("ratingScore", 5).toString());
        String comment = (String) payload.getOrDefault("comment", "");

        Long userId = payload.containsKey("userId") && payload.get("userId") != null
                ? Long.parseLong(payload.get("userId").toString())
                : null;

        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }
        if (user == null) {
            user = userRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        }

        FeedbackRating feedback = FeedbackRating.builder()
                .audioRecord(audio)
                .user(user)
                .mosScore(Math.max(1, Math.min(5, ratingScore)))
                .comment(comment)
                .build();

        FeedbackRating saved = feedbackRatingRepository.save(feedback);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Gửi đánh giá MOS thành công", saved));
    }
}
