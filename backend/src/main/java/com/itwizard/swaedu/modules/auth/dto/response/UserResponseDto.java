package com.itwizard.swaedu.modules.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {
    private Long id;
    private String username;
    private String roleName;
    private Boolean enabled;
    private AdminProfileDto admin;
    private InstructorProfileDto instructor;
}
