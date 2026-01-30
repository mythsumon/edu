# Kakao Maps API 설정 가이드

## 1. API 키 발급

1. [Kakao Developers](https://developers.kakao.com/)에 접속
2. 내 애플리케이션 만들기
3. 앱 설정 > 플랫폼 > Web 플랫폼 등록
4. 앱 키 > REST API 키 복사

## 2. application.properties 설정

```properties
# Kakao Maps API Configuration
kakao.maps.api-key=YOUR_KAKAO_MAPS_API_KEY_HERE
```

**중요**: `YOUR_KAKAO_MAPS_API_KEY_HERE`를 실제 REST API 키로 교체하세요.

## 3. API 사용량 및 제한

- **Static Map API**: 무료 플랜에서 일일 300,000건
- **Directions API**: 무료 플랜에서 일일 300,000건

## 4. 기능 설명

### 현재 구현된 기능
- **경로 지도 이미지 생성**: 집 → 기관1 → 기관2 → ... → 집 경로를 지도 이미지로 생성
- **자동 저장**: 생성된 이미지를 StorageService를 통해 저장하고 URL 반환

### 사용되는 API
- **Kakao Maps Static Map API**: 정적 지도 이미지 생성
  - 마커 표시 (집, 각 기관)
  - 경로 표시 (폴리라인)

## 5. 테스트

API 키를 설정한 후, 다음 API를 호출하여 테스트:

```bash
POST /api/v1/admin/instructors/{instructorId}/daily-travel/recalculate?date=2025-03-05
```

응답에서 `mapSnapshotUrl` 필드를 확인하여 이미지 URL이 생성되었는지 확인하세요.

## 6. 문제 해결

### API 키가 설정되지 않은 경우
- 로그에 "Kakao Maps API key is not configured" 메시지가 표시됩니다
- `mapSnapshotUrl`이 `null`로 반환됩니다
- `status`가 `DRAFT`로 유지됩니다

### 이미지 생성 실패
- API 키가 유효하지 않은 경우
- 네트워크 오류
- 좌표가 잘못된 경우 (한국 영역 밖)

로그를 확인하여 정확한 오류 원인을 파악하세요.
