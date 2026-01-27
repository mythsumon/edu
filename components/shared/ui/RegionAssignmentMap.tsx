'use client'

/// <reference path="../../../types/naver-maps.d.ts" />

import { useEffect, useRef, useState } from 'react'
import { loadNaverMapScript } from '@/libs/naverMapLoader'
import {
  featureToPaths,
  calculateCentroid,
  findFeaturesByAreaCodes,
  type GeoJson,
} from '@/libs/geojsonUtils'
import { getAllRegions, type Region } from '@/lib/regionStore'

interface RegionAssignmentMapProps {
  mode: 'PARTIAL' | 'FULL'
  value: number[]
  onChange: (ids: number[]) => void
  className?: string
}

export function RegionAssignmentMap({
  mode,
  value,
  onChange,
  className = '',
}: RegionAssignmentMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<naver.maps.Map | null>(null)
  const polygonsRef = useRef<Map<number, naver.maps.Polygon[]>>(new Map())
  const labelsRef = useRef<Map<number, naver.maps.Marker>>(new Map())
  const polylinesRef = useRef<naver.maps.Polyline[]>([])
  const centroidsRef = useRef<Map<number, naver.maps.LatLng>>(new Map())
  const [regions, setRegions] = useState<Region[]>([])
  const [geoJson, setGeoJson] = useState<GeoJson | null>(null)
  const [loading, setLoading] = useState(true)
  const [mapError, setMapError] = useState<string | null>(null)
  const [selectedRegions, setSelectedRegions] = useState<Set<number>>(new Set(value))

  // 권역 데이터 로드
  useEffect(() => {
    try {
      const regionsData = getAllRegions()
      setRegions(regionsData)
    } catch (error) {
      console.error('권역 데이터 로드 실패:', error)
    }
  }, [])

  // GeoJSON 데이터 로드 (정적 파일 또는 public 폴더에서)
  useEffect(() => {
    const loadGeoJson = async () => {
      try {
        // public 폴더에서 GeoJSON 로드 시도
        const response = await fetch('/geo/si-gun-gu.geojson')
        if (response.ok) {
          const data = await response.json()
          setGeoJson(data)
        } else {
          // GeoJSON 파일이 없으면 빈 GeoJSON 반환
          console.warn('GeoJSON 파일을 찾을 수 없습니다. /public/geo/si-gun-gu.geojson 경로를 확인해주세요.')
          setGeoJson({
            type: 'FeatureCollection',
            features: [],
          } as GeoJson)
        }
      } catch (error) {
        console.error('GeoJSON 데이터 로드 실패:', error)
        // 에러 발생 시 빈 GeoJSON 반환
        setGeoJson({
          type: 'FeatureCollection',
          features: [],
        } as GeoJson)
      } finally {
        setLoading(false)
      }
    }

    loadGeoJson()
  }, [])

  // 지도 초기화 및 렌더링
  useEffect(() => {
    if (!mapRef.current || regions.length === 0 || loading) return

    const initMap = async () => {
      try {
        setMapError(null)
        
        // Naver Map SDK 로드 시도
        try {
          await loadNaverMapScript()
        } catch (error: any) {
          console.warn('네이버 지도 SDK 로드 실패:', error)
          setMapError('네이버 지도 SDK를 로드할 수 없습니다. NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 환경변수를 확인해주세요.')
          return
        }

        if (!window.naver || !window.naver.maps) {
          setMapError('네이버 지도 SDK를 사용할 수 없습니다.')
          return
        }

        const naver = window.naver

        if (!mapInstanceRef.current) {
          // 지도 초기화
          const mapOptions: naver.maps.MapOptions = {
            center: new naver.maps.LatLng(36.5, 127.5), // 한국 중심
            zoom: 7,
            minZoom: 6,
            maxZoom: 18,
          }
          mapInstanceRef.current = new naver.maps.Map(mapRef.current!, mapOptions)
        }

        const map = mapInstanceRef.current

        // 기존 폴리곤, 라벨, 폴리라인 제거
        polygonsRef.current.forEach(polygons => {
          polygons.forEach(polygon => polygon.setMap(null))
        })
        labelsRef.current.forEach(label => label.setMap(null))
        polylinesRef.current.forEach(polyline => polyline.setMap(null))
        polygonsRef.current.clear()
        labelsRef.current.clear()
        polylinesRef.current = []
        centroidsRef.current.clear()

        // GeoJSON이 없으면 기본 지도만 표시 (폴리곤 없이)
        if (!geoJson || !geoJson.features || geoJson.features.length === 0) {
          console.warn('GeoJSON 데이터가 없습니다. 기본 지도만 표시됩니다.')
          // 지도는 이미 표시되었으므로 여기서 종료
          return
        }

        // 각 권역별로 폴리곤 그리기
        regions.forEach(region => {
          const areaCodes = region.areas.map(area => area.code)
          const features = findFeaturesByAreaCodes(geoJson, areaCodes)

          if (features.length === 0) return

          const polygons: naver.maps.Polygon[] = []
          const allPaths: naver.maps.LatLng[][] = []

          features.forEach(feature => {
            const paths = featureToPaths(feature, naver.maps)
            allPaths.push(...paths)

            paths.forEach(path => {
              const polygon = new naver.maps.Polygon({
                map: map,
                paths: path,
                fillColor: region.color,
                fillOpacity: selectedRegions.has(region.id) ? 0.6 : 0.3,
                strokeColor: region.color,
                strokeWeight: selectedRegions.has(region.id) ? 3 : 1,
                strokeOpacity: 0.8,
                strokePattern: [8, 4], // 점선 패턴: 8px 선, 4px 공백
                zIndex: selectedRegions.has(region.id) ? 100 : 10,
              })

              // Hover 이벤트
              naver.maps.Event.addListener(polygon, 'mouseover', () => {
                polygon.setOptions({
                  fillOpacity: 0.7,
                  strokeWeight: 4,
                  zIndex: 200,
                })
              })

              naver.maps.Event.addListener(polygon, 'mouseout', () => {
                polygon.setOptions({
                  fillOpacity: selectedRegions.has(region.id) ? 0.6 : 0.3,
                  strokeWeight: selectedRegions.has(region.id) ? 3 : 1,
                  zIndex: selectedRegions.has(region.id) ? 100 : 10,
                })
              })

              // Click 이벤트 (PARTIAL 모드에서만)
              if (mode === 'PARTIAL') {
                naver.maps.Event.addListener(polygon, 'click', () => {
                  const newSelected = new Set(selectedRegions)
                  if (newSelected.has(region.id)) {
                    newSelected.delete(region.id)
                  } else {
                    newSelected.add(region.id)
                  }
                  setSelectedRegions(newSelected)
                  onChange(Array.from(newSelected))
                })
              }

              polygons.push(polygon)
            })
          })

          polygonsRef.current.set(region.id, polygons)

          // 라벨 표시 (권역 중심)
          if (allPaths.length > 0) {
            const centroid = calculateCentroid(allPaths, naver.maps)
            centroidsRef.current.set(region.id, centroid)
            
            const label = new naver.maps.Marker({
              position: centroid,
              map: map,
              icon: {
                content: `
                  <div style="
                    background-color: ${region.color};
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: bold;
                    white-space: nowrap;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                  ">
                    ${region.name}
                  </div>
                `,
                anchor: new naver.maps.Point(0.5, 0.5),
              },
              zIndex: 1000,
            })
            labelsRef.current.set(region.id, label)
          }
        })

        // 권역 간 연결선 그리기 (점선)
        // 권역 순서대로 연결: 1-2, 2-3, 3-4, 4-5, 5-6, 6-1
        const regionOrder = [1, 2, 3, 4, 5, 6]
        for (let i = 0; i < regionOrder.length; i++) {
          const currentRegionId = regionOrder[i]
          const nextRegionId = regionOrder[(i + 1) % regionOrder.length]
          
          const currentCentroid = centroidsRef.current.get(currentRegionId)
          const nextCentroid = centroidsRef.current.get(nextRegionId)
          
          if (currentCentroid && nextCentroid) {
            const polyline = new naver.maps.Polyline({
              map: map,
              path: [currentCentroid, nextCentroid],
              strokeColor: '#9CA3AF', // 회색
              strokeWeight: 2,
              strokeOpacity: 0.6,
              strokePattern: [10, 5], // 점선 패턴: 10px 선, 5px 공백
              zIndex: 5, // 폴리곤보다 낮은 z-index
            })
            polylinesRef.current.push(polyline)
          }
        }

        // FULL 모드인 경우 모든 권역 선택
        if (mode === 'FULL') {
          const allRegionIds = regions.map(r => r.id)
          setSelectedRegions(new Set(allRegionIds))
          onChange(allRegionIds)
        }
      } catch (error: any) {
        console.error('지도 초기화 실패:', error)
        setMapError(error.message || '지도를 초기화할 수 없습니다.')
      }
    }

    initMap()
  }, [geoJson, regions, loading, mode, selectedRegions, onChange])

  // value 변경 시 selectedRegions 동기화
  useEffect(() => {
    setSelectedRegions(new Set(value))
  }, [value])

  // 선택된 권역에 따라 폴리곤 스타일 업데이트
  useEffect(() => {
    if (!mapInstanceRef.current) return

    regions.forEach(region => {
      const polygons = polygonsRef.current.get(region.id) || []
      const isSelected = selectedRegions.has(region.id)

      polygons.forEach(polygon => {
        polygon.setOptions({
          fillOpacity: isSelected ? 0.6 : 0.3,
          strokeWeight: isSelected ? 3 : 1,
          strokePattern: [8, 4], // 점선 패턴 유지
          zIndex: isSelected ? 100 : 10,
        })
      })
    })
  }, [selectedRegions, regions])

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 bg-gray-100 rounded-lg ${className}`}>
        <div className="text-gray-500">지도를 불러오는 중...</div>
      </div>
    )
  }

  if (mapError) {
    return (
      <div className={`flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg border border-gray-200 ${className}`}>
        <div className="text-gray-600 text-center px-4">
          <p className="font-medium mb-2">지도를 표시할 수 없습니다</p>
          <p className="text-sm text-gray-500">{mapError}</p>
          <p className="text-xs text-gray-400 mt-2">권역 관리는 지도 없이도 사용할 수 있습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-96 rounded-lg border border-gray-300" />
      {mode === 'PARTIAL' && (
        <div className="absolute top-4 left-4 bg-white p-2 rounded shadow text-sm">
          <p className="text-gray-600">권역을 클릭하여 선택/해제하세요</p>
        </div>
      )}
    </div>
  )
}
