package com.itwizard.swaedu.modules.region.service;

import com.itwizard.swaedu.modules.region.dto.request.RegionRequestDto;
import com.itwizard.swaedu.modules.region.dto.response.RegionDetailResponseDto;
import com.itwizard.swaedu.modules.region.dto.response.RegionListItemDto;
import com.itwizard.swaedu.modules.region.dto.response.RegionResponseDto;

import java.util.List;

public interface RegionService {
    RegionResponseDto createRegion(RegionRequestDto request);

    RegionDetailResponseDto getRegionById(Long id);

    List<RegionListItemDto> getAllRegions();

    List<RegionListItemDto> getRegionsByZoneId(Long zoneId);

    RegionResponseDto updateRegion(Long id, RegionRequestDto request);

    void deleteRegion(Long id);
}
