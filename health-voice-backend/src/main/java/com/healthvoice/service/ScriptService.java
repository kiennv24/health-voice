package com.healthvoice.service;

import com.healthvoice.dto.request.ScriptCreateRequest;
import com.healthvoice.dto.request.ScriptUpdateRequest;
import com.healthvoice.dto.response.ScriptResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ScriptService {

    ScriptResponse createScript(ScriptCreateRequest request);

    ScriptResponse updateScript(Long id, ScriptUpdateRequest request);

    ScriptResponse getScriptById(Long id);

    Page<ScriptResponse> getAllScripts(Pageable pageable);

    Page<ScriptResponse> searchScripts(String keyword, Pageable pageable);

    ScriptResponse normalizeScriptContent(Long id);

    void deleteScript(Long id);
}
