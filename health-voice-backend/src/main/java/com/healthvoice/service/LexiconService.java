package com.healthvoice.service;

import com.healthvoice.dto.request.LexiconRequest;
import com.healthvoice.entity.MedicalLexicon;
import com.healthvoice.entity.User;
import com.healthvoice.exception.ResourceNotFoundException;
import com.healthvoice.repository.MedicalLexiconRepository;
import com.healthvoice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LexiconService {

    private final MedicalLexiconRepository lexiconRepository;
    private final UserRepository userRepository;
    private final WebClient webClient;

    @Value("${tts.service.url:http://localhost:8000}")
    private String ttsServiceUrl;

    @Transactional(readOnly = true)
    public List<MedicalLexicon> getAllActive() {
        return lexiconRepository.findByIsActiveTrue();
    }

    @Transactional
    public MedicalLexicon createEntry(LexiconRequest request, Long userId) {
        User creator = null;
        if (userId != null) {
            creator = userRepository.findById(userId).orElse(null);
        }

        MedicalLexicon entry = MedicalLexicon.builder()
                .rawTerm(request.getRawTerm().trim())
                .phoneticReplacement(request.getPhoneticReplacement().trim())
                .category(request.getCategory() != null ? request.getCategory() : "THUAT_NGU")
                .createdBy(creator)
                .isActive(true)
                .build();

        MedicalLexicon saved = lexiconRepository.save(entry);
        try {
            syncWithTtsService();
        } catch (Exception e) {
            log.warn("Không thể đồng bộ tự động lên Python TTS Microservice: {}", e.getMessage());
        }
        return saved;
    }

    @Transactional
    public MedicalLexicon updateEntry(Long id, LexiconRequest request) {
        MedicalLexicon entry = lexiconRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalLexicon", "id", id));

        entry.setRawTerm(request.getRawTerm().trim());
        entry.setPhoneticReplacement(request.getPhoneticReplacement().trim());
        if (request.getCategory() != null) {
            entry.setCategory(request.getCategory());
        }

        MedicalLexicon saved = lexiconRepository.save(entry);
        try {
            syncWithTtsService();
        } catch (Exception e) {
            log.warn("Không thể đồng bộ tự động lên Python TTS: {}", e.getMessage());
        }
        return saved;
    }

    @Transactional
    public void deleteEntry(Long id) {
        MedicalLexicon entry = lexiconRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalLexicon", "id", id));
        entry.setIsActive(false);
        lexiconRepository.save(entry);
        try {
            syncWithTtsService();
        } catch (Exception e) {
            log.warn("Không thể đồng bộ sau khi xóa từ điển: {}", e.getMessage());
        }
    }

    /**
     * Đồng bộ toàn bộ danh sách từ điển sang Python FastAPI TTS Engine
     */
    public Map<String, Object> syncWithTtsService() {
        List<MedicalLexicon> activeList = lexiconRepository.findByIsActiveTrue();
        List<Map<String, String>> payloadEntries = activeList.stream()
                .map(item -> {
                    Map<String, String> map = new HashMap<>();
                    map.put("raw_term", item.getRawTerm());
                    map.put("phonetic_replacement", item.getPhoneticReplacement());
                    map.put("category", item.getCategory() != null ? item.getCategory() : "THUAT_NGU");
                    return map;
                })
                .collect(Collectors.toList());

        Map<String, Object> body = new HashMap<>();
        body.put("entries", payloadEntries);

        try {
            String resp = webClient.post()
                    .uri(ttsServiceUrl + "/api/v1/lexicon/reload")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            log.info("Đã đồng bộ {} từ điển lên Python TTS: {}", activeList.size(), resp);
            Map<String, Object> result = new HashMap<>();
            result.put("syncedCount", activeList.size());
            result.put("status", "SUCCESS");
            return result;
        } catch (Exception e) {
            log.error("Lỗi đồng bộ từ điển lên TTS Service: {}", e.getMessage());
            Map<String, Object> result = new HashMap<>();
            result.put("syncedCount", activeList.size());
            result.put("status", "FAILED");
            result.put("error", e.getMessage());
            return result;
        }
    }
}

