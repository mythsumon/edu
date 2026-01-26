/**
 * GeoJSON 유틸리티 함수
 * GeoJSON Polygon/MultiPolygon을 네이버 지도 좌표 배열로 변환
 */

export interface GeoJsonFeature {
  type: 'Feature';
  properties: Record<string, any>;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface GeoJson {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}

/**
 * GeoJSON 좌표 배열을 네이버 지도 LatLng 배열로 변환
 */
export const coordinatesToLatLngArray = (
  coordinates: number[][],
  naver: { maps: typeof naver.maps }
): naver.maps.LatLng[] => {
  return coordinates.map(([lng, lat]) => new naver.maps.LatLng(lat, lng));
};

/**
 * GeoJSON Polygon을 네이버 지도 경로 배열로 변환
 */
export const polygonToPaths = (
  coordinates: number[][][],
  naver: { maps: typeof naver.maps }
): naver.maps.LatLng[][] => {
  return coordinates.map(ring => coordinatesToLatLngArray(ring, naver));
};

/**
 * GeoJSON MultiPolygon을 네이버 지도 경로 배열로 변환
 */
export const multiPolygonToPaths = (
  coordinates: number[][][][],
  naver: { maps: typeof naver.maps }
): naver.maps.LatLng[][] => {
  const paths: naver.maps.LatLng[][] = [];
  coordinates.forEach(polygon => {
    polygon.forEach(ring => {
      paths.push(coordinatesToLatLngArray(ring, naver));
    });
  });
  return paths;
};

/**
 * GeoJSON Feature의 geometry를 네이버 지도 경로 배열로 변환
 */
export const featureToPaths = (
  feature: GeoJsonFeature,
  naver: { maps: typeof naver.maps }
): naver.maps.LatLng[][] => {
  const { geometry } = feature;
  
  if (geometry.type === 'Polygon') {
    return polygonToPaths(geometry.coordinates as number[][][], naver);
  } else if (geometry.type === 'MultiPolygon') {
    return multiPolygonToPaths(geometry.coordinates as number[][][][], naver);
  }
  
  return [];
};

/**
 * 폴리곤의 중심점(centroid) 계산
 */
export const calculateCentroid = (
  paths: naver.maps.LatLng[][],
  naver: { maps: typeof naver.maps }
): naver.maps.LatLng => {
  if (paths.length === 0 || paths[0].length === 0) {
    return new naver.maps.LatLng(37.5665, 126.9780); // 서울 기본 좌표
  }

  // 첫 번째 외곽 경로의 모든 좌표 사용
  const outerRing = paths[0];
  let sumLat = 0;
  let sumLng = 0;
  const count = outerRing.length;

  outerRing.forEach(point => {
    sumLat += point.lat();
    sumLng += point.lng();
  });

  return new naver.maps.LatLng(sumLat / count, sumLng / count);
};

/**
 * GeoJSON에서 특정 area_code에 해당하는 Feature 찾기
 */
export const findFeatureByAreaCode = (
  geoJson: GeoJson,
  areaCode: string
): GeoJsonFeature | null => {
  return geoJson.features.find(feature => {
    const props = feature.properties;
    // GeoJSON properties에서 코드 필드 확인 (실제 구조에 맞게 수정 필요)
    return props?.SIG_CD === areaCode || 
           props?.code === areaCode ||
           props?.SIG_CD?.toString() === areaCode;
  }) || null;
};

/**
 * 여러 area_code에 해당하는 Features 찾기
 */
export const findFeaturesByAreaCodes = (
  geoJson: GeoJson,
  areaCodes: string[]
): GeoJsonFeature[] => {
  return geoJson.features.filter(feature => {
    const props = feature.properties;
    const code = props?.SIG_CD || props?.code || props?.SIG_CD?.toString();
    return areaCodes.includes(code);
  });
};
