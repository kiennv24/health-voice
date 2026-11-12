package com.healthvoice.service.impl;

import com.healthvoice.dto.request.ScriptCreateRequest;
import com.healthvoice.dto.request.ScriptUpdateRequest;
import com.healthvoice.dto.response.ScriptResponse;
import com.healthvoice.entity.Category;
import com.healthvoice.entity.MedicalScript;
import com.healthvoice.entity.User;
import com.healthvoice.exception.ResourceNotFoundException;
import com.healthvoice.repository.CategoryRepository;
import com.healthvoice.repository.ScriptRepository;
import com.healthvoice.repository.UserRepository;
import com.healthvoice.service.ScriptService;
import com.healthvoice.service.TextNormalizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScriptServiceImpl implements ScriptService {

    private final ScriptRepository scriptRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final TextNormalizationService textNormalizationService;

    @Override
    @Transactional
    public ScriptResponse createScript(ScriptCreateRequest request) {
        log.info("Bắt đầu tạo kịch bản y tế mới: {}", request.getTitle());

        Category category = categoryRepository.findById(request.getCategoryId().intValue())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        User author;
        if (request.getAuthorId() != null) {
            author = userRepository.findById(request.getAuthorId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getAuthorId()));
        } else {
            author = userRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        }

        MedicalScript script = MedicalScript.builder()
                .title(request.getTitle())
                .rawContent(request.getRawContent())
                .summaryText(request.getRawContent().length() > 200 ? request.getRawContent().substring(0, 197) + "..." : request.getRawContent())
                .category(category)
                .doctor(author)
                .status("DRAFT")
                .build();

        MedicalScript savedScript = scriptRepository.save(script);
        log.info("Tạo kịch bản thành công với ID: {}", savedScript.getId());

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
            if (script.getSummaryText() == null || script.getSummaryText().isBlank()) {
                script.setSummaryText(request.getRawContent().length() > 200 ? request.getRawContent().substring(0, 197) + "..." : request.getRawContent());
            }
        }
        if (request.getNormalizedContent() != null) {
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
    @Transactional
    public ScriptResponse normalizeScriptContent(Long id) {
        log.info("Chuẩn hóa văn bản y tế cho kịch bản ID: {}", id);

        MedicalScript script = scriptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalScript", "id", id));

        String normalized = textNormalizationService.normalizeMedicalText(script.getRawContent());

        script.setNormalizedContent(normalized);
        script.setStatus("PROCESSED");

        MedicalScript saved = scriptRepository.save(script);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteScript(Long id) {
        log.info("Xóa kịch bản y tế ID: {}", id);
        if (!scriptRepository.existsById(id)) {
            throw new ResourceNotFoundException("MedicalScript", "id", id);
        }
        scriptRepository.deleteById(id);
    }

    private ScriptResponse mapToResponse(MedicalScript script) {
        return ScriptResponse.builder()
                .id(script.getId())
                .title(script.getTitle())
                .rawContent(script.getRawContent())
                .normalizedContent(script.getNormalizedContent())
                .categoryId(script.getCategory() != null ? script.getCategory().getId().longValue() : null)
                .categoryName(script.getCategory() != null ? script.getCategory().getName() : null)
                .authorId(script.getDoctor() != null ? script.getDoctor().getId() : null)
                .authorName(script.getDoctor() != null ? script.getDoctor().getFullName() : null)
                .status(script.getStatus())
                .createdAt(script.getCreatedAt())
                .updatedAt(script.getUpdatedAt())
                .build();
    }
}
