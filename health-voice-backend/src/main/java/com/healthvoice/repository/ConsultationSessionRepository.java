package com.healthvoice.repository;

import com.healthvoice.entity.ConsultationSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsultationSessionRepository extends JpaRepository<ConsultationSession, Long> {

    List<ConsultationSession> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    List<ConsultationSession> findByPatientIdAndStatus(Long patientId, String status);
}
