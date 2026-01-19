package com.itwizard.swaedu.modules.instructor.controller;

import com.itwizard.swaedu.modules.instructor.dto.request.InstructorPatchDto;
import com.itwizard.swaedu.modules.instructor.dto.request.InstructorUpdateDto;
import com.itwizard.swaedu.modules.instructor.dto.request.RegisterInstructorRequestDto;
import com.itwizard.swaedu.modules.instructor.dto.response.InstructorResponseDto;
import com.itwizard.swaedu.modules.instructor.service.InstructorService;
import com.itwizard.swaedu.util.ApiResponse;
import com.itwizard.swaedu.util.PageResponse;
import com.itwizard.swaedu.util.ResponseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/instructor")
@RequiredArgsConstructor
public class InstructorController {

    private final InstructorService instructorService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> registerInstructor(@Valid @RequestBody RegisterInstructorRequestDto request) {
        InstructorResponseDto response = instructorService.registerInstructor(request);
        return ResponseUtil.created("Instructor registered successfully", response);
    }

    @GetMapping
    public ResponseEntity<ApiResponse> listInstructors(
            @RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) List<Long> regionIds,
            @RequestParam(required = false) List<Long> classificationIds,
            @RequestParam(required = false) List<Long> statusIds,
            @RequestParam(required = false) List<Long> zoneIds) {
        PageResponse<InstructorResponseDto> response = instructorService.listInstructors(
                q, page, size, sort, regionIds, classificationIds, statusIds, zoneIds);
        return ResponseUtil.success("Instructors retrieved successfully", response);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse> getInstructorById(@PathVariable Long userId) {
        InstructorResponseDto response = instructorService.getInstructorById(userId);
        return ResponseUtil.success("Instructor retrieved successfully", response);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse> updateInstructor(
            @PathVariable Long userId,
            @Valid @RequestBody InstructorUpdateDto request) {
        InstructorResponseDto response = instructorService.updateInstructor(userId, request);
        return ResponseUtil.success("Instructor updated successfully", response);
    }

    @PatchMapping("/{userId}")
    public ResponseEntity<ApiResponse> patchInstructor(
            @PathVariable Long userId,
            @Valid @RequestBody InstructorPatchDto request) {
        InstructorResponseDto response = instructorService.patchInstructor(userId, request);
        return ResponseUtil.success("Instructor updated successfully", response);
    }

    // @DeleteMapping("/{userId}")
    // public ResponseEntity<ApiResponse> deleteInstructor(@PathVariable Long userId) {
    //     instructorService.deleteInstructor(userId);
    //     return ResponseUtil.success("Instructor deleted successfully");
    // }
}
