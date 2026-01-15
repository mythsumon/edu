package com.itwizard.swaedu.modules.region.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegionRequestDto {

    @NotBlank(message = "Region name is required")
    @Size(min = 1, max = 255, message = "Region name must be between 1 and 255 characters")
    private String name;

    @NotNull(message = "Zone ID is required")
    private Long zoneId;
}
