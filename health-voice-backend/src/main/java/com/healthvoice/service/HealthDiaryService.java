package com.healthvoice.service;

import com.healthvoice.entity.HealthDiary;
import com.healthvoice.entity.User;
import com.healthvoice.exception.ResourceNotFoundException;
import com.healthvoice.repository.HealthDiaryRepository;
import com.healthvoice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service xử lý Nhật ký sức khỏe bằng giọng nói (Voice Health Diary)
 * Bóc tách chỉ số lâm sàng (Huyết áp, Nhịp tim, Đường huyết) từ lời nói tiếng Việt
 * và sinh phản hồi âm thanh khuyến nghị y khoa qua FPT.AI.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HealthDiaryService {

    private final HealthDiaryRepository diaryRepository;
    private final UserRepository userRepository;
    private final FptAiTtsService fptAiTtsService;
    private final TextNormalizationService textNormalizationService;

    @Transactional(readOnly = true)
    public List<HealthDiary> getDiaries(Long userId) {
        if (userId != null) {
            List<HealthDiary> list = diaryRepository.findByUserIdOrderByLogDateDesc(userId);
            if (!list.isEmpty()) return list;
        }
        return diaryRepository.findAllByOrderByLogDateDesc();
    }

    /**
     * Tiếp nhận đoạn ghi âm / văn bản giọng nói, bóc tách chỉ số và đưa ra khuyến nghị
     */
    @Transactional
    public HealthDiary processVoiceDiary(String transcript, Long userId, String voiceCode) {
        if (transcript == null || transcript.isBlank()) {
            throw new IllegalArgumentException("Nội dung nhật ký giọng nói không được để trống");
        }

        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }
        if (user == null) {
            user = userRepository.findAll().stream().findFirst().orElse(null);
        }

        HealthDiary diary = HealthDiary.builder()
                .user(user)
                .logDate(LocalDateTime.now())
                .rawTranscript(transcript.trim())
                .build();

        // 1. Phân tích bóc tách các chỉ số y tế từ văn bản tiếng Việt
        parseClinicalMetrics(transcript, diary);

        // 2. Đánh giá phân loại mức độ an toàn (Triage)
        evaluateClinicalRisk(diary);

        // 3. Tự động sinh phản hồi âm thanh của Bác sĩ (Audio Advice)
        generateDoctorAdviceAudio(diary, voiceCode != null ? voiceCode : "thuminh");

        HealthDiary saved = diaryRepository.save(diary);
        log.info("Lưu nhật ký sức khỏe giọng nói thành công: ID={}, HA={}/{}, Mức độ={}",
                saved.getId(), saved.getSystolicBp(), saved.getDiastolicBp(), saved.getAlertLevel());

        return saved;
    }

    @Transactional
    public void deleteDiary(Long id) {
        if (!diaryRepository.existsById(id)) {
            throw new ResourceNotFoundException("HealthDiary", "id", id);
        }
        diaryRepository.deleteById(id);
    }

    /**
     * Bóc tách chỉ số Huyết áp, Nhịp tim, Đường huyết bằng biểu thức chính quy (Regex NLP)
     */
    private void parseClinicalMetrics(String text, HealthDiary diary) {
        String lower = text.toLowerCase();

        // 1. Tìm huyết áp (VD: "120/80", "135 trên 85", "huyết áp 140 90")
        Pattern bpPattern1 = Pattern.compile("(?i)(?:huyết áp|ha)?\\s*(\\d{2,3})\\s*(?:/|trên|\\s+)\\s*(\\d{2,3})");
        Matcher bpMatcher1 = bpPattern1.matcher(text);
        if (bpMatcher1.find()) {
            try {
                int sys = Integer.parseInt(bpMatcher1.group(1));
                int dia = Integer.parseInt(bpMatcher1.group(2));
                if (sys >= 60 && sys <= 250 && dia >= 40 && dia <= 160) {
                    diary.setSystolicBp(sys);
                    diary.setDiastolicBp(dia);
                }
            } catch (Exception ignored) {
            }
        }

        // 2. Tìm nhịp tim (VD: "nhịp tim 75", "tim đập 82", " mạch 78")
        Pattern hrPattern = Pattern.compile("(?i)(?:nhịp tim|tim đập|mạch)\\s*[:=]?\\s*(\\d{2,3})");
        Matcher hrMatcher = hrPattern.matcher(text);
        if (hrMatcher.find()) {
            try {
                int hr = Integer.parseInt(hrMatcher.group(1));
                if (hr >= 40 && hr <= 220) {
                    diary.setHeartRate(hr);
                }
            } catch (Exception ignored) {
            }
        }

        // 3. Tìm đường huyết (VD: "đường huyết 5.6", "đường máu 6.2 mmol/L", "đường huyết 110 mg/dL")
        Pattern bgPattern = Pattern.compile("(?i)(?:đường huyết|đường máu)\\s*[:=]?\\s*(\\d+[.,]?\\d*)");
        Matcher bgMatcher = bgPattern.matcher(text);
        if (bgMatcher.find()) {
            try {
                String valStr = bgMatcher.group(1).replace(",", ".");
                float bg = Float.parseFloat(valStr);
                diary.setBloodGlucose(bg);
            } catch (Exception ignored) {
            }
        }

        // 4. Phát hiện triệu chứng (đau đầu, chóng mặt, buồn nôn, mệt mỏi, tức ngực...)
        StringBuilder symptomsList = new StringBuilder();
        String[] knownSymptoms = {
                "đau đầu", "chóng mặt", "hoa mắt", "tức ngực", "khó thở", "mệt mỏi",
                "hồi hộp", "run tay", "buồn nôn", "sốt", "đau nhức", "mất ngủ"
        };
        for (String sym : knownSymptoms) {
            if (lower.contains(sym)) {
                if (symptomsList.length() > 0) symptomsList.append(", ");
                symptomsList.append(sym);
            }
        }
        diary.setSymptoms(symptomsList.length() > 0 ? symptomsList.toString() : "Không ghi nhận triệu chứng bất thường");
    }

    /**
     * Phân loại mức độ cảnh báo lâm sàng (Clinical Triage)
     */
    private void evaluateClinicalRisk(HealthDiary diary) {
        Integer sys = diary.getSystolicBp();
        Integer dia = diary.getDiastolicBp();
        Float bg = diary.getBloodGlucose();
        String symptoms = diary.getSymptoms();

        if (sys != null && dia != null) {
            if (sys >= 160 || dia >= 100) {
                diary.setAlertLevel("DANGER");
                diary.setDoctorAdvice("Cảnh báo: Chỉ số huyết áp " + sys + "/" + dia + " mmHg ở mức Tăng huyết áp độ 2 (Nguy cơ cao). " +
                        "Nếu kèm theo " + symptoms + ", quý vị vui lòng ngồi nghỉ tuyệt đối tại chỗ và liên hệ ngay với Bác sĩ hoặc trạm y tế gần nhất.");
            } else if (sys >= 140 || dia >= 90) {
                diary.setAlertLevel("WARNING");
                diary.setDoctorAdvice("Chỉ số huyết áp " + sys + "/" + dia + " mmHg đang ở ngưỡng Tăng huyết áp độ 1. " +
                        "Quý vị nên nghỉ ngơi yên tĩnh 15 phút tại nơi thoáng khí, hạn chế vận động mạnh và đo lại. Nhớ tuân thủ uống thuốc hạ áp theo đơn Bác sĩ.");
            } else if (sys >= 120 || dia >= 80) {
                diary.setAlertLevel("WARNING");
                diary.setDoctorAdvice("Huyết áp " + sys + "/" + dia + " mmHg ở ngưỡng Tiền tăng huyết áp. " +
                        "Hãy chú ý ăn giảm muối, hạn chế đồ uống có cồn, kiểm soát căng thẳng và theo dõi đều đặn.");
            } else {
                diary.setAlertLevel("NORMAL");
                diary.setDoctorAdvice("Chỉ số huyết áp " + sys + "/" + dia + " mmHg rất lý tưởng. " +
                        "Chúc mừng bạn! Hãy tiếp tục duy trì lối sống lành mạnh, ăn nhiều rau xanh và vận động thể lực phù hợp.");
            }
        } else if (bg != null) {
            if (bg >= 11.0f) {
                diary.setAlertLevel("DANGER");
                diary.setDoctorAdvice("Đường huyết " + bg + " mmol/L ở mức cao đáng báo động. Hãy uống nhiều nước lọc và kiểm tra lại với Bác sĩ chuyên khoa nội tiết.");
            } else if (bg >= 7.0f) {
                diary.setAlertLevel("WARNING");
                diary.setDoctorAdvice("Đường huyết " + bg + " mmol/L hơi cao. Hãy chú ý giảm tinh bột và đồ ngọt trong các bữa ăn tiếp theo.");
            } else {
                diary.setAlertLevel("NORMAL");
                diary.setDoctorAdvice("Chỉ số đường huyết " + bg + " mmol/L nằm trong giới hạn kiểm soát tốt.");
            }
        } else {
            diary.setAlertLevel("NORMAL");
            diary.setDoctorAdvice("Hệ thống đã ghi nhận nhật ký của bạn: \"" + diary.getRawTranscript() + "\". Hãy theo dõi thêm các chỉ số huyết áp và nhịp tim định kỳ.");
        }
    }

    /**
     * Tạo lời khuyên y tế bằng âm thanh FPT.AI
     */
    private void generateDoctorAdviceAudio(HealthDiary diary, String voiceCode) {
        try {
            String advice = diary.getDoctorAdvice();
            if (advice != null && !advice.isBlank()) {
                String normalizedAdvice = textNormalizationService.normalizeMedicalText(advice);
                FptAiTtsService.TtsResult result = fptAiTtsService.synthesizeAndSaveAudio(
                        normalizedAdvice,
                        voiceCode,
                        0.0
                );
                diary.setAdviceAudioPath(result.getFileName());
            }
        } catch (Exception e) {
            log.warn("Không thể sinh voice lời khuyên, dùng audio mặc định: {}", e.getMessage());
            diary.setAdviceAudioPath("sample_thuminh_tieuduong.mp3");
        }
    }
}

