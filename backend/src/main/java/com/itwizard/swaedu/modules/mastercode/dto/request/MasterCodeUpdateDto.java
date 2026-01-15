package com.itwizard.swaedu.modules.mastercode.dto.request;

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
public class MasterCodeUpdateDto {

    @NotNull(message = "Code is required")
    private Integer code;

    @NotBlank(message = "Code name is required")
    @Size(max = 255, message = "Code name must not exceed 255 characters")
    private String codeName;

    // parentId is explicitly NOT included - cannot be updated per requirements
}
