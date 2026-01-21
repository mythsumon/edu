package com.itwizard.swaedu.modules.period.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeriodCreateDto {

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @Min(value = 0, message = "Number of main instructors must be 0 or greater")
    private Integer numberMainInstructors;

    @Min(value = 0, message = "Number of assistant instructors must be 0 or greater")
    private Integer numberAssistantInstructors;

    @NotNull(message = "Training ID is required")
    private Long trainingId;
}
