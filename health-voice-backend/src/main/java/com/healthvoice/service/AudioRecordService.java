package com.healthvoice.service;

import com.healthvoice.entity.AudioRecord;
import com.healthvoice.entity.MedicalScript;
import com.healthvoice.entity.VoiceConfig;
import com.healthvoice.exception.ResourceNotFoundException;
import com.healthvoice.repository.AudioRecordRepository;
import com.healthvoice.repository.ScriptRepository;
import com.healthvoice.repository.VoiceConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service quản lý các bản ghi âm thanh y khoa (AudioRecord)
 * Kết nối kịch bản y khoa và FptAiTtsService để tổng hợp và lưu trữ podcast
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AudioRecordService {

    private final AudioRecordRepository audioRecordRepository;
    private final ScriptRepository scriptRepository;
    private final VoiceConfigRepository voiceConfigRepository;
    private final FptAiTtsService fptAiTtsService;
    private final TextNormalizationService textNormalizationService;

    /**
     * Tổng hợp kịch bản y tế thành file podcast qua FPT.AI TTS và lưu vào CSDL
     */
    @Transactional
    public AudioRecord generateAudioForScript(Long scriptId, Integer voiceConfigId, Double speed) {
        return generateAudioForScript(scriptId, voiceConfigId, speed, null);
    }

    /**
     * Tổng hợp kịch bản y tế thành file podcast qua FPT.AI TTS và lưu vào CSDL
     * Hỗ trợ truyền trực tiếp văn bản cập nhật từ editor Bác sĩ
     */
    @Transactional
    public AudioRecord generateAudioForScript(Long scriptId, Integer voiceConfigId, Double speed, String customText) {
        log.info("Khởi tạo tiến trình tổng hợp âm thanh cho script ID: {}, voice ID: {}, có customText: {}", 
                scriptId, voiceConfigId, (customText != null && !customText.isBlank()));

        MedicalScript script = scriptRepository.findById(scriptId)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalScript", "id", scriptId));

        VoiceConfig voiceConfig = voiceConfigRepository.findById(voiceConfigId)
                .orElseThrow(() -> new ResourceNotFoundException("VoiceConfig", "id", voiceConfigId));

        // Ưu tiên customText truyền trực tiếp từ editor của Bác sĩ nếu có
        String textToSynthesize;
        if (customText != null && !customText.isBlank()) {
            textToSynthesize = textNormalizationService.normalizeMedicalText(customText.trim());
            script.setNormalizedContent(textToSynthesize);
            scriptRepository.save(script);
        } else {
            String sourceText = (script.getRawContent() != null && !script.getRawContent().isBlank())
                    ? script.getRawContent()
                    : script.getSummaryText();
            textToSynthesize = textNormalizationService.normalizeMedicalText(sourceText);
            script.setNormalizedContent(textToSynthesize);
            scriptRepository.save(script);
        }

        // Gọi FptAiTtsService để sinh audio MP3 và lưu vật lý
        Double actualSpeed = (speed != null) ? speed : (double) voiceConfig.getDefaultSpeed();
        FptAiTtsService.TtsResult ttsResult = fptAiTtsService.synthesizeAndSaveAudio(
                textToSynthesize,
                voiceConfig.getVoiceCode(),
                actualSpeed
        );

        // Lưu bản ghi AudioRecord với trạng thái READY
        AudioRecord audioRecord = AudioRecord.builder()
                .script(script)
                .voiceConfig(voiceConfig)
                .filePath(ttsResult.getFileName())
                .fileSize(ttsResult.getFileSize())
                .durationSeconds(ttsResult.getDurationSeconds())
                .status("READY")
                .listenCount(0L)
                .build();

        AudioRecord savedRecord = audioRecordRepository.save(audioRecord);

        // Cập nhật trạng thái kịch bản thành PROCESSED
        script.setStatus("PROCESSED");
        scriptRepository.save(script);

        log.info("Tổng hợp hoàn tất! AudioRecord ID: {}, File: {}, Size: {} bytes",
                savedRecord.getId(), savedRecord.getFilePath(), savedRecord.getFileSize());

        return savedRecord;
    }

    @Transactional(readOnly = true)
    public AudioRecord getById(Long id) {
        return audioRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AudioRecord", "id", id));
    }

    @Transactional(readOnly = true)
    public List<AudioRecord> getByScriptId(Long scriptId) {
        return audioRecordRepository.findByScriptId(scriptId);
    }

    @Transactional
    public void incrementListenCount(Long id) {
        audioRecordRepository.findById(id).ifPresent(record -> {
            record.setListenCount((record.getListenCount() != null ? record.getListenCount() : 0L) + 1);
            audioRecordRepository.save(record);
        });
    }

    @Transactional(readOnly = true)
    public List<AudioRecord> getAllAudios() {
        return audioRecordRepository.findAll();
    }
}

