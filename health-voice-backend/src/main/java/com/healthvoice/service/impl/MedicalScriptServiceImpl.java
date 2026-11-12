package com.healthvoice.service.impl;

import com.healthvoice.dto.request.ScriptCreateRequest;
import com.healthvoice.dto.request.ScriptUpdateRequest;
import com.healthvoice.dto.response.ScriptResponse;
import com.healthvoice.entity.AudioRecord;
import com.healthvoice.entity.Category;
import com.healthvoice.entity.MedicalScript;
import com.healthvoice.entity.User;
import com.healthvoice.exception.ResourceNotFoundException;
import com.healthvoice.repository.*;
import com.healthvoice.service.AudioRecordService;
import com.healthvoice.service.MedicalScriptService;
import com.healthvoice.service.ScriptService;
import com.healthvoice.service.TextNormalizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@Primary
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MedicalScriptServiceImpl implements MedicalScriptService, ScriptService {

    private final ScriptRepository scriptRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final AudioRecordRepository audioRecordRepository;
    private final FeedbackRatingRepository feedbackRatingRepository;
    private final TextNormalizationService textNormalizationService;
    private final AudioRecordService audioRecordService;

    @Override
    @Transactional
    public ScriptResponse createScript(ScriptCreateRequest request) {
        log.info("Khởi tạo kịch bản tư vấn sức khỏe: {}", request.getTitle());

        Category category = categoryRepository.findById(request.getCategoryId().intValue())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        User doctor;
        if (request.getAuthorId() != null) {
            doctor = userRepository.findById(request.getAuthorId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getAuthorId()));
        } else {
            doctor = userRepository.findAll().stream()
                    .filter(u -> u.getRole() != null && "ROLE_DOCTOR".equals(u.getRole().getName()))
                    .findFirst()
                    .orElseGet(() -> userRepository.findAll().stream().findFirst()
                            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Bác sĩ")));
        }

        String raw = request.getRawContent();
        String normalized = textNormalizationService.normalizeMedicalText(raw);

        String summary = raw.length() > 220 ? raw.substring(0, 217) + "..." : raw;

        MedicalScript script = MedicalScript.builder()
                .title(request.getTitle())
                .rawContent(raw)
                .normalizedContent(normalized)
                .summaryText(summary)
                .category(category)
                .doctor(doctor)
                .status("DRAFT")
                .build();

        MedicalScript savedScript = scriptRepository.save(script);
        log.info("Tạo kịch bản thành công: ID={}", savedScript.getId());

        return mapToResponse(savedScript);
    }

    @Override
    @Transactional
    public ScriptResponse updateScript(Long id, ScriptUpdateRequest request) {
        log.info("Cập nhật kịch bản y tế ID: {}", id);

        MedicalScript script = scriptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalScript", "id", id));

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            script.setTitle(request.getTitle());
        }
        if (request.getRawContent() != null && !request.getRawContent().isBlank()) {
            script.setRawContent(request.getRawContent());
            if (request.getNormalizedContent() == null || request.getNormalizedContent().isBlank()) {
                script.setNormalizedContent(textNormalizationService.normalizeMedicalText(request.getRawContent()));
            }
            if (script.getSummaryText() == null || script.getSummaryText().isBlank()) {
                script.setSummaryText(request.getRawContent().length() > 220
                        ? request.getRawContent().substring(0, 217) + "..."
                        : request.getRawContent());
            }
        }
        if (request.getNormalizedContent() != null && !request.getNormalizedContent().isBlank()) {
            script.setNormalizedContent(request.getNormalizedContent());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            script.setStatus(request.getStatus());
        }
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId().intValue())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            script.setCategory(category);
        }

        MedicalScript updated = scriptRepository.save(script);
        return mapToResponse(updated);
    }

    @Override
    public ScriptResponse getScriptById(Long id) {
        MedicalScript script = scriptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalScript", "id", id));
        return mapToResponse(script);
    }

    @Override
    public Page<ScriptResponse> getAllScripts(Pageable pageable) {
        return scriptRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    public Page<ScriptResponse> searchScripts(String keyword, Pageable pageable) {
        return scriptRepository.findByTitleContainingIgnoreCase(keyword, pageable).map(this::mapToResponse);
    }

    @Override
    public List<ScriptResponse> getPublishedScripts() {
        return scriptRepository.findAll().stream()
                .filter(s -> "PUBLISHED".equalsIgnoreCase(s.getStatus()))
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public ScriptResponse normalizeScriptContent(Long id) {
        MedicalScript script = scriptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalScript", "id", id));

        String normalized = textNormalizationService.normalizeMedicalText(script.getRawContent());
        script.setNormalizedContent(normalized);

        MedicalScript saved = scriptRepository.save(script);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public AudioRecord generatePodcastAudio(Long scriptId, Integer voiceConfigId, Double speed) {
        return audioRecordService.generateAudioForScript(scriptId, voiceConfigId, speed);
    }

    @Override
    @Transactional
    public ScriptResponse publishScript(Long scriptId) {
        MedicalScript script = scriptRepository.findById(scriptId)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalScript", "id", scriptId));

        script.setStatus("PUBLISHED");
        MedicalScript saved = scriptRepository.save(script);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteScript(Long id) {
        if (!scriptRepository.existsById(id)) {
            throw new ResourceNotFoundException("MedicalScript", "id", id);
        }
        scriptRepository.deleteById(id);
    }

    private ScriptResponse mapToResponse(MedicalScript script) {
        List<AudioRecord> records = audioRecordRepository.findByScriptId(script.getId());

        Long audioId = null;
        String audioFileName = null;
        String audioUrl = null;
        Integer durationSeconds = null;
        Long listenCount = 0L;
        Double averageMosScore = null;
        Integer voiceId = null;
        String voiceName = null;
        String voiceCode = null;

        if (!records.isEmpty()) {
            AudioRecord latestAudio = records.get(records.size() - 1);
            audioId = latestAudio.getId();
            audioFileName = latestAudio.getFilePath();
            audioUrl = "/api/audio/stream/" + latestAudio.getId();
            durationSeconds = latestAudio.getDurationSeconds();
            listenCount = latestAudio.getListenCount();

            if (latestAudio.getVoiceConfig() != null) {
                voiceId = latestAudio.getVoiceConfig().getId();
                voiceName = latestAudio.getVoiceConfig().getVoiceName();
                voiceCode = latestAudio.getVoiceConfig().getVoiceCode();
            }

            Double avgMos = feedbackRatingRepository.getAverageMosScoreByAudioId(latestAudio.getId());
            if (avgMos != null) {
                averageMosScore = Math.round(avgMos * 10.0) / 10.0;
            } else {
                averageMosScore = 4.8; // Default rating if new
            }
        }

        String doctorName = (script.getDoctor() != null && script.getDoctor().getFullName() != null)
                ? script.getDoctor().getFullName()
                : "BS. Chuyên Khoa";

        return ScriptResponse.builder()
                .id(script.getId())
                .title(script.getTitle())
                .summaryText(script.getSummaryText())
                .rawContent(script.getRawContent())
                .normalizedContent(script.getNormalizedContent())
                .categoryId(script.getCategory() != null ? Long.valueOf(script.getCategory().getId()) : null)
                .categoryName(script.getCategory() != null ? script.getCategory().getName() : "")
                .authorId(script.getDoctor() != null ? script.getDoctor().getId() : null)
                .authorName(doctorName)
                .doctorName(doctorName)
                .status(script.getStatus())
                .audioId(audioId)
                .audioFileName(audioFileName)
                .audioUrl(audioUrl)
                .durationSeconds(durationSeconds)
                .listenCount(listenCount)
                .averageMosScore(averageMosScore)
                .voiceId(voiceId)
                .voiceName(voiceName)
                .voiceCode(voiceCode)
                .createdAt(script.getCreatedAt())
                .updatedAt(script.getUpdatedAt())
                .build();
    }
}
