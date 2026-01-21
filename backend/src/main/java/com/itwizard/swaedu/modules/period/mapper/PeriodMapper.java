package com.itwizard.swaedu.modules.period.mapper;

import com.itwizard.swaedu.modules.period.dto.request.PeriodBulkCreateDto;
import com.itwizard.swaedu.modules.period.dto.request.PeriodCreateDto;
import com.itwizard.swaedu.modules.period.dto.request.PeriodUpdateDto;
import com.itwizard.swaedu.modules.period.dto.response.PeriodResponseDto;
import com.itwizard.swaedu.modules.period.entity.PeriodEntity;
import com.itwizard.swaedu.modules.training.entity.TrainingEntity;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper utility class for converting between PeriodEntity and DTOs
 */
public class PeriodMapper {

    private PeriodMapper() {
        // Utility class - prevent instantiation
    }

    /**
     * Convert PeriodEntity to PeriodResponseDto
     */
    public static PeriodResponseDto toResponseDto(PeriodEntity entity) {
        if (entity == null) {
            return null;
        }
        return PeriodResponseDto.builder()
                .id(entity.getId())
                .date(entity.getDate())
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .numberMainInstructors(entity.getNumberMainInstructors())
                .numberAssistantInstructors(entity.getNumberAssistantInstructors())
                .trainingId(entity.getTrainingId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    /**
     * Convert PeriodCreateDto to PeriodEntity
     */
    public static PeriodEntity toEntity(PeriodCreateDto dto) {
        if (dto == null) {
            return null;
        }
        PeriodEntity entity = new PeriodEntity();
        entity.setDate(dto.getDate());
        entity.setStartTime(dto.getStartTime());
        entity.setEndTime(dto.getEndTime());
        entity.setNumberMainInstructors(dto.getNumberMainInstructors());
        entity.setNumberAssistantInstructors(dto.getNumberAssistantInstructors());

        // Set training reference
        if (dto.getTrainingId() != null) {
            TrainingEntity training = new TrainingEntity();
            training.setId(dto.getTrainingId());
            entity.setTraining(training);
        }

        return entity;
    }

    /**
     * Convert PeriodBulkCreateDto.PeriodItemDto to PeriodEntity
     */
    public static PeriodEntity toEntity(PeriodBulkCreateDto.PeriodItemDto dto, Long trainingId) {
        if (dto == null) {
            return null;
        }
        PeriodEntity entity = new PeriodEntity();
        entity.setDate(dto.getDate());
        entity.setStartTime(dto.getStartTime());
        entity.setEndTime(dto.getEndTime());
        entity.setNumberMainInstructors(dto.getNumberMainInstructors());
        entity.setNumberAssistantInstructors(dto.getNumberAssistantInstructors());

        // Set training reference
        if (trainingId != null) {
            TrainingEntity training = new TrainingEntity();
            training.setId(trainingId);
            entity.setTraining(training);
        }

        return entity;
    }

    /**
     * Update existing PeriodEntity with data from PeriodUpdateDto
     */
    public static void updateEntityFromDto(PeriodEntity entity, PeriodUpdateDto dto) {
        if (entity == null || dto == null) {
            return;
        }
        entity.setDate(dto.getDate());
        entity.setStartTime(dto.getStartTime());
        entity.setEndTime(dto.getEndTime());
        entity.setNumberMainInstructors(dto.getNumberMainInstructors());
        entity.setNumberAssistantInstructors(dto.getNumberAssistantInstructors());

        // Update training reference
        if (dto.getTrainingId() != null) {
            TrainingEntity training = new TrainingEntity();
            training.setId(dto.getTrainingId());
            entity.setTraining(training);
        }
    }

    /**
     * Convert list of entities to response DTOs
     */
    public static List<PeriodResponseDto> toResponseDtoList(List<PeriodEntity> entities) {
        if (entities == null) {
            return Collections.emptyList();
        }
        return entities.stream()
                .map(PeriodMapper::toResponseDto)
                .collect(Collectors.toList());
    }
}
