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
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.IOException;

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

    // GET /api/v1/admin/export — export admins to Excel
    // IMPORTANT: This must be defined BEFORE /{userId} to avoid route conflicts
    @GetMapping("/export")
    public ResponseEntity<StreamingResponseBody> exportAdmins(
            @RequestParam(required = false) String q) {
        
        StreamingResponseBody responseBody = outputStream -> {
            try {
                adminService.exportAdminsToExcel(outputStream, q);
            } catch (IOException e) {
                throw new RuntimeException("Error exporting admins to Excel", e);
            }
        };

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDisposition(
                ContentDisposition.attachment()
                        .filename("admins.xlsx")
                        .build()
        );

        return ResponseEntity.ok()
                .headers(headers)
                .body(responseBody);
    }
    
    // GET /api/v1/admin/username/{username} — get admin by username
    // IMPORTANT: This must be defined BEFORE /{userId} to avoid route conflicts
    @GetMapping("/username/{username}")
    public ResponseEntity<ApiResponse> getAdminByUsername(@PathVariable String username) {
        AdminResponseDto response = adminService.getAdminByUsername(username);
        return ResponseUtil.success("Admin retrieved successfully", response);
    }
    
    // PUT /api/v1/admin/username/{username} — update admin by username
    // IMPORTANT: This must be defined BEFORE /{userId} to avoid route conflicts
    @PutMapping("/username/{username}")
    public ResponseEntity<ApiResponse> updateAdminByUsername(
            @PathVariable String username,
            @Valid @RequestBody AdminUpdateDto request) {
        AdminResponseDto response = adminService.updateAdminByUsername(username, request);
        return ResponseUtil.success("Admin updated successfully", response);
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
