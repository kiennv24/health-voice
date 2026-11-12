package com.healthvoice.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 6 Chuyên mục y tế trọng điểm của Thư viện Podcast Sức Khỏe Health Voice
 */
@Getter
@RequiredArgsConstructor
public enum PodcastCategory {
    TIM_MACH("Tim Mạch & Huyết Áp", "tim-mach"),
    THAN_KINH("Thần Kinh & Đột Quỵ", "than-kinh"),
    TIEU_HOA("Tiêu Hóa & Dạ Dày", "tieu-hoa"),
    HO_HAP("Hô Hấp & Bệnh Theo Mùa", "ho-hap"),
    DINH_DUONG("Dinh Dưỡng & Lối Sống Lành Mạnh", "dinh-duong"),
    DUOC_PHAM("Thuốc & Dược Liệu Hướng Dẫn", "duoc-pham");

    private final String displayName;
    private final String slug;

    public static boolean isValid(String code) {
        if (code == null || code.isBlank()) return false;
        for (PodcastCategory c : values()) {
            if (c.name().equalsIgnoreCase(code.trim())) return true;
        }
        return false;
    }

    public static String getDisplayNameOrCode(String code) {
        if (code == null) return "";
        for (PodcastCategory c : values()) {
            if (c.name().equalsIgnoreCase(code.trim())) {
                return c.getDisplayName();
            }
        }
        return code;
    }
}

