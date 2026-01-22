package com.itwizard.swaedu.modules.staff.service;

import com.itwizard.swaedu.modules.staff.dto.response.StaffResponseDto;
import com.itwizard.swaedu.modules.staff.entity.Staff;
import com.itwizard.swaedu.modules.staff.mapper.StaffMapper;
import com.itwizard.swaedu.modules.staff.repository.StaffRepository;
import com.itwizard.swaedu.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;
    private final StaffMapper staffMapper;

    @Override
    @Transactional(readOnly = true)
    public StaffResponseDto getStaffByUsername(String username) {
        Staff staff = staffRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with username: " + username));
        return staffMapper.toResponseDto(staff);
    }

    @Override
    @Transactional(readOnly = true)
    public StaffResponseDto getStaffById(Long userId) {
        Staff staff = staffRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + userId));
        return staffMapper.toResponseDto(staff);
    }
}
