package com.itwizard.swaedu.modules.institutions.service;

import com.itwizard.swaedu.exception.ResourceNotFoundException;
import com.itwizard.swaedu.modules.institutions.dto.request.InstitutionCreateDto;
import com.itwizard.swaedu.modules.institutions.dto.request.InstitutionUpdateDto;
import com.itwizard.swaedu.modules.institutions.dto.response.InstitutionResponseDto;
import com.itwizard.swaedu.modules.institutions.entity.InstitutionEntity;
import com.itwizard.swaedu.modules.institutions.mapper.InstitutionMapper;
import com.itwizard.swaedu.modules.institutions.repository.InstitutionRepository;
import com.itwizard.swaedu.modules.mastercode.repository.MasterCodeRepository;
import com.itwizard.swaedu.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class InstitutionServiceImpl implements InstitutionService {

    private final InstitutionRepository repository;
    private final MasterCodeRepository masterCodeRepository;

    @Override
    @Transactional
    public InstitutionResponseDto createInstitution(InstitutionCreateDto request) {
        // Validate foreign key references if provided
        if (request.getInstitutionTypeId() != null) {
            validateMasterCodeExists(request.getInstitutionTypeId(), "Institution type");
        }
        if (request.getRegionId() != null) {
            validateMasterCodeExists(request.getRegionId(), "Region");
        }
        if (request.getEducationTypeId() != null) {
            validateMasterCodeExists(request.getEducationTypeId(), "Education type");
        }

        // Create entity
        InstitutionEntity entity = InstitutionMapper.toEntity(request);
        InstitutionEntity saved = repository.save(entity);
        return InstitutionMapper.toResponseDto(saved);
    }

    @Override
    public PageResponse<InstitutionResponseDto> listInstitutions(
            String q,
            Integer page,
            Integer size,
            String sort,
            Long institutionTypeId,
            Long regionId,
            Long educationTypeId,
            Long inChargePersonId) {
        // Parse sort parameter
        Pageable pageable = buildPageable(page, size, sort);

        // Search with filters
        Page<InstitutionEntity> pageResult = repository.search(
                q, institutionTypeId, regionId, educationTypeId, inChargePersonId, pageable);

        return buildPageResponse(pageResult);
    }

    @Override
    public InstitutionResponseDto getInstitutionById(Long id) {
        InstitutionEntity entity = repository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found with id: " + id));
        return InstitutionMapper.toResponseDto(entity);
    }

    @Override
    @Transactional
    public InstitutionResponseDto updateInstitution(Long id, InstitutionUpdateDto request) {
        InstitutionEntity entity = repository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found with id: " + id));

        // Validate foreign key references if provided
        if (request.getInstitutionTypeId() != null) {
            validateMasterCodeExists(request.getInstitutionTypeId(), "Institution type");
        }
        if (request.getRegionId() != null) {
            validateMasterCodeExists(request.getRegionId(), "Region");
        }
        if (request.getEducationTypeId() != null) {
            validateMasterCodeExists(request.getEducationTypeId(), "Education type");
        }

        // Update entity
        InstitutionMapper.updateEntityFromDto(entity, request);
        entity.setUpdatedAt(LocalDateTime.now());

        InstitutionEntity updated = repository.save(entity);
        return InstitutionMapper.toResponseDto(updated);
    }

    @Override
    @Transactional
    public void deleteInstitution(Long id) {
        InstitutionEntity entity = repository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found with id: " + id));

        // Soft delete
        entity.setIsDelete(true);
        entity.setUpdatedAt(LocalDateTime.now());
        repository.save(entity);
    }

    // Private helper methods

    private void validateMasterCodeExists(Long id, String fieldName) {
        masterCodeRepository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException(fieldName + " not found with id: " + id));
    }

    private Pageable buildPageable(Integer page, Integer size, String sort) {
        int pageNumber = page != null && page >= 0 ? page : 0;
        int pageSize = size != null && size > 0 ? size : 20;

        if (sort != null && !sort.isEmpty()) {
            String[] sortParts = sort.split(",");
            if (sortParts.length == 2) {
                String property = sortParts[0].trim();
                Sort.Direction direction = "desc".equalsIgnoreCase(sortParts[1].trim())
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC;
                return PageRequest.of(pageNumber, pageSize, Sort.by(direction, property));
            }
        }

        return PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.ASC, "name"));
    }

    private PageResponse<InstitutionResponseDto> buildPageResponse(Page<InstitutionEntity> pageResult) {
        return PageResponse.<InstitutionResponseDto>builder()
                .items(InstitutionMapper.toResponseDtoList(pageResult.getContent()))
                .total(pageResult.getTotalElements())
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalPages(pageResult.getTotalPages())
                .build();
    }
}
