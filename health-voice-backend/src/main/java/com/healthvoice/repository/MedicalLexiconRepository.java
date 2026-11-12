package com.healthvoice.repository;

import com.healthvoice.entity.MedicalLexicon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalLexiconRepository extends JpaRepository<MedicalLexicon, Long> {

    List<MedicalLexicon> findByIsActiveTrue();

    List<MedicalLexicon> findByCategoryAndIsActiveTrue(String category);
}
