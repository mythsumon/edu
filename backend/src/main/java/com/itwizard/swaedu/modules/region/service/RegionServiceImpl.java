package com.itwizard.swaedu.modules.region.service;

import com.itwizard.swaedu.exception.ResourceNotFoundException;
import com.itwizard.swaedu.exception.ValidationException;
import com.itwizard.swaedu.modules.region.dto.request.RegionRequestDto;
import com.itwizard.swaedu.modules.region.dto.response.RegionResponseDto;
import com.itwizard.swaedu.modules.region.entity.RegionEntity;
import com.itwizard.swaedu.modules.region.mapper.RegionMapper;
import com.itwizard.swaedu.modules.region.repository.RegionRepository;
import com.itwizard.swaedu.modules.zone.entity.ZoneEntity;
import com.itwizard.swaedu.modules.zone.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RegionServiceImpl implements RegionService {

    private final RegionRepository regionRepository;
    private final ZoneRepository zoneRepository;

    @Override
    @Transactional
    public RegionResponseDto createRegion(RegionRequestDto request) {
        // Validate zone exists
        ZoneEntity zone = zoneRepository.findById(request.getZoneId())
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + request.getZoneId()));

        // Check if region name already exists in the same zone
        if (regionRepository.existsByNameAndZoneId(request.getName(), request.getZoneId())) {
            throw new ValidationException("Region with this name already exists in the specified zone");
        }

        RegionEntity entity = RegionMapper.toEntity(request, zone);
        RegionEntity saved = regionRepository.save(entity);
        return RegionMapper.toDto(saved);
    }

    @Override
    public RegionResponseDto getRegionById(Long id) {
        RegionEntity entity = regionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Region not found with id: " + id));
        return RegionMapper.toDto(entity);
    }

    @Override
    public List<RegionResponseDto> getAllRegions() {
        List<RegionEntity> entities = regionRepository.findAll();
        return entities.stream()
                .map(RegionMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<RegionResponseDto> getRegionsByZoneId(Long zoneId) {
        List<RegionEntity> entities = regionRepository.findByZoneId(zoneId);
        return entities.stream()
                .map(RegionMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RegionResponseDto updateRegion(Long id, RegionRequestDto request) {
        RegionEntity entity = regionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Region not found with id: " + id));

        // Validate zone exists
        ZoneEntity zone = zoneRepository.findById(request.getZoneId())
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + request.getZoneId()));

        // Check if name is being changed and if new name already exists in the zone
        if (!entity.getName().equals(request.getName()) || !entity.getZoneId().equals(request.getZoneId())) {
            if (regionRepository.existsByNameAndZoneId(request.getName(), request.getZoneId())) {
                throw new ValidationException("Region with this name already exists in the specified zone");
            }
        }

        RegionMapper.updateEntityFromRequest(entity, request, zone);
        RegionEntity updated = regionRepository.save(entity);
        return RegionMapper.toDto(updated);
    }

    @Override
    @Transactional
    public void deleteRegion(Long id) {
        RegionEntity entity = regionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Region not found with id: " + id));
        regionRepository.delete(entity);
    }
}
