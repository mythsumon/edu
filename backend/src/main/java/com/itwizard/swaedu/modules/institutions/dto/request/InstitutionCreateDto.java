package com.itwizard.swaedu.modules.institutions.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstitutionCreateDto {

    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    private Long institutionTypeId;

    @Size(max = 50, message = "Phone number must not exceed 50 characters")
    private String phoneNumber;

    private Long regionId;

    private Long educationTypeId;

    @Size(max = 255, message = "Street must not exceed 255 characters")
    private String street;

    @Size(max = 500, message = "Additional address must not exceed 500 characters")
    private String additionalAddress;

    private String note;

    private Long inChargePersonId;

    @Size(max = 500, message = "Signature path must not exceed 500 characters")
    private String signature;
}
