package com.healthvoice.controller;

import com.healthvoice.dto.response.ApiResponse;
import com.healthvoice.entity.*;
import com.healthvoice.exception.ResourceNotFoundException;
import com.healthvoice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AudioCacheRepository audioCacheRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final HealthPodcastRepository healthPodcastRepository;
    private final CategoryRepository categoryRepository;
    private final ConsultationSessionRepository consultationSessionRepository;
    private final MedicationReminderRepository medicationReminderRepository;

    /**
     * Thống kê tổng quan hệ thống: Lượt tổng hợp, Tỷ lệ trúng cache, Độ trễ trung bình, Tổng người dùng,
     * Podcast y khoa, Chuyên khoa, Lịch nhắc thuốc, Phiên tư vấn, và Kho lưu trữ âm thanh
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemStats() {
        long totalUsers = userRepository.count();
        long totalMessages = chatMessageRepository.count();
        long cacheEntries = audioCacheRepository.count();
        long totalPodcasts = healthPodcastRepository.count();
        long totalCategories = categoryRepository.count();
        long totalConsultations = consultationSessionRepository.count();
        long totalReminders = medicationReminderRepository.count();

        List<AudioCache> caches = audioCacheRepository.findAll();
        long totalHits = caches.stream().mapToLong(c -> c.getHitCount() != null ? c.getHitCount() : 0L).sum();
        long totalRequests = cacheEntries + totalHits;
        double hitRate = totalRequests > 0 ? ((double) totalHits / totalRequests) * 100.0 : 0.0;

        Map<String, Object> storageStats = calculateStorageStats();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalTtsRequests", Math.max(totalRequests, totalMessages));
        stats.put("totalCacheEntries", cacheEntries);
        stats.put("totalCacheHits", totalHits);
        stats.put("cacheHitRatePercent", Math.round(hitRate * 10.0) / 10.0);
        stats.put("avgLatencyMs", 350);
        stats.put("totalPodcasts", totalPodcasts);
        stats.put("totalCategories", totalCategories);
        stats.put("totalConsultations", totalConsultations);
        stats.put("totalReminders", totalReminders);
        stats.put("totalMessages", totalMessages);
        stats.put("storageStats", storageStats);

        return ResponseEntity.ok(ApiResponse.success("Lấy thông số giám sát hệ thống thành công", stats));
    }

    /**
     * Danh sách tất cả người dùng trong hệ thống
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = userRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách người dùng thành công", users));
    }

    /**
     * Thay đổi vai trò người dùng (ROLE_ADMIN, ROLE_DOCTOR, ROLE_PATIENT / ROLE_LISTENER)
     */
    @PutMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<User>> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        String roleName = body.get("role");
        if (roleName != null && !roleName.startsWith("ROLE_")) {
            roleName = "ROLE_" + roleName.toUpperCase();
        }
        if ("ROLE_PATIENT".equals(roleName)) {
            roleName = "ROLE_LISTENER";
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Vai trò không tồn tại: " + body.get("role")));

        user.setRole(role);
        User updated = userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success("Cập nhật quyền thành công", updated));
    }

    /**
     * Khóa hoặc mở khóa tài khoản người dùng
     */
    @PutMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<User>> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        Integer status = body.getOrDefault("status", 1);
        user.setStatus(status);
        User updated = userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái người dùng thành công", updated));
    }

    /**
     * Bảng dữ liệu chi tiết bộ nhớ đệm âm thanh (Audio Cache)
     */
    @GetMapping("/cache/stats")
    public ResponseEntity<ApiResponse<List<AudioCache>>> getCacheEntries() {
        List<AudioCache> caches = audioCacheRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách cache thành công", caches));
    }

    /**
     * Xóa 1 bản ghi cache âm thanh
     */
    @DeleteMapping("/cache/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCacheEntry(@PathVariable Long id) {
        if (!audioCacheRepository.existsById(id)) {
            throw new ResourceNotFoundException("AudioCache", "id", id);
        }
        audioCacheRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa bản ghi cache âm thanh", null));
    }

    /**
     * Xóa toàn bộ bộ nhớ đệm âm thanh
     */
    @DeleteMapping("/cache/clear")
    public ResponseEntity<ApiResponse<Void>> clearAllCache() {
        audioCacheRepository.deleteAll();
        return ResponseEntity.ok(ApiResponse.success("Đã làm sạch toàn bộ bộ nhớ đệm âm thanh", null));
    }

    /**
     * Danh sách tất cả bài viết Podcast y khoa dành cho Admin
     */
    @GetMapping("/podcasts")
    public ResponseEntity<ApiResponse<List<HealthPodcast>>> getAllPodcasts() {
        List<HealthPodcast> podcasts = healthPodcastRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách podcast thành công", podcasts));
    }

    /**
     * Thay đổi trạng thái xuất bản podcast (PUBLISHED, DRAFT, ARCHIVED)
     */
    @PutMapping("/podcasts/{id}/status")
    public ResponseEntity<ApiResponse<HealthPodcast>> updatePodcastStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        HealthPodcast podcast = healthPodcastRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HealthPodcast", "id", id));
        String status = body.getOrDefault("status", "PUBLISHED");
        podcast.setStatus(status);
        HealthPodcast saved = healthPodcastRepository.save(podcast);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái podcast thành công", saved));
    }

    /**
     * Xóa podcast y khoa kèm xóa tệp âm thanh
     */
    @DeleteMapping("/podcasts/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePodcast(@PathVariable Long id) {
        HealthPodcast podcast = healthPodcastRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HealthPodcast", "id", id));

        if (podcast.getAudioUrl() != null && !podcast.getAudioUrl().isBlank()) {
            String filename = extractFilename(podcast.getAudioUrl());
            for (Path storageDir : getCandidateStorageDirs()) {
                Path p = storageDir.resolve(filename);
                try {
                    Files.deleteIfExists(p);
                } catch (Exception ignored) {}
            }
        }

        healthPodcastRepository.delete(podcast);
        return ResponseEntity.ok(ApiResponse.success("Xóa podcast y khoa thành công", null));
    }

    /**
     * Danh sách tất cả lịch nhắc uống thuốc để quản trị viên giám sát
     */
    @GetMapping("/reminders")
    public ResponseEntity<ApiResponse<List<MedicationReminder>>> getAllReminders() {
        List<MedicationReminder> reminders = medicationReminderRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách lịch nhắc thành công", reminders));
    }

    /**
     * Danh sách các phiên tư vấn sức khỏe để quản trị viên giám sát
     */
    @GetMapping("/consultations")
    public ResponseEntity<ApiResponse<List<ConsultationSession>>> getAllConsultations() {
        List<ConsultationSession> sessions = consultationSessionRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phiên tư vấn thành công", sessions));
    }

    /**
     * Quét và dọn dẹp các tệp âm thanh mồ côi (không còn liên kết với DB)
     */
    @PostMapping("/storage/cleanup")
    public ResponseEntity<ApiResponse<Map<String, Object>>> cleanupOrphanedAudios() {
        Set<String> referenced = new HashSet<>();

        healthPodcastRepository.findAll().forEach(p -> {
            if (p.getAudioUrl() != null && !p.getAudioUrl().isBlank()) {
                referenced.add(extractFilename(p.getAudioUrl()));
            }
        });

        chatMessageRepository.findAll().forEach(m -> {
            if (m.getAudioUrl() != null && !m.getAudioUrl().isBlank()) {
                referenced.add(extractFilename(m.getAudioUrl()));
            }
        });

        medicationReminderRepository.findAll().forEach(r -> {
            if (r.getAudioUrl() != null && !r.getAudioUrl().isBlank()) {
                referenced.add(extractFilename(r.getAudioUrl()));
            }
        });

        audioCacheRepository.findAll().forEach(c -> {
            if (c.getAudioUrl() != null && !c.getAudioUrl().isBlank()) {
                referenced.add(extractFilename(c.getAudioUrl()));
            }
        });

        int deletedCount = 0;
        long freedBytes = 0;

        for (Path storageDir : getCandidateStorageDirs()) {
            if (Files.exists(storageDir) && Files.isDirectory(storageDir)) {
                try (var stream = Files.walk(storageDir)) {
                    var files = stream.filter(Files::isRegularFile).toList();
                    for (Path f : files) {
                        String name = f.getFileName().toString();
                        if (name.endsWith(".mp3") && !referenced.contains(name)) {
                            try {
                                long sz = Files.size(f);
                                Files.delete(f);
                                deletedCount++;
                                freedBytes += sz;
                                log.info("Admin đã dọn dẹp âm thanh mồ côi: {}", name);
                            } catch (Exception ex) {
                                log.warn("Không thể xóa file mồ côi {}: {}", name, ex.getMessage());
                            }
                        }
                    }
                } catch (Exception e) {
                    log.warn("Lỗi duyệt thư mục storage: {}", e.getMessage());
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("deletedFilesCount", deletedCount);
        result.put("freedBytesMb", Math.round((freedBytes / (1024.0 * 1024.0)) * 100.0) / 100.0);
        result.put("remainingReferencedCount", referenced.size());

        return ResponseEntity.ok(ApiResponse.success("Dọn dẹp tệp âm thanh mồ côi thành công", result));
    }

    private List<Path> getCandidateStorageDirs() {
        return List.of(
                Paths.get("d:/health-voice-project/tts-service/audio_storage"),
                Paths.get("d:/health-voice-project/tts-service/audio_storage/podcasts"),
                Paths.get("../tts-service/audio_storage"),
                Paths.get("audio_storage")
        );
    }

    private Map<String, Object> calculateStorageStats() {
        Map<String, Object> storageStats = new HashMap<>();
        try {
            Path storageDir = Paths.get("d:/health-voice-project/tts-service/audio_storage");
            if (!Files.exists(storageDir)) {
                storageDir = Paths.get("../tts-service/audio_storage");
            }
            if (Files.exists(storageDir) && Files.isDirectory(storageDir)) {
                long totalFiles = 0;
                long totalBytes = 0;
                try (var stream = Files.walk(storageDir)) {
                    var fileList = stream.filter(Files::isRegularFile).toList();
                    totalFiles = fileList.size();
                    for (Path f : fileList) {
                        try {
                            totalBytes += Files.size(f);
                        } catch (Exception ignored) {}
                    }
                }
                double sizeMb = Math.round((totalBytes / (1024.0 * 1024.0)) * 10.0) / 10.0;
                storageStats.put("totalFiles", totalFiles);
                storageStats.put("totalSizeMb", sizeMb);
                storageStats.put("storagePath", storageDir.toAbsolutePath().toString());
            } else {
                storageStats.put("totalFiles", 0);
                storageStats.put("totalSizeMb", 0);
            }
        } catch (Exception e) {
            log.warn("Lỗi tính toán dung lượng kho âm thanh: {}", e.getMessage());
            storageStats.put("totalFiles", 0);
            storageStats.put("totalSizeMb", 0);
        }
        return storageStats;
    }

    private String extractFilename(String pathOrUrl) {
        if (pathOrUrl == null) return "";
        int lastSlash = Math.max(pathOrUrl.lastIndexOf('/'), pathOrUrl.lastIndexOf('\\'));
        return lastSlash >= 0 ? pathOrUrl.substring(lastSlash + 1) : pathOrUrl;
    }
}
