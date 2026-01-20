package com.itwizard.swaedu.modules.training.service;

import com.itwizard.swaedu.modules.training.dto.request.TrainingCreateDto;
import com.itwizard.swaedu.modules.training.dto.request.TrainingUpdateDto;
import com.itwizard.swaedu.modules.training.dto.response.TrainingResponseDto;
import com.itwizard.swaedu.util.PageResponse;

import java.time.LocalDate;
import java.util.List;

public interface TrainingService {

    TrainingResponseDto createTraining(TrainingCreateDto request);

    PageResponse<TrainingResponseDto> listTrainings(
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
            LocalDate endDateTo);

    TrainingResponseDto getTrainingById(Long id);

    TrainingResponseDto updateTraining(Long id, TrainingUpdateDto request);

    void deleteTraining(Long id);
}
