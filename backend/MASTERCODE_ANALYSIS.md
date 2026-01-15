# MasterCode Implementation — Problem Analysis & Solutions

## Executive Summary

This document analyzes the MasterCode API requirements (lines 19-42 in `api-tasks.md`) against the current backend architecture, identifying potential problems and proposing solutions before implementation.

---

## Phase 0: Reconnaissance Findings

### Current State
- ✅ Database schema exists: `master_code` table with hierarchical structure
- ✅ Soft delete support: `is_delete` column present
- ✅ Database constraints: Unique indexes on `(parent_id, code)` and `(parent_id, code_name)`
- ✅ Foreign key constraint: `ON DELETE RESTRICT` prevents orphaned children
- ❌ No MasterCode module implementation exists
- ✅ Reference pattern available: `sample` module demonstrates structure

### Database Schema Details
```sql
master_code (
    id BIGSERIAL PRIMARY KEY,
    code INT NOT NULL,
    code_name VARCHAR(255) NOT NULL,
    parent_id BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_master_code_parent FOREIGN KEY (parent_id) 
        REFERENCES master_code(id) ON DELETE RESTRICT
)
```

**Indexes:**
- `idx_master_code_parent_id` on `parent_id`
- `uq_master_code_parent_code` UNIQUE on `(parent_id, code)`
- `uq_master_code_parent_name` UNIQUE on `(parent_id, code_name)`

---

## Identified Problems & Solutions

### 🔴 Problem 1: API Path Inconsistency

**Issue:**
- Requirements specify: `/api/master-codes`
- Backend rules mandate: `/api/v1/{resource}` prefix
- Existing modules are inconsistent:
  - `AuthController`: `/api/v1/auth` ✅
  - `SampleController`: `/sample` ❌ (missing version)

**Impact:**
- Violates backend architecture rules
- Creates inconsistency across API endpoints
- May break frontend expectations if frontend expects `/api/v1/` prefix

**Solution:**
```java
@RequestMapping("/api/v1/master-codes")  // ✅ Correct
// NOT: @RequestMapping("/api/master-codes")  // ❌ Wrong
```

**Action Required:**
- Update `api-tasks.md` line 21-42 to use `/api/v1/master-codes`
- Ensure all endpoints follow `/api/v1/master-codes` pattern

---

### 🔴 Problem 2: Missing Pagination Response Wrapper

**Issue:**
- Requirements specify pagination for multiple endpoints (list, roots, children)
- Frontend has `PageResponse<T>` interface defined
- Backend has no equivalent pagination wrapper DTO
- Current `SampleController` returns `List<SampleResponseDto>` (no pagination)

**Impact:**
- Cannot return pagination metadata (total, page, size, totalPages)
- Frontend cannot implement proper pagination UI
- Inconsistent with REST API best practices

**Solution:**
Create `PageResponse<T>` DTO in `util/` package:
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {
    private List<T> items;
    private long total;
    private int page;
    private int size;
    private int totalPages;
}
```

**Usage Pattern:**
```java
@GetMapping
public ResponseEntity<ApiResponse> listMasterCodes(
    @RequestParam(required = false) String q,
    @RequestParam(required = false, defaultValue = "0") int page,
    @RequestParam(required = false, defaultValue = "20") int size,
    @RequestParam(required = false) String sort,
    @RequestParam(required = false) Long parentId,
    @RequestParam(required = false) Boolean rootOnly) {
    
    Page<MasterCodeResponseDto> pageResult = service.list(q, page, size, sort, parentId, rootOnly);
    PageResponse<MasterCodeResponseDto> response = PageResponse.<MasterCodeResponseDto>builder()
        .items(pageResult.getContent())
        .total(pageResult.getTotalElements())
        .page(pageResult.getNumber())
        .size(pageResult.getSize())
        .totalPages(pageResult.getTotalPages())
        .build();
    
    return ResponseUtil.success("Master codes retrieved successfully", response);
}
```

---

### 🟡 Problem 3: Hierarchical Query Complexity

**Issue:**
- Endpoint #10: `GET /api/v1/master-codes/tree` requires recursive tree traversal
- Optional parameters: `rootId`, `depth`
- Spring Data JPA does not natively support recursive queries
- Need to handle:
  - Full tree (all roots) vs. subtree (from specific rootId)
  - Depth limiting (optional)
  - Soft-deleted nodes filtering

**Impact:**
- Complex query logic required
- Performance concerns for deep trees
- N+1 query risk if not optimized

**Solution Options:**

**Option A: Recursive CTE (PostgreSQL)**
```java
@Query(value = """
    WITH RECURSIVE code_tree AS (
        SELECT id, code, code_name, parent_id, 0 as depth
        FROM master_code
        WHERE (:rootId IS NULL AND parent_id IS NULL) 
           OR (:rootId IS NOT NULL AND id = :rootId)
          AND is_delete = FALSE
        
        UNION ALL
        
        SELECT mc.id, mc.code, mc.code_name, mc.parent_id, ct.depth + 1
        FROM master_code mc
        INNER JOIN code_tree ct ON mc.parent_id = ct.id
        WHERE mc.is_delete = FALSE
          AND (:maxDepth IS NULL OR ct.depth < :maxDepth)
    )
    SELECT * FROM code_tree
    ORDER BY parent_id NULLS FIRST, code
    """, nativeQuery = true)
