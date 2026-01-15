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
public class MasterCodeCreateDto {

    @NotNull(message = "Code is required")
    private Integer code;

    @NotBlank(message = "Code name is required")
    @Size(max = 255, message = "Code name must not exceed 255 characters")
    private String codeName;

    // parentId is required in request body but can be null for root codes
    // Validation is handled in service layer to ensure field is always present
    private Long parentId; // Required field in JSON - null for root codes, Long value for child codes
}
