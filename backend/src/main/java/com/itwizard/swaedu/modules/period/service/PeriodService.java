package com.itwizard.swaedu.modules.period.service;

import com.itwizard.swaedu.modules.period.dto.request.PeriodBulkCreateDto;
import com.itwizard.swaedu.modules.period.dto.request.PeriodCreateDto;
import com.itwizard.swaedu.modules.period.dto.request.PeriodUpdateDto;
import com.itwizard.swaedu.modules.period.dto.response.PeriodResponseDto;

import java.util.List;

/**
 * Service interface for Period operations
 */
public interface PeriodService {

    /**
     * Create a single period
     */
    PeriodResponseDto createPeriod(PeriodCreateDto request);

    /**
     * Create multiple periods in bulk
     */
    List<PeriodResponseDto> createPeriodsBulk(PeriodBulkCreateDto request);

    /**
     * Get all periods by training ID
     */
    List<PeriodResponseDto> getPeriodsByTrainingId(Long trainingId);

    /**
     * Get period by ID
     */
    PeriodResponseDto getPeriodById(Long id);

    /**
     * Update a period
     */
    PeriodResponseDto updatePeriod(Long id, PeriodUpdateDto request);

    /**
     * Delete a period
     */
    void deletePeriod(Long id);

    /**
     * Delete all periods by training ID
     */
    void deletePeriodsByTrainingId(Long trainingId);
}
