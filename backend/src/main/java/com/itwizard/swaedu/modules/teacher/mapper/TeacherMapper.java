package com.itwizard.swaedu.modules.teacher.mapper;

import com.itwizard.swaedu.modules.teacher.dto.response.TeacherResponseDto;
import com.itwizard.swaedu.modules.teacher.entity.Teacher;
import com.itwizard.swaedu.modules.auth.entity.User;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper utility class for converting between Teacher entity and DTOs
 */
public class TeacherMapper {

    private TeacherMapper() {
        // Utility class - prevent instantiation
    }

    /**
     * Convert Teacher entity (with User) to TeacherResponseDto
     */
    public static TeacherResponseDto toResponseDto(Teacher teacher) {
        if (teacher == null) {
            return null;
        }
        User user = teacher.getUser();
        return TeacherResponseDto.builder()
                .userId(teacher.getUserId())
                .username(user != null ? user.getUsername() : null)
                .name(teacher.getName())
                .email(teacher.getEmail())
                .phone(teacher.getPhone())
                .profilePhoto(teacher.getProfilePhoto())
                .enabled(user != null ? user.getEnabled() : null)
                .build();
    }

    /**
     * Convert list of Teacher entities to response DTOs
     */
    public static List<TeacherResponseDto> toResponseDtoList(List<Teacher> teachers) {
        if (teachers == null) {
            return Collections.emptyList();
        }
        return teachers.stream()
                .map(TeacherMapper::toResponseDto)
                .collect(Collectors.toList());
    }
}
