package com.healthvoice.service;

import com.healthvoice.entity.HealthDiary;
import com.healthvoice.repository.HealthDiaryRepository;
import com.healthvoice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class HealthDiaryServiceTest {

    private HealthDiaryService diaryService;
    private HealthDiaryRepository diaryRepository;
    private UserRepository userRepository;
    private FptAiTtsService fptAiTtsService;
    private TextNormalizationService textNormalizationService;

    @BeforeEach
    void setUp() {
        diaryRepository = Mockito.mock(HealthDiaryRepository.class);
        userRepository = Mockito.mock(UserRepository.class);
        fptAiTtsService = Mockito.mock(FptAiTtsService.class);
        textNormalizationService = new TextNormalizationService();

        diaryService = new HealthDiaryService(
                diaryRepository,
                userRepository,
                fptAiTtsService,
                textNormalizationService
        );

        when(diaryRepository.save(any(HealthDiary.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    @DisplayName("Bóc tách chỉ số huyết áp, nhịp tim, đường huyết và triệu chứng từ giọng nói")
    void testProcessVoiceDiaryClinicalExtraction() {
        String transcript = "Sáng nay thức dậy đo huyết áp 145 trên 95, nhịp tim 82, đường huyết 6.5 mmol/L, thấy hơi đau đầu và mệt mỏi.";
        HealthDiary result = diaryService.processVoiceDiary(transcript, 1L, "banmai");

        assertNotNull(result);
        assertEquals(145, result.getSystolicBp(), "Huyết áp tâm thu bóc tách không chính xác");
        assertEquals(95, result.getDiastolicBp(), "Huyết áp tâm trương bóc tách không chính xác");
        assertEquals(82, result.getHeartRate(), "Nhịp tim bóc tách không chính xác");
        assertEquals(6.5f, result.getBloodGlucose(), "Đường huyết bóc tách không chính xác");
        assertTrue(result.getSymptoms().contains("đau đầu"), "Triệu chứng đau đầu chưa được phát hiện");
        assertTrue(result.getSymptoms().contains("mệt mỏi"), "Triệu chứng mệt mỏi chưa được phát hiện");
        assertEquals("WARNING", result.getAlertLevel(), "Phân loại mức độ nguy cơ chưa chính xác");
        assertNotNull(result.getDoctorAdvice(), "Lời khuyên bác sĩ không được để trống");

        System.out.println("Extracted Diary:");
        System.out.println("BP: " + result.getSystolicBp() + "/" + result.getDiastolicBp());
        System.out.println("HR: " + result.getHeartRate());
        System.out.println("BG: " + result.getBloodGlucose());
        System.out.println("Symptoms: " + result.getSymptoms());
        System.out.println("Alert: " + result.getAlertLevel());
        System.out.println("Advice: " + result.getDoctorAdvice());
    }
}

