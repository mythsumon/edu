package com.itwizard.swaedu.modules.mastercode.service;

import com.itwizard.swaedu.exception.ResourceNotFoundException;
import com.itwizard.swaedu.exception.ValidationException;
import com.itwizard.swaedu.modules.mastercode.dto.request.MasterCodeCreateDto;
import com.itwizard.swaedu.modules.mastercode.dto.request.MasterCodePatchDto;
import com.itwizard.swaedu.modules.mastercode.dto.request.MasterCodeUpdateDto;
import com.itwizard.swaedu.modules.mastercode.dto.response.MasterCodeResponseDto;
import com.itwizard.swaedu.modules.mastercode.dto.response.MasterCodeTreeDto;
import com.itwizard.swaedu.modules.mastercode.entity.MasterCodeEntity;
import com.itwizard.swaedu.modules.mastercode.mapper.MasterCodeMapper;
import com.itwizard.swaedu.modules.mastercode.repository.MasterCodeRepository;
import com.itwizard.swaedu.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class MasterCodeServiceImpl implements MasterCodeService {

    private final MasterCodeRepository repository;

    @Override
    @Transactional
    public MasterCodeResponseDto createMasterCode(MasterCodeCreateDto request) {
        MasterCodeEntity parent = null;
        
        // Validate parent exists if provided (parentId is now always required, but can be null)
        if (request.getParentId() != null) {
            parent = repository.findByIdAndIsDeleteFalse(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent master code not found: " + request.getParentId()));
            
            // Prevent circular reference
            validateNoCircularReference(request.getParentId(), null);
        }

        // Validate uniqueness - code is globally unique, codeName is unique within parent
        validateUniqueness(request.getCode(), request.getCodeName(), request.getParentId(), null);

        // Create entity
        MasterCodeEntity entity = MasterCodeMapper.toEntity(request);
        if (parent != null) {
            entity.setParent(parent);
        }

        MasterCodeEntity saved = repository.save(entity);
        return MasterCodeMapper.toResponseDto(saved);
    }

    @Override
    public PageResponse<MasterCodeResponseDto> listMasterCodes(String q, Integer page, Integer size, String sort, Long parentId, Boolean rootOnly) {
        // Parse sort parameter
        Pageable pageable = buildPageable(page, size, sort);
        
        // Search with filters
        Page<MasterCodeEntity> pageResult = repository.search(q, parentId, rootOnly, pageable);
        
        return buildPageResponse(pageResult);
    }

    @Override
    public MasterCodeResponseDto getMasterCodeById(Long id) {
        MasterCodeEntity entity = repository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Master code not found with id: " + id));
        return MasterCodeMapper.toResponseDto(entity);
    }

    @Override
    public MasterCodeResponseDto getMasterCodeByCode(String code) {
        MasterCodeEntity entity = repository.findByCodeAndIsDeleteFalse(code)
                .orElseThrow(() -> new ResourceNotFoundException("Master code not found with code: " + code));
        return MasterCodeMapper.toResponseDto(entity);
    }

    @Override
    @Transactional
    public MasterCodeResponseDto updateMasterCode(Long id, MasterCodeUpdateDto request) {
        MasterCodeEntity entity = repository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Master code not found with id: " + id));

        // Validate uniqueness (excluding current record)
        validateUniqueness(request.getCode(), request.getCodeName(), entity.getParentId(), id);

        // Update entity
        MasterCodeMapper.updateEntityFromDto(entity, request);
        entity.setUpdatedAt(LocalDateTime.now());

        MasterCodeEntity updated = repository.save(entity);
        return MasterCodeMapper.toResponseDto(updated);
    }

    @Override
    @Transactional
    public MasterCodeResponseDto patchMasterCode(Long id, MasterCodePatchDto request) {
        MasterCodeEntity entity = repository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Master code not found with id: " + id));

        // Get values to validate (use existing if not provided in patch)
        String codeToValidate = request.getCode() != null ? request.getCode() : entity.getCode();
        String codeNameToValidate = request.getCodeName() != null ? request.getCodeName() : entity.getCodeName();

        // Validate uniqueness if code or codeName is being changed
        if (request.getCode() != null || request.getCodeName() != null) {
            validateUniqueness(codeToValidate, codeNameToValidate, entity.getParentId(), id);
        }

        // Partial update
        MasterCodeMapper.patchEntityFromDto(entity, request);
        entity.setUpdatedAt(LocalDateTime.now());

        MasterCodeEntity updated = repository.save(entity);
        return MasterCodeMapper.toResponseDto(updated);
    }

    @Override
    @Transactional
    public void deleteMasterCode(Long id) {
        MasterCodeEntity entity = repository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Master code not found with id: " + id));

        // Check for active children
        long childCount = repository.countByParentIdAndIsDeleteFalse(id);
        if (childCount > 0) {
            throw new ValidationException(
                    "Cannot delete master code: it has " + childCount + " active child code(s). " +
                            "Delete or move children first.");
        }

        // Soft delete: rename code to {originalCode}-deleted{id} to free up the code for reuse
        String originalCode = entity.getCode();
        String originalCodeName = entity.getCodeName();
        String deletedCode = originalCode + "-deleted" + id;
        String deletedCodeName = originalCodeName + "-deleted" + id;
        entity.setCode(deletedCode);
        entity.setCodeName(deletedCodeName);
        entity.setIsDelete(true);
        entity.setUpdatedAt(LocalDateTime.now());
        repository.save(entity);
    }

    @Override
    public PageResponse<MasterCodeResponseDto> listRootMasterCodes(String q, Integer page, Integer size, String sort) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<MasterCodeEntity> pageResult = repository.findRoots(q, pageable);
        return buildPageResponse(pageResult);
    }

    @Override
    public PageResponse<MasterCodeResponseDto> listChildren(String parentCode, String q, Integer page, Integer size, String sort) {
        // Find parent by code and validate it exists
        MasterCodeEntity parent = repository.findByCodeAndIsDeleteFalse(parentCode)
                .orElseThrow(() -> new ResourceNotFoundException("Parent master code not found with code: " + parentCode));

        Pageable pageable = buildPageable(page, size, sort);
        Page<MasterCodeEntity> pageResult = repository.findChildren(parent.getId(), q, pageable);
        return buildPageResponse(pageResult);
    }

    @Override
    public PageResponse<MasterCodeResponseDto> listGrandChildren(String grandparentCode, String q, Integer page, Integer size, String sort) {
        // Find grandparent by code and validate it exists
        MasterCodeEntity grandparent = repository.findByCodeAndIsDeleteFalse(grandparentCode)
                .orElseThrow(() -> new ResourceNotFoundException("Grandparent master code not found with code: " + grandparentCode));

        // Get all direct children of the grandparent
        List<MasterCodeEntity> children = repository.findByParentIdAndIsDeleteFalse(grandparent.getId());

        // If no children exist, return empty page
        if (children.isEmpty()) {
            Pageable pageable = buildPageable(page, size, sort);
            return PageResponse.<MasterCodeResponseDto>builder()
                    .items(List.of())
                    .total(0)
                    .page(page != null && page >= 0 ? page : 0)
                    .size(size != null && size > 0 ? size : 20)
                    .totalPages(0)
                    .build();
        }

        // Extract parent IDs
        List<Long> parentIds = children.stream()
                .map(MasterCodeEntity::getId)
                .toList();

        // Find grandchildren (children of children)
        Pageable pageable = buildPageable(page, size, sort);
        Page<MasterCodeEntity> pageResult = repository.findGrandChildren(parentIds, q, pageable);
        return buildPageResponse(pageResult);
    }

    @Override
    public List<MasterCodeTreeDto> getMasterCodeTree(Long rootId, Integer depth) {
        if (rootId != null) {
            // Build tree from specific root
            MasterCodeEntity root = repository.findRootById(rootId)
                    .orElseThrow(() -> new ResourceNotFoundException("Root master code not found: " + rootId));
            return List.of(buildTreeRecursive(root, 0, depth));
        } else {
            // Build tree from all roots
            List<MasterCodeEntity> roots = repository.findRoots(null, Pageable.unpaged()).getContent();
            return roots.stream()
                    .map(root -> buildTreeRecursive(root, 0, depth))
                    .toList();
        }
    }

    @Override
    public boolean checkCodeExists(String code) {
        return repository.existsByCodeAndIsDeleteFalse(code);
    }

    // Private helper methods

    private void validateUniqueness(String code, String codeName, Long parentId, Long excludeId) {
        if (excludeId == null) {
            // Create operation
            // Code is globally unique - check if code already exists
            if (repository.existsByCodeAndIsDeleteFalse(code)) {
                throw new ValidationException(
                        "Master code with code '" + code + "' already exists. Code must be globally unique.");
            }
            // CodeName is unique within parent scope
            if (repository.existsByCodeNameAndParentIdAndIsDeleteFalse(codeName, parentId)) {
                throw new ValidationException(
                        "Master code with name '" + codeName + "' already exists under this parent");
            }
        } else {
            // Update operation
            // Code is globally unique - check if code already exists (excluding current record)
            if (repository.existsByCodeAndIdNotAndIsDeleteFalse(code, excludeId)) {
                throw new ValidationException(
                        "Master code with code '" + code + "' already exists. Code must be globally unique.");
            }
            // CodeName is unique within parent scope (excluding current record)
            if (repository.existsByCodeNameAndParentIdAndIdNotAndIsDeleteFalse(codeName, parentId, excludeId)) {
                throw new ValidationException(
                        "Master code with name '" + codeName + "' already exists under this parent");
            }
        }
    }

    private void validateNoCircularReference(Long parentId, Long currentId) {
        if (parentId == null) {
            return;
        }

        // Check if parentId is a descendant of currentId (would create cycle)
        Long ancestorId = parentId;
        Set<Long> visited = new HashSet<>();

        while (ancestorId != null) {
            if (currentId != null && ancestorId.equals(currentId)) {
                throw new ValidationException("Cannot set parent: would create circular reference");
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

    private MasterCodeTreeDto buildTreeRecursive(MasterCodeEntity node, int currentDepth, Integer maxDepth) {
        if (maxDepth != null && currentDepth >= maxDepth) {
            return MasterCodeMapper.toTreeDto(node, new ArrayList<>());
        }

        List<MasterCodeEntity> children = repository.findByParentIdAndIsDeleteFalse(node.getId());
        List<MasterCodeTreeDto> childDtos = children.stream()
                .map(child -> buildTreeRecursive(child, currentDepth + 1, maxDepth))
                .toList();

        return MasterCodeMapper.toTreeDto(node, childDtos);
    }

    private Pageable buildPageable(Integer page, Integer size, String sort) {
        int pageNumber = page != null && page >= 0 ? page : 0;
        int pageSize = size != null && size > 0 ? size : 20;

        if (sort != null && !sort.isEmpty()) {
            String[] sortParts = sort.split(",");
            if (sortParts.length == 2) {
                String property = sortParts[0].trim();
                // Map entity property names to database column names for native queries
                String columnName = mapPropertyToColumnName(property);
                Sort.Direction direction = "desc".equalsIgnoreCase(sortParts[1].trim()) 
                        ? Sort.Direction.DESC 
                        : Sort.Direction.ASC;
                return PageRequest.of(pageNumber, pageSize, Sort.by(direction, columnName));
            }
        }

        // Default sort uses database column name for native queries
        return PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.ASC, "code_name"));
    }

    /**
     * Maps entity property names (camelCase) to database column names (snake_case)
     * for use with native queries
     */
    private String mapPropertyToColumnName(String property) {
        return switch (property) {
            case "codeName" -> "code_name";
            case "parentId" -> "parent_id";
            case "isDelete" -> "is_delete";
            case "createdAt" -> "created_at";
            case "updatedAt" -> "updated_at";
            default -> property; // Assume property name matches column name (e.g., "code", "id")
        };
    }

    private PageResponse<MasterCodeResponseDto> buildPageResponse(Page<MasterCodeEntity> pageResult) {
        List<MasterCodeResponseDto> items = MasterCodeMapper.toResponseDtoList(pageResult.getContent());
        return PageResponse.<MasterCodeResponseDto>builder()
                .items(items)
                .total(pageResult.getTotalElements())
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalPages(pageResult.getTotalPages())
                .build();
    }
}
