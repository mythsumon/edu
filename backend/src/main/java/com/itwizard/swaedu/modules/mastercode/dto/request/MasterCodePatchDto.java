package com.itwizard.swaedu.modules.mastercode.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MasterCodePatchDto {

    @Size(max = 255, message = "Code must not exceed 255 characters")
    private String code; // Optional for partial update

    @Size(max = 255, message = "Code name must not exceed 255 characters")
    private String codeName; // Optional for partial update

    // parentId is explicitly NOT included - cannot be updated per requirements
}
