package com.itwizard.swaedu.modules.training.repository;

import com.itwizard.swaedu.modules.training.entity.TrainingEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TrainingRepository extends JpaRepository<TrainingEntity, Long> {

    // Find by ID excluding soft-deleted - with relationships eagerly loaded
    @Query("""
        SELECT t FROM TrainingEntity t
        LEFT JOIN FETCH t.program p
        LEFT JOIN FETCH p.sessionPart
        LEFT JOIN FETCH p.status
        LEFT JOIN FETCH p.programType
        LEFT JOIN FETCH t.institution i
        WHERE t.id = :id AND t.isDelete = FALSE
        """)
    Optional<TrainingEntity> findByIdAndIsDeleteFalse(@Param("id") Long id);

    // Search with filters - using JPQL with JOIN FETCH to eagerly load relationships (paginated)
    @Query("""
        SELECT DISTINCT t FROM TrainingEntity t
        LEFT JOIN FETCH t.program p
        LEFT JOIN FETCH p.sessionPart
        LEFT JOIN FETCH p.status
        LEFT JOIN FETCH p.programType
        LEFT JOIN FETCH t.institution i
        WHERE t.isDelete = FALSE
          AND (:q IS NULL OR :q = '' OR 
               LOWER(t.name) LIKE LOWER(CONCAT('%', :q, '%')) OR
               LOWER(COALESCE(t.description, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
               LOWER(COALESCE(t.note, '')) LIKE LOWER(CONCAT('%', :q, '%')))
          AND (:programId IS NULL OR t.programId = :programId)
          AND (:institutionId IS NULL OR t.institutionId = :institutionId)
          AND (:programIds IS NULL OR t.programId IN :programIds)
          AND (:institutionIds IS NULL OR t.institutionId IN :institutionIds)
          AND (:startDateFrom IS NULL OR t.startDate >= :startDateFrom)
          AND (:startDateTo IS NULL OR t.startDate <= :startDateTo)
          AND (:endDateFrom IS NULL OR t.endDate >= :endDateFrom)
          AND (:endDateTo IS NULL OR t.endDate <= :endDateTo)
        """)
    Page<TrainingEntity> search(
            @Param("q") String q,
            @Param("programId") Long programId,
            @Param("institutionId") Long institutionId,
            @Param("programIds") List<Long> programIds,
            @Param("institutionIds") List<Long> institutionIds,
            @Param("startDateFrom") LocalDate startDateFrom,
            @Param("startDateTo") LocalDate startDateTo,
            @Param("endDateFrom") LocalDate endDateFrom,
            @Param("endDateTo") LocalDate endDateTo,
            Pageable pageable);

    // Search with filters - returns all records (no pagination)
    @Query("""
        SELECT DISTINCT t FROM TrainingEntity t
        LEFT JOIN FETCH t.program p
        LEFT JOIN FETCH p.sessionPart
        LEFT JOIN FETCH p.status
        LEFT JOIN FETCH p.programType
        LEFT JOIN FETCH t.institution i
        WHERE t.isDelete = FALSE
          AND (:q IS NULL OR :q = '' OR 
               LOWER(t.name) LIKE LOWER(CONCAT('%', :q, '%')) OR
               LOWER(COALESCE(t.description, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
               LOWER(COALESCE(t.note, '')) LIKE LOWER(CONCAT('%', :q, '%')))
          AND (:programId IS NULL OR t.programId = :programId)
          AND (:institutionId IS NULL OR t.institutionId = :institutionId)
          AND (:programIds IS NULL OR t.programId IN :programIds)
          AND (:institutionIds IS NULL OR t.institutionId IN :institutionIds)
          AND (:startDateFrom IS NULL OR t.startDate >= :startDateFrom)
          AND (:startDateTo IS NULL OR t.startDate <= :startDateTo)
          AND (:endDateFrom IS NULL OR t.endDate >= :endDateFrom)
          AND (:endDateTo IS NULL OR t.endDate <= :endDateTo)
        ORDER BY t.name ASC
        """)
    List<TrainingEntity> searchAll(
            @Param("q") String q,
            @Param("programId") Long programId,
            @Param("institutionId") Long institutionId,
            @Param("programIds") List<Long> programIds,
            @Param("institutionIds") List<Long> institutionIds,
            @Param("startDateFrom") LocalDate startDateFrom,
            @Param("startDateTo") LocalDate startDateTo,
            @Param("endDateFrom") LocalDate endDateFrom,
            @Param("endDateTo") LocalDate endDateTo);
}
