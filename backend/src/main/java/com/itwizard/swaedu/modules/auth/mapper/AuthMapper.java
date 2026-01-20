package com.itwizard.swaedu.modules.auth.mapper;

import com.itwizard.swaedu.modules.admin.dto.response.AdminProfileDto;
import com.itwizard.swaedu.modules.instructor.dto.response.InstructorProfileDto;
import com.itwizard.swaedu.modules.auth.dto.JwtPayload;
import com.itwizard.swaedu.modules.auth.dto.response.UserResponseDto;
import com.itwizard.swaedu.modules.auth.entity.User;

/**
 * Mapper utility class for converting between User entity and DTOs
 */
public class AuthMapper {

    private AuthMapper() {
        // Utility class - prevent instantiation
    }

    /**
     * Convert User entity to JwtPayload
     */
    public static JwtPayload toJwtPayload(User user) {
        if (user == null) {
            return null;
        }
        String roleName = user.getRole() != null ? user.getRole().getName() : null;
        return JwtPayload.builder()
                .username(user.getUsername())
                .role(roleName)
                .build();
    }

    /**
     * Convert User entity to UserResponseDto
     */
    public static UserResponseDto toUserResponseDto(User user) {
        if (user == null) {
            return null;
        }

        String roleName = user.getRole() != null ? user.getRole().getName() : null;

        AdminProfileDto adminDto = null;
        if (user.getAdmin() != null) {
            adminDto = AdminProfileDto.builder()
                    .name(user.getAdmin().getName())
                    .email(user.getAdmin().getEmail())
                    .phone(user.getAdmin().getPhone())
                    .profilePhoto(user.getAdmin().getProfilePhoto())
                    .build();
        }

        InstructorProfileDto instructorDto = null;
        if (user.getInstructor() != null) {
            instructorDto = InstructorProfileDto.builder()
                    .name(user.getInstructor().getName())
                    .email(user.getInstructor().getEmail())
                    .phone(user.getInstructor().getPhone())
                    .gender(user.getInstructor().getGender())
                    .dob(user.getInstructor().getDob())
                    .regionId(user.getInstructor().getRegionId())
                    .cityId(user.getInstructor().getCityId())
                    .street(user.getInstructor().getStreet())
                    .detailAddress(user.getInstructor().getDetailAddress())
                    .statusId(user.getInstructor().getStatusId())
                    .classificationId(user.getInstructor().getClassificationId())
                    .affiliation(user.getInstructor().getAffiliation())
                    .signature(user.getInstructor().getSignature())
                    .profilePhoto(user.getInstructor().getProfilePhoto())
                    .build();
        }

        return UserResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .roleName(roleName)
                .enabled(user.getEnabled())
                .admin(adminDto)
                .instructor(instructorDto)
                .build();
    }
}

