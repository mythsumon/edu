package com.itwizard.swaedu.modules.teacher.service;

import com.itwizard.swaedu.modules.teacher.dto.response.TeacherResponseDto;
import com.itwizard.swaedu.util.PageResponse;

public interface TeacherService {
    PageResponse<TeacherResponseDto> listTeachers(String q, Integer page, Integer size, String sort);

    TeacherResponseDto getTeacherById(Long userId);
}
