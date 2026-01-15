package com.itwizard.swaedu.modules.region.dto.response;

import com.itwizard.swaedu.modules.zone.dto.response.ZoneInfoDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegionDetailResponseDto {
    private Long id;
    private String name;
    private ZoneInfoDto zone;
}
