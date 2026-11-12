package com.healthvoice.repository;

import com.healthvoice.entity.FeedbackRating;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRatingRepository extends JpaRepository<FeedbackRating, Long> {

    @EntityGraph(attributePaths = {"audioRecord", "user"})
    List<FeedbackRating> findByAudioRecordId(Long audioRecordId);

    @Query("SELECT f FROM FeedbackRating f WHERE f.audioRecord.script.id = :scriptId ORDER BY f.createdAt DESC")
    List<FeedbackRating> findByScriptId(@Param("scriptId") Long scriptId);

    @Query("SELECT AVG(f.mosScore) FROM FeedbackRating f WHERE f.audioRecord.id = :audioId")
    Double getAverageMosScoreByAudioId(@Param("audioId") Long audioId);

    @Query("SELECT AVG(f.mosScore) FROM FeedbackRating f WHERE f.audioRecord.script.id = :scriptId")
    Double getAverageMosScoreByScriptId(@Param("scriptId") Long scriptId);

    @Query("SELECT AVG(f.mosScore) FROM FeedbackRating f WHERE f.audioRecord.voiceConfig.id = :voiceId")
    Double getAverageMosScoreByVoiceId(@Param("voiceId") Integer voiceId);
}
