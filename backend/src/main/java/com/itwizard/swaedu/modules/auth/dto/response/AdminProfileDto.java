package com.itwizard.swaedu.modules.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminProfileDto {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String profilePhoto;
}
