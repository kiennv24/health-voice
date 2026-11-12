package com.healthvoice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

class TextNormalizationServiceTest {

    private TextNormalizationService normalizer;

    @BeforeEach
    void setUp() {
        normalizer = new TextNormalizationService();
    }

    @Test
    @DisplayName("Chuẩn hóa chỉ số huyết áp 120/80 mmHg")
    void testBloodPressureNormalization() {
        String input = "Bệnh nhân có chỉ số HA 120/80 mmHg rất ổn định.";
        String output = normalizer.normalize(input);
        System.out.println("Result: " + output);
        assertTrue(output.contains("một trăm hai mươi trên tám mươi mi-li-mét thủy ngân"),
                "Chỉ số huyết áp chưa được chuẩn hóa chính xác");
    }

    @Test
    @DisplayName("Chuẩn hóa đường huyết 5.6 mmol/L")
    void testBloodSugarNormalization() {
        String input = "Mức đường huyết đói 5.6 mmol/L là mục tiêu điều trị.";
        String output = normalizer.normalize(input);
        System.out.println("Result: " + output);
        assertTrue(output.contains("năm phẩy sáu mi-li-mol trên lít"),
                "Chỉ số đường huyết chưa được chuẩn hóa chính xác");
    }

    @Test
    @DisplayName("Chuẩn hóa liều lượng Paracetamol 500mg")
    void testDosageNormalization() {
        String input = "Uống Paracetamol 500mg 1 viên sau ăn.";
        String output = normalizer.normalize(input);
        System.out.println("Result: " + output);
        assertTrue(output.contains("năm trăm mi-li-gam"),
                "Liều lượng mg chưa được chuẩn hóa chính xác");
        assertTrue(output.contains("Pa-ra-xê-ta-mol"),
                "Tên thuốc Paracetamol chưa được phiên âm tiếng Việt");
    }

    @Test
    @DisplayName("Chuẩn hóa từ viết tắt THA và ĐTĐ type 2")
    void testAbbreviationsNormalization() {
        String input = "Bệnh nhân mắc THA và ĐTĐ type 2 cần theo dõi.";
        String output = normalizer.normalize(input);
        System.out.println("Result: " + output);
        assertTrue(output.contains("tăng huyết áp"), "Từ viết tắt THA chưa được chuẩn hóa");
        assertTrue(output.contains("đái tháo đường típ hai"), "Từ viết tắt ĐTĐ type 2 chưa được chuẩn hóa");
    }
}

