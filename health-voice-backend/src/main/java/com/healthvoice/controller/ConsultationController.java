package com.healthvoice.controller;

import com.healthvoice.dto.request.ConsultationRequest;
import com.healthvoice.dto.response.ApiResponse;
import com.healthvoice.entity.ChatMessage;
import com.healthvoice.entity.ConsultationSession;
import com.healthvoice.entity.User;
import com.healthvoice.repository.UserRepository;
import com.healthvoice.service.ConsultationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/consultation")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService consultationService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("Chưa đăng nhập");
        }
        return userRepository.findByUsernameIgnoreCase(auth.getName())
                .or(() -> userRepository.findByUsername(auth.getName()))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng: " + auth.getName()));
    }

    /**
     * Tạo phiên tư vấn sức khỏe mới
     */
    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<ConsultationSession>> createSession(@RequestBody(required = false) Map<String, String> body) {
        User user = getCurrentUser();
        String title = (body != null) ? body.get("title") : null;
        ConsultationSession session = consultationService.createSession(user.getId(), title);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Khởi tạo phiên tư vấn thành công", session));
    }

    /**
     * Lấy danh sách các phiên tư vấn của người dùng
     */
    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<ConsultationSession>>> getMySessions() {
        User user = getCurrentUser();
        List<ConsultationSession> sessions = consultationService.getPatientSessions(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phiên tư vấn thành công", sessions));
    }

    /**
     * Lấy danh sách tin nhắn hội thoại trong một phiên
     */
    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<ApiResponse<List<ChatMessage>>> getSessionMessages(@PathVariable Long sessionId) {
        List<ChatMessage> messages = consultationService.getSessionMessages(sessionId);
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử tin nhắn thành công", messages));
    }

    /**
     * Gửi triệu chứng sức khỏe và nhận câu trả lời phân tích lâm sàng kèm giọng đọc TTS AI
     */
    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendSymptomAndGetAdvice(@Valid @RequestBody ConsultationRequest request) {
        User user = getCurrentUser();
        Long sessionId = request.getSessionId();

        // Nếu chưa có phiên, tự động tạo mới
        if (sessionId == null) {
            ConsultationSession newSession = consultationService.createSession(
                    user.getId(),
                    "Tư vấn: " + (request.getSymptomText().length() > 30 
                            ? request.getSymptomText().substring(0, 30) + "..." 
                            : request.getSymptomText())
            );
            sessionId = newSession.getId();
        }

        // 1. Lưu tin nhắn của bệnh nhân
        ChatMessage patientMsg = consultationService.addPatientMessage(sessionId, request.getSymptomText());

        // 2. Sinh câu trả lời của trợ lý y tế và tổng hợp giọng nói
        double speed = (request.getSpeed() != null) ? request.getSpeed() : 0.0;
        ChatMessage botMsg = consultationService.generateBotReply(
                sessionId,
                request.getSymptomText(),
                request.getVoiceCode(),
                speed,
                null
        );

        Map<String, Object> result = new HashMap<>();
        result.put("sessionId", sessionId);
        result.put("patientMessage", patientMsg);
        result.put("botReply", botMsg);
        result.put("riskLevel", botMsg.getRiskLevel());
        result.put("ruleCode", botMsg.getRuleCode());
        result.put("quickReplies", botMsg.getQuickReplies());

        return ResponseEntity.ok(ApiResponse.success("Phân tích triệu chứng và tổng hợp âm thanh thành công", result));
    }

    /**
     * Đóng phiên tư vấn
     */
    @PutMapping("/sessions/{sessionId}/close")
    public ResponseEntity<ApiResponse<ConsultationSession>> closeSession(@PathVariable Long sessionId) {
        ConsultationSession session = consultationService.closeSession(sessionId);
        return ResponseEntity.ok(ApiResponse.success("Đã kết thúc phiên tư vấn", session));
    }

    /**
     * Xóa đoạn hội thoại tư vấn sức khỏe
     */
    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<Void>> deleteSession(@PathVariable Long sessionId) {
        User user = getCurrentUser();
        consultationService.deleteSession(sessionId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Đã xóa đoạn hội thoại thành công", null));
    }
}

