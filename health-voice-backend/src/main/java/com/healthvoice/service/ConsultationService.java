package com.healthvoice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthvoice.entity.ChatMessage;
import com.healthvoice.entity.ConsultationSession;
import com.healthvoice.entity.User;
import com.healthvoice.exception.ResourceNotFoundException;
import com.healthvoice.repository.AudioCacheRepository;
import com.healthvoice.repository.ChatMessageRepository;
import com.healthvoice.repository.ConsultationSessionRepository;
import com.healthvoice.repository.HealthPodcastRepository;
import com.healthvoice.repository.MedicationReminderRepository;
import com.healthvoice.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

/**
 * Service quản lý phiên tư vấn sức khỏe trực tuyến và kiến trúc Hybrid 4 Tầng
 */
@Slf4j
@Service
public class ConsultationService {

    private final ConsultationSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final TtsProxyService ttsProxyService;
    private final TriageService triageService;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;
    private final AudioCacheRepository audioCacheRepository;
    private final HealthPodcastRepository podcastRepository;
    private final MedicationReminderRepository reminderRepository;

    public ConsultationService(
            ConsultationSessionRepository sessionRepository,
            ChatMessageRepository messageRepository,
            UserRepository userRepository,
            TtsProxyService ttsProxyService,
            TriageService triageService,
            GeminiService geminiService,
            ObjectMapper objectMapper,
            AudioCacheRepository audioCacheRepository,
            HealthPodcastRepository podcastRepository,
            MedicationReminderRepository reminderRepository
    ) {
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.ttsProxyService = ttsProxyService;
        this.triageService = triageService;
        this.geminiService = geminiService;
        this.objectMapper = objectMapper;
        this.audioCacheRepository = audioCacheRepository;
        this.podcastRepository = podcastRepository;
        this.reminderRepository = reminderRepository;
    }

    @Transactional
    public ConsultationSession createSession(Long patientId, String title) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", patientId));

        String sessionTitle = (title != null && !title.isBlank())
                ? title.trim()
                : "Tư vấn sức khỏe " + java.time.LocalDate.now();

        ConsultationSession session = ConsultationSession.builder()
                .patient(patient)
                .title(sessionTitle)
                .status("ACTIVE")
                .build();

