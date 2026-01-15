package com.itwizard.swaedu.modules.zone.service;

import com.itwizard.swaedu.modules.zone.dto.request.ZoneRequestDto;
import com.itwizard.swaedu.modules.zone.dto.response.ZoneResponseDto;

import java.util.List;

public interface ZoneService {
    ZoneResponseDto createZone(ZoneRequestDto request);

    ZoneResponseDto getZoneById(Long id);

    List<ZoneResponseDto> getAllZones();

    ZoneResponseDto updateZone(Long id, ZoneRequestDto request);

    void deleteZone(Long id);
}
