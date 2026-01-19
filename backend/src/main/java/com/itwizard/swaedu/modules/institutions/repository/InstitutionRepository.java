package com.itwizard.swaedu.modules.institutions.repository;

import com.itwizard.swaedu.modules.institutions.entity.InstitutionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

@Repository
public interface InstitutionRepository extends JpaRepository<InstitutionEntity, Long> {

    // Find by ID excluding soft-deleted - with relationships eagerly loaded
    @Query("""
        SELECT i FROM InstitutionEntity i
        LEFT JOIN FETCH i.district
        LEFT JOIN FETCH i.zone
        LEFT JOIN FETCH i.region
        LEFT JOIN FETCH i.majorCategory
        LEFT JOIN FETCH i.categoryOne
        LEFT JOIN FETCH i.categoryTwo
        LEFT JOIN FETCH i.classification
        LEFT JOIN FETCH i.teacher t
        LEFT JOIN FETCH t.user
        WHERE i.id = :id AND i.isDelete = FALSE
        """)
    Optional<InstitutionEntity> findByIdAndIsDeleteFalse(@Param("id") Long id);

    // Count institutions created on a specific date (for generating institution_id)
    @Query("SELECT COUNT(i) FROM InstitutionEntity i WHERE DATE(i.createdAt) = :date")
    long countByCreatedAtDate(@Param("date") LocalDate date);

    // Search with filters - using JPQL with JOIN FETCH to eagerly load relationships
    @Query("""
        SELECT DISTINCT i FROM InstitutionEntity i
        LEFT JOIN FETCH i.district
        LEFT JOIN FETCH i.zone
        LEFT JOIN FETCH i.region
        LEFT JOIN FETCH i.majorCategory
        LEFT JOIN FETCH i.categoryOne
        LEFT JOIN FETCH i.categoryTwo
        LEFT JOIN FETCH i.classification
        LEFT JOIN FETCH i.teacher t
        LEFT JOIN FETCH t.user
        WHERE i.isDelete = FALSE
          AND (:q IS NULL OR :q = '' OR 
               LOWER(i.name) LIKE LOWER(CONCAT('%', :q, '%')) OR
               LOWER(COALESCE(i.phoneNumber, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
               LOWER(COALESCE(i.street, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
               LOWER(COALESCE(i.address, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
               LOWER(COALESCE(i.notes, '')) LIKE LOWER(CONCAT('%', :q, '%')))
          AND (:majorCategoryIds IS NULL OR i.majorCategoryId IN :majorCategoryIds)
          AND (:categoryOneIds IS NULL OR i.categoryOneId IN :categoryOneIds)
          AND (:categoryTwoIds IS NULL OR i.categoryTwoId IN :categoryTwoIds)
          AND (:classificationIds IS NULL OR i.classificationId IN :classificationIds)
          AND (:districtId IS NULL OR i.districtId = :districtId)
          AND (:zoneIds IS NULL OR i.zoneId IN :zoneIds)
          AND (:regionIds IS NULL OR i.regionId IN :regionIds)
          AND (:teacherId IS NULL OR i.teacherId = :teacherId)
        """)
    Page<InstitutionEntity> search(
            @Param("q") String q,
            @Param("majorCategoryIds") List<Long> majorCategoryIds,
            @Param("categoryOneIds") List<Long> categoryOneIds,
            @Param("categoryTwoIds") List<Long> categoryTwoIds,
            @Param("classificationIds") List<Long> classificationIds,
            @Param("districtId") Long districtId,
            @Param("zoneIds") List<Long> zoneIds,
            @Param("regionIds") List<Long> regionIds,
            @Param("teacherId") Long teacherId,
            Pageable pageable);

    // Stream all institutions for export (excluding soft-deleted)
    // Uses JOIN FETCH to eagerly load relationships needed for name display
    @Query("""
        SELECT DISTINCT i FROM InstitutionEntity i
        LEFT JOIN FETCH i.district
        LEFT JOIN FETCH i.zone
        LEFT JOIN FETCH i.region
        LEFT JOIN FETCH i.majorCategory
        LEFT JOIN FETCH i.categoryOne
        LEFT JOIN FETCH i.categoryTwo
        LEFT JOIN FETCH i.classification
        LEFT JOIN FETCH i.teacher
        WHERE i.isDelete = FALSE
          AND (:q IS NULL OR :q = '' OR 
               LOWER(i.name) LIKE LOWER(CONCAT('%', :q, '%')) OR
               LOWER(COALESCE(i.phoneNumber, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
               LOWER(COALESCE(i.street, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
               LOWER(COALESCE(i.address, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
               LOWER(COALESCE(i.notes, '')) LIKE LOWER(CONCAT('%', :q, '%')))
          AND (:majorCategoryIds IS NULL OR i.majorCategoryId IN :majorCategoryIds)
          AND (:categoryOneIds IS NULL OR i.categoryOneId IN :categoryOneIds)
          AND (:categoryTwoIds IS NULL OR i.categoryTwoId IN :categoryTwoIds)
          AND (:classificationIds IS NULL OR i.classificationId IN :classificationIds)
          AND (:districtId IS NULL OR i.districtId = :districtId)
          AND (:zoneIds IS NULL OR i.zoneId IN :zoneIds)
          AND (:regionIds IS NULL OR i.regionId IN :regionIds)
          AND (:teacherId IS NULL OR i.teacherId = :teacherId)
        ORDER BY i.id
        """)
    Stream<InstitutionEntity> streamForExport(
            @Param("q") String q,
            @Param("majorCategoryIds") List<Long> majorCategoryIds,
            @Param("categoryOneIds") List<Long> categoryOneIds,
            @Param("categoryTwoIds") List<Long> categoryTwoIds,
            @Param("classificationIds") List<Long> classificationIds,
            @Param("districtId") Long districtId,
            @Param("zoneIds") List<Long> zoneIds,
            @Param("regionIds") List<Long> regionIds,
            @Param("teacherId") Long teacherId);
}
