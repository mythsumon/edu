package com.itwizard.swaedu.modules.mastercode.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MasterCodeResponseDto {
    private Long id;
    private String code;
    private String codeName;
    private Long parentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
