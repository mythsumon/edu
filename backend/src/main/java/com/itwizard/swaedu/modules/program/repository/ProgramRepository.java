package com.itwizard.swaedu.modules.program.repository;

import com.itwizard.swaedu.modules.program.entity.ProgramEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

@Repository
public interface ProgramRepository extends JpaRepository<ProgramEntity, Long> {

    // Find by ID excluding soft-deleted - with relationships eagerly loaded
    @Query("""
        SELECT p FROM ProgramEntity p
        LEFT JOIN FETCH p.sessionPart
        LEFT JOIN FETCH p.status
        LEFT JOIN FETCH p.programType
        WHERE p.id = :id AND p.isDelete = FALSE
        """)
    Optional<ProgramEntity> findByIdAndIsDeleteFalse(@Param("id") Long id);

    // Search with filters - using JPQL with JOIN FETCH to eagerly load relationships
    @Query("""
        SELECT DISTINCT p FROM ProgramEntity p
        LEFT JOIN FETCH p.sessionPart
        LEFT JOIN FETCH p.status
        LEFT JOIN FETCH p.programType
        WHERE p.isDelete = FALSE
          AND (:q IS NULL OR :q = '' OR 
               LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')) OR
               LOWER(COALESCE(p.notes, '')) LIKE LOWER(CONCAT('%', :q, '%')))
          AND (:sessionPartId IS NULL OR p.sessionPartId = :sessionPartId)
          AND (:statusId IS NULL OR p.statusId = :statusId)
          AND (:sessionPartIds IS NULL OR p.sessionPartId IN :sessionPartIds)
          AND (:statusIds IS NULL OR p.statusId IN :statusIds)
        """)
    Page<ProgramEntity> search(
            @Param("q") String q,
            @Param("sessionPartId") Long sessionPartId,
            @Param("statusId") Long statusId,
            @Param("sessionPartIds") List<Long> sessionPartIds,
            @Param("statusIds") List<Long> statusIds,
            Pageable pageable);

    // Stream all programs for export (excluding soft-deleted)
    // Uses JOIN FETCH to eagerly load relationships needed for name display
    @Query("""
        SELECT DISTINCT p FROM ProgramEntity p
        LEFT JOIN FETCH p.sessionPart
        LEFT JOIN FETCH p.status
        LEFT JOIN FETCH p.programType
        WHERE p.isDelete = FALSE
          AND (:q IS NULL OR :q = '' OR 
               LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')) OR
               LOWER(COALESCE(p.notes, '')) LIKE LOWER(CONCAT('%', :q, '%')))
          AND (:statusIds IS NULL OR p.statusId IN :statusIds)
        ORDER BY p.id
        """)
    Stream<ProgramEntity> streamForExport(
            @Param("q") String q,
            @Param("statusIds") List<Long> statusIds);
}
