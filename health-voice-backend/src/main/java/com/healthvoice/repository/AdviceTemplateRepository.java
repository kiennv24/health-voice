package com.healthvoice.repository;

import com.healthvoice.entity.AdviceTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdviceTemplateRepository extends JpaRepository<AdviceTemplate, Long> {

    List<AdviceTemplate> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);

    List<AdviceTemplate> findByIsPublicTrueOrderByCreatedAtDesc();

    List<AdviceTemplate> findByCategoryAndIsPublicTrue(String category);
}