        return sessionRepository.save(session);
    }

    @Transactional
    public ChatMessage addPatientMessage(Long sessionId, String symptomText) {
        ConsultationSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("ConsultationSession", "id", sessionId));

        ChatMessage message = ChatMessage.builder()
                .session(session)
                .senderType("PATIENT")
                .rawContent(symptomText.trim())
                .normalizedContent(symptomText.trim())
                .build();

        return messageRepository.save(message);
    }

    /**
     * Quy trình Hybrid 4 Tầng:
     * 1. Tầng 1 (Guardrail Cây quyết định): Quét cờ đỏ cấp cứu khẩn cấp, ngắt luồng tức thì nếu nguy kịch.
     * 2. Tầng 2 (Gemini LLM Engine): Phân tích lâm sàng cá nhân hóa sâu theo triệu chứng & chỉ số sinh tồn.
     * 3. Tầng 3 (Template Ghép Dặn Dò & Gợi Ý): Nối khuyến cáo y tế bất biến và gắn 3 Quick-reply tags.
     * 4. Tầng 4 (FPT.AI TTS & Audio Cache): Chuẩn hóa ngữ âm y tế và tổng hợp giọng đọc Ban Mai FPT.AI.
     */
    @Transactional
    public ChatMessage generateBotReply(Long sessionId, String symptomText, String voiceCode, double speed, String apiKey) {
        ConsultationSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("ConsultationSession", "id", sessionId));

        String adviceText;
        String riskLevel;
        String ruleCode;
        List<String> quickReplies;

        // =====================================================================
        // TẦNG 1: GUARDRAIL CÂY QUYẾT ĐỊNH (Emergency Red Flags)
        // =====================================================================
        TriageService.TriageResult emergencyResult = triageService.checkEmergencyRedFlags(symptomText);
        if (emergencyResult != null) {
            log.warn("TẦNG 1 KÍCH HOẠT: Phát hiện cờ đỏ cấp cứu ({})! Ngắt luồng, trả ngay khuyến nghị 115.", emergencyResult.ruleCode());
            adviceText = emergencyResult.adviceText();
            riskLevel = "EMERGENCY";
            ruleCode = emergencyResult.ruleCode();
            quickReplies = triageService.getEmergencyQuickReplies();
        } else {
            // =====================================================================
            // TẦNG 2: GEMINI LLM ENGINE (Phân tích lâm sàng chuyên sâu)
            // =====================================================================
            List<ChatMessage> history = messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
            GeminiService.GeminiAnalysisResult geminiResult = geminiService.consult(symptomText, history);

            adviceText = geminiResult.clinicalAdvice();
            riskLevel = geminiResult.riskLevel();
            ruleCode = "GEMINI_AI_CLINICAL";
            quickReplies = geminiResult.quickReplies();

            // =====================================================================
            // TẦNG 3: TEMPLATE GHÉP DẶN DÒ Y KHOA BẤT BIẾN
            // =====================================================================
            if (!adviceText.contains("LỜI DẶN Y TẾ")) {
                adviceText += "\n\nLỜI DẶN Y TẾ: Khuyến nghị trên mang tính chất định hướng lâm sàng ban đầu. Bạn tuyệt đối không tự ý dùng các loại thuốc kê đơn khi chưa có sự thăm khám của Bác sĩ.";
            }
        }

        // =====================================================================
        // TẦNG 4: FPT.AI TTS & AUDIO CACHE (Cố định duy nhất giọng đọc Ban Mai)
        // =====================================================================
        String selectedVoice = "banmai";
        TtsProxyService.TtsProxyResult ttsResult;
        try {
            ttsResult = ttsProxyService.synthesize(adviceText, selectedVoice, speed, apiKey);
        } catch (Exception e) {
            log.error("Lỗi khi tổng hợp giọng nói cho phiên {}: {}", sessionId, e.getMessage());
            ttsResult = new TtsProxyService.TtsProxyResult(
                    "/api/audio/stream/fallback",
                    adviceText,
                    0L,
                    0L,
                    10.0,
                    "offline",
                    false
            );
        }

        // Chuyển đổi danh sách Quick-reply tags sang JSON string để lưu trữ
        String quickRepliesJson;
        try {
            quickRepliesJson = objectMapper.writeValueAsString(quickReplies);
        } catch (Exception e) {
            quickRepliesJson = "[]";
        }

        // Lưu tin nhắn BOT kèm siêu dữ liệu
        ChatMessage botMessage = ChatMessage.builder()
                .session(session)
                .senderType("BOT")
                .rawContent(adviceText)
                .normalizedContent(ttsResult.normalizedText())
                .audioUrl(ttsResult.audioUrl())
                .voiceCode(selectedVoice)
                .latencyMs((int) ttsResult.latencyMs())
                .isCached(ttsResult.isCached())
                .riskLevel(riskLevel)
                .ruleCode(ruleCode)
                .quickReplies(quickRepliesJson)
                .build();

        return messageRepository.save(botMessage);
    }

    @Transactional(readOnly = true)
    public List<ConsultationSession> getPatientSessions(Long patientId) {
        return sessionRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    @Transactional(readOnly = true)
    public List<ChatMessage> getSessionMessages(Long sessionId) {
        return messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
    }

    @Transactional
    public ConsultationSession closeSession(Long sessionId) {
        ConsultationSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("ConsultationSession", "id", sessionId));
        session.setStatus("CLOSED");
        return sessionRepository.save(session);
    }

    @Transactional
    public void deleteSession(Long sessionId, Long patientId) {
        ConsultationSession session = sessionRepository.findById(sessionId)
                .orElse(null);

        if (session == null) {
            log.info("Phiên tư vấn {} không tồn tại hoặc đã bị xóa trước đó", sessionId);
            return;
        }

        // 1. Lấy danh sách tin nhắn để trích xuất file âm thanh thuộc phiên cần xóa
        List<ChatMessage> messages = messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
        List<String> audioUrls = messages.stream()
                .filter(java.util.Objects::nonNull)
                .map(msg -> msg.getAudioUrl())
                .filter(url -> url != null && !url.isBlank() && !url.contains("fallback"))
                .distinct()
                .toList();

        // 2. Xóa các file âm thanh vật lý và cache nếu không còn phiên hoặc podcast nào khác tham chiếu
        for (String audioUrl : audioUrls) {
            try {
                String filename = audioUrl.substring(audioUrl.lastIndexOf('/') + 1);
                long otherMsgCount = messageRepository.countByAudioUrlInOtherSessions(audioUrl, sessionId);
                long podcastCount = podcastRepository.countByAudioUrlContaining(filename);
                long reminderCount = reminderRepository.countByAudioUrl(audioUrl);

                if (otherMsgCount == 0 && podcastCount == 0 && reminderCount == 0) {
                    deletePhysicalAudioFile(filename);
                    audioCacheRepository.deleteByAudioUrlContaining(filename);
                    log.info("Đã xóa vĩnh viễn file âm thanh phiên {}: {}", sessionId, filename);
                } else {
                    log.info("File âm thanh {} vẫn còn được sử dụng ở nơi khác (tin nhắn: {}, podcast: {}, nhắc thuốc: {}), giữ lại file vật lý",
                            filename, otherMsgCount, podcastCount, reminderCount);
                }
            } catch (Exception ex) {
                log.warn("Lỗi khi xử lý xóa file âm thanh {} cho phiên {}: {}", audioUrl, sessionId, ex.getMessage());
            }
        }

        // 3. Xóa các tin nhắn chat trong database
        try {
            messageRepository.deleteBySessionId(sessionId);
        } catch (Exception ex) {
            log.warn("Lỗi khi dọn dẹp ChatMessages cho phiên {}: {}", sessionId, ex.getMessage());
        }

        // 4. Xóa session
        sessionRepository.delete(session);
        log.info("Đã xóa hoàn toàn phiên tư vấn id: {} và các file âm thanh liên quan bởi user id: {}", sessionId, patientId);
    }

    /**
     * Xóa file âm thanh vật lý trên đĩa cứng ở tất cả các thư mục lưu trữ (FastAPI và Spring Boot)
     */
    private void deletePhysicalAudioFile(String filename) {
        String[] storageDirectories = {
                "d:/health-voice-project/tts-service/audio_storage",
                "d:/health-voice-project/audio_storage",
                "audio_storage",
                "../tts-service/audio_storage",
                "../audio_storage"
        };

        for (String dirPath : storageDirectories) {
            try {
                Path path = Paths.get(dirPath, filename);
                if (Files.exists(path)) {
                    Files.delete(path);
                    log.info("Đã xóa thành công file vật lý: {}", path.toAbsolutePath());
                }
            } catch (Exception e) {
                log.warn("Không thể xóa file vật lý trong {}: {}", dirPath, e.getMessage());
            }
        }
    }
}
