/**
 * 네이버 지도 SDK 로더
 * NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 환경변수를 사용하여 SDK를 로드합니다.
 */

let mapScriptLoaded = false;
let mapScriptLoading = false;
let loadPromise: Promise<void> | null = null;

export const loadNaverMapScript = (): Promise<void> => {
  if (mapScriptLoaded) {
    return Promise.resolve();
  }

  if (mapScriptLoading && loadPromise) {
    return loadPromise;
  }

  mapScriptLoading = true;
  loadPromise = new Promise((resolve, reject) => {
    // Next.js 환경변수: NEXT_PUBLIC_ 접두사 필요
    const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
    
    if (!clientId) {
      reject(new Error('NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 환경변수가 설정되지 않았습니다.'));
      return;
    }

    // 이미 스크립트가 로드되어 있는지 확인
    if (window.naver && window.naver.maps) {
      mapScriptLoaded = true;
      mapScriptLoading = false;
      resolve();
      return;
    }

    // 스크립트 동적 로드
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
    script.async = true;
    
    script.onload = () => {
      mapScriptLoaded = true;
      mapScriptLoading = false;
      resolve();
    };
    
    script.onerror = () => {
      mapScriptLoading = false;
      loadPromise = null;
      reject(new Error('네이버 지도 SDK 로드에 실패했습니다.'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};
