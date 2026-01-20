package com.itwizard.swaedu.modules.staff.controller;

import com.itwizard.swaedu.modules.staff.dto.response.StaffResponseDto;
import com.itwizard.swaedu.modules.staff.service.StaffService;
import com.itwizard.swaedu.util.ApiResponse;
import com.itwizard.swaedu.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse> getMyProfile(Authentication authentication) {
        StaffResponseDto response = staffService.getStaffByUsername(authentication.getName());
        return ResponseUtil.success("Staff profile retrieved successfully", response);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse> getStaffById(@PathVariable Long userId) {
        StaffResponseDto response = staffService.getStaffById(userId);
        return ResponseUtil.success("Staff retrieved successfully", response);
    }
}
