package com.edu.dto;

import com.edu.entity.AdminRegion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegionUpdateRequest {
    @NotBlank(message = "권역 이름은 필수입니다.")
    private String name;

    @NotBlank(message = "색상은 필수입니다.")
    private String color;

    @NotNull(message = "모드는 필수입니다.")
    private AdminRegion.RegionMode mode;

    @NotEmpty(message = "행정구역 목록은 최소 1개 이상 필요합니다.")
    private List<AreaRequest> areas;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AreaRequest {
        @NotBlank(message = "행정구역 코드는 필수입니다.")
        private String code;

        @NotBlank(message = "행정구역 이름은 필수입니다.")
        private String name;
    }
}
