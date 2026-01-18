package com.itwizard.swaedu.modules.teacher.controller;

import com.itwizard.swaedu.modules.teacher.dto.response.TeacherResponseDto;
import com.itwizard.swaedu.modules.teacher.service.TeacherService;
import com.itwizard.swaedu.util.ApiResponse;
import com.itwizard.swaedu.util.PageResponse;
import com.itwizard.swaedu.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/teacher")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;

    @GetMapping
    public ResponseEntity<ApiResponse> listTeachers(
            @RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size,
            @RequestParam(required = false) String sort) {
        PageResponse<TeacherResponseDto> response = teacherService.listTeachers(q, page, size, sort);
        return ResponseUtil.success("Teachers retrieved successfully", response);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse> getTeacherById(@PathVariable Long userId) {
        TeacherResponseDto response = teacherService.getTeacherById(userId);
        return ResponseUtil.success("Teacher retrieved successfully", response);
    }
}
