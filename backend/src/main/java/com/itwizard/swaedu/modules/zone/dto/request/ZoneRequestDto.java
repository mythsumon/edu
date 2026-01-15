package com.itwizard.swaedu.modules.zone.dto.request;

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
public class ZoneRequestDto {

    @NotBlank(message = "Zone name is required")
    @Size(min = 1, max = 255, message = "Zone name must be between 1 and 255 characters")
    private String name;
}
