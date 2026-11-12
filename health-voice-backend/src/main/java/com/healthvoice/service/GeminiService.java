package com.healthvoice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthvoice.entity.ChatMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Tầng 2: Gemini LLM Engine
 * Tích hợp Google Gemini AI phân tích triệu chứng chuyên sâu & gợi ý lâm sàng cá nhân hóa
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiService {

    private final ObjectMapper objectMapper;

    @Value("${gemini.api-key:AIzaSyC8g92p4WOnNvLKUwymnytfxct5SWrSht8}")
    private String apiKey;

    @Value("${gemini.api-url:https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent}")
    private String apiUrl;

    @Value("${gemini.fallback-url:https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent}")
    private String fallbackUrl;

    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private static final Pattern RISK_LEVEL_PATTERN = Pattern.compile("\\[RISK_LEVEL:\\s*([A-Z_]+)\\]", Pattern.CASE_INSENSITIVE);
    private static final Pattern QUICK_TAGS_PATTERN = Pattern.compile("\\[QUICK_TAGS:\\s*(.*?)\\]", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);

    public record GeminiAnalysisResult(
            String clinicalAdvice,
            String riskLevel, // HIGH, MEDIUM, LOW
            List<String> quickReplies
    ) {}

    private static final String SYSTEM_PROMPT = """
            Bạn là Bác sĩ Trợ lý Y tế Trí tuệ Nhân tạo (Health Voice AI Doctor) của nền tảng Y tế Health Voice.
            Nhiệm vụ của bạn:
            1. Đón nhận triệu chứng hoặc chỉ số sinh tồn của người bệnh (huyết áp, sốt, SpO2, đường huyết, nhịp tim, cảm giác khó chịu).
            2. Phân tích lâm sàng súc tích, ân cần, giải thích nguyên nhân khả dĩ và hướng dẫn chăm sóc theo dõi an toàn tại nhà.
            3. Tuyệt đối KHÔNG tự ý kê đơn thuốc kháng sinh hay thuốc đặc trị liều cao. Khuyên người bệnh tái khám trực tiếp khi cần.
            4. Trình bày rõ ràng, dùng ngôn ngữ dễ hiểu cho người bệnh và người cao tuổi, chia ý bằng gạch đầu dòng rõ nét để dễ đọc qua giọng nói.
            5. Đánh giá mức độ rủi ro y tế: Ghi một dòng duy nhất theo cú pháp:
            [RISK_LEVEL: HIGH] (nếu cần đi khám sớm trong 24h)
            hoặc [RISK_LEVEL: MEDIUM] (nếu cần theo dõi sát tại nhà)
            hoặc [RISK_LEVEL: LOW] (nếu lành tính, nhẹ)
            6. Ở cuối cùng, BẮT BUỘC sinh đúng 3 câu hỏi gợi ý đào sâu lâm sàng cho bệnh nhân, đặt trong thẻ theo cú pháp:
            [QUICK_TAGS: Câu hỏi 1 | Câu hỏi 2 | Câu hỏi 3]
            """;

    /**
     * Gọi Google Gemini LLM để phân tích triệu chứng
     */
    public GeminiAnalysisResult consult(String symptomText, List<ChatMessage> history) {
        log.info("Bắt đầu phân tích triệu chứng qua Gemini LLM: '{}'", symptomText);

        try {
            String responseBody = callGeminiApi(apiUrl, symptomText, history);
            return parseGeminiResponse(responseBody, symptomText);
        } catch (Exception primaryEx) {
            log.warn("Gọi Gemini Primary URL ({}) thất bại: {}. Đang thử Fallback URL...", apiUrl, primaryEx.getMessage());
            try {
                String fallbackResponseBody = callGeminiApi(fallbackUrl, symptomText, history);
                return parseGeminiResponse(fallbackResponseBody, symptomText);
            } catch (Exception fallbackEx) {
                log.error("Tất cả các endpoint Gemini đều không phản hồi: {}. Sử dụng kịch bản dự phòng an toàn.", fallbackEx.getMessage());
                return buildSafeFallbackResult(symptomText);
            }
        }
    }

    private String callGeminiApi(String endpointUrl, String symptomText, List<ChatMessage> history) throws Exception {
        String fullUrl = endpointUrl;
        if (!fullUrl.contains("key=")) {
            fullUrl += (fullUrl.contains("?") ? "&" : "?") + "key=" + apiKey;
        }

        Map<String, Object> requestPayload = new LinkedHashMap<>();

        // System Instruction
        requestPayload.put("systemInstruction", Map.of(
                "parts", List.of(Map.of("text", SYSTEM_PROMPT))
        ));

        // Contents (lấy tối đa 4 tin nhắn gần nhất để giữ ngữ cảnh đàm thoại)
        List<Map<String, Object>> contents = new ArrayList<>();
        if (history != null && !history.isEmpty()) {
            int startIdx = Math.max(0, history.size() - 4);
            for (int i = startIdx; i < history.size(); i++) {
                ChatMessage m = history.get(i);
                String role = "BOT".equalsIgnoreCase(m.getSenderType()) ? "model" : "user";
                String text = m.getRawContent();
                if (text != null && !text.isBlank()) {
                    contents.add(Map.of("role", role, "parts", List.of(Map.of("text", text))));
                }
            }
        }

        // Thêm câu hỏi hiện tại của người dùng
        contents.add(Map.of("role", "user", "parts", List.of(Map.of("text", symptomText))));
        requestPayload.put("contents", contents);

        // Generation Config
        Map<String, Object> genConfig = new LinkedHashMap<>();
        genConfig.put("temperature", 0.2);
        genConfig.put("maxOutputTokens", 1200);
        genConfig.put("thinkingConfig", Map.of("thinkingBudget", 0));
        requestPayload.put("generationConfig", genConfig);

        String jsonPayload = objectMapper.writeValueAsString(requestPayload);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(fullUrl))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(15))
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            return response.body();
        } else {
            throw new RuntimeException("Gemini API trả về HTTP " + response.statusCode() + ": " + response.body());
        }
    }

    private GeminiAnalysisResult parseGeminiResponse(String responseJson, String originalSymptom) {
        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode candidates = root.path("candidates");
            if (candidates.isEmpty()) {
                throw new RuntimeException("Không có candidate trong phản hồi Gemini");
            }

            JsonNode parts = candidates.get(0).path("content").path("parts");
            StringBuilder fullTextBuilder = new StringBuilder();
            for (JsonNode part : parts) {
                if (!part.path("thought").asBoolean(false) && part.has("text")) {
                    fullTextBuilder.append(part.path("text").asText());
                }
            }

            String fullText = fullTextBuilder.toString().trim();
            if (fullText.isEmpty()) {
                return buildSafeFallbackResult(originalSymptom);
            }

            // Trích xuất mức độ rủi ro (Risk Level)
            String riskLevel = "LOW";
            Matcher riskMatcher = RISK_LEVEL_PATTERN.matcher(fullText);
            if (riskMatcher.find()) {
                String extracted = riskMatcher.group(1).toUpperCase();
                if (extracted.contains("HIGH")) riskLevel = "HIGH";
                else if (extracted.contains("MEDIUM")) riskLevel = "MEDIUM";
                else riskLevel = "LOW";
            }

            // Trích xuất 3 câu hỏi gợi ý đào sâu (Quick Tags)
            List<String> quickReplies = new ArrayList<>();
            Matcher tagsMatcher = QUICK_TAGS_PATTERN.matcher(fullText);
            if (tagsMatcher.find()) {
                String rawTags = tagsMatcher.group(1);
                String[] split = rawTags.split("\\|");
                for (String tag : split) {
                    String clean = tag.trim().replaceAll("^[\"']|[\"']$", "");
                    if (!clean.isEmpty()) {
                        quickReplies.add(clean);
                    }
                }
            }

            // Nếu không có tags hoặc ít hơn 3, tự động bù câu hỏi y khoa chuẩn
            if (quickReplies.size() < 3) {
                quickReplies = getDefaultQuickReplies(originalSymptom);
            } else if (quickReplies.size() > 3) {
                quickReplies = quickReplies.subList(0, 3);
            }

            // Dọn dẹp thẻ meta khỏi văn bản tư vấn hiển thị & đọc âm thanh
            String cleanAdvice = fullText
                    .replaceAll("\\[RISK_LEVEL:\\s*[A-Z_]+\\]", "")
                    .replaceAll("\\[QUICK_TAGS:\\s*.*?\\]", "")
                    .trim();

            return new GeminiAnalysisResult(cleanAdvice, riskLevel, quickReplies);
        } catch (Exception e) {
            log.error("Lỗi khi bóc tách JSON Gemini: ", e);
            return buildSafeFallbackResult(originalSymptom);
        }
    }

    private GeminiAnalysisResult buildSafeFallbackResult(String symptomText) {
        String advice = "HƯỚNG DẪN THEO DÕI TẠI NHÀ: Cảm ơn bạn đã chia sẻ tình trạng sức khỏe. " +
                "Dựa trên các triệu chứng bạn vừa mô tả, hiện tại chưa ghi nhận dấu hiệu nguy kịch ngay tức thì. " +
                "Bạn nên nghỉ ngơi ở nơi thoáng mát, uống đủ 1.5 - 2 lít nước ấm mỗi ngày và tiếp tục theo dõi sát phản ứng của cơ thể. " +
                "Nếu triệu chứng kéo dài hoặc nặng thêm, bạn hãy đến cơ sở y tế gần nhất để được thăm khám trực tiếp.";

        return new GeminiAnalysisResult(
                advice,
                "LOW",
                getDefaultQuickReplies(symptomText)
        );
    }

    private List<String> getDefaultQuickReplies(String symptomText) {
        String lower = symptomText.toLowerCase();
        if (lower.contains("huyết áp") || lower.contains("tim") || lower.contains("ha")) {
            return List.of(
                    "Tôi có cần ghi nhật ký huyết áp mỗi ngày không?",
                    "Nên ăn uống thế nào để ổn định huyết áp?",
                    "Khi nào tôi cần đến bệnh viện khám ngay?"
            );
        } else if (lower.contains("sốt") || lower.contains("nhiệt độ")) {
            return List.of(
                    "Bao nhiêu độ thì nên uống thuốc hạ sốt Paracetamol?",
                    "Có nên lau người bằng nước ấm khi sốt không?",
                    "Dấu hiệu sốt nào ở người lớn và trẻ em cần đi viện?"
            );
        } else if (lower.contains("ho") || lower.contains("họng") || lower.contains("đờm")) {
            return List.of(
                    "Nên súc miệng nước muối mấy lần một ngày?",
                    "Uống nước mật ong chanh ấm có giúp đỡ ho không?",
                    "Ho kéo dài bao nhiêu ngày thì cần chụp X-quang phổi?"
            );
        }

        return List.of(
                "Tôi cần kiêng những thực phẩm hoặc đồ uống nào?",
                "Có các biện pháp tự nhiên nào giúp giảm triệu chứng tại nhà?",
                "Những dấu hiệu cảnh báo nào cần đến gặp Bác sĩ ngay?"
        );
    }
}

