package com.edu.service;

import com.edu.dto.AreaDto;
import com.edu.dto.RegionDto;
import com.edu.dto.RegionUpdateRequest;
import com.edu.entity.AdminRegion;
import com.edu.entity.AdminRegionArea;
import com.edu.exception.BusinessException;
import com.edu.exception.ErrorCode;
import com.edu.repository.AdminRegionAreaRepository;
import com.edu.repository.AdminRegionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RegionService {
    private final AdminRegionRepository regionRepository;
    private final AdminRegionAreaRepository areaRepository;

    public List<RegionDto> getAllRegions() {
        return regionRepository.findAllOrderById().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public RegionDto getRegionById(Long id) {
        AdminRegion region = regionRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.REGION_NOT_FOUND));
        return toDto(region);
    }

    @Transactional
    public RegionDto updateRegion(Long id, RegionUpdateRequest request) {
        AdminRegion region = regionRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.REGION_NOT_FOUND));

        // 중복 체크: 다른 권역에 이미 할당된 area_code가 있는지 확인
        for (RegionUpdateRequest.AreaRequest areaRequest : request.getAreas()) {
            List<AdminRegionArea> existingAreas = areaRepository.findByAreaCodeExcludingRegion(
                    areaRequest.getCode(), id);
            if (!existingAreas.isEmpty()) {
                throw new BusinessException(ErrorCode.AREA_ALREADY_ASSIGNED,
                        String.format("행정구역 코드 '%s'는 이미 다른 권역에 할당되어 있습니다.", areaRequest.getCode()));
            }
        }

        // 권역 정보 업데이트
        region.setName(request.getName());
        region.setColor(request.getColor());
        region.setMode(request.getMode());

        // 기존 areas 삭제
        areaRepository.deleteByRegionId(id);
        region.getAreas().clear();

        // 새로운 areas 추가
        for (RegionUpdateRequest.AreaRequest areaRequest : request.getAreas()) {
            AdminRegionArea area = AdminRegionArea.builder()
                    .region(region)
                    .areaCode(areaRequest.getCode())
                    .areaName(areaRequest.getName())
                    .build();
            region.getAreas().add(area);
        }

        AdminRegion saved = regionRepository.save(region);
        return toDto(saved);
    }

    private RegionDto toDto(AdminRegion region) {
        List<RegionDto.AreaDto> areaDtos = region.getAreas().stream()
                .map(area -> RegionDto.AreaDto.builder()
                        .code(area.getAreaCode())
                        .name(area.getAreaName())
                        .build())
                .collect(Collectors.toList());

        return RegionDto.builder()
                .id(region.getId())
                .name(region.getName())
                .color(region.getColor())
                .mode(region.getMode())
                .areas(areaDtos)
                .createdAt(region.getCreatedAt())
                .updatedAt(region.getUpdatedAt())
                .build();
    }
}
