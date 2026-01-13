package com.itwizard.swaedu.modules.region.mapper;

import com.itwizard.swaedu.modules.region.dto.request.RegionRequestDto;
import com.itwizard.swaedu.modules.region.dto.response.RegionResponseDto;
import com.itwizard.swaedu.modules.region.entity.RegionEntity;
import com.itwizard.swaedu.modules.zone.entity.ZoneEntity;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class RegionMapper {

    private RegionMapper() {
        // Utility class - prevent instantiation
    }

    public static RegionResponseDto toDto(RegionEntity entity) {
        if (entity == null) {
            return null;
        }
        return RegionResponseDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .zoneId(entity.getZoneId())
                .zoneName(entity.getZone() != null ? entity.getZone().getName() : null)
                .build();
    }

    public static RegionEntity toEntity(RegionRequestDto dto, ZoneEntity zone) {
        if (dto == null) {
            return null;
        }
        RegionEntity entity = new RegionEntity();
        entity.setName(dto.getName());
        entity.setZone(zone);
        return entity;
    }

    public static List<RegionResponseDto> toDtoList(List<RegionEntity> entities) {
        if (entities == null) {
            return Collections.emptyList();
        }
        return entities.stream()
                .map(RegionMapper::toDto)
                .collect(Collectors.toList());
    }

    public static void updateEntityFromRequest(RegionEntity entity, RegionRequestDto requestDto, ZoneEntity zone) {
        if (entity == null || requestDto == null) {
            return;
        }
        entity.setName(requestDto.getName());
        entity.setZone(zone);
    }
}
