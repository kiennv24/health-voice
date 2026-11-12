package com.healthvoice.service;

import com.healthvoice.dto.request.AdviceTemplateRequest;
import com.healthvoice.entity.AdviceTemplate;
import com.healthvoice.entity.User;
import com.healthvoice.exception.ResourceNotFoundException;
import com.healthvoice.repository.AdviceTemplateRepository;
import com.healthvoice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdviceTemplateService {

    private final AdviceTemplateRepository templateRepository;
    private final UserRepository userRepository;
    private final TtsProxyService ttsProxyService;

    @Transactional(readOnly = true)
    public List<AdviceTemplate> getPublicTemplates() {
        return templateRepository.findByIsPublicTrueOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<AdviceTemplate> getDoctorTemplates(Long doctorId) {
        return templateRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId);
    }

    @Transactional
    public AdviceTemplate createTemplate(AdviceTemplateRequest request, Long doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", doctorId));

        AdviceTemplate template = AdviceTemplate.builder()
                .doctor(doctor)
                .title(request.getTitle().trim())
                .category(request.getCategory() != null ? request.getCategory() : "TIM_MACH")
                .content(request.getContent().trim())
                .voiceCode(request.getVoiceCode() != null ? request.getVoiceCode() : "banmai")
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : false)
                .build();

        // Tự động tổng hợp âm thanh giọng đọc cho phác đồ mẫu
        try {
            TtsProxyService.TtsProxyResult result = ttsProxyService.synthesize(
                    template.getContent(),
                    template.getVoiceCode(),
                    0.0,
                    null
            );
            template.setAudioUrl(result.audioUrl());
        } catch (Exception e) {
            log.warn("Chưa thể tổng hợp audio cho phác đồ mẫu: {}", e.getMessage());
        }

        return templateRepository.save(template);
    }

    @Transactional
    public AdviceTemplate updateTemplate(Long id, AdviceTemplateRequest request, Long doctorId) {
        AdviceTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AdviceTemplate", "id", id));

        template.setTitle(request.getTitle().trim());
        template.setContent(request.getContent().trim());
        if (request.getCategory() != null) template.setCategory(request.getCategory());
        if (request.getVoiceCode() != null) template.setVoiceCode(request.getVoiceCode());
        if (request.getIsPublic() != null) template.setIsPublic(request.getIsPublic());

        // Tổng hợp lại âm thanh nếu nội dung thay đổi
        try {
            TtsProxyService.TtsProxyResult result = ttsProxyService.synthesize(
                    template.getContent(),
                    template.getVoiceCode(),
                    0.0,
                    null
            );
            template.setAudioUrl(result.audioUrl());
        } catch (Exception e) {
            log.warn("Lỗi tổng hợp audio cập nhật phác đồ: {}", e.getMessage());
        }

        return templateRepository.save(template);
    }

    @Transactional
    public void deleteTemplate(Long id, Long doctorId) {
        AdviceTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AdviceTemplate", "id", id));
        templateRepository.delete(template);
    }
}

