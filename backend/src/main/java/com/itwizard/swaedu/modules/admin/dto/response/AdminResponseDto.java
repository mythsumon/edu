package com.itwizard.swaedu.modules.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminResponseDto {
    private Long userId;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String profilePhoto;
    private Boolean enabled;
}
