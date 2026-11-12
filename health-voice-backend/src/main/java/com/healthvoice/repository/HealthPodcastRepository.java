package com.healthvoice.repository;

import com.healthvoice.entity.HealthPodcast;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HealthPodcastRepository extends JpaRepository<HealthPodcast, Long> {

    Optional<HealthPodcast> findBySlug(String slug);

    Page<HealthPodcast> findByAuthorIdOrderByCreatedAtDesc(Long authorId, Pageable pageable);

    List<HealthPodcast> findTop5ByStatusOrderByListenCountDesc(String status);

    @Query("SELECT p FROM HealthPodcast p WHERE p.status = 'PUBLISHED' " +
           "AND (:category IS NULL OR :category = '' OR :category = 'ALL' OR p.category = :category) " +
           "AND (:keyword IS NULL OR :keyword = '' OR LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.summary) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY p.createdAt DESC")
    Page<HealthPodcast> searchPublicPodcasts(
            @Param("category") String category,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @Modifying
    @Query("UPDATE HealthPodcast p SET p.viewsCount = p.viewsCount + 1 WHERE p.id = :id")
    void incrementViewsCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE HealthPodcast p SET p.listenCount = p.listenCount + 1 WHERE p.id = :id")
    void incrementListenCount(@Param("id") Long id);

    @Query("SELECT COUNT(p) FROM HealthPodcast p WHERE p.audioUrl LIKE CONCAT('%', :filename, '%')")
    long countByAudioUrlContaining(@Param("filename") String filename);
}

