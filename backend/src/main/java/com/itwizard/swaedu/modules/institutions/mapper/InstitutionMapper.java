package com.itwizard.swaedu.modules.institutions.mapper;

import com.itwizard.swaedu.modules.institutions.dto.request.InstitutionCreateDto;
import com.itwizard.swaedu.modules.institutions.dto.request.InstitutionUpdateDto;
import com.itwizard.swaedu.modules.institutions.dto.response.InstitutionResponseDto;
import com.itwizard.swaedu.modules.institutions.entity.InstitutionEntity;
import com.itwizard.swaedu.modules.mastercode.entity.MasterCodeEntity;
import com.itwizard.swaedu.modules.mastercode.mapper.MasterCodeMapper;
import com.itwizard.swaedu.modules.teacher.entity.Teacher;
import com.itwizard.swaedu.modules.teacher.mapper.TeacherMapper;

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
                .institutionId(entity.getInstitutionId())
                .name(entity.getName())
                .phoneNumber(entity.getPhoneNumber())
                .district(MasterCodeMapper.toResponseDto(entity.getDistrict()))
                .zone(MasterCodeMapper.toResponseDto(entity.getZone()))
                .region(MasterCodeMapper.toResponseDto(entity.getRegion()))
                .street(entity.getStreet())
                .address(entity.getAddress())
                .majorCategory(MasterCodeMapper.toResponseDto(entity.getMajorCategory()))
                .categoryOne(MasterCodeMapper.toResponseDto(entity.getCategoryOne()))
                .categoryTwo(MasterCodeMapper.toResponseDto(entity.getCategoryTwo()))
                .classification(MasterCodeMapper.toResponseDto(entity.getClassification()))
                .notes(entity.getNotes())
                .teacher(TeacherMapper.toResponseDto(entity.getTeacher()))
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
        entity.setAddress(dto.getAddress());
        entity.setNotes(dto.getNotes());
        entity.setSignature(dto.getSignature());

        // Set foreign key relationships if IDs are provided
        if (dto.getTeacherId() != null) {
            Teacher teacher = new Teacher();
            teacher.setUserId(dto.getTeacherId());
            entity.setTeacher(teacher);
        }
        if (dto.getDistrictId() != null) {
            MasterCodeEntity district = new MasterCodeEntity();
            district.setId(dto.getDistrictId());
            entity.setDistrict(district);
        }

        if (dto.getZoneId() != null) {
            MasterCodeEntity zone = new MasterCodeEntity();
            zone.setId(dto.getZoneId());
            entity.setZone(zone);
        }

        if (dto.getRegionId() != null) {
            MasterCodeEntity region = new MasterCodeEntity();
            region.setId(dto.getRegionId());
            entity.setRegion(region);
        }

        if (dto.getMajorCategoryId() != null) {
            MasterCodeEntity majorCategory = new MasterCodeEntity();
            majorCategory.setId(dto.getMajorCategoryId());
            entity.setMajorCategory(majorCategory);
        }

        if (dto.getCategoryOneId() != null) {
            MasterCodeEntity categoryOne = new MasterCodeEntity();
            categoryOne.setId(dto.getCategoryOneId());
            entity.setCategoryOne(categoryOne);
        }

        if (dto.getCategoryTwoId() != null) {
            MasterCodeEntity categoryTwo = new MasterCodeEntity();
            categoryTwo.setId(dto.getCategoryTwoId());
            entity.setCategoryTwo(categoryTwo);
        }

        if (dto.getClassificationId() != null) {
            MasterCodeEntity classification = new MasterCodeEntity();
            classification.setId(dto.getClassificationId());
            entity.setClassification(classification);
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
        entity.setAddress(dto.getAddress());
        entity.setNotes(dto.getNotes());
        entity.setSignature(dto.getSignature());

        // Update foreign key relationships if IDs are provided
        if (dto.getTeacherId() != null) {
            Teacher teacher = new Teacher();
            teacher.setUserId(dto.getTeacherId());
            entity.setTeacher(teacher);
        } else {
            entity.setTeacher(null);
        }
        if (dto.getDistrictId() != null) {
            MasterCodeEntity district = new MasterCodeEntity();
            district.setId(dto.getDistrictId());
            entity.setDistrict(district);
        } else {
            entity.setDistrict(null);
        }

        if (dto.getZoneId() != null) {
            MasterCodeEntity zone = new MasterCodeEntity();
            zone.setId(dto.getZoneId());
            entity.setZone(zone);
        } else {
            entity.setZone(null);
        }

        if (dto.getRegionId() != null) {
            MasterCodeEntity region = new MasterCodeEntity();
            region.setId(dto.getRegionId());
            entity.setRegion(region);
        } else {
            entity.setRegion(null);
        }

        if (dto.getMajorCategoryId() != null) {
            MasterCodeEntity majorCategory = new MasterCodeEntity();
            majorCategory.setId(dto.getMajorCategoryId());
            entity.setMajorCategory(majorCategory);
        } else {
            entity.setMajorCategory(null);
        }

        if (dto.getCategoryOneId() != null) {
            MasterCodeEntity categoryOne = new MasterCodeEntity();
            categoryOne.setId(dto.getCategoryOneId());
            entity.setCategoryOne(categoryOne);
        } else {
            entity.setCategoryOne(null);
        }

        if (dto.getCategoryTwoId() != null) {
            MasterCodeEntity categoryTwo = new MasterCodeEntity();
            categoryTwo.setId(dto.getCategoryTwoId());
            entity.setCategoryTwo(categoryTwo);
        } else {
            entity.setCategoryTwo(null);
        }

        if (dto.getClassificationId() != null) {
            MasterCodeEntity classification = new MasterCodeEntity();
            classification.setId(dto.getClassificationId());
            entity.setClassification(classification);
        } else {
            entity.setClassification(null);
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
