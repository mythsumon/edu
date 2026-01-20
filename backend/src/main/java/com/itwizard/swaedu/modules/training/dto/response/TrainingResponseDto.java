package com.itwizard.swaedu.modules.training.dto.response;

import com.itwizard.swaedu.modules.institutions.dto.response.InstitutionResponseDto;
import com.itwizard.swaedu.modules.program.dto.response.ProgramResponseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainingResponseDto {
    private Long id;
    private String name;
    private ProgramResponseDto program;
    private InstitutionResponseDto institution;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String note;
    private String grade;
    private String classInfo;
    private Integer numberStudents;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
