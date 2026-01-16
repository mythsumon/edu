package com.itwizard.swaedu.modules.mastercode.repository;

import com.itwizard.swaedu.modules.mastercode.entity.MasterCodeEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MasterCodeRepository extends JpaRepository<MasterCodeEntity, Long> {

    // Find by ID excluding soft-deleted
    @Query("SELECT mc FROM MasterCodeEntity mc WHERE mc.id = :id AND mc.isDelete = FALSE")
    Optional<MasterCodeEntity> findByIdAndIsDeleteFalse(@Param("id") Long id);

    // Find by code excluding soft-deleted - code is globally unique
    @Query("SELECT mc FROM MasterCodeEntity mc WHERE mc.code = :code AND mc.isDelete = FALSE")
    Optional<MasterCodeEntity> findByCodeAndIsDeleteFalse(@Param("code") String code);

    // Check if code exists globally (excluding soft-deleted) - code is globally unique
    @Query("SELECT COUNT(mc) > 0 FROM MasterCodeEntity mc WHERE mc.code = :code AND mc.isDelete = FALSE")
    boolean existsByCodeAndIsDeleteFalse(@Param("code") String code);

    // Check if codeName exists under parent (excluding soft-deleted) - codeName is unique within parent
    @Query("SELECT COUNT(mc) > 0 FROM MasterCodeEntity mc WHERE mc.codeName = :codeName AND (mc.parentId = :parentId OR (:parentId IS NULL AND mc.parentId IS NULL)) AND mc.isDelete = FALSE")
    boolean existsByCodeNameAndParentIdAndIsDeleteFalse(@Param("codeName") String codeName, @Param("parentId") Long parentId);

    // Check code uniqueness excluding current record (for updates) - code is globally unique
    @Query("SELECT COUNT(mc) > 0 FROM MasterCodeEntity mc WHERE mc.code = :code AND mc.id != :excludeId AND mc.isDelete = FALSE")
    boolean existsByCodeAndIdNotAndIsDeleteFalse(@Param("code") String code, @Param("excludeId") Long excludeId);

    // Check codeName uniqueness excluding current record (for updates) - codeName is unique within parent
    @Query("SELECT COUNT(mc) > 0 FROM MasterCodeEntity mc WHERE mc.codeName = :codeName AND (mc.parentId = :parentId OR (:parentId IS NULL AND mc.parentId IS NULL)) AND mc.id != :excludeId AND mc.isDelete = FALSE")
    boolean existsByCodeNameAndParentIdAndIdNotAndIsDeleteFalse(@Param("codeName") String codeName, @Param("parentId") Long parentId, @Param("excludeId") Long excludeId);

    // Search with filters - using native query for proper PostgreSQL type handling
    @Query(value = """
        SELECT mc.* FROM master_code mc
        WHERE mc.is_delete = FALSE
          AND (:q IS NULL OR 
               mc.code LIKE '%' || :q || '%' OR
               LOWER(mc.code_name) LIKE '%' || LOWER(:q) || '%')
          AND (:parentId IS NULL OR mc.parent_id = :parentId)
          AND (:rootOnly IS NULL OR :rootOnly = FALSE OR mc.parent_id IS NULL)
        """, nativeQuery = true)
    Page<MasterCodeEntity> search(
            @Param("q") String q,
            @Param("parentId") Long parentId,
            @Param("rootOnly") Boolean rootOnly,
            Pageable pageable);

    // Find root codes (parentId IS NULL) - using native query for proper PostgreSQL type handling
    @Query(value = """
        SELECT mc.* FROM master_code mc
        WHERE mc.is_delete = FALSE
          AND mc.parent_id IS NULL
          AND (:q IS NULL OR 
               mc.code LIKE '%' || :q || '%' OR
               LOWER(mc.code_name) LIKE '%' || LOWER(:q) || '%')
        """, nativeQuery = true)
    Page<MasterCodeEntity> findRoots(
            @Param("q") String q,
            Pageable pageable);

    // Find direct children of a parent - using native query for proper PostgreSQL type handling
    @Query(value = """
        SELECT mc.* FROM master_code mc
        WHERE mc.is_delete = FALSE
          AND mc.parent_id = :parentId
          AND (:q IS NULL OR 
               mc.code LIKE '%' || :q || '%' OR
               LOWER(mc.code_name) LIKE '%' || LOWER(:q) || '%')
        """, nativeQuery = true)
    Page<MasterCodeEntity> findChildren(
            @Param("parentId") Long parentId,
            @Param("q") String q,
            Pageable pageable);

    // Count active children (for delete validation)
    @Query("SELECT COUNT(mc) FROM MasterCodeEntity mc WHERE mc.parentId = :parentId AND mc.isDelete = FALSE")
    long countByParentIdAndIsDeleteFalse(@Param("parentId") Long parentId);

    // Find all children recursively (for tree building)
    @Query("SELECT mc FROM MasterCodeEntity mc WHERE mc.parentId = :parentId AND mc.isDelete = FALSE")
    List<MasterCodeEntity> findByParentIdAndIsDeleteFalse(@Param("parentId") Long parentId);

    // Find root by ID (for tree building)
    @Query("SELECT mc FROM MasterCodeEntity mc WHERE mc.id = :rootId AND mc.parentId IS NULL AND mc.isDelete = FALSE")
    Optional<MasterCodeEntity> findRootById(@Param("rootId") Long rootId);
}
