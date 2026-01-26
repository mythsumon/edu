package com.edu.controller;

import com.edu.dto.AreaDto;
import com.edu.dto.RegionDto;
import com.edu.dto.RegionUpdateRequest;
import com.edu.service.AreaService;
import com.edu.service.GeoJsonService;
import com.edu.service.RegionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/regions")
@RequiredArgsConstructor
@Slf4j
public class RegionController {
    private final RegionService regionService;
    private final AreaService areaService;
    private final GeoJsonService geoJsonService;

    /**
     * 모든 권역 조회
     */
    @GetMapping
    public ResponseEntity<List<RegionDto>> getAllRegions() {
        return ResponseEntity.ok(regionService.getAllRegions());
    }

    /**
     * 특정 권역 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<RegionDto> getRegion(@PathVariable Long id) {
        return ResponseEntity.ok(regionService.getRegionById(id));
    }

    /**
     * 권역 정보 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<RegionDto> updateRegion(
            @PathVariable Long id,
            @Valid @RequestBody RegionUpdateRequest request) {
        return ResponseEntity.ok(regionService.updateRegion(id, request));
    }

    /**
     * 사용 가능한 행정구역 목록 조회
     */
    @GetMapping("/areas")
    public ResponseEntity<List<AreaDto>> getAllAreas() {
        try {
            List<AreaDto> areas = areaService.getAllAreas();
            if (areas.isEmpty()) {
                log.warn("행정구역 목록이 비어있습니다. GeoJSON 파일을 확인해주세요.");
            }
            return ResponseEntity.ok(areas);
        } catch (Exception e) {
            log.error("행정구역 목록 조회 실패", e);
            // 에러가 발생해도 빈 목록 반환 (AreaService에서 기본 목록 제공)
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    /**
     * 특정 행정구역의 GeoJSON 조회
     */
    @GetMapping(value = "/geojson/areas/{code}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getAreaGeoJson(@PathVariable String code) {
        return ResponseEntity.ok(geoJsonService.getAreaGeoJson(code));
    }

    /**
     * 모든 행정구역의 GeoJSON 조회
     */
    @GetMapping(value = "/geojson/areas", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getAllAreasGeoJson() {
        return ResponseEntity.ok(geoJsonService.getAllAreasGeoJson());
    }
}
