package com.itwizard.swaedu.modules.teacher.service;

import com.itwizard.swaedu.modules.teacher.dto.request.RegisterTeacherRequestDto;
import com.itwizard.swaedu.modules.teacher.dto.request.TeacherUpdateDto;
import com.itwizard.swaedu.modules.teacher.dto.response.TeacherResponseDto;
import com.itwizard.swaedu.util.PageResponse;

public interface TeacherService {
    TeacherResponseDto registerTeacher(RegisterTeacherRequestDto request);
    
    PageResponse<TeacherResponseDto> listTeachers(String q, Integer page, Integer size, String sort);

    TeacherResponseDto getTeacherById(Long userId);
    
    TeacherResponseDto updateTeacher(Long userId, TeacherUpdateDto request);
}
