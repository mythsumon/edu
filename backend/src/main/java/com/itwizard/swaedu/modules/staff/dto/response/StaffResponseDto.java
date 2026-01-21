package com.itwizard.swaedu.modules.staff.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffResponseDto {
    private Long userId;
    private String staffId;
    private String username;
    private String name;
    private String email;
    private String phone;
    private Long statusId;
    private String profilePhoto;
    private Boolean enabled;
}
