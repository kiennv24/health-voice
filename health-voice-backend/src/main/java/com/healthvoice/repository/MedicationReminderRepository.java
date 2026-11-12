package com.healthvoice.repository;

import com.healthvoice.entity.MedicationReminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicationReminderRepository extends JpaRepository<MedicationReminder, Integer> {

    List<MedicationReminder> findByUserIdOrderByReminderTimeAsc(Long userId);

    List<MedicationReminder> findByIsActiveTrue();

    @Query("SELECT COUNT(m) FROM MedicationReminder m WHERE m.audioUrl = :audioUrl AND m.id != :id")
    long countByAudioUrlInOtherReminders(@Param("audioUrl") String audioUrl, @Param("id") Integer id);

    @Query("SELECT COUNT(m) FROM MedicationReminder m WHERE m.audioUrl = :audioUrl")
    long countByAudioUrl(@Param("audioUrl") String audioUrl);
}

