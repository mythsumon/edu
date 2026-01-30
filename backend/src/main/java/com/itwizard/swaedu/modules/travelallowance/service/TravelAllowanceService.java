package com.itwizard.swaedu.modules.travelallowance.service;

import com.itwizard.swaedu.modules.travelallowance.dto.response.DailyTravelResponseDto;
import com.itwizard.swaedu.modules.travelallowance.dto.response.MonthlyTravelSummaryDto;

import java.time.LocalDate;
import java.util.List;

/**
 * Travel Allowance Service Interface
 * Handles instructor daily travel allowance calculation and management
 */
public interface TravelAllowanceService {

    /**
     * Recalculate daily travel record for an instructor on a specific date
     * This is idempotent - will create or update existing record
     * 
     * @param instructorId Instructor ID
     * @param date Travel date
     * @return Daily travel record
     */
    DailyTravelResponseDto recalculateDailyTravel(Long instructorId, LocalDate date);

    /**
     * Get daily travel records for an instructor in a date range
     * 
     * @param instructorId Instructor ID
     * @param from Start date (inclusive)
     * @param to End date (inclusive)
     * @return List of daily travel records
     */
    List<DailyTravelResponseDto> getDailyTravelRecords(Long instructorId, LocalDate from, LocalDate to);

    /**
     * Get monthly travel summary for an instructor
     * 
     * @param instructorId Instructor ID
     * @param month Month in YYYY-MM format
     * @return Monthly summary with daily records and total
     */
    MonthlyTravelSummaryDto getMonthlyTravelSummary(Long instructorId, String month);

    /**
     * Rebuild daily travel records for an instructor when:
     * - Instructor home address changes
     * - Institution address changes
     * - Training assignment changes
     * - Training schedule date/time changes
     * 
     * This method will recalculate all affected daily travel records.
     * 
     * @param instructorId Instructor ID (if null, rebuilds all)
     * @param fromDate Start date for recalculation (if null, from earliest)
     * @param toDate End date for recalculation (if null, to latest)
     */
    void rebuildDailyTravelRecords(Long instructorId, LocalDate fromDate, LocalDate toDate);
}
