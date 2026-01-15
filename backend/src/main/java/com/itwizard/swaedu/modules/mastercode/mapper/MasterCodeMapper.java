package com.itwizard.swaedu.modules.mastercode.mapper;

import com.itwizard.swaedu.modules.mastercode.dto.request.MasterCodeCreateDto;
import com.itwizard.swaedu.modules.mastercode.dto.request.MasterCodePatchDto;
import com.itwizard.swaedu.modules.mastercode.dto.request.MasterCodeUpdateDto;
import com.itwizard.swaedu.modules.mastercode.dto.response.MasterCodeResponseDto;
import com.itwizard.swaedu.modules.mastercode.dto.response.MasterCodeTreeDto;
import com.itwizard.swaedu.modules.mastercode.entity.MasterCodeEntity;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper utility class for converting between MasterCodeEntity and DTOs
 */
public class MasterCodeMapper {

    private MasterCodeMapper() {
        // Utility class - prevent instantiation
    }

    /**
     * Convert MasterCodeEntity to MasterCodeResponseDto
     */
    public static MasterCodeResponseDto toResponseDto(MasterCodeEntity entity) {
        if (entity == null) {
            return null;
        }
        Long parentId = entity.getParent() != null ? entity.getParent().getId() : null;
        return MasterCodeResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .codeName(entity.getCodeName())
                .parentId(parentId)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    /**
     * Convert MasterCodeEntity to MasterCodeTreeDto
     */
    public static MasterCodeTreeDto toTreeDto(MasterCodeEntity entity, List<MasterCodeTreeDto> children) {
        if (entity == null) {
            return null;
        }
        Long parentId = entity.getParent() != null ? entity.getParent().getId() : null;
        return MasterCodeTreeDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .codeName(entity.getCodeName())
                .parentId(parentId)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .children(children != null ? children : Collections.emptyList())
                .build();
    }

    /**
     * Convert MasterCodeCreateDto to MasterCodeEntity
     */
    public static MasterCodeEntity toEntity(MasterCodeCreateDto dto) {
        if (dto == null) {
            return null;
        }
        MasterCodeEntity entity = new MasterCodeEntity();
        entity.setCode(dto.getCode());
        entity.setCodeName(dto.getCodeName());
        // parentId will be set via parent relationship in service
        return entity;
    }

    /**
     * Update existing MasterCodeEntity with data from MasterCodeUpdateDto
     */
    public static void updateEntityFromDto(MasterCodeEntity entity, MasterCodeUpdateDto dto) {
        if (entity == null || dto == null) {
            return;
        }
        entity.setCode(dto.getCode());
        entity.setCodeName(dto.getCodeName());
        // parentId is NOT updated - per requirements
    }

    /**
     * Partial update from MasterCodePatchDto
     */
    public static void patchEntityFromDto(MasterCodeEntity entity, MasterCodePatchDto dto) {
        if (entity == null || dto == null) {
            return;
        }
        if (dto.getCode() != null) {
            entity.setCode(dto.getCode());
        }
        if (dto.getCodeName() != null) {
            entity.setCodeName(dto.getCodeName());
        }
        // parentId is NOT updated - per requirements
    }

    /**
     * Convert list of entities to response DTOs
     */
    public static List<MasterCodeResponseDto> toResponseDtoList(List<MasterCodeEntity> entities) {
        if (entities == null) {
            return Collections.emptyList();
        }
        return entities.stream()
                .map(MasterCodeMapper::toResponseDto)
                .collect(Collectors.toList());
    }
}
