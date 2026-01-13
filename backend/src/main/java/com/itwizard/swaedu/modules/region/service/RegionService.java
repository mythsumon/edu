package com.itwizard.swaedu.modules.region.service;

import com.itwizard.swaedu.modules.region.dto.request.RegionRequestDto;
import com.itwizard.swaedu.modules.region.dto.response.RegionResponseDto;

import java.util.List;

public interface RegionService {
    RegionResponseDto createRegion(RegionRequestDto request);

    RegionResponseDto getRegionById(Long id);

    List<RegionResponseDto> getAllRegions();

    List<RegionResponseDto> getRegionsByZoneId(Long zoneId);

    RegionResponseDto updateRegion(Long id, RegionRequestDto request);

    void deleteRegion(Long id);
}
