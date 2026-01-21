package com.itwizard.swaedu.modules.period.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeriodResponseDto {

    private Long id;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer numberMainInstructors;
    private Integer numberAssistantInstructors;
    private Long trainingId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
