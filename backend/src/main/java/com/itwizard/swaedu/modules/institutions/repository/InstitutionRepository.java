package com.itwizard.swaedu.modules.institutions.repository;

import com.itwizard.swaedu.modules.institutions.entity.InstitutionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InstitutionRepository extends JpaRepository<InstitutionEntity, Long> {

    // Find by ID excluding soft-deleted
    @Query("SELECT i FROM InstitutionEntity i WHERE i.id = :id AND i.isDelete = FALSE")
    Optional<InstitutionEntity> findByIdAndIsDeleteFalse(@Param("id") Long id);

    // Search with filters
    @Query(value = """
        SELECT i.* FROM institutions i
        WHERE i.is_delete = FALSE
          AND (:q IS NULL OR 
               LOWER(i.name) LIKE '%' || LOWER(CAST(:q AS VARCHAR)) || '%' OR
               LOWER(i.phone_number) LIKE '%' || LOWER(CAST(:q AS VARCHAR)) || '%' OR
               LOWER(i.street) LIKE '%' || LOWER(CAST(:q AS VARCHAR)) || '%' OR
               LOWER(i.additional_address) LIKE '%' || LOWER(CAST(:q AS VARCHAR)) || '%' OR
               LOWER(i.note) LIKE '%' || LOWER(CAST(:q AS VARCHAR)) || '%')
          AND (:institutionTypeId IS NULL OR i.institution_type_id = :institutionTypeId)
          AND (:regionId IS NULL OR i.region_id = :regionId)
          AND (:educationTypeId IS NULL OR i.education_type_id = :educationTypeId)
          AND (:inChargePersonId IS NULL OR i.in_charge_person_id = :inChargePersonId)
        """, nativeQuery = true)
    Page<InstitutionEntity> search(
            @Param("q") String q,
            @Param("institutionTypeId") Long institutionTypeId,
            @Param("regionId") Long regionId,
            @Param("educationTypeId") Long educationTypeId,
            @Param("inChargePersonId") Long inChargePersonId,
            Pageable pageable);
}
