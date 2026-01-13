package com.itwizard.swaedu.modules.zone.service;

import com.itwizard.swaedu.exception.ResourceNotFoundException;
import com.itwizard.swaedu.exception.ValidationException;
import com.itwizard.swaedu.modules.region.entity.RegionEntity;
import com.itwizard.swaedu.modules.region.repository.RegionRepository;
import com.itwizard.swaedu.modules.zone.dto.request.ZoneRequestDto;
import com.itwizard.swaedu.modules.zone.dto.response.ZoneResponseDto;
import com.itwizard.swaedu.modules.zone.entity.ZoneEntity;
import com.itwizard.swaedu.modules.zone.mapper.ZoneMapper;
import com.itwizard.swaedu.modules.zone.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ZoneServiceImpl implements ZoneService {

    private final ZoneRepository zoneRepository;
    private final RegionRepository regionRepository;

    @Override
    @Transactional
    public ZoneResponseDto createZone(ZoneRequestDto request) {
        if (zoneRepository.existsByName(request.getName())) {
            throw new ValidationException("Zone with this name already exists");
        }

        ZoneEntity entity = ZoneMapper.toEntity(request);
        ZoneEntity saved = zoneRepository.save(entity);
        return ZoneMapper.toDto(saved);
    }

    @Override
    public ZoneResponseDto getZoneById(Long id) {
        ZoneEntity entity = zoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + id));
        
        // Fetch regions for this zone
        List<RegionEntity> regions = regionRepository.findByZoneId(id);
        
        return ZoneMapper.toDtoWithRegions(entity, regions);
    }

    @Override
    public List<ZoneResponseDto> getAllZones() {
        List<ZoneEntity> entities = zoneRepository.findAll();
        return entities.stream()
                .map(ZoneMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ZoneResponseDto updateZone(Long id, ZoneRequestDto request) {
        ZoneEntity entity = zoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + id));

        // Check if name is being changed and if new name already exists
        if (!entity.getName().equals(request.getName()) && zoneRepository.existsByName(request.getName())) {
            throw new ValidationException("Zone with this name already exists");
        }

        ZoneMapper.updateEntityFromRequest(entity, request);
        ZoneEntity updated = zoneRepository.save(entity);
        return ZoneMapper.toDto(updated);
    }

    @Override
    @Transactional
    public void deleteZone(Long id) {
        ZoneEntity entity = zoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + id));
        zoneRepository.delete(entity);
    }
}
