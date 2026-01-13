package com.itwizard.swaedu.modules.zone.mapper;

import com.itwizard.swaedu.modules.region.dto.response.RegionResponseDto;
import com.itwizard.swaedu.modules.region.entity.RegionEntity;
import com.itwizard.swaedu.modules.region.mapper.RegionMapper;
import com.itwizard.swaedu.modules.zone.dto.request.ZoneRequestDto;
import com.itwizard.swaedu.modules.zone.dto.response.ZoneResponseDto;
import com.itwizard.swaedu.modules.zone.entity.ZoneEntity;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class ZoneMapper {

    private ZoneMapper() {
        // Utility class - prevent instantiation
    }

    public static ZoneResponseDto toDto(ZoneEntity entity) {
        if (entity == null) {
            return null;
        }
        return ZoneResponseDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .build();
    }

    public static ZoneEntity toEntity(ZoneRequestDto dto) {
        if (dto == null) {
            return null;
        }
        ZoneEntity entity = new ZoneEntity();
        entity.setName(dto.getName());
        return entity;
    }

    public static List<ZoneResponseDto> toDtoList(List<ZoneEntity> entities) {
        if (entities == null) {
            return Collections.emptyList();
        }
        return entities.stream()
                .map(ZoneMapper::toDto)
                .collect(Collectors.toList());
    }

    public static void updateEntityFromRequest(ZoneEntity entity, ZoneRequestDto requestDto) {
        if (entity == null || requestDto == null) {
            return;
        }
        entity.setName(requestDto.getName());
    }

    public static ZoneResponseDto toDtoWithRegions(ZoneEntity entity, List<RegionEntity> regions) {
        if (entity == null) {
            return null;
        }
        List<RegionResponseDto> regionDtos = regions != null 
                ? regions.stream()
                    .map(RegionMapper::toDto)
                    .collect(Collectors.toList())
                : Collections.emptyList();
        
        return ZoneResponseDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .regions(regionDtos)
                .build();
    }
}
