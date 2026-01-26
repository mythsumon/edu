# GeoJSON 데이터 준비 가이드

## 개요
권역 지도 기능을 사용하기 위해서는 한국 행정구역 경계 데이터(GeoJSON)가 필요합니다.

## 데이터 소스
1. **공공데이터포털 (data.go.kr)**
   - 검색어: "행정구역 경계"
   - 제공 형식: SHP (Shapefile)
   - 다운로드: 시군구(SIG) 단위 경계 데이터

2. **국토교통부 국가공간정보포털 (www.vworld.kr)**
   - 행정구역 경계 데이터 제공
   - GeoJSON 형식 직접 다운로드 가능

## 변환 방법

### 방법 1: ogr2ogr 사용 (권장)

```bash
# GDAL 설치 (Windows: OSGeo4W, Mac: brew install gdal, Linux: apt-get install gdal-bin)

# SHP -> GeoJSON 변환
ogr2ogr -f GeoJSON si-gun-gu.geojson TL_SCCO_SIG.shp -t_srs EPSG:4326

# 좌표계 확인 및 변환 (필요시)
ogr2ogr -f GeoJSON -t_srs EPSG:4326 si-gun-gu.geojson TL_SCCO_SIG.shp
```

### 방법 2: QGIS 사용

1. QGIS 설치 (https://qgis.org/)
2. SHP 파일 열기
3. 레이어 우클릭 → Export → Save Features As
4. Format: GeoJSON 선택
5. CRS: EPSG:4326 (WGS84) 선택
6. 저장

### 방법 3: 온라인 변환 도구

- https://mapshaper.org/
- https://mygeodata.cloud/converter/

## 파일 배치

### Backend
```
backend/src/main/resources/geo/si-gun-gu.geojson
```

### Frontend (정적 파일로 사용하는 경우)
```
public/geo/si-gun-gu.geojson
```

## GeoJSON 구조 예시

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "SIG_CD": "41111",
        "SIG_KOR_NM": "수원시 영통구"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[lng, lat], [lng, lat], ...]]
      }
    }
  ]
}
```

## 필수 Properties 필드

GeoJSON의 `properties` 객체에 다음 필드가 포함되어야 합니다:

- **SIG_CD** 또는 **code**: 시군구 코드 (예: "41111")
- **SIG_KOR_NM** 또는 **name**: 시군구 이름 (예: "수원시 영통구")

## 코드 매핑 확인

시군구 코드는 5자리 숫자입니다:
- 예: 41111 (수원시 영통구)
- 예: 11680 (서울시 강남구)

코드와 이름의 매핑은 한국행정구역코드표를 참고하세요.

## 주의사항

1. **좌표계**: 반드시 WGS84 (EPSG:4326)로 변환해야 합니다.
2. **파일 크기**: GeoJSON 파일이 클 경우 (100MB 이상) 서버에서 제공하는 방식을 권장합니다.
3. **성능**: 많은 폴리곤을 렌더링할 때 성능 최적화가 필요할 수 있습니다.

## 테스트

GeoJSON 파일이 올바르게 준비되었는지 확인:

```bash
# 파일 크기 확인
ls -lh si-gun-gu.geojson

# JSON 유효성 검사
cat si-gun-gu.geojson | jq '.features | length'

# 첫 번째 Feature 확인
cat si-gun-gu.geojson | jq '.features[0]'
```
