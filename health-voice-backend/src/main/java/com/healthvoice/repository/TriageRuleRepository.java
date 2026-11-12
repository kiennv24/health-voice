package com.healthvoice.repository;

import com.healthvoice.entity.TriageRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TriageRuleRepository extends JpaRepository<TriageRule, Integer> {

    /**
     * Lấy toàn bộ cây luật rủi ro y tế sắp xếp theo thứ tự ưu tiên giảm dần
     */
    List<TriageRule> findAllByOrderByPriorityDesc();

    Optional<TriageRule> findByRuleCode(String ruleCode);

    List<TriageRule> findByRiskLevelOrderByPriorityDesc(String riskLevel);
}

