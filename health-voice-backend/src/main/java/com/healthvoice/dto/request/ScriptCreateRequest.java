package com.healthvoice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScriptCreateRequest {

    @NotBlank(message = "Tiêu đề kịch bản không được để trống")
    @Size(max = 255, message = "Tiêu đề không được vượt quá 255 ký tự")
    private String title;

    @NotBlank(message = "Nội dung thô của kịch bản y tế không được để trống")
    private String rawContent;

    @NotNull(message = "ID chuyên mục sức khỏe không được để trống")
    private Long categoryId;

    // authorId là tùy chọn, nếu frontend không truyền backend sẽ tự động gán tài khoản mặc định/đang đăng nhập
    private Long authorId;
}
