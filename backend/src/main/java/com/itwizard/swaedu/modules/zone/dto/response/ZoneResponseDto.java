package com.itwizard.swaedu.modules.zone.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.itwizard.swaedu.modules.region.dto.response.RegionResponseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZoneResponseDto {
    private Long id;
    private String name;
    
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private List<RegionResponseDto> regions;
}
