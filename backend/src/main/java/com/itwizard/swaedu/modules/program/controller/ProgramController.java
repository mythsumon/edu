package com.itwizard.swaedu.modules.program.controller;

import com.itwizard.swaedu.modules.program.dto.request.ProgramCreateDto;
import com.itwizard.swaedu.modules.program.dto.request.ProgramUpdateDto;
import com.itwizard.swaedu.modules.program.dto.response.ProgramResponseDto;
import com.itwizard.swaedu.modules.program.service.ProgramService;
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
import java.util.List;

@RestController
@RequestMapping("/api/v1/programs")
@RequiredArgsConstructor
public class ProgramController {

    private final ProgramService programService;

    // POST /api/v1/programs — create program
    @PostMapping
    public ResponseEntity<ApiResponse> createProgram(@Valid @RequestBody ProgramCreateDto request) {
        ProgramResponseDto response = programService.createProgram(request);
        return ResponseUtil.created("Program created successfully", response);
    }

    // GET /api/v1/programs — list programs (pagination + search)
    @GetMapping
    public ResponseEntity<ApiResponse> listPrograms(
            @RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) Long sessionPartId,
            @RequestParam(required = false) Long statusId,
            @RequestParam(required = false) List<Long> sessionPartIds,
            @RequestParam(required = false) List<Long> statusIds) {
        PageResponse<ProgramResponseDto> response = programService.listPrograms(
                q, page, size, sort, sessionPartId, statusId, sessionPartIds, statusIds);
        return ResponseUtil.success("Programs retrieved successfully", response);
    }

    // GET /api/v1/programs/{id} — program detail
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getProgramById(@PathVariable Long id) {
        ProgramResponseDto response = programService.getProgramById(id);
        return ResponseUtil.success("Program retrieved successfully", response);
    }

    // PUT /api/v1/programs/{id} — update program (full update)
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateProgram(
            @PathVariable Long id,
            @Valid @RequestBody ProgramUpdateDto request) {
        ProgramResponseDto response = programService.updateProgram(id, request);
        return ResponseUtil.success("Program updated successfully", response);
    }

    // DELETE /api/v1/programs/{id} — delete program (soft delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteProgram(@PathVariable Long id) {
        programService.deleteProgram(id);
        return ResponseUtil.success("Program deleted successfully");
    }

    // GET /api/v1/programs/export — export programs to Excel
    @GetMapping("/export")
    public ResponseEntity<StreamingResponseBody> exportPrograms(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) List<Long> statusIds) {
        
        StreamingResponseBody responseBody = outputStream -> {
            try {
                programService.exportProgramsToExcel(outputStream, q, statusIds);
            } catch (IOException e) {
                throw new RuntimeException("Error exporting programs to Excel", e);
            }
        };

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDisposition(
                ContentDisposition.attachment()
                        .filename("programs.xlsx")
                        .build()
        );

        return ResponseEntity.ok()
                .headers(headers)
                .body(responseBody);
    }
}
