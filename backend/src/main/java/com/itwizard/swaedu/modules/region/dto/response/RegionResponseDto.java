package com.itwizard.swaedu.modules.region.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegionResponseDto {
    private Long id;
    private String name;
    private Long zoneId;
    private String zoneName;
}