List<MasterCodeEntity> findTree(@Param("rootId") Long rootId, @Param("maxDepth") Integer maxDepth);
```

**Option B: Java-based Recursive Loading (Simpler, but N+1 risk)**
```java
public List<MasterCodeTreeDto> buildTree(Long rootId, Integer maxDepth) {
    List<MasterCodeEntity> roots = rootId == null 
        ? repository.findRoots() 
        : List.of(repository.findById(rootId).orElseThrow(...));
    
    return roots.stream()
        .map(root -> buildTreeRecursive(root, 0, maxDepth))
        .toList();
}

private MasterCodeTreeDto buildTreeRecursive(MasterCodeEntity node, int currentDepth, Integer maxDepth) {
    if (maxDepth != null && currentDepth >= maxDepth) {
        return mapper.toTreeDto(node, Collections.emptyList());
    }
    
    List<MasterCodeEntity> children = repository.findByParentIdAndIsDeleteFalse(node.getId());
    List<MasterCodeTreeDto> childDtos = children.stream()
        .map(child -> buildTreeRecursive(child, currentDepth + 1, maxDepth))
        .toList();
    
    return mapper.toTreeDto(node, childDtos);
}
```

**Recommendation:** Option A (CTE) for better performance, Option B for simplicity.

---

### 🟡 Problem 4: Soft Delete Filtering

**Issue:**
- Database has `is_delete` column
- Requirements say "soft delete optional"
- All queries must filter out soft-deleted records
- Delete endpoint should set `is_delete = TRUE` instead of physical delete
- Need to handle soft-deleted parents when creating children

**Impact:**
- Must add `is_delete = FALSE` filter to all repository queries
- Must validate parent is not deleted when creating child
- Must check for children (including soft-deleted) before allowing delete

**Solution:**
```java
// Repository methods
@Query("SELECT mc FROM MasterCodeEntity mc WHERE mc.isDelete = FALSE")
Page<MasterCodeEntity> findAllActive(Pageable pageable);

@Query("SELECT mc FROM MasterCodeEntity mc WHERE mc.parentId = :parentId AND mc.isDelete = FALSE")
List<MasterCodeEntity> findByParentIdAndIsDeleteFalse(@Param("parentId") Long parentId);

@Query("SELECT COUNT(mc) > 0 FROM MasterCodeEntity mc WHERE mc.parentId = :parentId")
boolean hasChildren(@Param("parentId") Long parentId); // Includes soft-deleted for delete validation

// Service delete method
@Transactional
public void deleteMasterCode(Long id) {
    MasterCodeEntity entity = repository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Master code not found: " + id));
    
    if (repository.hasChildren(id)) {
        throw new ValidationException("Cannot delete master code with children. Delete children first.");
    }
    
    entity.setIsDelete(true);
    entity.setUpdatedAt(LocalDateTime.now());
    repository.save(entity);
}
```

---

### 🟡 Problem 5: Uniqueness Validation Logic

**Issue:**
- Database has unique constraints: `(parent_id, code)` and `(parent_id, code_name)`
- Must validate in service layer before save to provide user-friendly errors
- Need to handle NULL parent_id (root codes) correctly
- Update operations must exclude current record from uniqueness check

**Impact:**
- Database constraint violations will throw cryptic errors
- Need explicit validation for better error messages
- Update operations need special handling

**Solution:**
```java
// Repository
boolean existsByCodeAndParentIdAndIsDeleteFalse(Integer code, Long parentId);
boolean existsByCodeNameAndParentIdAndIsDeleteFalse(String codeName, Long parentId);
boolean existsByCodeAndParentIdAndIdNotAndIsDeleteFalse(Integer code, Long parentId, Long excludeId);
boolean existsByCodeNameAndParentIdAndIdNotAndIsDeleteFalse(String codeName, Long parentId, Long excludeId);

