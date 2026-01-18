package com.itwizard.swaedu.modules.program.dto.response;

import com.itwizard.swaedu.modules.mastercode.dto.response.MasterCodeResponseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgramResponseDto {
    private Long id;
    private String programId;
    private MasterCodeResponseDto sessionPart;
    private String name;
    private MasterCodeResponseDto status;
    private MasterCodeResponseDto programType;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
