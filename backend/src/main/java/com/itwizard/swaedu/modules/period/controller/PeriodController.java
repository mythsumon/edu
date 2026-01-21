package com.itwizard.swaedu.modules.period.controller;

import com.itwizard.swaedu.modules.period.dto.request.PeriodBulkCreateDto;
import com.itwizard.swaedu.modules.period.dto.request.PeriodCreateDto;
import com.itwizard.swaedu.modules.period.dto.request.PeriodUpdateDto;
import com.itwizard.swaedu.modules.period.dto.response.PeriodResponseDto;
import com.itwizard.swaedu.modules.period.service.PeriodService;
import com.itwizard.swaedu.util.ApiResponse;
import com.itwizard.swaedu.util.ResponseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/periods")
@RequiredArgsConstructor
public class PeriodController {

    private final PeriodService periodService;

    /**
     * POST /api/v1/periods — Create a single period
     */
    @PostMapping
    public ResponseEntity<ApiResponse> createPeriod(@Valid @RequestBody PeriodCreateDto request) {
        PeriodResponseDto response = periodService.createPeriod(request);
        return ResponseUtil.created("Period created successfully", response);
    }

    /**
     * POST /api/v1/periods/bulk — Create multiple periods
     */
    @PostMapping("/bulk")
    public ResponseEntity<ApiResponse> createPeriodsBulk(@Valid @RequestBody PeriodBulkCreateDto request) {
        List<PeriodResponseDto> response = periodService.createPeriodsBulk(request);
        return ResponseUtil.created("Periods created successfully", response);
    }

    /**
     * GET /api/v1/periods — List periods by training ID
     */
    @GetMapping
    public ResponseEntity<ApiResponse> listPeriods(@RequestParam Long trainingId) {
        List<PeriodResponseDto> response = periodService.getPeriodsByTrainingId(trainingId);
        return ResponseUtil.success("Periods retrieved successfully", response);
    }

    /**
     * GET /api/v1/periods/{id} — Get period by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getPeriodById(@PathVariable Long id) {
        PeriodResponseDto response = periodService.getPeriodById(id);
        return ResponseUtil.success("Period retrieved successfully", response);
    }

    /**
     * PUT /api/v1/periods/{id} — Update period
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updatePeriod(
            @PathVariable Long id,
            @Valid @RequestBody PeriodUpdateDto request) {
        PeriodResponseDto response = periodService.updatePeriod(id, request);
        return ResponseUtil.success("Period updated successfully", response);
    }

    /**
     * DELETE /api/v1/periods/{id} — Delete period
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deletePeriod(@PathVariable Long id) {
        periodService.deletePeriod(id);
        return ResponseUtil.success("Period deleted successfully");
    }

    /**
     * DELETE /api/v1/periods/training/{trainingId} — Delete all periods by training ID
     */
    @DeleteMapping("/training/{trainingId}")
    public ResponseEntity<ApiResponse> deletePeriodsByTrainingId(@PathVariable Long trainingId) {
        periodService.deletePeriodsByTrainingId(trainingId);
        return ResponseUtil.success("Periods deleted successfully");
    }
}
