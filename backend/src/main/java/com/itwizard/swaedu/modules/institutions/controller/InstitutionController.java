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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
            @RequestParam(required = false) Long institutionTypeId,
            @RequestParam(required = false) Long regionId,
            @RequestParam(required = false) Long educationTypeId,
            @RequestParam(required = false) Long inChargePersonId) {
        PageResponse<InstitutionResponseDto> response = institutionService.listInstitutions(
                q, page, size, sort, institutionTypeId, regionId, educationTypeId, inChargePersonId);
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
}
