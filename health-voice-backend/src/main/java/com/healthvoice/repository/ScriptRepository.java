package com.healthvoice.repository;

import com.healthvoice.entity.MedicalScript;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScriptRepository extends JpaRepository<MedicalScript, Long> {

    @Override
    @EntityGraph(attributePaths = {"category", "doctor"})
    Optional<MedicalScript> findById(Long id);

    @Override
    @EntityGraph(attributePaths = {"category", "doctor"})
    Page<MedicalScript> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"category", "doctor"})
    List<MedicalScript> findByCategoryId(Integer categoryId);

    @EntityGraph(attributePaths = {"category", "doctor"})
    List<MedicalScript> findByDoctorId(Long doctorId);

    @EntityGraph(attributePaths = {"category", "doctor"})
    List<MedicalScript> findByStatus(String status);

    @EntityGraph(attributePaths = {"category", "doctor"})
    Page<MedicalScript> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);

    @EntityGraph(attributePaths = {"category", "doctor"})
    @Query("SELECT s FROM MedicalScript s " +
           "WHERE (:categoryId IS NULL OR s.category.id = :categoryId) " +
           "AND (:status IS NULL OR s.status = :status)")
    Page<MedicalScript> filterScripts(@Param("categoryId") Integer categoryId,
                                      @Param("status") String status,
                                      Pageable pageable);
}
