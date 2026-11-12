package com.healthvoice.repository;

import com.healthvoice.entity.VoiceConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoiceConfigRepository extends JpaRepository<VoiceConfig, Integer> {
    Optional<VoiceConfig> findByVoiceCode(String voiceCode);
    List<VoiceConfig> findByIsActiveTrue();
    List<VoiceConfig> findByRegion(String region);
}
