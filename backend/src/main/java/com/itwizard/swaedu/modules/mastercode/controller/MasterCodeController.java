package com.itwizard.swaedu.modules.mastercode.controller;

import com.itwizard.swaedu.modules.mastercode.dto.request.MasterCodeCreateDto;
import com.itwizard.swaedu.modules.mastercode.dto.request.MasterCodePatchDto;
import com.itwizard.swaedu.modules.mastercode.dto.request.MasterCodeUpdateDto;
import com.itwizard.swaedu.modules.mastercode.dto.response.MasterCodeResponseDto;
import com.itwizard.swaedu.modules.mastercode.dto.response.MasterCodeTreeDto;
import com.itwizard.swaedu.modules.mastercode.service.MasterCodeService;
import com.itwizard.swaedu.util.ApiResponse;
import com.itwizard.swaedu.util.PageResponse;
import com.itwizard.swaedu.util.ResponseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mastercode")
@RequiredArgsConstructor
public class MasterCodeController {

    private final MasterCodeService masterCodeService;

    // 1. POST /api/v1/mastercode — create master code (root or child)
    @PostMapping
    public ResponseEntity<ApiResponse> createMasterCode(@Valid @RequestBody MasterCodeCreateDto request) {
        MasterCodeResponseDto response = masterCodeService.createMasterCode(request);
        return ResponseUtil.created("Master code created successfully", response);
    }

    // 2. GET /api/v1/mastercode — list master codes (pagination + search)
    @GetMapping
    public ResponseEntity<ApiResponse> listMasterCodes(
            @RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) Long parentId,
            @RequestParam(required = false) Boolean rootOnly) {
        PageResponse<MasterCodeResponseDto> response = masterCodeService.listMasterCodes(q, page, size, sort, parentId, rootOnly);
        return ResponseUtil.success("Master codes retrieved successfully", response);
    }

    // 4. GET /api/v1/mastercode/{id} — master code detail by code
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getMasterCodeById(@PathVariable Long id) {
        MasterCodeResponseDto response = masterCodeService.getMasterCodeById(id);
        return ResponseUtil.success("Master code retrieved successfully", response);
    }

    // 4b. GET /api/v1/mastercode/code/{code} — master code detail by code
    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse> getMasterCodeByCode(@PathVariable String code) {
        MasterCodeResponseDto response = masterCodeService.getMasterCodeByCode(code);
        return ResponseUtil.success("Master code retrieved successfully", response);
    }

    // 5. PUT /api/v1/mastercode/{id} — update master code (full update)
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateMasterCode(
            @PathVariable Long id,
            @Valid @RequestBody MasterCodeUpdateDto request) {
        MasterCodeResponseDto response = masterCodeService.updateMasterCode(id, request);
        return ResponseUtil.success("Master code updated successfully", response);
    }

    // 6. PATCH /api/v1/mastercode/{id} — partial update (optional)
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse> patchMasterCode(
            @PathVariable Long id,
            @Valid @RequestBody MasterCodePatchDto request) {
        MasterCodeResponseDto response = masterCodeService.patchMasterCode(id, request);
        return ResponseUtil.success("Master code updated successfully", response);
    }

    // 7. DELETE /api/v1/mastercode/{id} — delete master code (soft delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteMasterCode(@PathVariable Long id) {
        masterCodeService.deleteMasterCode(id);
        return ResponseUtil.success("Master code deleted successfully");
    }

    // 8. GET /api/v1/mastercode/roots — list root-level master codes
    @GetMapping("/roots")
    public ResponseEntity<ApiResponse> listRootMasterCodes(
            @RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size,
            @RequestParam(required = false) String sort) {
        PageResponse<MasterCodeResponseDto> response = masterCodeService.listRootMasterCodes(q, page, size, sort);
        return ResponseUtil.success("Root master codes retrieved successfully", response);
    }

    // 9. GET /api/v1/mastercode/{code}/children — list direct children of a master code (by code)
    @GetMapping("/{code}/children")
    public ResponseEntity<ApiResponse> listChildren(
            @PathVariable String code,
            @RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size,
            @RequestParam(required = false) String sort) {
        PageResponse<MasterCodeResponseDto> response = masterCodeService.listChildren(code, q, page, size, sort);
        return ResponseUtil.success("Children retrieved successfully", response);
    }

    // 9b. GET /api/v1/mastercode/{code}/grandchildren — list grandchildren of a master code (by code)
    @GetMapping("/{code}/grandchildren")
    public ResponseEntity<ApiResponse> listGrandChildren(
            @PathVariable String code,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sort) {
        PageResponse<MasterCodeResponseDto> response = masterCodeService.listGrandChildren(code, q, page, size, sort);
        return ResponseUtil.success("Grandchildren retrieved successfully", response);
    }

    // 10. GET /api/v1/mastercode/tree — retrieve master code hierarchy
    @GetMapping("/tree")
    public ResponseEntity<ApiResponse> getMasterCodeTree(
            @RequestParam(required = false) Long rootId,
            @RequestParam(required = false) Integer depth) {
        List<MasterCodeTreeDto> response = masterCodeService.getMasterCodeTree(rootId, depth);
        return ResponseUtil.success("Master code tree retrieved successfully", response);
    }

    // 11. GET /api/v1/mastercode/check — check if master code exists
    @GetMapping("/check")
    public ResponseEntity<ApiResponse> checkCodeExists(@RequestParam String code) {
        boolean exists = masterCodeService.checkCodeExists(code);
        if (exists) {
            return ResponseUtil.error("Master code already exists");
        }
        return ResponseUtil.success("Master code is available");
    }
}
