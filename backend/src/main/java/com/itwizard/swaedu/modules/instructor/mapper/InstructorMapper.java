package com.itwizard.swaedu.modules.instructor.mapper;

import com.itwizard.swaedu.modules.instructor.dto.request.InstructorPatchDto;
import com.itwizard.swaedu.modules.instructor.dto.request.InstructorUpdateDto;
import com.itwizard.swaedu.modules.instructor.dto.response.InstructorResponseDto;
import com.itwizard.swaedu.modules.instructor.entity.Instructor;
import com.itwizard.swaedu.modules.auth.entity.User;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper utility class for converting between Instructor entity and DTOs
 */
public class InstructorMapper {

    private InstructorMapper() {
        // Utility class - prevent instantiation
    }

    /**
     * Convert Instructor entity (with User) to InstructorResponseDto
     */
    public static InstructorResponseDto toResponseDto(Instructor instructor) {
        if (instructor == null) {
            return null;
        }
        User user = instructor.getUser();
        return InstructorResponseDto.builder()
                .userId(instructor.getUserId())
                .username(user != null ? user.getUsername() : null)
                .firstName(instructor.getFirstName())
                .lastName(instructor.getLastName())
                .email(instructor.getEmail())
                .phone(instructor.getPhone())
                .gender(instructor.getGender())
                .dob(instructor.getDob())
                .regionId(instructor.getRegionId())
                .city(instructor.getCity())
                .street(instructor.getStreet())
                .detailAddress(instructor.getDetailAddress())
                .statusId(instructor.getStatusId())
                .classificationId(instructor.getClassificationId())
                .signature(instructor.getSignature())
                .profilePhoto(instructor.getProfilePhoto())
                .enabled(user != null ? user.getEnabled() : null)
                .build();
    }

    /**
     * Update existing Instructor entity with data from InstructorUpdateDto
     */
    public static void updateEntityFromDto(Instructor instructor, InstructorUpdateDto dto) {
        if (instructor == null || dto == null) {
            return;
        }
        instructor.setFirstName(dto.getFirstName());
        instructor.setLastName(dto.getLastName());
        instructor.setEmail(dto.getEmail());
        instructor.setPhone(dto.getPhone());
        instructor.setGender(dto.getGender());
        instructor.setDob(dto.getDob());
        instructor.setCity(dto.getCity());
        instructor.setStreet(dto.getStreet());
        instructor.setDetailAddress(dto.getDetailAddress());
    }

    /**
     * Partial update from InstructorPatchDto
     */
    public static void patchEntityFromDto(Instructor instructor, InstructorPatchDto dto) {
        if (instructor == null || dto == null) {
            return;
        }
        if (dto.getFirstName() != null) {
            instructor.setFirstName(dto.getFirstName());
        }
        if (dto.getLastName() != null) {
            instructor.setLastName(dto.getLastName());
        }
        if (dto.getEmail() != null) {
            instructor.setEmail(dto.getEmail());
        }
        if (dto.getPhone() != null) {
            instructor.setPhone(dto.getPhone());
        }
        if (dto.getGender() != null) {
            instructor.setGender(dto.getGender());
        }
        if (dto.getDob() != null) {
            instructor.setDob(dto.getDob());
        }
        if (dto.getCity() != null) {
            instructor.setCity(dto.getCity());
        }
        if (dto.getStreet() != null) {
            instructor.setStreet(dto.getStreet());
        }
        if (dto.getDetailAddress() != null) {
            instructor.setDetailAddress(dto.getDetailAddress());
        }
    }

    /**
     * Convert list of Instructor entities to response DTOs
     */
    public static List<InstructorResponseDto> toResponseDtoList(List<Instructor> instructors) {
        if (instructors == null) {
            return Collections.emptyList();
        }
        return instructors.stream()
                .map(InstructorMapper::toResponseDto)
                .collect(Collectors.toList());
    }
}
