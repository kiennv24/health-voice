package com.healthvoice.service;

import com.healthvoice.entity.TriageRule;
import com.healthvoice.repository.TriageRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Tầng 1: Guardrail Cây quyết định phân loại rủi ro y tế (Medical Triage Guardrail)
 * Quét cờ đỏ cấp cứu khẩn cấp (Emergency Red Flags), ngắt luồng ngay lập tức để triệt tiêu độ trễ
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TriageService {

    private final TriageRuleRepository triageRuleRepository;

    private static final Pattern BLOOD_PRESSURE_PATTERN = Pattern.compile("(\\d{2,3})\\s*/\\s*(\\d{2,3})");

    // Danh sách cờ đỏ cấp cứu khẩn cấp (Emergency Red Flags)
    private static final List<String> STROKE_RED_FLAGS = List.of(
            "méo miệng", "đớ lưỡi", "nói ngọng", "yếu liệt", "liệt nửa người", 
            "liệt mặt", "đột quỵ", "tai biến", "mất ý thức", "hôn mê"
    );

    private static final List<String> CARDIAC_RED_FLAGS = List.of(
            "đau thắt ngực", "đau tức ngực dữ dội", "đau ngực lan ra vai", 
            "đau ngực lan ra cánh tay", "nhồi máu cơ tim", "vã mồ hôi lạnh", "ngừng tim", "ép ngực"
    );

    private static final List<String> RESPIRATORY_RED_FLAGS = List.of(
            "khó thở dữ dội", "tím tái", "không thở được", "ngạt thở", "suy hô hấp"
    );

    private static final List<String> OTHER_EMERGENCY_FLAGS = List.of(
            "sốt co giật", "co giật", "ngộ độc cấp", "bỏng diện rộng", "nôn ra máu"
    );

    /**
     * Kết quả phân loại rủi ro y tế
     */
    public record TriageResult(
            String ruleCode,
            String category,
            String riskLevel, // EMERGENCY, HIGH, MEDIUM, LOW
            int priority,
            String matchedKeyword,
            String adviceText
    ) {}

    /**
     * Tầng 1 Guardrail: Kiểm tra xem triệu chứng có thuộc diện cờ đỏ cấp cứu khẩn cấp hay không.
     * Nếu có, trả về TriageResult mức EMERGENCY để ngắt luồng ngay, KHÔNG gọi AI bên ngoài.
     * Nếu không, trả về null để chuyển sang Tầng 2 (Gemini LLM).
     */
    public TriageResult checkEmergencyRedFlags(String patientMessage) {
        if (patientMessage == null || patientMessage.trim().isBlank()) {
            return null;
        }

        String normalized = normalizeText(patientMessage);

        // 1. Kiểm tra huyết áp kịch phát qua Regex (Tâm thu >= 160 hoặc Tâm trương >= 100)
        Matcher bpMatcher = BLOOD_PRESSURE_PATTERN.matcher(patientMessage);
        if (bpMatcher.find()) {
            try {
                int systolic = Integer.parseInt(bpMatcher.group(1));
                int diastolic = Integer.parseInt(bpMatcher.group(2));
                if (systolic >= 160 || diastolic >= 100) {
                    log.warn("GUARDRAIL TRIGGERED: Phát hiện tăng huyết áp kịch phát: {}/{} mmHg -> EMERGENCY", systolic, diastolic);
                    return new TriageResult(
                            "EMERGENCY_HYPERTENSIVE_CRISIS",
                            "TIM_MACH",
                            "EMERGENCY",
                            10,
                            systolic + "/" + diastolic + " mmHg",
                            String.format("CẢNH BÁO CẤP CỨU KHẨN CẤP: Chỉ số huyết áp của bạn đo được là %d trên %d milimét thủy ngân, đang ở mức Tăng huyết áp độ hai nguy cơ tim mạch rất cao. Bạn cần ngồi nghỉ ngơi ngay tại chỗ ở nơi thoáng mát, nới lỏng trang phục và tránh căng thẳng. Nếu xuất hiện kèm đau đầu dữ dội, mờ mắt, khó thở hoặc buồn nôn, hãy gọi ngay tổng đài cấp cứu một một năm hoặc nhờ người nhà đưa đến cơ sở y tế gần nhất.", systolic, diastolic)
                    );
                }
            } catch (NumberFormatException ignored) {
            }
        }

        // 2. Kiểm tra cờ đỏ Đột quỵ não (FAST)
        for (String flag : STROKE_RED_FLAGS) {
            if (normalized.contains(flag)) {
                log.warn("GUARDRAIL TRIGGERED: Cờ đỏ Đột quỵ não khớp từ khóa: '{}' -> EMERGENCY", flag);
                return new TriageResult(
                        "EMERGENCY_STROKE_FAST",
                        "THAN_KINH",
                        "EMERGENCY",
                        10,
                        flag,
                        "CẢNH BÁO CẤP CỨU KHẨN CẤP: Dấu hiệu bạn vừa mô tả là triệu chứng điển hình của Đột quỵ não hoặc Tai biến mạch máu não theo tiêu chuẩn FAST. Bạn hoặc người nhà cần gọi ngay tổng đài Cấp cứu 115 hoặc di chuyển ngay đến bệnh viện có đơn vị can thiệp đột quỵ gần nhất trong thời gian vàng 3 đến 4 giờ đầu. Tuyệt đối không tự ý cho uống nước, cạo gió hay dùng thuốc hạ áp tại nhà."
                );
            }
        }

        // 3. Kiểm tra cờ đỏ Nhồi máu cơ tim / Đau thắt ngực
        for (String flag : CARDIAC_RED_FLAGS) {
            if (normalized.contains(flag)) {
                log.warn("GUARDRAIL TRIGGERED: Cờ đỏ Tim mạch khớp từ khóa: '{}' -> EMERGENCY", flag);
                return new TriageResult(
                        "EMERGENCY_MYOCARDIAL_INFARCTION",
                        "TIM_MACH",
                        "EMERGENCY",
                        10,
                        flag,
                        "CẢNH BÁO CẤP CỨU KHẨN CẤP: Triệu chứng đau tức ngực dữ dội kèm khó thở và vã mồ hôi là dấu hiệu cảnh báo của Cơn đau thắt ngực không ổn định hoặc Nhồi máu cơ tim cấp tính. Hãy gọi ngay cấp cứu 115 hoặc nhờ người nhà đưa đến bệnh viện gần nhất. Trong lúc chờ đợi, hãy ngồi tựa lưng nghỉ ngơi ở nơi thoáng mát, nới lỏng cổ áo, giữ bình tĩnh và tuyệt đối không gắng sức vận động."
                );
            }
        }

        // 4. Kiểm tra cờ đỏ Hô hấp / Cấp cứu khác
        for (String flag : RESPIRATORY_RED_FLAGS) {
            if (normalized.contains(flag)) {
                log.warn("GUARDRAIL TRIGGERED: Cờ đỏ Hô hấp khớp từ khóa: '{}' -> EMERGENCY", flag);
                return new TriageResult(
                        "EMERGENCY_RESPIRATORY_DISTRESS",
                        "HO_HAP",
                        "EMERGENCY",
                        10,
                        flag,
                        "CẢNH BÁO CẤP CỨU KHẨN CẤP: Dấu hiệu khó thở dữ dội, tím tái là tình trạng suy hô hấp cấp tính đe dọa tính mạng. Hãy gọi ngay 115 hoặc đưa người bệnh đến phòng cấp cứu gần nhất ngay lập tức. Đặt người bệnh ở tư thế nửa nằm nửa ngồi, mở rộng cửa cho thoáng khí và không tụ tập đông người quanh bệnh nhân."
                );
            }
        }

        for (String flag : OTHER_EMERGENCY_FLAGS) {
            if (normalized.contains(flag)) {
                log.warn("GUARDRAIL TRIGGERED: Cờ đỏ cấp cứu khớp từ khóa: '{}' -> EMERGENCY", flag);
                return new TriageResult(
                        "EMERGENCY_CRITICAL_CARE",
                        "CAP_CUU",
                        "EMERGENCY",
                        10,
                        flag,
                        "CẢNH BÁO CẤP CỨU KHẨN CẤP: Tình trạng trên là một cấp cứu nội khoa nghiêm trọng. Cần liên hệ ngay tổng đài Cấp cứu 115 hoặc di chuyển khẩn cấp tới bệnh viện. Giữ cho người bệnh an toàn, không nhét bất cứ vật gì vào miệng khi co giật và nghiêng nhẹ đầu sang một bên để tránh hít sặc."
                );
            }
        }

        // 5. Kiểm tra cây luật từ cơ sở dữ liệu nếu có luật mức EMERGENCY
        try {
            List<TriageRule> rules = triageRuleRepository.findAllByOrderByPriorityDesc();
            for (TriageRule rule : rules) {
                if ("EMERGENCY".equalsIgnoreCase(rule.getRiskLevel())) {
                    String keywordsRaw = rule.getTriggerKeywords();
                    if (keywordsRaw != null && !keywordsRaw.isBlank()) {
                        for (String kw : keywordsRaw.split("[,;]+")) {
                            String clean = kw.trim().toLowerCase();
                            if (!clean.isEmpty() && normalized.contains(clean)) {
                                log.warn("GUARDRAIL TRIGGERED: Khớp luật CSDL mức EMERGENCY: '{}' -> ruleCode={}", clean, rule.getRuleCode());
                                return new TriageResult(
                                        rule.getRuleCode(),
                                        rule.getCategory(),
                                        "EMERGENCY",
                                        rule.getPriority() != null ? rule.getPriority() : 10,
                                        clean,
                                        rule.getAdviceText()
                                );
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Lỗi kiểm tra luật CSDL: {}", e.getMessage());
        }

        // Không phải cấp cứu khẩn cấp -> Cho phép chuyển tiếp sang Tầng 2 (Gemini LLM)
        return null;
    }

    public List<String> getEmergencyQuickReplies() {
        return List.of(
                "Gọi tổng đài cấp cứu 115 ngay",
                "Hướng dẫn sơ cứu trong lúc chờ xe 115",
                "Những điều tuyệt đối không được làm"
        );
    }

    private String normalizeText(String text) {
        if (text == null) return "";
        return text.toLowerCase()
                .replaceAll("\\s+", " ")
                .trim();
    }
}
