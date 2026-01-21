package com.itwizard.swaedu.modules.period.service;

import com.itwizard.swaedu.exception.ResourceNotFoundException;
import com.itwizard.swaedu.exception.ValidationException;
import com.itwizard.swaedu.modules.period.dto.request.PeriodBulkCreateDto;
import com.itwizard.swaedu.modules.period.dto.request.PeriodCreateDto;
import com.itwizard.swaedu.modules.period.dto.request.PeriodUpdateDto;
import com.itwizard.swaedu.modules.period.dto.response.PeriodResponseDto;
import com.itwizard.swaedu.modules.period.entity.PeriodEntity;
import com.itwizard.swaedu.modules.period.mapper.PeriodMapper;
import com.itwizard.swaedu.modules.period.repository.PeriodRepository;
import com.itwizard.swaedu.modules.training.repository.TrainingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PeriodServiceImpl implements PeriodService {

    private final PeriodRepository periodRepository;
    private final TrainingRepository trainingRepository;

    @Override
    @Transactional
    public PeriodResponseDto createPeriod(PeriodCreateDto request) {
        // Validate training exists
        validateTrainingExists(request.getTrainingId());

        // Validate time range
        validateTimeRange(request.getStartTime(), request.getEndTime());

        // Create entity
        PeriodEntity entity = PeriodMapper.toEntity(request);
        PeriodEntity saved = periodRepository.save(entity);

        // Reload with relationships
        return getPeriodById(saved.getId());
    }

    @Override
    @Transactional
    public List<PeriodResponseDto> createPeriodsBulk(PeriodBulkCreateDto request) {
        // Validate training exists
        validateTrainingExists(request.getTrainingId());

        List<PeriodEntity> entities = new ArrayList<>();

        for (PeriodBulkCreateDto.PeriodItemDto item : request.getPeriods()) {
            // Validate time range
            validateTimeRange(item.getStartTime(), item.getEndTime());

            // Create entity
            PeriodEntity entity = PeriodMapper.toEntity(item, request.getTrainingId());
            entities.add(entity);
        }

        // Save all entities
        periodRepository.saveAll(entities);

        // Reload with relationships
        return getPeriodsByTrainingId(request.getTrainingId());
    }

    @Override
    public List<PeriodResponseDto> getPeriodsByTrainingId(Long trainingId) {
        List<PeriodEntity> entities = periodRepository.findByTrainingIdWithRelations(trainingId);
        return PeriodMapper.toResponseDtoList(entities);
    }

    @Override
    public PeriodResponseDto getPeriodById(Long id) {
        PeriodEntity entity = periodRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new ResourceNotFoundException("Period not found with id: " + id));
        return PeriodMapper.toResponseDto(entity);
    }

    @Override
    @Transactional
    public PeriodResponseDto updatePeriod(Long id, PeriodUpdateDto request) {
        PeriodEntity entity = periodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Period not found with id: " + id));

        // Validate training exists
        validateTrainingExists(request.getTrainingId());

        // Validate time range
        validateTimeRange(request.getStartTime(), request.getEndTime());

        // Update entity
        PeriodMapper.updateEntityFromDto(entity, request);
        periodRepository.save(entity);

        // Reload with relationships
        return getPeriodById(id);
    }

    @Override
    @Transactional
    public void deletePeriod(Long id) {
        PeriodEntity entity = periodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Period not found with id: " + id));
        periodRepository.delete(entity);
    }

    @Override
    @Transactional
    public void deletePeriodsByTrainingId(Long trainingId) {
        periodRepository.deleteByTrainingId(trainingId);
    }

    // Private helper methods

    private void validateTrainingExists(Long trainingId) {
        trainingRepository.findByIdAndIsDeleteFalse(trainingId)
                .orElseThrow(() -> new ResourceNotFoundException("Training not found with id: " + trainingId));
    }

    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (startTime != null && endTime != null && !endTime.isAfter(startTime)) {
            throw new ValidationException("End time must be after start time");
        }
    }
}
