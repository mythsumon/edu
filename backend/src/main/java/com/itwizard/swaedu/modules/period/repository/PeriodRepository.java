package com.itwizard.swaedu.modules.period.repository;

import com.itwizard.swaedu.modules.period.entity.PeriodEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PeriodRepository extends JpaRepository<PeriodEntity, Long> {

    /**
     * Find period by ID with training relationship eagerly loaded
     */
    @Query("""
        SELECT p FROM PeriodEntity p
        LEFT JOIN FETCH p.training t
        WHERE p.id = :id
        """)
    Optional<PeriodEntity> findByIdWithRelations(@Param("id") Long id);

    /**
     * Find all periods by training ID with training relationship eagerly loaded
     */
    @Query("""
        SELECT p FROM PeriodEntity p
        LEFT JOIN FETCH p.training t
        WHERE p.trainingId = :trainingId
        ORDER BY p.date ASC, p.startTime ASC
        """)
    List<PeriodEntity> findByTrainingIdWithRelations(@Param("trainingId") Long trainingId);

    /**
     * Find all periods by training ID (simple query)
     */
    List<PeriodEntity> findByTrainingIdOrderByDateAscStartTimeAsc(Long trainingId);

    /**
     * Delete all periods by training ID
     */
    void deleteByTrainingId(Long trainingId);
}
