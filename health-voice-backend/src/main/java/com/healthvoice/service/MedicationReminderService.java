package com.healthvoice.service;

import com.healthvoice.dto.request.MedicationReminderRequest;
import com.healthvoice.entity.MedicationReminder;
import com.healthvoice.exception.ResourceNotFoundException;
import com.healthvoice.repository.AudioCacheRepository;
import com.healthvoice.repository.ChatMessageRepository;
import com.healthvoice.repository.HealthPodcastRepository;
import com.healthvoice.repository.MedicationReminderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MedicationReminderService {

    private final MedicationReminderRepository reminderRepository;
    private final TtsProxyService ttsProxyService;
    private final AudioCacheRepository audioCacheRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final HealthPodcastRepository podcastRepository;

    private static final DateTimeFormatter TIME_FORMATTER_HM = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter TIME_FORMATTER_HMS = DateTimeFormatter.ofPattern("HH:mm:ss");

    private LocalTime parseTime(String timeStr) {
        if (timeStr == null || timeStr.trim().isEmpty()) {
            return LocalTime.of(8, 0);
        }
        String clean = timeStr.trim();
        try {
            if (clean.length() == 5) {
                return LocalTime.parse(clean, TIME_FORMATTER_HM);
            }
            return LocalTime.parse(clean, TIME_FORMATTER_HMS);
        } catch (Exception e) {
            log.warn("Lỗi định dạng giờ '{}', dùng giờ mặc định 08:00: {}", timeStr, e.getMessage());
            return LocalTime.of(8, 0);
        }
    }

    /**
     * Tạo câu văn bản dặn dò y tế ân cần bằng tiếng Việt để FPT.AI tổng hợp giọng đọc
     */
    public String buildSpeechPrompt(String medicineName, String dosage, LocalTime time, String note) {
        String timeDisplay = time.format(TIME_FORMATTER_HM);
        StringBuilder sb = new StringBuilder();
        sb.append("Chào bạn, đã đến ").append(timeDisplay).append(". ");
        sb.append("Đã đến giờ uống thuốc ").append(medicineName.trim()).append(", liều lượng ").append(dosage.trim()).append(". ");
        if (note != null && !note.trim().isBlank()) {
            String cleanNote = note.trim();
            if (!cleanNote.endsWith(".") && !cleanNote.endsWith("!") && !cleanNote.endsWith("?")) {
                cleanNote += ".";
            }
            sb.append(cleanNote).append(" ");
        }
        sb.append("Bạn hãy uống thuốc đúng giờ để đảm bảo hiệu quả điều trị nhé.");
        return sb.toString();
    }

    /**
     * Tổng hợp file giọng đọc nhắc thuốc từ FPT.AI / Edge-TTS
     */
    private String generateAudio(String text, String voiceCode) {
        String selectedVoice = (voiceCode != null && !voiceCode.isBlank()) ? voiceCode : "banmai";
        try {
            TtsProxyService.TtsProxyResult result = ttsProxyService.synthesize(text, selectedVoice, 0.0, null);
            log.info("Tổng hợp audio nhắc thuốc thành công: url={}, engine={}", result.audioUrl(), result.engine());
            return result.audioUrl();
        } catch (Exception e) {
            log.error("Lỗi khi gọi TTS sinh giọng đọc nhắc thuốc: {}", e.getMessage());
            return "/api/audio/stream/fallback";
        }
    }

    @Transactional
    public MedicationReminder createReminder(MedicationReminderRequest req, Long userId) {
        LocalTime time = parseTime(req.getReminderTime());
        String voice = (req.getVoiceCode() != null && !req.getVoiceCode().isBlank()) ? req.getVoiceCode() : "banmai";
        String prompt = buildSpeechPrompt(req.getMedicineName(), req.getDosage(), time, req.getNote());

        log.info("Tạo lịch nhắc thuốc mới cho người dùng {}: thuốc={}, giờ={}", userId, req.getMedicineName(), time);
        String audioUrl = generateAudio(prompt, voice);

        MedicationReminder reminder = MedicationReminder.builder()
                .userId(userId)
                .medicineName(req.getMedicineName().trim())
                .dosage(req.getDosage().trim())
                .reminderTime(time)
                .note(req.getNote() != null ? req.getNote().trim() : "")
                .voiceCode(voice)
                .audioUrl(audioUrl)
                .isActive(true)
                .build();

        return reminderRepository.save(reminder);
    }

    @Transactional
    public MedicationReminder updateReminder(Integer id, MedicationReminderRequest req, Long userId) {
        MedicationReminder reminder = reminderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicationReminder", "id", id));

        String oldAudioUrl = reminder.getAudioUrl();

        LocalTime time = parseTime(req.getReminderTime());
        String voice = (req.getVoiceCode() != null && !req.getVoiceCode().isBlank()) ? req.getVoiceCode() : "banmai";
        String prompt = buildSpeechPrompt(req.getMedicineName(), req.getDosage(), time, req.getNote());
        String audioUrl = generateAudio(prompt, voice);

        reminder.setMedicineName(req.getMedicineName().trim());
        reminder.setDosage(req.getDosage().trim());
        reminder.setReminderTime(time);
        reminder.setNote(req.getNote() != null ? req.getNote().trim() : "");
        reminder.setVoiceCode(voice);
        reminder.setAudioUrl(audioUrl);

        MedicationReminder saved = reminderRepository.save(reminder);

        // Nếu sinh ra file audio mới khác file cũ, kiểm tra và dọn dẹp file cũ
        if (oldAudioUrl != null && !oldAudioUrl.equals(audioUrl)) {
            cleanupAudioIfUnused(oldAudioUrl, id);
        }

        return saved;
    }

    @Transactional(readOnly = true)
    public List<MedicationReminder> getMySchedules(Long userId) {
        return reminderRepository.findByUserIdOrderByReminderTimeAsc(userId);
    }

    @Transactional
    public MedicationReminder markTaken(Integer id, Long userId) {
        MedicationReminder reminder = reminderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicationReminder", "id", id));
        reminder.setLastTriggeredDate(LocalDate.now());
        log.info("Xác nhận đã uống thuốc: id={}, ngày={}", id, LocalDate.now());
        return reminderRepository.save(reminder);
    }

    @Transactional
    public MedicationReminder toggleActive(Integer id, Long userId) {
        MedicationReminder reminder = reminderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicationReminder", "id", id));
        reminder.setIsActive(!Boolean.TRUE.equals(reminder.getIsActive()));
        return reminderRepository.save(reminder);
    }

    @Transactional
    public void deleteReminder(Integer id, Long userId) {
        MedicationReminder reminder = reminderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicationReminder", "id", id));

        String audioUrl = reminder.getAudioUrl();

        // 1. Xóa bản ghi lịch nhắc khỏi cơ sở dữ liệu
        reminderRepository.delete(reminder);
        log.info("Đã xóa lịch nhắc thuốc id: {} của user: {}", id, userId);

        // 2. Dọn dẹp file âm thanh vật lý và cache nếu không còn đối tượng nào dùng chung
        cleanupAudioIfUnused(audioUrl, id);
    }

    /**
     * Kiểm tra xem file âm thanh có còn được dùng ở nơi nào khác không. Nếu không, xóa sạch trên đĩa và bảng cache.
     */
    private void cleanupAudioIfUnused(String audioUrl, Integer reminderId) {
        if (audioUrl == null || audioUrl.isBlank() || audioUrl.contains("fallback")) {
            return;
        }
        try {
            String filename = audioUrl.substring(audioUrl.lastIndexOf('/') + 1);
            long otherReminderCount = reminderId != null
                    ? reminderRepository.countByAudioUrlInOtherReminders(audioUrl, reminderId)
                    : reminderRepository.countByAudioUrl(audioUrl);
            long chatCount = chatMessageRepository.countByAudioUrl(audioUrl);
            long podcastCount = podcastRepository.countByAudioUrlContaining(filename);

            if (otherReminderCount == 0 && chatCount == 0 && podcastCount == 0) {
                deletePhysicalAudioFile(filename);
                audioCacheRepository.deleteByAudioUrlContaining(filename);
                log.info("Đã xóa vĩnh viễn file âm thanh nhắc thuốc: {}", filename);
            } else {
                log.info("File âm thanh {} vẫn còn được sử dụng (nhắc thuốc khác: {}, chat: {}, podcast: {}), không xóa file vật lý",
                        filename, otherReminderCount, chatCount, podcastCount);
            }
        } catch (Exception ex) {
            log.warn("Lỗi khi xử lý dọn dẹp file âm thanh nhắc thuốc {}: {}", audioUrl, ex.getMessage());
        }
    }

    /**
     * Xóa file âm thanh vật lý trên đĩa cứng ở các thư mục lưu trữ
     */
    private void deletePhysicalAudioFile(String filename) {
        List<Path> candidatePaths = List.of(
                Paths.get("d:/health-voice-project/tts-service/audio_storage", filename),
                Paths.get("d:/health-voice-project/audio_storage", filename),
                Paths.get("audio_storage", filename),
                Paths.get("../tts-service/audio_storage", filename),
                Paths.get("../audio_storage", filename)
        );

        for (Path path : candidatePaths) {
            try {
                if (Files.exists(path)) {
                    Files.delete(path);
                    log.info("Đã xóa thành công file vật lý: {}", path.toAbsolutePath());
                }
            } catch (Exception e) {
                log.warn("Không thể xóa file vật lý {}: {}", path.toAbsolutePath(), e.getMessage());
            }
        }
    }
}

