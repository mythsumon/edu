package com.itwizard.swaedu.modules.travelallowance.controller;

import com.itwizard.swaedu.modules.travelallowance.dto.response.DailyTravelResponseDto;
import com.itwizard.swaedu.modules.travelallowance.dto.response.MonthlyTravelSummaryDto;
import com.itwizard.swaedu.modules.travelallowance.service.TravelAllowanceService;
import com.itwizard.swaedu.util.ApiResponse;
import com.itwizard.swaedu.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Travel Allowance Controller
 * 
 * Provides minimal APIs for admin and reporting:
 * - GET daily travel records
 * - POST recalculate daily travel
 * - GET monthly travel summary
 */
@RestController
@RequestMapping("/api/v1/admin/instructors")
@RequiredArgsConstructor
public class TravelAllowanceController {

    private final TravelAllowanceService travelAllowanceService;

    /**
     * GET /api/v1/admin/instructors/{instructorId}/daily-travel
     * Get daily travel records for an instructor in a date range
     */
    @GetMapping("/{instructorId}/daily-travel")
    public ResponseEntity<ApiResponse> getDailyTravelRecords(
            @PathVariable Long instructorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        
        // Default to current month if not specified
        if (from == null) {
            from = LocalDate.now().withDayOfMonth(1);
        }
        if (to == null) {
            to = LocalDate.now();
        }

        List<DailyTravelResponseDto> records = travelAllowanceService.getDailyTravelRecords(instructorId, from, to);
        return ResponseUtil.success("일별 여비 내역 조회 성공", records);
    }

    /**
     * POST /api/v1/admin/instructors/{instructorId}/daily-travel/recalculate
     * Recalculate daily travel record for a specific date
     */
    @PostMapping("/{instructorId}/daily-travel/recalculate")
    public ResponseEntity<ApiResponse> recalculateDailyTravel(
            @PathVariable Long instructorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        DailyTravelResponseDto result = travelAllowanceService.recalculateDailyTravel(instructorId, date);
        return ResponseUtil.success("일별 여비 재계산 완료", result);
    }

    /**
     * GET /api/v1/admin/instructors/{instructorId}/monthly-travel
     * Get monthly travel summary for an instructor
     */
    @GetMapping("/{instructorId}/monthly-travel")
    public ResponseEntity<ApiResponse> getMonthlyTravelSummary(
            @PathVariable Long instructorId,
            @RequestParam String month) {  // YYYY-MM format
        
        MonthlyTravelSummaryDto summary = travelAllowanceService.getMonthlyTravelSummary(instructorId, month);
        return ResponseUtil.success("월별 여비 요약 조회 성공", summary);
    }
}
