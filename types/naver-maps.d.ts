/**
 * 네이버 지도 타입 정의
 * 네이버 지도 SDK는 전역 window.naver 객체로 제공됩니다.
 */

declare global {
  namespace naver {
    namespace maps {
      class LatLng {
        constructor(lat: number, lng: number);
        lat(): number;
        lng(): number;
      }

      class Point {
        constructor(x: number, y: number);
        x: number;
        y: number;
      }

      interface MapOptions {
        center: LatLng;
        zoom: number;
        minZoom?: number;
        maxZoom?: number;
      }

      class Map {
        constructor(element: HTMLElement, options: MapOptions);
        setCenter(center: LatLng): void;
        setZoom(zoom: number): void;
        getCenter(): LatLng;
        getZoom(): number;
      }

      interface PolygonOptions {
        map?: Map | null;
        paths: LatLng | LatLng[] | LatLng[][];
        fillColor?: string;
        fillOpacity?: number;
        strokeColor?: string;
        strokeWeight?: number;
        strokeOpacity?: number;
        strokePattern?: number[];
        zIndex?: number;
      }

      class Polygon {
        constructor(options: PolygonOptions);
        setMap(map: Map | null): void;
        setOptions(options: Partial<PolygonOptions>): void;
        getMap(): Map | null;
      }

      interface PolylineOptions {
        map?: Map | null;
        path: LatLng[];
        strokeColor?: string;
        strokeWeight?: number;
        strokeOpacity?: number;
        strokePattern?: number[];
        zIndex?: number;
      }

      class Polyline {
        constructor(options: PolylineOptions);
        setMap(map: Map | null): void;
        setOptions(options: Partial<PolylineOptions>): void;
        getMap(): Map | null;
      }

      interface MarkerOptions {
        position: LatLng;
        map?: Map | null;
        icon?: {
          content: string;
          anchor?: Point;
        };
        zIndex?: number;
      }

      class Marker {
        constructor(options: MarkerOptions);
        setMap(map: Map | null): void;
        setPosition(position: LatLng): void;
        getPosition(): LatLng;
      }

      namespace Event {
        function addListener(
          instance: Polygon | Polyline | Marker | Map,
          eventName: string,
          handler: (...args: any[]) => void
        ): void;
        function removeListener(
          instance: Polygon | Polyline | Marker | Map,
          eventName: string,
          handler: (...args: any[]) => void
        ): void;
      }
    }
  }

  interface Window {
    naver: {
      maps: typeof naver.maps;
    };
  }
}

export {};