// Service validation
private void validateUniqueness(Integer code, String codeName, Long parentId, Long excludeId) {
    if (excludeId == null) {
        // Create operation
        if (repository.existsByCodeAndParentIdAndIsDeleteFalse(code, parentId)) {
            throw new ValidationException(
                "Master code with code '" + code + "' already exists under this parent");
        }
        if (repository.existsByCodeNameAndParentIdAndIsDeleteFalse(codeName, parentId)) {
            throw new ValidationException(
                "Master code with name '" + codeName + "' already exists under this parent");
        }
    } else {
        // Update operation
        if (repository.existsByCodeAndParentIdAndIdNotAndIsDeleteFalse(code, parentId, excludeId)) {
            throw new ValidationException(
                "Master code with code '" + code + "' already exists under this parent");
        }
        if (repository.existsByCodeNameAndParentIdAndIdNotAndIsDeleteFalse(codeName, parentId, excludeId)) {
            throw new ValidationException(
                "Master code with name '" + codeName + "' already exists under this parent");
        }
    }
}
```

---

### 🟡 Problem 6: Parent Update Restriction

**Issue:**
- Requirements explicitly state: "✖ parentId not allowed" in PUT/PATCH
- Business rule: Cannot re-parent master codes after creation
- Must enforce this in DTO validation and service layer

**Impact:**
- Need to exclude `parentId` from update DTOs
- Service layer must ignore any `parentId` in update requests
- Clear error message if client attempts to send `parentId`

**Solution:**
```java
// Update DTO (no parentId field)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MasterCodeUpdateDto {
    @NotNull(message = "Code is required")
    private Integer code;
    
    @NotBlank(message = "Code name is required")
    @Size(max = 255, message = "Code name must not exceed 255 characters")
    private String codeName;
    
    // NO parentId field - explicitly excluded
}

// Service update method
@Transactional
public MasterCodeResponseDto updateMasterCode(Long id, MasterCodeUpdateDto request) {
    MasterCodeEntity entity = repository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Master code not found: " + id));
    
    // Validate uniqueness (excluding current record)
    validateUniqueness(request.getCode(), request.getCodeName(), 
                       entity.getParentId(), id);
    
    // Update only allowed fields
    entity.setCode(request.getCode());
    entity.setCodeName(request.getCodeName());
    entity.setUpdatedAt(LocalDateTime.now());
    // parentId is NOT updated - remains unchanged
    
    return mapper.toDto(repository.save(entity));
}
```

---

### 🟡 Problem 7: Circular Reference Prevention

**Issue:**
- Self-referencing table allows potential circular references
- Example: A → B → C → A (invalid)
- Must prevent setting a descendant as parent

**Impact:**
- Data integrity risk
- Infinite loops in tree traversal
- Application crashes

**Solution:**
```java
private void validateNoCircularReference(Long parentId, Long currentId) {
    if (parentId == null || parentId.equals(currentId)) {
        return; // Root code or self-reference (both invalid)
    }
    
    // Check if parentId is a descendant of currentId
    Long ancestorId = parentId;
    Set<Long> visited = new HashSet<>();
    
    while (ancestorId != null) {
        if (ancestorId.equals(currentId)) {
            throw new ValidationException(
                "Cannot set parent: would create circular reference");
        }
        if (visited.contains(ancestorId)) {
            break; // Safety check for unexpected cycles
        }
        visited.add(ancestorId);
        
        MasterCodeEntity ancestor = repository.findById(ancestorId)
            .orElseThrow(() -> new ResourceNotFoundException("Parent not found: " + parentId));
        ancestorId = ancestor.getParentId();
    }
}

// Use in create/update (if parentId updates were allowed - but they're not per requirements)
// Still useful for create operation validation
```

**Note:** Since parentId updates are not allowed, this is mainly needed for create operations.

---

### 🟡 Problem 8: Search Query Implementation

**Issue:**
- Endpoint requires `q` parameter for general search
- Must search across `code` (INT) and `code_name` (VARCHAR)
- Need case-insensitive partial matching
- Must combine with filters (parentId, rootOnly) and pagination

**Impact:**
- Complex query building
- Performance considerations for large datasets

**Solution:**
```java
@Query("""
    SELECT mc FROM MasterCodeEntity mc
    WHERE mc.isDelete = FALSE
      AND (:q IS NULL OR 
           CAST(mc.code AS string) LIKE CONCAT('%', :q, '%') OR
           LOWER(mc.codeName) LIKE LOWER(CONCAT('%', :q, '%')))
      AND (:parentId IS NULL OR mc.parentId = :parentId)
      AND (:rootOnly IS NULL OR :rootOnly = FALSE OR mc.parentId IS NULL)
    """)
Page<MasterCodeEntity> search(
    @Param("q") String q,
    @Param("parentId") Long parentId,
    @Param("rootOnly") Boolean rootOnly,
    Pageable pageable);
