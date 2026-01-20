package com.itwizard.swaedu.modules.institutions.dto.response;

import com.itwizard.swaedu.modules.mastercode.dto.response.MasterCodeResponseDto;
import com.itwizard.swaedu.modules.teacher.dto.response.TeacherResponseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstitutionResponseDto {
    private Long id;
    private String institutionId;
    private String name;
    private String phoneNumber;
    private MasterCodeResponseDto district;
    private MasterCodeResponseDto zone;
    private MasterCodeResponseDto region;
    private String street;
    private String address;
    private MasterCodeResponseDto majorCategory;
    private MasterCodeResponseDto categoryOne;
    private MasterCodeResponseDto categoryTwo;
    private MasterCodeResponseDto classification;
    private String notes;
    private TeacherResponseDto teacher;
    private String signature;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
