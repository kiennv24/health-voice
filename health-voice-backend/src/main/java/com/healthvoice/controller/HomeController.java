package com.healthvoice.controller;

import com.healthvoice.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {

    /**
     * Endpoint gốc (http://localhost:8080/)
     * Trả về thông tin trạng thái hoạt động của Backend thay vì báo lỗi "No static resource"
     */
    @GetMapping("/")
    public ResponseEntity<ApiResponse<Map<String, Object>>> home() {
        Map<String, Object> info = Map.of(
                "status", "UP",
                "service", "HealthVoice Backend API (Spring Boot 3 + MySQL)",
                "topic", "Nghiên cứu ứng dụng công nghệ tổng hợp và chuyển đổi giọng nói trong xây dựng nội dung tư vấn sức khỏe bằng VoiceStudio",
                "endpoints", Map.of(
                        "categories", "http://localhost:8080/api/categories",
                        "voices", "http://localhost:8080/api/voices",
                        "scripts", "http://localhost:8080/api/scripts",
                        "auth", "http://localhost:8080/api/auth/login"
                )
        );
        return ResponseEntity.ok(ApiResponse.success("Hệ thống HealthVoice Backend đang hoạt động bình thường", info));
    }
}
