package com.itwizard.swaedu.modules.program.mapper;

import com.itwizard.swaedu.modules.mastercode.entity.MasterCodeEntity;
import com.itwizard.swaedu.modules.mastercode.mapper.MasterCodeMapper;
import com.itwizard.swaedu.modules.program.dto.request.ProgramCreateDto;
import com.itwizard.swaedu.modules.program.dto.request.ProgramUpdateDto;
import com.itwizard.swaedu.modules.program.dto.response.ProgramResponseDto;
import com.itwizard.swaedu.modules.program.entity.ProgramEntity;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper utility class for converting between ProgramEntity and DTOs
 */
public class ProgramMapper {

    private ProgramMapper() {
        // Utility class - prevent instantiation
    }

    /**
     * Convert ProgramEntity to ProgramResponseDto
     */
    public static ProgramResponseDto toResponseDto(ProgramEntity entity) {
        if (entity == null) {
            return null;
        }
        return ProgramResponseDto.builder()
                .id(entity.getId())
                .programId(entity.getProgramId())
                .sessionPart(MasterCodeMapper.toResponseDto(entity.getSessionPart()))
                .name(entity.getName())
                .status(MasterCodeMapper.toResponseDto(entity.getStatus()))
                .programType(MasterCodeMapper.toResponseDto(entity.getProgramType()))
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    /**
     * Convert ProgramCreateDto to ProgramEntity
     */
    public static ProgramEntity toEntity(ProgramCreateDto dto) {
        if (dto == null) {
            return null;
        }
        ProgramEntity entity = new ProgramEntity();
        entity.setName(dto.getName());
        entity.setNotes(dto.getNotes());

        // Set foreign key relationships
        if (dto.getSessionPartId() != null) {
            MasterCodeEntity sessionPart = new MasterCodeEntity();
            sessionPart.setId(dto.getSessionPartId());
            entity.setSessionPart(sessionPart);
        }

        if (dto.getStatusId() != null) {
            MasterCodeEntity status = new MasterCodeEntity();
            status.setId(dto.getStatusId());
            entity.setStatus(status);
        }

        if (dto.getProgramTypeId() != null) {
            MasterCodeEntity programType = new MasterCodeEntity();
            programType.setId(dto.getProgramTypeId());
            entity.setProgramType(programType);
        }

        return entity;
    }

    /**
     * Update existing ProgramEntity with data from ProgramUpdateDto
     */
    public static void updateEntityFromDto(ProgramEntity entity, ProgramUpdateDto dto) {
        if (entity == null || dto == null) {
            return;
        }
        entity.setName(dto.getName());
        entity.setNotes(dto.getNotes());

        // Update foreign key relationships
        if (dto.getSessionPartId() != null) {
            MasterCodeEntity sessionPart = new MasterCodeEntity();
            sessionPart.setId(dto.getSessionPartId());
            entity.setSessionPart(sessionPart);
        } else {
            entity.setSessionPart(null);
        }

        if (dto.getStatusId() != null) {
            MasterCodeEntity status = new MasterCodeEntity();
            status.setId(dto.getStatusId());
            entity.setStatus(status);
        } else {
            entity.setStatus(null);
        }

        if (dto.getProgramTypeId() != null) {
            MasterCodeEntity programType = new MasterCodeEntity();
            programType.setId(dto.getProgramTypeId());
            entity.setProgramType(programType);
        } else {
            entity.setProgramType(null);
        }
    }

    /**
     * Convert list of entities to response DTOs
     */
    public static List<ProgramResponseDto> toResponseDtoList(List<ProgramEntity> entities) {
        if (entities == null) {
            return Collections.emptyList();
        }
        return entities.stream()
                .map(ProgramMapper::toResponseDto)
                .collect(Collectors.toList());
    }
}
