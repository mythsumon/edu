package com.itwizard.swaedu.modules.region.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegionListItemDto {
    private Long id;
    private String name;
    private Long zoneId;
}
