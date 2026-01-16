package com.itwizard.swaedu.modules.institutions.mapper;

import com.itwizard.swaedu.modules.institutions.dto.request.InstitutionCreateDto;
import com.itwizard.swaedu.modules.institutions.dto.request.InstitutionUpdateDto;
import com.itwizard.swaedu.modules.institutions.dto.response.InstitutionResponseDto;
import com.itwizard.swaedu.modules.institutions.entity.InstitutionEntity;
import com.itwizard.swaedu.modules.mastercode.entity.MasterCodeEntity;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper utility class for converting between InstitutionEntity and DTOs
 */
public class InstitutionMapper {

    private InstitutionMapper() {
        // Utility class - prevent instantiation
    }

    /**
     * Convert InstitutionEntity to InstitutionResponseDto
     */
    public static InstitutionResponseDto toResponseDto(InstitutionEntity entity) {
        if (entity == null) {
            return null;
        }
        return InstitutionResponseDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .institutionTypeId(entity.getInstitutionTypeId())
                .phoneNumber(entity.getPhoneNumber())
                .regionId(entity.getRegionId())
                .educationTypeId(entity.getEducationTypeId())
                .street(entity.getStreet())
                .additionalAddress(entity.getAdditionalAddress())
                .note(entity.getNote())
                .inChargePersonId(entity.getInChargePersonId())
                .signature(entity.getSignature())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    /**
     * Convert InstitutionCreateDto to InstitutionEntity
     */
    public static InstitutionEntity toEntity(InstitutionCreateDto dto) {
        if (dto == null) {
            return null;
        }
        InstitutionEntity entity = new InstitutionEntity();
        entity.setName(dto.getName());
        entity.setPhoneNumber(dto.getPhoneNumber());
        entity.setStreet(dto.getStreet());
        entity.setAdditionalAddress(dto.getAdditionalAddress());
        entity.setNote(dto.getNote());
        entity.setInChargePersonId(dto.getInChargePersonId());
        entity.setSignature(dto.getSignature());

        // Set foreign key relationships if IDs are provided
        if (dto.getInstitutionTypeId() != null) {
            MasterCodeEntity institutionType = new MasterCodeEntity();
            institutionType.setId(dto.getInstitutionTypeId());
            entity.setInstitutionType(institutionType);
        }

        if (dto.getRegionId() != null) {
            MasterCodeEntity region = new MasterCodeEntity();
            region.setId(dto.getRegionId());
            entity.setRegion(region);
        }

        if (dto.getEducationTypeId() != null) {
            MasterCodeEntity educationType = new MasterCodeEntity();
            educationType.setId(dto.getEducationTypeId());
            entity.setEducationType(educationType);
        }

        return entity;
    }

    /**
     * Update existing InstitutionEntity with data from InstitutionUpdateDto
     */
    public static void updateEntityFromDto(InstitutionEntity entity, InstitutionUpdateDto dto) {
        if (entity == null || dto == null) {
            return;
        }
        entity.setName(dto.getName());
        entity.setPhoneNumber(dto.getPhoneNumber());
        entity.setStreet(dto.getStreet());
        entity.setAdditionalAddress(dto.getAdditionalAddress());
        entity.setNote(dto.getNote());
        entity.setInChargePersonId(dto.getInChargePersonId());
        entity.setSignature(dto.getSignature());

        // Update foreign key relationships if IDs are provided
        if (dto.getInstitutionTypeId() != null) {
            MasterCodeEntity institutionType = new MasterCodeEntity();
            institutionType.setId(dto.getInstitutionTypeId());
            entity.setInstitutionType(institutionType);
        } else {
            entity.setInstitutionType(null);
        }

        if (dto.getRegionId() != null) {
            MasterCodeEntity region = new MasterCodeEntity();
            region.setId(dto.getRegionId());
            entity.setRegion(region);
        } else {
            entity.setRegion(null);
        }

        if (dto.getEducationTypeId() != null) {
            MasterCodeEntity educationType = new MasterCodeEntity();
            educationType.setId(dto.getEducationTypeId());
            entity.setEducationType(educationType);
        } else {
            entity.setEducationType(null);
        }
    }

    /**
     * Convert list of entities to response DTOs
     */
    public static List<InstitutionResponseDto> toResponseDtoList(List<InstitutionEntity> entities) {
        if (entities == null) {
            return Collections.emptyList();
        }
        return entities.stream()
                .map(InstitutionMapper::toResponseDto)
                .collect(Collectors.toList());
    }
}
