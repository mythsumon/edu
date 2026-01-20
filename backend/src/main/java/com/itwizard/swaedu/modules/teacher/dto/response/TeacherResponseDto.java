package com.itwizard.swaedu.modules.teacher.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherResponseDto {
    private Long userId;
    private String teacherId;
    private String username;
    private String name;
    private String email;
    private String phone;
    private String profilePhoto;
    private Boolean enabled;
}
