package com.itwizard.swaedu.modules.training.service;

import com.itwizard.swaedu.exception.ResourceNotFoundException;
import com.itwizard.swaedu.exception.ValidationException;
import com.itwizard.swaedu.modules.institutions.repository.InstitutionRepository;
import com.itwizard.swaedu.modules.program.repository.ProgramRepository;
import com.itwizard.swaedu.modules.training.dto.request.TrainingCreateDto;
import com.itwizard.swaedu.modules.training.dto.request.TrainingUpdateDto;
import com.itwizard.swaedu.modules.training.dto.response.TrainingResponseDto;
import com.itwizard.swaedu.modules.training.entity.TrainingEntity;
import com.itwizard.swaedu.modules.training.mapper.TrainingMapper;
import com.itwizard.swaedu.modules.training.repository.TrainingRepository;
import com.itwizard.swaedu.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TrainingServiceImpl implements TrainingService {

    private final TrainingRepository repository;
    private final ProgramRepository programRepository;
    private final InstitutionRepository institutionRepository;

    @Override
    @Transactional
    public TrainingResponseDto createTraining(TrainingCreateDto request) {
        // Validate foreign key references
        validateProgramExists(request.getProgramId());
        validateInstitutionExists(request.getInstitutionId());

        // Validate date range
        validateDateRange(request.getStartDate(), request.getEndDate());

        // Create entity
        TrainingEntity entity = TrainingMapper.toEntity(request);
        TrainingEntity saved = repository.save(entity);

        // Generate training_id after save to have the id
        String trainingId = generateTrainingId(saved.getId());
        saved.setTrainingId(trainingId);
        saved = repository.save(saved);

        // Reload with relationships
        return getTrainingById(saved.getId());
    }

    /**
     * Generate training_id in format: EDU-YYYY-{serial}
     * Example: EDU-2026-1, EDU-2026-2, EDU-2026-100
     */
    private String generateTrainingId(Long id) {
        return "EDU-" + Year.now().getValue() + "-" + id;
    }

    @Override
    public PageResponse<TrainingResponseDto> listTrainings(
            String q,
            Integer page,
            Integer size,
            String sort,
            Long programId,
            Long institutionId,
            List<Long> programIds,
            List<Long> institutionIds,
            LocalDate startDateFrom,
            LocalDate startDateTo,
            LocalDate endDateFrom,
            LocalDate endDateTo) {
        // Normalize empty lists to null for JPQL query (empty lists cause issues with IN clause)
        List<Long> normalizedProgramIds = (programIds != null && programIds.isEmpty()) ? null : programIds;
        List<Long> normalizedInstitutionIds = (institutionIds != null && institutionIds.isEmpty()) ? null : institutionIds;

        // If page and size are not provided, return all records
        if (page == null && size == null) {
            List<TrainingEntity> allResults = repository.searchAll(
                    q, programId, institutionId, normalizedProgramIds, normalizedInstitutionIds,
                    startDateFrom, startDateTo, endDateFrom, endDateTo);
            return buildListResponse(allResults);
        }

        // Parse sort parameter and use pagination
        Pageable pageable = buildPageable(page, size, sort);

        // Search with filters
        Page<TrainingEntity> pageResult = repository.search(
                q, programId, institutionId, normalizedProgramIds, normalizedInstitutionIds,
                startDateFrom, startDateTo, endDateFrom, endDateTo, pageable);

        return buildPageResponse(pageResult);
    }

    @Override
    public TrainingResponseDto getTrainingById(Long id) {
        TrainingEntity entity = repository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Training not found with id: " + id));
        return TrainingMapper.toResponseDto(entity);
    }

    @Override
    @Transactional
    public TrainingResponseDto updateTraining(Long id, TrainingUpdateDto request) {
        TrainingEntity entity = repository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Training not found with id: " + id));

        // Validate foreign key references
        validateProgramExists(request.getProgramId());
        validateInstitutionExists(request.getInstitutionId());

        // Validate date range
        validateDateRange(request.getStartDate(), request.getEndDate());

        // Update entity
        TrainingMapper.updateEntityFromDto(entity, request);
        entity.setUpdatedAt(LocalDateTime.now());

        TrainingEntity updated = repository.save(entity);

        // Reload with relationships
        return getTrainingById(updated.getId());
    }

    @Override
    @Transactional
    public void deleteTraining(Long id) {
        TrainingEntity entity = repository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Training not found with id: " + id));

        // Soft delete
        entity.setIsDelete(true);
        entity.setUpdatedAt(LocalDateTime.now());
        repository.save(entity);
    }

    // Private helper methods

    private void validateProgramExists(Long id) {
        programRepository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Program not found with id: " + id));
    }

    private void validateInstitutionExists(Long id) {
        institutionRepository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found with id: " + id));
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new ValidationException("End date must be on or after start date");
        }
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

    private PageResponse<TrainingResponseDto> buildPageResponse(Page<TrainingEntity> pageResult) {
        return PageResponse.<TrainingResponseDto>builder()
                .items(TrainingMapper.toResponseDtoList(pageResult.getContent()))
                .total(pageResult.getTotalElements())
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalPages(pageResult.getTotalPages())
                .build();
    }

    private PageResponse<TrainingResponseDto> buildListResponse(List<TrainingEntity> results) {
        return PageResponse.<TrainingResponseDto>builder()
                .items(TrainingMapper.toResponseDtoList(results))
                .total((long) results.size())
                .page(0)
                .size(results.size())
                .totalPages(1)
                .build();
    }
}
