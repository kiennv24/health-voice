package com.healthvoice.repository;

import com.healthvoice.entity.AudioRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AudioRecordRepository extends JpaRepository<AudioRecord, Long> {

    @EntityGraph(attributePaths = {"script", "voiceConfig"})
    List<AudioRecord> findByScriptId(Long scriptId);

    @EntityGraph(attributePaths = {"script", "voiceConfig"})
    Page<AudioRecord> findAll(Pageable pageable);
}
