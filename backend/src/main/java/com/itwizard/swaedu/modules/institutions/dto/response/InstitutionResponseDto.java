package com.itwizard.swaedu.modules.institutions.dto.response;

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
    private String name;
    private Long institutionTypeId;
    private String phoneNumber;
    private Long regionId;
    private Long educationTypeId;
    private String street;
    private String additionalAddress;
    private String note;
    private Long inChargePersonId;
    private String signature;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
