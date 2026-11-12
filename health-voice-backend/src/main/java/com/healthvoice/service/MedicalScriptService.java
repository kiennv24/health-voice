package com.healthvoice.service;

import com.healthvoice.dto.request.ScriptCreateRequest;
import com.healthvoice.dto.request.ScriptUpdateRequest;
import com.healthvoice.dto.response.ScriptResponse;
import com.healthvoice.entity.AudioRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service xử lý nghiệp vụ kịch bản bài viết tư vấn y khoa (MedicalScript)
 */
public interface MedicalScriptService {

    ScriptResponse createScript(ScriptCreateRequest request);

    ScriptResponse updateScript(Long id, ScriptUpdateRequest request);

    ScriptResponse getScriptById(Long id);

    Page<ScriptResponse> getAllScripts(Pageable pageable);

    Page<ScriptResponse> searchScripts(String keyword, Pageable pageable);

    List<ScriptResponse> getPublishedScripts();

    ScriptResponse normalizeScriptContent(Long id);

    AudioRecord generatePodcastAudio(Long scriptId, Integer voiceConfigId, Double speed);

    ScriptResponse publishScript(Long scriptId);

    void deleteScript(Long id);
}

