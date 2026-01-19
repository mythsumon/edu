package com.itwizard.swaedu.modules.admin.service;

import com.itwizard.swaedu.modules.admin.dto.request.AdminPatchDto;
import com.itwizard.swaedu.modules.admin.dto.request.AdminUpdateDto;
import com.itwizard.swaedu.modules.admin.dto.request.RegisterAdminRequestDto;
import com.itwizard.swaedu.modules.admin.dto.response.AdminResponseDto;
import com.itwizard.swaedu.util.PageResponse;

import java.io.IOException;
import java.io.OutputStream;

public interface AdminService {
    AdminResponseDto registerAdmin(RegisterAdminRequestDto request);

    PageResponse<AdminResponseDto> listAdmins(String q, Integer page, Integer size, String sort);

    AdminResponseDto getAdminById(Long userId);
    
    AdminResponseDto getAdminByUsername(String username);

    AdminResponseDto updateAdmin(Long userId, AdminUpdateDto request);
    
    AdminResponseDto updateAdminByUsername(String username, AdminUpdateDto request);

    AdminResponseDto patchAdmin(Long userId, AdminPatchDto request);

    void deleteAdmin(Long userId);

    void exportAdminsToExcel(OutputStream outputStream, String q) throws IOException;
}
