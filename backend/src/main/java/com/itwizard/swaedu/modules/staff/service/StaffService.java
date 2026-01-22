package com.itwizard.swaedu.modules.staff.service;

import com.itwizard.swaedu.modules.staff.dto.response.StaffResponseDto;

public interface StaffService {
    StaffResponseDto getStaffByUsername(String username);
    
    StaffResponseDto getStaffById(Long userId);
}
