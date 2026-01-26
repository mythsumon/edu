package com.edu.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // 공통
    INTERNAL_SERVER_ERROR(500, "E001", "서버 내부 오류가 발생했습니다."),
    INVALID_INPUT(400, "E002", "잘못된 입력값입니다."),

    // 권역 관련
    REGION_NOT_FOUND(404, "R001", "권역을 찾을 수 없습니다."),
    AREA_ALREADY_ASSIGNED(400, "R002", "이미 다른 권역에 할당된 행정구역입니다."),
    AREA_CODE_NOT_FOUND(404, "R003", "행정구역 코드를 찾을 수 없습니다."),

    // GeoJSON 관련
    GEOJSON_NOT_FOUND(404, "G001", "GeoJSON 데이터를 찾을 수 없습니다."),
    GEOJSON_PARSE_ERROR(500, "G002", "GeoJSON 파싱 중 오류가 발생했습니다.");

    private final int status;
    private final String code;
    private final String message;
}
