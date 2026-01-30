package com.itwizard.swaedu.modules.travelallowance.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WaypointResponseDto {
    private Integer seq;
    private Long institutionId;
    private String institutionName;
    private String institutionAddress;
    private BigDecimal lat;
    private BigDecimal lng;
    private Long trainingId;
    private Boolean isHome;
}
