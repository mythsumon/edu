# 권역 지도 기능 구현 요약

## 구현 완료 항목

### Backend (Spring Boot)

#### 1. 데이터베이스
- ✅ `admin_region` 테이블 (권역 정보)
- ✅ `admin_region_area` 테이블 (권역-행정구역 매핑)
- ✅ 초기 데이터: 6개 권역 자동 생성
- ✅ 트리거: updated_at 자동 업데이트

#### 2. Entity
- ✅ `AdminRegion.java` - 권역 엔티티
- ✅ `AdminRegionArea.java` - 권역-행정구역 매핑 엔티티

#### 3. DTO
- ✅ `RegionDto.java` - 권역 응답 DTO
- ✅ `RegionUpdateRequest.java` - 권역 수정 요청 DTO
- ✅ `AreaDto.java` - 행정구역 DTO

#### 4. Repository
- ✅ `AdminRegionRepository.java`
- ✅ `AdminRegionAreaRepository.java`

#### 5. Service
- ✅ `RegionService.java` - 권역 관리 서비스
- ✅ `AreaService.java` - 행정구역 목록 서비스 (GeoJSON에서 추출)
- ✅ `GeoJsonService.java` - GeoJSON 데이터 제공 서비스

#### 6. Controller
- ✅ `RegionController.java`
  - GET `/api/v1/regions` - 모든 권역 조회
  - GET `/api/v1/regions/{id}` - 특정 권역 조회
  - PUT `/api/v1/regions/{id}` - 권역 수정
  - GET `/api/v1/regions/areas` - 행정구역 목록
  - GET `/api/v1/regions/geojson/areas/{code}` - 특정 행정구역 GeoJSON
  - GET `/api/v1/regions/geojson/areas` - 전체 GeoJSON

#### 7. Exception Handling
- ✅ `ErrorCode.java` - 에러 코드 ENUM
- ✅ `BusinessException.java` - 비즈니스 예외
- ✅ `GlobalExceptionHandler.java` - 전역 예외 처리
- ✅ `ErrorResponse.java` - 에러 응답 DTO

#### 8. Validation
- ✅ 중복 행정구역 할당 검증 (R002 에러코드)
- ✅ 입력값 검증 (Jakarta Validation)

### Frontend (React + TypeScript)

#### 1. 네이버 지도 SDK 로더
- ✅ `libs/naverMapLoader.ts` - SDK 동적 로드

#### 2. GeoJSON 유틸리티
- ✅ `libs/geojsonUtils.ts`
  - 좌표 변환 (GeoJSON → Naver Maps LatLng)
  - Polygon/MultiPolygon 처리
  - Centroid 계산
  - Feature 검색

#### 3. 지도 컴포넌트
- ✅ `components/shared/ui/RegionAssignmentMap.tsx`
  - 권역별 폴리곤 렌더링
  - 라벨 표시
  - Hover 효과
  - Click 이벤트 (PARTIAL 모드)
  - FULL 모드 지원

#### 4. 관리자 페이지
- ✅ `app/admin/region-management/page.tsx`
  - 권역 목록 표시
  - 권역 편집 모달
  - 행정구역 멀티셀렉트
  - 저장 기능

#### 5. 타입 정의
- ✅ `types/naver-maps.d.ts` - 네이버 지도 타입 정의

#### 6. 설정
- ✅ `libs/axiosConfig.ts` - Axios 기본 설정

## 사용 방법

### 1. 환경 변수 설정

`.env.local` 파일에 추가:
```env
VITE_NAVER_MAP_CLIENT_ID=your_naver_cloud_client_id
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### 2. GeoJSON 파일 준비

`README_GEOJSON_SETUP.md` 참고하여 GeoJSON 파일을 준비:
- Backend: `backend/src/main/resources/geo/si-gun-gu.geojson`
- Frontend (선택): `public/geo/si-gun-gu.geojson`

### 3. 데이터베이스 마이그레이션

```bash
cd backend
./mvnw flyway:migrate
```

### 4. 컴포넌트 사용 예시

```tsx
import { RegionAssignmentMap } from '@/components/shared/ui/RegionAssignmentMap'

function MyComponent() {
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  return (
    <RegionAssignmentMap
      mode="PARTIAL"
      value={selectedIds}
      onChange={setSelectedIds}
    />
  )
}
```

## API 엔드포인트

### 권역 관리
- `GET /api/v1/regions` - 모든 권역 조회
- `GET /api/v1/regions/{id}` - 특정 권역 조회
- `PUT /api/v1/regions/{id}` - 권역 수정

### 행정구역
- `GET /api/v1/regions/areas` - 행정구역 목록

### GeoJSON
- `GET /api/v1/regions/geojson/areas` - 전체 GeoJSON
- `GET /api/v1/regions/geojson/areas/{code}` - 특정 행정구역 GeoJSON

## 에러 코드

- `R001`: 권역을 찾을 수 없음
- `R002`: 이미 다른 권역에 할당된 행정구역
- `R003`: 행정구역 코드를 찾을 수 없음
- `G001`: GeoJSON 데이터를 찾을 수 없음
- `G002`: GeoJSON 파싱 오류

## 다음 단계 (선택)

1. **PostGIS 통합**: 대용량 데이터 처리 시 PostGIS 사용
2. **캐싱**: GeoJSON 데이터 캐싱 (Redis 등)
3. **성능 최적화**: 많은 폴리곤 렌더링 시 클러스터링
4. **실시간 업데이트**: WebSocket을 통한 실시간 권역 업데이트
