package com.itwizard.swaedu.modules.admin.controller;

import com.itwizard.swaedu.modules.admin.dto.request.AdminPatchDto;
import com.itwizard.swaedu.modules.admin.dto.request.AdminUpdateDto;
import com.itwizard.swaedu.modules.admin.dto.request.RegisterAdminRequestDto;
import com.itwizard.swaedu.modules.admin.dto.response.AdminResponseDto;
import com.itwizard.swaedu.modules.admin.service.AdminService;
import com.itwizard.swaedu.util.ApiResponse;
import com.itwizard.swaedu.util.PageResponse;
import com.itwizard.swaedu.util.ResponseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> registerAdmin(@Valid @RequestBody RegisterAdminRequestDto request) {
        AdminResponseDto response = adminService.registerAdmin(request);
        return ResponseUtil.created("Admin registered successfully", response);
    }

    @GetMapping
    public ResponseEntity<ApiResponse> listAdmins(
            @RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size,
            @RequestParam(required = false) String sort) {
        PageResponse<AdminResponseDto> response = adminService.listAdmins(q, page, size, sort);
        return ResponseUtil.success("Admins retrieved successfully", response);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse> getAdminById(@PathVariable Long userId) {
        AdminResponseDto response = adminService.getAdminById(userId);
        return ResponseUtil.success("Admin retrieved successfully", response);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse> updateAdmin(
            @PathVariable Long userId,
            @Valid @RequestBody AdminUpdateDto request) {
        AdminResponseDto response = adminService.updateAdmin(userId, request);
        return ResponseUtil.success("Admin updated successfully", response);
    }

    @PatchMapping("/{userId}")
    public ResponseEntity<ApiResponse> patchAdmin(
            @PathVariable Long userId,
            @Valid @RequestBody AdminPatchDto request) {
        AdminResponseDto response = adminService.patchAdmin(userId, request);
        return ResponseUtil.success("Admin updated successfully", response);
    }

    // @DeleteMapping("/{userId}")
    // public ResponseEntity<ApiResponse> deleteAdmin(@PathVariable Long userId) {
    //     adminService.deleteAdmin(userId);
    //     return ResponseUtil.success("Admin deleted successfully");
    // }
}