```

---

### 🟢 Problem 9: Delete Validation (Children Check)

**Issue:**
- Requirements: "block delete if children exist (recommended)"
- Database has `ON DELETE RESTRICT` but only prevents physical deletes
- For soft delete, must check in service layer
- Should check only active (non-deleted) children

**Impact:**
- Must implement business logic validation
- Clear error message needed

**Solution:**
```java
@Transactional
public void deleteMasterCode(Long id) {
    MasterCodeEntity entity = repository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Master code not found: " + id));
    
    // Check for active children
    long childCount = repository.countByParentIdAndIsDeleteFalse(id);
    if (childCount > 0) {
        throw new ValidationException(
            "Cannot delete master code: it has " + childCount + " active child code(s). " +
            "Delete or move children first.");
    }
    
    entity.setIsDelete(true);
    entity.setUpdatedAt(LocalDateTime.now());
    repository.save(entity);
}
```

---

### 🟢 Problem 10: Timestamp Management

**Issue:**
- Database has `created_at` (auto) and `updated_at` (manual)
- Entity needs `@EntityListeners(AuditingEntityListener.class)` for `created_at`
- `updated_at` must be set manually in service layer on updates

**Impact:**
- Need JPA Auditing configuration
- Must remember to set `updatedAt` in all update operations

**Solution:**
```java
// Entity
@Entity
@Table(name = "master_code")
@Data
@EntityListeners(AuditingEntityListener.class)
public class MasterCodeEntity {
    // ... fields ...
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate  // Auto-updated if auditing enabled
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

// OR manually set in service (if auditing not configured)
entity.setUpdatedAt(LocalDateTime.now());
```

---

## Implementation Checklist

### Phase 1: Infrastructure
- [ ] Create `PageResponse<T>` DTO in `util/` package
- [ ] Update `api-tasks.md` to use `/api/v1/master-codes` paths
- [ ] Verify JPA Auditing is configured (for timestamps)

### Phase 2: Core Module Structure
- [ ] Create `modules/master-code/` directory structure
- [ ] Entity: `MasterCodeEntity` with proper annotations
- [ ] Repository: `MasterCodeRepository` with custom queries
- [ ] DTOs: Request (Create, Update) and Response DTOs
- [ ] Mapper: `MasterCodeMapper` for Entity ↔ DTO conversion
- [ ] Service: `MasterCodeService` interface and implementation
- [ ] Controller: `MasterCodeController` with all endpoints

### Phase 3: Business Logic
- [ ] Uniqueness validation (code, codeName within parent)
- [ ] Parent existence validation (create child)
- [ ] Soft delete filtering (all queries)
- [ ] Children check before delete
- [ ] Circular reference prevention (create)
- [ ] Search query implementation
- [ ] Tree traversal logic

### Phase 4: Endpoints
- [ ] POST `/api/v1/master-codes` - Create
- [ ] GET `/api/v1/master-codes` - List with pagination
- [ ] GET `/api/v1/master-codes/{id}` - Detail
- [ ] PUT `/api/v1/master-codes/{id}` - Full update
- [ ] PATCH `/api/v1/master-codes/{id}` - Partial update
- [ ] DELETE `/api/v1/master-codes/{id}` - Soft delete
- [ ] GET `/api/v1/master-codes/roots` - Root codes
- [ ] GET `/api/v1/master-codes/{id}/children` - Direct children
- [ ] GET `/api/v1/master-codes/tree` - Tree hierarchy

### Phase 5: Testing & Validation
- [ ] Unit tests for service layer
- [ ] Integration tests for controller endpoints
- [ ] Test pagination, search, filters
- [ ] Test tree traversal (various depths)
- [ ] Test uniqueness constraints
- [ ] Test delete validation (children check)
- [ ] Test soft delete behavior

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Performance issues with deep trees | Medium | Use recursive CTE, add depth limits, consider caching |
| N+1 queries in tree building | Medium | Use batch loading or CTE queries |
| Circular reference bugs | High | Implement validation, add unit tests |
| Uniqueness constraint violations | Medium | Validate in service layer before save |
| Soft delete filtering missed | High | Use repository methods that always filter, add tests |
| Pagination inconsistencies | Low | Use `PageResponse` wrapper consistently |

---

## Recommendations

1. **Start with Simple Implementation**: Begin with Option B (Java-based tree building) for simplicity, optimize to CTE later if needed.

2. **Comprehensive Validation**: Implement all validation logic in service layer, not relying solely on database constraints.

3. **Consistent Error Messages**: Use `ValidationException` with clear, user-friendly messages.

4. **Test Hierarchical Scenarios**: Create test data with multi-level hierarchies to validate tree operations.

5. **Document API**: Update API documentation with all query parameters and response formats.

6. **Consider Caching**: For read-heavy tree operations, consider caching tree structures (with invalidation on updates).

---

## Next Steps

1. Review and approve this analysis
2. Create implementation plan with task breakdown
3. Implement infrastructure (PageResponse, path updates)
4. Implement core module following backend rules
5. Add comprehensive tests
6. Update documentation

---

**Document Version:** 1.0  
**Date:** 2024  
**Status:** Analysis Complete - Ready for Implementation Review
