package com.itwizard.swaedu.modules.auth.dto.response;

import com.itwizard.swaedu.modules.admin.dto.response.AdminProfileDto;
import com.itwizard.swaedu.modules.instructor.dto.response.InstructorProfileDto;
import com.itwizard.swaedu.modules.staff.dto.response.StaffProfileDto;
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
    private StaffProfileDto staff;
}
