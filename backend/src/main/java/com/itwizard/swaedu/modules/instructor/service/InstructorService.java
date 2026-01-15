package com.itwizard.swaedu.modules.instructor.service;

import com.itwizard.swaedu.modules.instructor.dto.request.InstructorPatchDto;
import com.itwizard.swaedu.modules.instructor.dto.request.InstructorUpdateDto;
import com.itwizard.swaedu.modules.instructor.dto.request.RegisterInstructorRequestDto;
import com.itwizard.swaedu.modules.instructor.dto.response.InstructorResponseDto;
import com.itwizard.swaedu.util.PageResponse;

public interface InstructorService {
    InstructorResponseDto registerInstructor(RegisterInstructorRequestDto request);

    PageResponse<InstructorResponseDto> listInstructors(String q, Integer page, Integer size, String sort);

    InstructorResponseDto getInstructorById(Long userId);

    InstructorResponseDto updateInstructor(Long userId, InstructorUpdateDto request);

    InstructorResponseDto patchInstructor(Long userId, InstructorPatchDto request);

    void deleteInstructor(Long userId);
}
