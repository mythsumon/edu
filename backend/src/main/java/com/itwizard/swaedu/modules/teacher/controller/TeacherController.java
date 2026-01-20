package com.itwizard.swaedu.modules.teacher.controller;

import com.itwizard.swaedu.modules.teacher.dto.request.RegisterTeacherRequestDto;
import com.itwizard.swaedu.modules.teacher.dto.request.TeacherUpdateDto;
import com.itwizard.swaedu.modules.teacher.dto.response.TeacherResponseDto;
import com.itwizard.swaedu.modules.teacher.service.TeacherService;
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
@RequestMapping("/api/v1/teacher")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> registerTeacher(@Valid @RequestBody RegisterTeacherRequestDto request) {
        TeacherResponseDto response = teacherService.registerTeacher(request);
        return ResponseUtil.created("Teacher registered successfully", response);
    }

    @GetMapping
    public ResponseEntity<ApiResponse> listTeachers(
            @RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size,
            @RequestParam(required = false) String sort) {
        PageResponse<TeacherResponseDto> response = teacherService.listTeachers(q, page, size, sort);
        return ResponseUtil.success("Teachers retrieved successfully", response);
    }

    // GET /api/v1/teacher/export — export teachers to Excel
    // IMPORTANT: This must be defined BEFORE /{userId} to avoid route conflicts
    @GetMapping("/export")
    public ResponseEntity<StreamingResponseBody> exportTeachers(
            @RequestParam(required = false) String q) {
        
        StreamingResponseBody responseBody = outputStream -> {
            try {
                teacherService.exportTeachersToExcel(outputStream, q);
            } catch (IOException e) {
                throw new RuntimeException("Error exporting teachers to Excel", e);
            }
        };

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDisposition(
                ContentDisposition.attachment()
                        .filename("teachers.xlsx")
                        .build()
        );

        return ResponseEntity.ok()
                .headers(headers)
                .body(responseBody);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse> getTeacherById(@PathVariable Long userId) {
        TeacherResponseDto response = teacherService.getTeacherById(userId);
        return ResponseUtil.success("Teacher retrieved successfully", response);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse> updateTeacher(
            @PathVariable Long userId,
            @Valid @RequestBody TeacherUpdateDto request) {
        TeacherResponseDto response = teacherService.updateTeacher(userId, request);
        return ResponseUtil.success("Teacher updated successfully", response);
    }
}
