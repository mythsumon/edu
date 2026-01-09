package com.itwizard.swaedu.modules.sample.mapper;

import com.itwizard.swaedu.modules.sample.dto.request.SampleRequestDto;
import com.itwizard.swaedu.modules.sample.dto.response.SampleResponseDto;
import com.itwizard.swaedu.modules.sample.entity.SampleEntity;

/**
 * Mapper utility class for converting between SampleEntity and DTOs
 */
public class SampleMapper {

    private SampleMapper() {
        // Utility class - prevent instantiation
    }

    /**
     * Convert SampleEntity to SampleResponseDto
     */
    public static SampleResponseDto toResponseDto(SampleEntity entity) {
        if (entity == null) {
            return null;
        }
        SampleResponseDto dto = new SampleResponseDto();
        dto.setId(entity.getId() != null ? entity.getId().toString() : null);
        dto.setName(entity.getName());
        return dto;
    }

    /**
     * Convert SampleRequestDto to SampleEntity
     */
    public static SampleEntity toEntity(SampleRequestDto requestDto) {
        if (requestDto == null) {
            return null;
        }
        SampleEntity entity = new SampleEntity();
        entity.setName(requestDto.getName());
        return entity;
    }

    /**
     * Update existing SampleEntity with data from SampleRequestDto
     */
    public static void updateEntityFromRequest(SampleEntity entity, SampleRequestDto requestDto) {
        if (entity == null || requestDto == null) {
            return;
        }
        entity.setName(requestDto.getName());
    }

    /**
     * Convert SampleRequestDto to SampleResponseDto
     */
    public static SampleResponseDto requestToResponse(SampleRequestDto requestDto) {
        if (requestDto == null) {
            return null;
        }
        SampleResponseDto responseDto = new SampleResponseDto();
        responseDto.setName(requestDto.getName());
        return responseDto;
    }
}

