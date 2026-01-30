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
    GEOJSON_PARSE_ERROR(500, "G002", "GeoJSON 파싱 중 오류가 발생했습니다."),

    // Travel Allowance 관련
    INSTRUCTOR_NOT_FOUND(404, "T001", "강사를 찾을 수 없습니다."),
    INSTITUTION_NOT_FOUND(404, "T002", "기관을 찾을 수 없습니다."),
    INSTRUCTOR_ADDRESS_MISSING(400, "T003", "강사의 집 주소가 등록되지 않았습니다."),
    INSTITUTION_ADDRESS_MISSING(400, "T004", "기관 주소가 등록되지 않았습니다."),
    DAILY_TRAVEL_NOT_FOUND(404, "T005", "일별 여비 내역을 찾을 수 없습니다."),
    TRAVEL_POLICY_NOT_FOUND(404, "T006", "여비 정책을 찾을 수 없습니다."),
    MAP_SNAPSHOT_GENERATION_FAILED(500, "T007", "지도 이미지 생성에 실패했습니다.");

    private final int status;
    private final String code;
    private final String message;
}
