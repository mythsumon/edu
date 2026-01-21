package com.itwizard.swaedu.modules.instructor.controller;

import com.itwizard.swaedu.modules.instructor.dto.request.InstructorPatchDto;
import com.itwizard.swaedu.modules.instructor.dto.request.InstructorUpdateDto;
import com.itwizard.swaedu.modules.instructor.dto.request.RegisterInstructorRequestDto;
import com.itwizard.swaedu.modules.instructor.dto.response.InstructorResponseDto;
import com.itwizard.swaedu.modules.instructor.service.InstructorService;
import com.itwizard.swaedu.modules.storage.service.StorageService;
import com.itwizard.swaedu.util.ApiResponse;
import com.itwizard.swaedu.util.PageResponse;
import com.itwizard.swaedu.util.ResponseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/instructor")
@RequiredArgsConstructor
public class InstructorController {

    private final InstructorService instructorService;
    private final StorageService storageService;

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

    @GetMapping("/me")
    public ResponseEntity<ApiResponse> getMyProfile(Authentication authentication) {
        InstructorResponseDto response = instructorService.getInstructorByUsername(authentication.getName());
        return ResponseUtil.success("Instructor profile retrieved successfully", response);
    }

    @PatchMapping("/me")
    public ResponseEntity<ApiResponse> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody InstructorPatchDto request) {
        InstructorResponseDto response = instructorService.updateInstructorByUsername(authentication.getName(), request);
        return ResponseUtil.success("Instructor profile updated successfully", response);
    }

    // POST /api/v1/instructor/me/signature — upload signature image
    @PostMapping("/me/signature")
    public ResponseEntity<ApiResponse> uploadSignature(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        try {
            String fileUrl = storageService.uploadFile(file, "instructors/signatures");
            System.out.println("fileUrl: " + fileUrl);
            InstructorResponseDto response = instructorService.updateSignatureByUsername(
                    authentication.getName(), fileUrl);
            return ResponseUtil.success("Signature uploaded successfully", response);
        } catch (IOException e) {
            return ResponseUtil.error("Failed to upload signature: " + e.getMessage());
        }
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

    // GET /api/v1/instructor/export — export instructors to Excel
    @GetMapping("/export")
    public ResponseEntity<StreamingResponseBody> exportInstructors(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) List<Long> regionIds,
            @RequestParam(required = false) List<Long> classificationIds,
            @RequestParam(required = false) List<Long> statusIds,
            @RequestParam(required = false) List<Long> zoneIds) {
        
        StreamingResponseBody responseBody = outputStream -> {
            try {
                instructorService.exportInstructorsToExcel(
                        outputStream, q, regionIds, classificationIds, statusIds, zoneIds);
            } catch (IOException e) {
                throw new RuntimeException("Error exporting instructors to Excel", e);
            }
        };

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDisposition(
                ContentDisposition.attachment()
                        .filename("instructors.xlsx")
                        .build()
        );

        return ResponseEntity.ok()
                .headers(headers)
                .body(responseBody);
    }

    // @DeleteMapping("/{userId}")
    // public ResponseEntity<ApiResponse> deleteInstructor(@PathVariable Long userId) {
    //     instructorService.deleteInstructor(userId);
    //     return ResponseUtil.success("Instructor deleted successfully");
    // }
}
