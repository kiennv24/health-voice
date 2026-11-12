package com.healthvoice.controller;

import com.healthvoice.dto.request.MedicationReminderRequest;
import com.healthvoice.dto.response.ApiResponse;
import com.healthvoice.entity.MedicationReminder;
import com.healthvoice.entity.User;
import com.healthvoice.repository.UserRepository;
import com.healthvoice.service.MedicationReminderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping({"/api/reminders", "/api/v1/reminders"})
@RequiredArgsConstructor
public class ReminderController {

    private final MedicationReminderService reminderService;
    private final UserRepository userRepository;

    private Long getCurrentUserId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                return userRepository.findByUsernameIgnoreCase(auth.getName())
                        .or(() -> userRepository.findByUsername(auth.getName()))
                        .map(User::getId)
                        .orElse(1L);
            }
        } catch (Exception ignored) {
        }
        return 1L; // Fallback default user id
    }

    /**
     * Lấy danh sách lịch nhắc uống thuốc của bệnh nhân
     */
    @GetMapping({"/my-schedules", ""})
    public ResponseEntity<ApiResponse<List<MedicationReminder>>> getMySchedules(
            @RequestParam(required = false) Long userId) {
        Long targetUserId = (userId != null) ? userId : getCurrentUserId();
        List<MedicationReminder> list = reminderService.getMySchedules(targetUserId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách lịch nhắc thành công", list));
    }

    /**
     * Tạo mới lịch nhắc uống thuốc & tự động tổng hợp giọng dặn dò FPT.AI
     */
    @PostMapping
    public ResponseEntity<ApiResponse<MedicationReminder>> createReminder(
            @Valid @RequestBody MedicationReminderRequest request,
            @RequestParam(required = false) Long userId) {
        Long targetUserId = (userId != null) ? userId : getCurrentUserId();
        MedicationReminder created = reminderService.createReminder(request, targetUserId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo lịch nhắc thuốc và tổng hợp giọng đọc FPT.AI thành công", created));
    }

    /**
     * Chỉnh sửa lịch nhắc uống thuốc & cập nhật file âm thanh
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicationReminder>> updateReminder(
            @PathVariable Integer id,
            @Valid @RequestBody MedicationReminderRequest request,
            @RequestParam(required = false) Long userId) {
        Long targetUserId = (userId != null) ? userId : getCurrentUserId();
        MedicationReminder updated = reminderService.updateReminder(id, request, targetUserId);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật lịch nhắc thành công", updated));
    }

    /**
     * Bật / Tắt trạng thái hoạt động của lịch nhắc
     */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<MedicationReminder>> toggleReminder(
            @PathVariable Integer id,
            @RequestParam(required = false) Long userId) {
        Long targetUserId = (userId != null) ? userId : getCurrentUserId();
        MedicationReminder toggled = reminderService.toggleActive(id, targetUserId);
        return ResponseEntity.ok(ApiResponse.success("Chuyển trạng thái kích hoạt thành công", toggled));
    }

    /**
     * Đánh dấu bệnh nhân đã uống thuốc
     */
    @PostMapping("/{id}/mark-taken")
    public ResponseEntity<ApiResponse<MedicationReminder>> markTaken(
            @PathVariable Integer id,
            @RequestParam(required = false) Long userId) {
        Long targetUserId = (userId != null) ? userId : getCurrentUserId();
        MedicationReminder updated = reminderService.markTaken(id, targetUserId);
        return ResponseEntity.ok(ApiResponse.success("Đã ghi nhận uống thuốc thành công", updated));
    }

    /**
     * Xóa lịch nhắc uống thuốc
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReminder(
            @PathVariable Integer id,
            @RequestParam(required = false) Long userId) {
        Long targetUserId = (userId != null) ? userId : getCurrentUserId();
        reminderService.deleteReminder(id, targetUserId);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa lịch nhắc uống thuốc", null));
    }
}
