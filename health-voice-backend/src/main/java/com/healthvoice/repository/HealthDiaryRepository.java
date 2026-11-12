package com.healthvoice.repository;

import com.healthvoice.entity.HealthDiary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthDiaryRepository extends JpaRepository<HealthDiary, Long> {

    List<HealthDiary> findByUserIdOrderByLogDateDesc(Long userId);

    List<HealthDiary> findAllByOrderByLogDateDesc();
}

