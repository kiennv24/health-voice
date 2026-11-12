package com.healthvoice.controller;

import com.healthvoice.dto.request.CreatePodcastRequest;
import com.healthvoice.dto.request.PreviewTtsRequest;
import com.healthvoice.dto.request.UpdatePodcastRequest;
import com.healthvoice.dto.response.ApiResponse;
import com.healthvoice.dto.response.PodcastResponse;
import com.healthvoice.entity.User;
import com.healthvoice.repository.UserRepository;
import com.healthvoice.service.DoctorPodcastService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping({"/api/doctor/podcasts", "/api/v1/doctor/podcasts"})
@RequiredArgsConstructor
@PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
public class DoctorPodcastController {

    private final DoctorPodcastService doctorPodcastService;
    private final UserRepository userRepository;

    private Long getCurrentDoctorId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                return userRepository.findByUsernameIgnoreCase(auth.getName())
                        .or(() -> userRepository.findByUsername(auth.getName()))
                        .map(User::getId)
                        .orElse(2L); // Default doctor ID
            }
        } catch (Exception ignored) {
        }
        return 2L;
    }

    /**
     * Bác sĩ tạo bài viết sức khỏe & tổng hợp giọng nói FPT.AI
     */
    @PostMapping
    public ResponseEntity<ApiResponse<PodcastResponse>> createPodcast(
            @Valid @RequestBody CreatePodcastRequest request) {
        Long doctorId = getCurrentDoctorId();
        PodcastResponse response = doctorPodcastService.createPodcast(request, doctorId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Xuất bản bài viết y khoa và tổng hợp giọng đọc FPT.AI thành công", response));
    }

    /**
     * Cập nhật bài viết của Bác sĩ
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PodcastResponse>> updatePodcast(
            @PathVariable Long id,
            @RequestBody UpdatePodcastRequest request) {
        Long doctorId = getCurrentDoctorId();
        PodcastResponse response = doctorPodcastService.updatePodcast(id, request, doctorId);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật bài viết thành công", response));
    }

    /**
     * Xóa bài viết
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePodcast(@PathVariable Long id) {
        Long doctorId = getCurrentDoctorId();
        doctorPodcastService.deletePodcast(id, doctorId);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa bài viết thành công", null));
    }

    /**
     * Lấy danh sách bài viết do chính Bác sĩ hiện tại soạn thảo
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<PodcastResponse>>> getMyPodcasts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long doctorId = getCurrentDoctorId();
        Pageable pageable = PageRequest.of(page, size);
        Page<PodcastResponse> list = doctorPodcastService.getMyPodcasts(doctorId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Tải danh sách bài viết thành công", list));
    }

    /**
     * Kiểm thử và nghe thử giọng đọc AI trước khi duyệt lưu bài
     */
    @PostMapping("/preview-voice")
    public ResponseEntity<ApiResponse<Map<String, Object>>> previewTtsVoice(
            @Valid @RequestBody PreviewTtsRequest request) {
        Map<String, Object> result = doctorPodcastService.previewTtsVoice(request.getText(), request.getVoiceCode());
        return ResponseEntity.ok(ApiResponse.success("Tổng hợp giọng đọc demo thành công", result));
    }

    /**
     * Tải ảnh bìa hoặc ảnh minh họa bài viết từ máy tính lên máy chủ
     */
    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File tải lên không được để trống");
        }
        try {
            String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg";
            String extension = ".jpg";
            int dotIdx = originalFilename.lastIndexOf('.');
            if (dotIdx > 0) {
                extension = originalFilename.substring(dotIdx).toLowerCase();
            }

            // Tạo thư mục ./uploads/images nếu chưa có
            Path uploadDir = Paths.get("./uploads/images").toAbsolutePath().normalize();
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            String fileName = "img_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12) + extension;
            Path targetPath = uploadDir.resolve(fileName).normalize();
            file.transferTo(targetPath.toFile());

            // Đường dẫn tĩnh truy cập ảnh
            String fileUrl = "http://localhost:8080/uploads/images/" + fileName;
            return ResponseEntity.ok(ApiResponse.success(
                    "Tải ảnh từ máy tính lên máy chủ thành công",
                    Map.of("url", fileUrl, "fileName", fileName, "originalName", originalFilename)
            ));
        } catch (Exception e) {
            log.error("Lỗi khi lưu ảnh từ máy tính: ", e);
            throw new RuntimeException("Không thể lưu ảnh từ máy tính: " + e.getMessage());
        }
    }
}

