package com.itwizard.swaedu.modules.staff.mapper;

import com.itwizard.swaedu.modules.staff.dto.response.StaffResponseDto;
import com.itwizard.swaedu.modules.staff.entity.Staff;
import org.springframework.stereotype.Component;

@Component
public class StaffMapper {

    public StaffResponseDto toResponseDto(Staff staff) {
        if (staff == null) {
            return null;
        }

        return StaffResponseDto.builder()
                .userId(staff.getUserId())
                .staffId(staff.getStaffId())
                .username(staff.getUser() != null ? staff.getUser().getUsername() : null)
                .name(staff.getName())
                .email(staff.getEmail())
                .phone(staff.getPhone())
                .statusId(staff.getStatusId())
                .profilePhoto(staff.getProfilePhoto())
                .enabled(staff.getUser() != null ? staff.getUser().getEnabled() : null)
                .build();
    }
}
