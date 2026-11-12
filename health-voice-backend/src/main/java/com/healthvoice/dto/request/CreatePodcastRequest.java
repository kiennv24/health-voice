package com.healthvoice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePodcastRequest {

    @NotBlank(message = "Tiêu đề bài viết không được để trống")
    @Size(max = 255, message = "Tiêu đề không được vượt quá 255 ký tự")
    private String title;

    @NotBlank(message = "Chuyên khoa không được để trống")
    private String category; // TIM_MACH, THAN_KINH, TIEU_HOA, HO_HAP, DINH_DUONG, DUOC_PHAM

    @NotBlank(message = "Tóm tắt không được để trống")
    private String summary;

    @NotBlank(message = "Nội dung bài viết không được để trống")
    private String content;

    private String thumbnailUrl;

    private String defaultVoice; // banmai, thuminh, leminh, giahuy, myan

    private String status; // PUBLISHED, DRAFT
}

