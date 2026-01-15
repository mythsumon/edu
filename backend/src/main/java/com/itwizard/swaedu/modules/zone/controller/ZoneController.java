package com.itwizard.swaedu.modules.zone.controller;

import com.itwizard.swaedu.modules.zone.dto.request.ZoneRequestDto;
import com.itwizard.swaedu.modules.zone.dto.response.ZoneResponseDto;
import com.itwizard.swaedu.modules.zone.service.ZoneService;
import com.itwizard.swaedu.util.ApiResponse;
import com.itwizard.swaedu.util.ResponseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/zones")
@RequiredArgsConstructor
public class ZoneController {

    private final ZoneService zoneService;

    @PostMapping
    public ResponseEntity<ApiResponse> createZone(@Valid @RequestBody ZoneRequestDto request) {
        ZoneResponseDto dto = zoneService.createZone(request);
        return ResponseUtil.created("Zone created successfully", dto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getZoneById(@PathVariable Long id) {
        ZoneResponseDto dto = zoneService.getZoneById(id);
        return ResponseUtil.success("Zone retrieved successfully", dto);
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllZones() {
        List<ZoneResponseDto> dtoList = zoneService.getAllZones();
        return ResponseUtil.success("Zones retrieved successfully", dtoList);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateZone(
            @PathVariable Long id,
            @Valid @RequestBody ZoneRequestDto request) {
        ZoneResponseDto dto = zoneService.updateZone(id, request);
        return ResponseUtil.success("Zone updated successfully", dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteZone(@PathVariable Long id) {
        zoneService.deleteZone(id);
        return ResponseUtil.success("Zone deleted successfully");
    }
}
