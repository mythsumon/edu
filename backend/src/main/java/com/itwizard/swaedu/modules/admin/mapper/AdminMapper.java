package com.itwizard.swaedu.modules.admin.mapper;

import com.itwizard.swaedu.modules.admin.dto.request.AdminPatchDto;
import com.itwizard.swaedu.modules.admin.dto.request.AdminUpdateDto;
import com.itwizard.swaedu.modules.admin.dto.response.AdminResponseDto;
import com.itwizard.swaedu.modules.admin.entity.Admin;
import com.itwizard.swaedu.modules.auth.entity.User;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper utility class for converting between Admin entity and DTOs
 */
public class AdminMapper {

    private AdminMapper() {
        // Utility class - prevent instantiation
    }

    /**
     * Convert Admin entity (with User) to AdminResponseDto
     */
    public static AdminResponseDto toResponseDto(Admin admin) {
        if (admin == null) {
            return null;
        }
        User user = admin.getUser();
        return AdminResponseDto.builder()
                .userId(admin.getUserId())
                .username(user != null ? user.getUsername() : null)
                .name(admin.getName())
                .email(admin.getEmail())
                .phone(admin.getPhone())
                .profilePhoto(admin.getProfilePhoto())
                .enabled(user != null ? user.getEnabled() : null)
                .build();
    }

    /**
     * Update existing Admin entity with data from AdminUpdateDto
     */
    public static void updateEntityFromDto(Admin admin, AdminUpdateDto dto) {
        if (admin == null || dto == null) {
            return;
        }
        admin.setName(dto.getName());
        admin.setEmail(dto.getEmail());
        admin.setPhone(dto.getPhone());
    }

    /**
     * Partial update from AdminPatchDto
     */
    public static void patchEntityFromDto(Admin admin, AdminPatchDto dto) {
        if (admin == null || dto == null) {
            return;
        }
        if (dto.getName() != null) {
            admin.setName(dto.getName());
        }
        if (dto.getEmail() != null) {
            admin.setEmail(dto.getEmail());
        }
        if (dto.getPhone() != null) {
            admin.setPhone(dto.getPhone());
        }
    }

    /**
     * Convert list of Admin entities to response DTOs
     */
    public static List<AdminResponseDto> toResponseDtoList(List<Admin> admins) {
        if (admins == null) {
            return Collections.emptyList();
        }
        return admins.stream()
                .map(AdminMapper::toResponseDto)
                .collect(Collectors.toList());
    }
}
