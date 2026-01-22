package com.itwizard.swaedu.modules.staff.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffProfileDto {
    private String name;
    private String email;
    private String phone;
    private Long statusId;
    private String profilePhoto;
}
