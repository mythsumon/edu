package com.edu.service;

import com.edu.exception.BusinessException;
import com.edu.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * GeoJSON 데이터 제공 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GeoJsonService {
    public String getAreaGeoJson(String areaCode) {
        try {
            ClassPathResource resource = new ClassPathResource("geo/si-gun-gu.geojson");
            if (!resource.exists()) {
                throw new BusinessException(ErrorCode.GEOJSON_NOT_FOUND);
            }

            try (InputStream inputStream = resource.getInputStream()) {
                String jsonContent = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
                
                // TODO: areaCode에 해당하는 Feature만 필터링하여 반환
                // 현재는 전체 GeoJSON 반환 (필터링 로직 추가 필요)
                return jsonContent;
            }
        } catch (IOException e) {
            log.error("GeoJSON 파일 읽기 오류", e);
            throw new BusinessException(ErrorCode.GEOJSON_PARSE_ERROR);
        }
    }

    public String getAllAreasGeoJson() {
        try {
            ClassPathResource resource = new ClassPathResource("geo/si-gun-gu.geojson");
            if (!resource.exists()) {
                throw new BusinessException(ErrorCode.GEOJSON_NOT_FOUND);
            }

            try (InputStream inputStream = resource.getInputStream()) {
                return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
            }
        } catch (IOException e) {
            log.error("GeoJSON 파일 읽기 오류", e);
            throw new BusinessException(ErrorCode.GEOJSON_PARSE_ERROR);
        }
    }
}
