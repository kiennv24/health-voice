package com.healthvoice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MedicationReminderRequest {

    @NotBlank(message = "Tên thuốc không được để trống")
    private String medicineName;

    @NotBlank(message = "Liều lượng không được để trống")
    private String dosage;

    @NotBlank(message = "Giờ uống thuốc không được để trống")
    private String reminderTime; // Định dạng HH:mm hoặc HH:mm:ss

    private String note;

    private String voiceCode = "banmai";
}

