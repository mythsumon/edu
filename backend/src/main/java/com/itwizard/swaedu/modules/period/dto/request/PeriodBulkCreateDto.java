package com.itwizard.swaedu.modules.period.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeriodBulkCreateDto {

    @NotNull(message = "Training ID is required")
    private Long trainingId;

    @NotEmpty(message = "Periods list cannot be empty")
    @Valid
    private List<PeriodItemDto> periods;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PeriodItemDto {

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
    }
}
