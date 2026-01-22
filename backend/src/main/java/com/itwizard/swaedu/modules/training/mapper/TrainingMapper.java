package com.itwizard.swaedu.modules.training.mapper;

import com.itwizard.swaedu.modules.institutions.entity.InstitutionEntity;
import com.itwizard.swaedu.modules.institutions.mapper.InstitutionMapper;
import com.itwizard.swaedu.modules.program.entity.ProgramEntity;
import com.itwizard.swaedu.modules.program.mapper.ProgramMapper;
import com.itwizard.swaedu.modules.training.dto.request.TrainingCreateDto;
import com.itwizard.swaedu.modules.training.dto.request.TrainingUpdateDto;
import com.itwizard.swaedu.modules.training.dto.response.TrainingResponseDto;
import com.itwizard.swaedu.modules.training.entity.TrainingEntity;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper utility class for converting between TrainingEntity and DTOs
 */
public class TrainingMapper {

    private TrainingMapper() {
        // Utility class - prevent instantiation
    }

    /**
     * Convert TrainingEntity to TrainingResponseDto
     */
    public static TrainingResponseDto toResponseDto(TrainingEntity entity) {
        if (entity == null) {
            return null;
        }
        return TrainingResponseDto.builder()
                .id(entity.getId())
                .trainingId(entity.getTrainingId())
                .name(entity.getName())
                .program(ProgramMapper.toResponseDto(entity.getProgram()))
                .institution(InstitutionMapper.toResponseDto(entity.getInstitution()))
                .description(entity.getDescription())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .note(entity.getNote())
                .grade(entity.getGrade())
                .classInfo(entity.getClassInfo())
                .numberStudents(entity.getNumberStudents())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    /**
     * Convert TrainingCreateDto to TrainingEntity
     */
    public static TrainingEntity toEntity(TrainingCreateDto dto) {
        if (dto == null) {
            return null;
        }
        TrainingEntity entity = new TrainingEntity();
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setNote(dto.getNote());
        entity.setGrade(dto.getGrade());
        entity.setClassInfo(dto.getClassInfo());
        entity.setNumberStudents(dto.getNumberStudents());

        // Set foreign key relationships
        if (dto.getProgramId() != null) {
            ProgramEntity program = new ProgramEntity();
            program.setId(dto.getProgramId());
            entity.setProgram(program);
        }

        if (dto.getInstitutionId() != null) {
            InstitutionEntity institution = new InstitutionEntity();
            institution.setId(dto.getInstitutionId());
            entity.setInstitution(institution);
        }

        return entity;
    }

    /**
     * Update existing TrainingEntity with data from TrainingUpdateDto
     */
    public static void updateEntityFromDto(TrainingEntity entity, TrainingUpdateDto dto) {
        if (entity == null || dto == null) {
            return;
        }
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setNote(dto.getNote());
        entity.setGrade(dto.getGrade());
        entity.setClassInfo(dto.getClassInfo());
        entity.setNumberStudents(dto.getNumberStudents());

        // Update foreign key relationships
        if (dto.getProgramId() != null) {
            ProgramEntity program = new ProgramEntity();
            program.setId(dto.getProgramId());
            entity.setProgram(program);
        }

        if (dto.getInstitutionId() != null) {
            InstitutionEntity institution = new InstitutionEntity();
            institution.setId(dto.getInstitutionId());
            entity.setInstitution(institution);
        }
    }

    /**
     * Convert list of entities to response DTOs
     */
    public static List<TrainingResponseDto> toResponseDtoList(List<TrainingEntity> entities) {
        if (entities == null) {
            return Collections.emptyList();
        }
        return entities.stream()
                .map(TrainingMapper::toResponseDto)
                .collect(Collectors.toList());
    }
}
