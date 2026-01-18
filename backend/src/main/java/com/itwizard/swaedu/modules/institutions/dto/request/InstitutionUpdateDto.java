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
public class InstitutionUpdateDto {

    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    @Size(max = 50, message = "Phone number must not exceed 50 characters")
    private String phoneNumber;

    private Long districtId;

    private Long zoneId;

    private Long regionId;

    @Size(max = 255, message = "Street must not exceed 255 characters")
    private String street;

    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    private Long majorCategoryId;

    private Long categoryOneId;

    private Long categoryTwoId;

    private Long classificationId;

    private String notes;

    private Long teacherId;

    @Size(max = 500, message = "Signature path must not exceed 500 characters")
    private String signature;
}
