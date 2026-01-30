package com.itwizard.swaedu.modules.travelallowance.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyTravelSummaryDto {
    private Long instructorId;
    private String month;  // YYYY-MM
    private List<DailyTravelResponseDto> dailyRecords;
    private Integer totalTravelExpense;  // Sum of all daily travel fees for the month
}
