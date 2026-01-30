package com.itwizard.swaedu.modules.travelallowance.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyTravelResponseDto {
    private Long id;
    private Long instructorId;
    private String instructorName;
    private LocalDate travelDate;
    private String workMonth;  // YYYY-MM
    private BigDecimal totalDistanceKm;
    private Integer travelFeeAmountKrw;
    private String mapSnapshotUrl;
    private String status;  // DRAFT or FINAL
    private List<WaypointResponseDto> waypoints;
}
