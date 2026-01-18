package com.itwizard.swaedu.modules.institutions.controller;

import com.itwizard.swaedu.modules.institutions.dto.request.InstitutionCreateDto;
import com.itwizard.swaedu.modules.institutions.dto.request.InstitutionUpdateDto;
import com.itwizard.swaedu.modules.institutions.dto.response.InstitutionResponseDto;
import com.itwizard.swaedu.modules.institutions.service.InstitutionService;
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
@RequestMapping("/api/v1/institutions")
@RequiredArgsConstructor
public class InstitutionController {

    private final InstitutionService institutionService;

    // POST /api/v1/institutions — create institution
    @PostMapping
    public ResponseEntity<ApiResponse> createInstitution(@Valid @RequestBody InstitutionCreateDto request) {
        InstitutionResponseDto response = institutionService.createInstitution(request);
        return ResponseUtil.created("Institution created successfully", response);
    }

    // GET /api/v1/institutions — list institutions (pagination + search)
    @GetMapping
    public ResponseEntity<ApiResponse> listInstitutions(
            @RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) List<Long> majorCategoryIds,
            @RequestParam(required = false) List<Long> categoryOneIds,
            @RequestParam(required = false) List<Long> categoryTwoIds,
            @RequestParam(required = false) List<Long> classificationIds,
            @RequestParam(required = false) Long districtId,
            @RequestParam(required = false) List<Long> zoneIds,
            @RequestParam(required = false) List<Long> regionIds,
            @RequestParam(required = false) Long teacherId) {
        PageResponse<InstitutionResponseDto> response = institutionService.listInstitutions(
                q, page, size, sort, majorCategoryIds, categoryOneIds, categoryTwoIds,
                classificationIds, districtId, zoneIds, regionIds, teacherId);
        return ResponseUtil.success("Institutions retrieved successfully", response);
    }

    // GET /api/v1/institutions/{id} — institution detail
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getInstitutionById(@PathVariable Long id) {
        InstitutionResponseDto response = institutionService.getInstitutionById(id);
        return ResponseUtil.success("Institution retrieved successfully", response);
    }

    // PUT /api/v1/institutions/{id} — update institution (full update)
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateInstitution(
            @PathVariable Long id,
            @Valid @RequestBody InstitutionUpdateDto request) {
        InstitutionResponseDto response = institutionService.updateInstitution(id, request);
        return ResponseUtil.success("Institution updated successfully", response);
    }

    // DELETE /api/v1/institutions/{id} — delete institution (soft delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteInstitution(@PathVariable Long id) {
        institutionService.deleteInstitution(id);
        return ResponseUtil.success("Institution deleted successfully");
    }

    // GET /api/v1/institutions/export — export institutions to Excel
    @GetMapping("/export")
    public ResponseEntity<StreamingResponseBody> exportInstitutions(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) List<Long> majorCategoryIds,
            @RequestParam(required = false) List<Long> categoryOneIds,
            @RequestParam(required = false) List<Long> categoryTwoIds,
            @RequestParam(required = false) List<Long> classificationIds,
            @RequestParam(required = false) Long districtId,
            @RequestParam(required = false) List<Long> zoneIds,
            @RequestParam(required = false) List<Long> regionIds,
            @RequestParam(required = false) Long teacherId) {
        
        StreamingResponseBody responseBody = outputStream -> {
            try {
                institutionService.exportInstitutionsToExcel(
                        outputStream, q, majorCategoryIds, categoryOneIds, categoryTwoIds,
                        classificationIds, districtId, zoneIds, regionIds, teacherId);
            } catch (IOException e) {
                throw new RuntimeException("Error exporting institutions to Excel", e);
            }
        };

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDisposition(
                ContentDisposition.attachment()
                        .filename("institutions.xlsx")
                        .build()
        );

        return ResponseEntity.ok()
                .headers(headers)
                .body(responseBody);
    }
}
