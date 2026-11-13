package com.healthvoice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthvoice.entity.ChatMessage;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Tầng 2: Gemini LLM Engine
 * Tích hợp Google Gemini AI phân tích triệu chứng chuyên sâu & gợi ý lâm sàng
 * cá nhân hóa
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiService {

    private final ObjectMapper objectMapper;

    @Value("${gemini.api-key:}")
    private String apiKey;

    @Value("${gemini.api-url:https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent}")
    private String apiUrl;

    @Value("${gemini.fallback-url:https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent}")
    private String fallbackUrl;

    @PostConstruct
    public void initApiKey() {
        if (this.apiKey == null || this.apiKey.isBlank()) {
            // 1. Thử đọc từ biến môi trường hệ điều hành
            String envVal = System.getenv("GEMINI_API_KEY");
            if (envVal != null && !envVal.isBlank()) {
                this.apiKey = envVal.trim();
                log.info("Đã nạp GEMINI_API_KEY thành công từ biến môi trường OS");
                return;
            }

            // 2. Thử đọc trực tiếp từ file .env (được loại bỏ khỏi Git)
            List<Path> candidateEnvFiles = List.of(
                    Paths.get(".env"),
                    Paths.get("../.env"),
                    Paths.get("health-voice-backend/.env"));
            for (Path path : candidateEnvFiles) {
                if (Files.exists(path)) {
                    try {
                        for (String line : Files.readAllLines(path)) {
                            String trimmed = line.trim();
                            if (trimmed.startsWith("GEMINI_API_KEY=")) {
                                String val = trimmed.substring("GEMINI_API_KEY=".length()).trim();
                                if (!val.isBlank() && !val.equals("your_gemini_api_key_here")) {
                                    this.apiKey = val;
                                    log.info("Đã nạp thành công GEMINI_API_KEY từ file: {}", path.toAbsolutePath());
                                    return;
                                }
                            }
                        }
                    } catch (Exception ex) {
                        log.warn("Lỗi khi đọc file .env {}: {}", path, ex.getMessage());
                    }
                }
            }
        }
    }

    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(6))
            .build();

    private static final Pattern RISK_LEVEL_PATTERN = Pattern.compile("\\[RISK_LEVEL:\\s*([A-Z_]+)\\]",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern QUICK_TAGS_PATTERN = Pattern.compile("\\[QUICK_TAGS:\\s*(.*?)\\]",
            Pattern.CASE_INSENSITIVE | Pattern.DOTALL);

    public record GeminiAnalysisResult(
            String clinicalAdvice,
            String riskLevel, // HIGH, MEDIUM, LOW
            List<String> quickReplies,
            boolean isLlmGenerated) {
    }

    /**
     * Đoạn Văn Mẫu Chung Nhất (Master Template):
     * Gắn triệu chứng bệnh nhân và nội dung phân tích lâm sàng từ Gemini AI vào cấu
     * trúc chuẩn y tế thống nhất,
     * tự động thích ứng thông minh theo mức độ rủi ro (HIGH, MEDIUM, LOW).
     */
    public static String applyMasterTemplate(String symptomText, String aiAnalysis) {
        return applyMasterTemplate(symptomText, aiAnalysis, "LOW");
    }

    public static String applyMasterTemplate(String symptomText, String aiAnalysis, String riskLevel) {
        String header;
        String disclaimer;

        if ("HIGH".equalsIgnoreCase(riskLevel)) {
            header = "CẢNH BÁO NGUY CƠ Y TẾ KHẨN CẤP:\n" +
                    "Hệ thống ghi nhận triệu chứng bạn vừa mô tả (\"" + symptomText.trim()
                    + "\") có dấu hiệu rủi ro cao, cần được can thiệp y tế khẩn cấp.";
            disclaimer = "LƯU Ý KHẨN CẤP: Lời dặn trên mang tính chất định hướng lâm sàng cấp bách. Bạn tuyệt đối không tự ý dùng thuốc giảm đau hay chườm nóng che lấp triệu chứng. Hãy đến ngay bệnh viện gần nhất hoặc gọi cấp cứu 115.";
        } else if ("MEDIUM".equalsIgnoreCase(riskLevel)) {
            header = "HƯỚNG DẪN THEO DÕI VÀ CHĂM SÓC Y TẾ:\n" +
                    "Dựa trên các triệu chứng bạn vừa mô tả (\"" + symptomText.trim()
                    + "\"), bạn cần theo dõi sát phản ứng cơ thể theo hướng dẫn sau:";
            disclaimer = "LỜI DẶN Y TẾ: Khuyến nghị trên mang tính chất định hướng lâm sàng ban đầu. Nếu tình trạng không thuyên giảm sau 24-48 giờ, bạn hãy đến cơ sở y tế thăm khám trực tiếp.";
        } else {
            header = "HƯỚNG DẪN CHĂM SÓC SỨC KHỎE TẠI NHÀ:\n" +
                    "Cảm ơn bạn đã chia sẻ tình trạng sức khỏe (\"" + symptomText.trim()
                    + "\"). Dưới đây là phân tích chuyên môn và hướng dẫn chăm sóc:";
            disclaimer = "LỜI DẶN Y TẾ: Khuyến nghị trên mang tính chất định hướng lâm sàng ban đầu. Bạn tuyệt đối không tự ý dùng các loại thuốc kê đơn khi chưa có sự thăm khám của Bác sĩ.";
        }

        return header + "\n\n" + aiAnalysis.trim() + "\n\n" + disclaimer;
    }

    private static final String SYSTEM_PROMPT = """
            Bạn là Bác sĩ Trợ lý Y tế Trí tuệ Nhân tạo (Health Voice AI Doctor) của nền tảng Y tế Số Health Voice.
            Nhiệm vụ chuyên môn:
            1. Phân tích lâm sàng chính xác, sắc bén dựa trên triệu chứng hoặc chỉ số sinh tồn của người bệnh (ví dụ: đau bụng dữ dội bên phải kèm sốt cao phải nghi ngờ ngay viêm ruột thừa cấp; đau thắt ngực phải nghi nhồi máu cơ tim...).
            2. Đánh giá mức độ rủi ro y tế thật chuẩn xác theo một dòng duy nhất:
               [RISK_LEVEL: HIGH] (nếu nghi ngờ cấp cứu ngoại khoa như viêm ruột thừa, nhồi máu cơ tim, đột quỵ, sốt cao co giật, khó thở dữ dội, đau dữ dội...)
               hoặc [RISK_LEVEL: MEDIUM] (nếu cần theo dõi sát tại nhà, có nguy cơ trở nặng trong 24-48h)
               hoặc [RISK_LEVEL: LOW] (nếu là triệu chứng nhẹ, lành tính)
            3. Cấu trúc câu trả lời:
               - Đi thẳng vào đánh giá lâm sàng và cảnh báo (không cần lời chào rườm rà).
               - Đánh giá tình trạng & các nguyên nhân khả dĩ nhất (nêu rõ các bệnh lý nguy hiểm cần loại trừ).
               - Hướng xử trí tức thì & những điều TUYỆT ĐỐI KHÔNG ĐƯỢC LÀM (ví dụ nghi đau ruột thừa thì không chườm nóng, không uống thuốc giảm đau che dấu triệu chứng).
               - Dấu hiệu cần đưa bệnh nhân đến cơ sở y tế ngay lập tức.
            4. Tuyệt đối KHÔNG tự ý kê đơn thuốc kháng sinh hay thuốc đặc trị liều cao.
            5. Ngôn ngữ y khoa ân cần, gạch đầu dòng rõ ràng, câu từ ngắn gọn tối ưu cho máy đọc giọng nói (TTS).
            6. Ở cuối cùng, BẮT BUỘC sinh đúng 3 câu hỏi gợi ý đào sâu lâm sàng liên quan trực tiếp đến bệnh cảnh:
               [QUICK_TAGS: Câu hỏi 1 | Câu hỏi 2 | Câu hỏi 3]
            """;

    private static final String PROMPT_TEMPLATE = """
            Bệnh nhân đang tham vấn triệu chứng sức khỏe: "%s".
            Hãy phân tích chuyên môn lâm sàng:
            - Đánh giá nguyên nhân khả dĩ và phân loại rủi ro (lưu ý phát hiện các dấu hiệu ngoại khoa khẩn cấp).
            - Hướng dẫn xử trí ban đầu an toàn (nêu rõ việc nên làm và việc TUYỆT ĐỐI KHÔNG ĐƯỢC LÀM).
            - Hướng dẫn đưa bệnh nhân đi cấp cứu hoặc khám trực tiếp.
            Đánh giá mức độ rủi ro: [RISK_LEVEL: HIGH/MEDIUM/LOW].
            Gợi ý đúng 3 câu hỏi đào sâu theo cú pháp: [QUICK_TAGS: Câu hỏi 1 | Câu hỏi 2 | Câu hỏi 3].
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
            log.warn("Gọi Gemini Primary URL ({}) thất bại: {}. Đang thử Fallback URL...", apiUrl,
                    primaryEx.getMessage());
            try {
                String fallbackResponseBody = callGeminiApi(fallbackUrl, symptomText, history);
                return parseGeminiResponse(fallbackResponseBody, symptomText);
            } catch (Exception fallbackEx) {
                log.error("Tất cả các endpoint Gemini đều không phản hồi: {}. Sử dụng kịch bản dự phòng an toàn.",
                        fallbackEx.getMessage());
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
                "parts", List.of(Map.of("text", SYSTEM_PROMPT))));

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

        // Thêm câu hỏi của bệnh nhân vào Prompt Template có sẵn
        String formattedUserPrompt = String.format(PROMPT_TEMPLATE, symptomText.trim());
        contents.add(Map.of("role", "user", "parts", List.of(Map.of("text", formattedUserPrompt))));
        requestPayload.put("contents", contents);

        // Generation Config
        Map<String, Object> genConfig = new LinkedHashMap<>();
        genConfig.put("temperature", 0.2);
        genConfig.put("maxOutputTokens", 1200);
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
                if (extracted.contains("HIGH"))
                    riskLevel = "HIGH";
                else if (extracted.contains("MEDIUM"))
                    riskLevel = "MEDIUM";
                else
                    riskLevel = "LOW";
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
                    .replaceAll("(?i)\\*\\*\\[RISK_LEVEL:.*?\\]\\*\\*", "")
                    .replaceAll("(?i)\\[RISK_LEVEL:.*?\\]", "")
                    .replaceAll("(?is)\\*\\*\\[QUICK_TAGS:.*?\\]\\*\\*", "")
                    .replaceAll("(?is)\\[QUICK_TAGS:.*?\\]", "")
                    .replaceAll("\\*\\*\\s*\\*\\*", "")
                    .trim();

            // Gán thông tin phân tích từ Gemini vào Đoạn Văn Mẫu Chung Nhất (Master
            // Template) thích ứng theo rủi ro
            String masterFormattedAdvice = applyMasterTemplate(originalSymptom, cleanAdvice, riskLevel);
            return new GeminiAnalysisResult(masterFormattedAdvice, riskLevel, quickReplies, true);
        } catch (Exception e) {
            log.error("Lỗi khi bóc tách JSON Gemini: ", e);
            return buildSafeFallbackResult(originalSymptom);
        }
    }

    /**
     * Kịch bản dự phòng an toàn khi mất mạng hoặc không có kết nối Gemini AI.
     * Tự động nhận diện cờ đỏ khẩn cấp (Red Flags) để cảnh báo chính xác, không chủ
     * quan.
     */
    private GeminiAnalysisResult buildSafeFallbackResult(String symptomText) {
        String lower = symptomText.toLowerCase();
        String riskLevel = "LOW";
        String fallbackAdvice;
        List<String> quickReplies;

        if (lower.contains("bụng") && (lower.contains("phải") || lower.contains("dữ dội") || lower.contains("sốt"))) {
            riskLevel = "HIGH";
            fallbackAdvice = "**CẢNH BÁO LÂM SÀNG:** Triệu chứng đau bụng dữ dội ở vùng hố chậu phải kèm sốt cao có nguy cơ cao là viêm ruột thừa cấp hoặc bệnh lý ngoại khoa khẩn cấp.\n\n"
                    +
                    "- **Việc cần làm ngay:** Nhanh chóng đưa bệnh nhân đến cơ sở y tế gần nhất hoặc gọi cấp cứu 115.\n"
                    +
                    "- **TUYỆT ĐỐI TRÁNH:** Không tự ý uống thuốc giảm đau (sẽ làm che lấp triệu chứng chẩn đoán), không chườm nóng và không ăn uống gì để chuẩn bị cho can thiệp y tế nếu cần.";
            quickReplies = List.of(
                    "Cơn đau bắt đầu từ vùng nào trước khi đau bên phải?",
                    "Bệnh nhân có bị nôn mửa hoặc tiêu chảy không?",
                    "Nhiệt độ cơ thể đo được hiện tại là bao nhiêu độ?");
        } else if (lower.contains("ngực") || lower.contains("khó thở") || lower.contains("thắt ngực")
                || lower.contains("đột quỵ") || lower.contains("liệt")) {
            riskLevel = "HIGH";
            fallbackAdvice = "**CẢNH BÁO NGUY CẤP:** Các dấu hiệu đau tức ngực, khó thở hoặc yếu liệt có thể liên quan đến tai biến mạch máu não hoặc biến cố tim mạch cấp.\n\n"
                    +
                    "- **Xử trí ngay:** Cho bệnh nhân ngồi hoặc nằm yên tĩnh, nới lỏng quần áo, gọi ngay cấp cứu 115 hoặc đưa đến phòng cấp cứu gần nhất.\n"
                    +
                    "- **Lưu ý:** Không tự lái xe, không vận động mạnh và không uống các loại thuốc không rõ nguồn gốc.";
            quickReplies = List.of(
                    "Cơn đau ngực có lan ra cánh tay trái hay sau lưng không?",
                    "Bệnh nhân có cảm giác khó thở hoặc vã mồ hôi lạnh không?",
                    "Huyết áp và nhịp tim hiện tại đo được là bao nhiêu?");
        } else if (lower.contains("huyết áp") || lower.contains("tim") || lower.contains("ha ")
                || lower.contains("nhịp tim")) {
            riskLevel = "MEDIUM";
            fallbackAdvice = "- Bạn nên ngồi hoặc nằm nghỉ ngơi tĩnh tại ở nơi thoáng mát trong 15-20 phút, sau đó đo lại huyết áp.\n"
                    +
                    "- Hạn chế căng thẳng tâm lý, giảm lượng muối trong khẩu phần ăn, uống đủ nước ấm.\n" +
                    "- Nếu huyết áp tâm thu vượt quá 160 mmHg hoặc kèm đau đầu dữ dội, hãy đến cơ sở y tế khám ngay.";
            quickReplies = getDefaultQuickReplies(symptomText);
        } else {
            riskLevel = "LOW";
            fallbackAdvice = "- Bạn nên dành thời gian nghỉ ngơi ở không gian thoáng mát, tránh lao động gắng sức hoặc căng thẳng tâm lý.\n"
                    +
                    "- Uống đủ 1.5 đến 2 lít nước ấm mỗi ngày, duy trì chế độ dinh dưỡng thanh đạm, giàu vitamin.\n" +
                    "- Tiếp tục theo dõi sát phản ứng của cơ thể. Nếu triệu chứng kéo dài hoặc có dấu hiệu nặng thêm, bạn hãy đến cơ sở y tế gần nhất để được thăm khám trực tiếp.";
            quickReplies = getDefaultQuickReplies(symptomText);
        }

        String masterFormattedAdvice = applyMasterTemplate(symptomText, fallbackAdvice, riskLevel);
        return new GeminiAnalysisResult(masterFormattedAdvice, riskLevel, quickReplies, false);
    }

    private List<String> getDefaultQuickReplies(String symptomText) {
        String lower = symptomText.toLowerCase();
        if (lower.contains("huyết áp") || lower.contains("tim") || lower.contains("ha ")
                || lower.contains("nhịp tim")) {
            return List.of(
                    "Tôi có cần ghi nhật ký huyết áp mỗi ngày không?",
                    "Nên ăn uống thế nào để ổn định huyết áp?",
                    "Khi nào tôi cần đến bệnh viện khám ngay?");
        } else if (lower.contains("chân") || lower.contains("mỏi") || lower.contains("khớp")
                || lower.contains("xương")) {
            return List.of(
                    "Nằm gác cao chân bao nhiêu phút mỗi ngày để giảm mỏi?",
                    "Khi nào đau mỏi chân là dấu hiệu suy giãn tĩnh mạch?",
                    "Có nên tập các bài giãn cơ bắp chân tại nhà không?");
        } else if (lower.contains("sốt") || lower.contains("nhiệt độ") || lower.contains("nóng sốt")) {
            return List.of(
                    "Bao nhiêu độ thì nên uống thuốc hạ sốt Paracetamol?",
                    "Có nên lau người bằng nước ấm khi sốt không?",
                    "Dấu hiệu sốt nào ở người lớn và trẻ em cần đi viện?");
        } else if (lower.contains("ho") || lower.contains("họng") || lower.contains("đờm")
                || lower.contains("sổ mũi")) {
            return List.of(
                    "Nên súc miệng nước muối mấy lần một ngày?",
                    "Uống nước mật ong chanh ấm có giúp đỡ ho không?",
                    "Ho kéo dài bao nhiêu ngày thì cần chụp X-quang phổi?");
        } else if (lower.contains("dạ dày") || lower.contains("bụng") || lower.contains("trào ngược")
                || lower.contains("tiêu hóa")) {
            return List.of(
                    "Bị trào ngược dạ dày nên kiêng những đồ ăn thức uống gì?",
                    "Nên ăn gì vào buổi sáng để làm dịu cơn đau dạ dày?",
                    "Những triệu chứng tiêu hóa nào cảnh báo xuất huyết dạ dày?");
        }

        return List.of(
                "Tôi cần kiêng những thực phẩm hoặc đồ uống nào?",
                "Có các biện pháp tự nhiên nào giúp giảm triệu chứng tại nhà?",
                "Những dấu hiệu cảnh báo nào cần đến gặp Bác sĩ ngay?");
    }
}
