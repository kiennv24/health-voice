package com.healthvoice.repository;

import com.healthvoice.entity.AudioCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface AudioCacheRepository extends JpaRepository<AudioCache, Long> {

    Optional<AudioCache> findByTextHash(String textHash);

    long count();

    @Modifying
    @Transactional
    @Query("DELETE FROM AudioCache a WHERE a.audioUrl LIKE CONCAT('%', :filename, '%')")
    void deleteByAudioUrlContaining(@Param("filename") String filename);
}
