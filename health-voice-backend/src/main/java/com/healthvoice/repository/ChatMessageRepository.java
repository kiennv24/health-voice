package com.healthvoice.repository;

import com.healthvoice.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT m FROM ChatMessage m WHERE m.session.id = :sessionId ORDER BY m.createdAt ASC")
    List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(@Param("sessionId") Long sessionId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("DELETE FROM ChatMessage m WHERE m.session.id = :sessionId")
    void deleteBySessionId(@Param("sessionId") Long sessionId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.audioUrl = :audioUrl AND m.session.id != :sessionId")
    long countByAudioUrlInOtherSessions(@Param("audioUrl") String audioUrl, @Param("sessionId") Long sessionId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.audioUrl = :audioUrl")
    long countByAudioUrl(@Param("audioUrl") String audioUrl);

    long countByCreatedAtAfter(LocalDateTime dateTime);
}

