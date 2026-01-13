package com.itwizard.swaedu.modules.region.controller;

import com.itwizard.swaedu.modules.region.dto.request.RegionRequestDto;
import com.itwizard.swaedu.modules.region.dto.response.RegionResponseDto;
import com.itwizard.swaedu.modules.region.service.RegionService;
import com.itwizard.swaedu.util.ApiResponse;
import com.itwizard.swaedu.util.ResponseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/regions")
@RequiredArgsConstructor
public class RegionController {

    private final RegionService regionService;

    @PostMapping
    public ResponseEntity<ApiResponse> createRegion(@Valid @RequestBody RegionRequestDto request) {
        RegionResponseDto dto = regionService.createRegion(request);
        return ResponseUtil.created("Region created successfully", dto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getRegionById(@PathVariable Long id) {
        RegionResponseDto dto = regionService.getRegionById(id);
        return ResponseUtil.success("Region retrieved successfully", dto);
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllRegions(
            @RequestParam(required = false) Long zoneId) {
        List<RegionResponseDto> dtoList;
        if (zoneId != null) {
            dtoList = regionService.getRegionsByZoneId(zoneId);
        } else {
            dtoList = regionService.getAllRegions();
        }
        return ResponseUtil.success("Regions retrieved successfully", dtoList);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateRegion(
            @PathVariable Long id,
            @Valid @RequestBody RegionRequestDto request) {
        RegionResponseDto dto = regionService.updateRegion(id, request);
        return ResponseUtil.success("Region updated successfully", dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteRegion(@PathVariable Long id) {
        regionService.deleteRegion(id);
        return ResponseUtil.success("Region deleted successfully");
    }
}
