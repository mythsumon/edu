package com.itwizard.swaedu.modules.training.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainingCreateDto {

    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    @NotNull(message = "Program is required")
    private Long programId;

    @NotNull(message = "Institution is required")
    private Long institutionId;

    private String description;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private String note;

    @Size(max = 50, message = "Grade must not exceed 50 characters")
    private String grade;

    @Size(max = 50, message = "Class must not exceed 50 characters")
    private String classInfo;

    @Min(value = 0, message = "Number of students must be 0 or greater")
    private Integer numberStudents;
}
