package com.edu.service;

import com.edu.dto.AreaDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * 행정구역 목록 서비스
 * GeoJSON 파일에서 시군구 목록을 추출하여 제공합니다.
 * 
 * GeoJSON 파일 준비 방법:
 * 1. 공공데이터포털(data.go.kr)에서 "행정구역 경계" 데이터 다운로드 (SHP 형식)
 * 2. QGIS 또는 ogr2ogr을 사용하여 SHP -> GeoJSON 변환:
 *    ogr2ogr -f GeoJSON si-gun-gu.geojson TL_SCCO_SIG.shp -t_srs EPSG:4326
 * 3. 변환된 GeoJSON을 /src/main/resources/geo/si-gun-gu.geojson 에 저장
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AreaService {
    private final ObjectMapper objectMapper;
    private List<AreaDto> cachedAreas;

    public List<AreaDto> getAllAreas() {
        if (cachedAreas != null) {
            return cachedAreas;
        }

        try {
            ClassPathResource resource = new ClassPathResource("geo/si-gun-gu.geojson");
            if (!resource.exists()) {
                log.warn("GeoJSON 파일을 찾을 수 없습니다: geo/si-gun-gu.geojson");
                log.info("기본 행정구역 목록을 반환합니다.");
                // GeoJSON 파일이 없을 경우 기본 목록 반환
                cachedAreas = getDefaultAreas();
                return cachedAreas;
            }

            try (InputStream inputStream = resource.getInputStream()) {
                String jsonContent = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
                JsonNode rootNode = objectMapper.readTree(jsonContent);

                List<AreaDto> areas = new ArrayList<>();
                JsonNode features = rootNode.get("features");

                if (features != null && features.isArray()) {
                    for (JsonNode feature : features) {
                        JsonNode properties = feature.get("properties");
                        if (properties != null) {
                            // GeoJSON properties에서 코드와 이름 추출
                            // 다양한 필드명 지원
                            String code = null;
                            String name = null;
                            
                            // 코드 필드 찾기
                            if (properties.has("SIG_CD")) {
                                code = properties.get("SIG_CD").asText();
                            } else if (properties.has("code")) {
                                code = properties.get("code").asText();
                            } else if (properties.has("CTPRVN_CD") || properties.has("SIDO_CD")) {
                                // 시도 코드와 시군구 코드 조합
                                String sidoCode = properties.has("CTPRVN_CD") ? 
                                    properties.get("CTPRVN_CD").asText() : 
                                    properties.get("SIDO_CD").asText();
                                String sigCode = properties.has("SIG_CD") ? 
                                    properties.get("SIG_CD").asText() : "";
                                code = sidoCode + sigCode;
                            }
                            
                            // 이름 필드 찾기
                            if (properties.has("SIG_KOR_NM")) {
                                name = properties.get("SIG_KOR_NM").asText();
                            } else if (properties.has("name")) {
                                name = properties.get("name").asText();
                            } else if (properties.has("CTP_KOR_NM") || properties.has("SIG_KOR_NM")) {
                                name = properties.has("CTP_KOR_NM") ? 
                                    properties.get("CTP_KOR_NM").asText() : 
                                    properties.get("SIG_KOR_NM").asText();
                            }

                            if (code != null && name != null && !code.isEmpty() && !name.isEmpty()) {
                                areas.add(AreaDto.builder()
                                        .code(code)
                                        .name(name)
                                        .build());
                            }
                        }
                    }
                }

                if (areas.isEmpty()) {
                    log.warn("GeoJSON에서 행정구역을 추출할 수 없습니다. 기본 목록을 반환합니다.");
                    cachedAreas = getDefaultAreas();
                } else {
                    cachedAreas = areas.stream()
                            .distinct()
                            .sorted((a, b) -> a.getName().compareTo(b.getName()))
                            .collect(Collectors.toList());
                    log.info("행정구역 목록 로드 완료: {}개", cachedAreas.size());
                }
                return cachedAreas;
            }
        } catch (Exception e) {
            log.error("GeoJSON 파일 읽기 오류", e);
            log.info("기본 행정구역 목록을 반환합니다.");
            cachedAreas = getDefaultAreas();
            return cachedAreas;
        }
    }

    /**
     * 기본 행정구역 목록 (GeoJSON 파일이 없을 때 사용)
     * 경기도 주요 시군구 목록
     */
    private List<AreaDto> getDefaultAreas() {
        List<AreaDto> defaultAreas = new ArrayList<>();
        
        // 경기도 주요 시군구 (예시)
        String[][] defaultAreaData = {
            {"41111", "수원시 영통구"},
            {"41113", "수원시 장안구"},
            {"41115", "수원시 권선구"},
            {"41117", "수원시 팔달구"},
            {"41131", "성남시 수정구"},
            {"41133", "성남시 중원구"},
            {"41135", "성남시 분당구"},
            {"41150", "의정부시"},
            {"41171", "안양시 만안구"},
            {"41173", "안양시 동안구"},
            {"41190", "부천시"},
            {"41210", "광명시"},
            {"41220", "평택시"},
            {"41250", "동두천시"},
            {"41271", "안산시 상록구"},
            {"41273", "안산시 단원구"},
            {"41281", "고양시 덕양구"},
            {"41285", "고양시 일산동구"},
            {"41287", "고양시 일산서구"},
            {"41290", "과천시"},
            {"41310", "구리시"},
            {"41360", "남양주시"},
            {"41370", "오산시"},
            {"41390", "시흥시"},
            {"41410", "군포시"},
            {"41430", "의왕시"},
            {"41450", "하남시"},
            {"41461", "용인시 처인구"},
            {"41463", "용인시 기흥구"},
            {"41465", "용인시 수지구"},
            {"41480", "파주시"},
            {"41500", "이천시"},
            {"41550", "안성시"},
            {"41570", "김포시"},
            {"41590", "화성시"},
            {"41610", "광주시"},
            {"41630", "양주시"},
            {"41650", "포천시"},
            {"41670", "여주시"},
        };

        for (String[] data : defaultAreaData) {
            defaultAreas.add(AreaDto.builder()
                    .code(data[0])
                    .name(data[1])
                    .build());
        }

        return defaultAreas;
    }
}
