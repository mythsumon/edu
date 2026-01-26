'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, Button, Select, Space, message, Modal } from 'antd'
import { Save, Edit } from 'lucide-react'
import { RegionAssignmentMap } from '@/components/shared/ui/RegionAssignmentMap'
import { getAllRegions, getRegionById, updateRegion, getAllAreas, type Region, type Area } from '@/lib/regionStore'

interface Region {
  id: number
  name: string
  color: string
  mode: 'PARTIAL' | 'FULL'
  areas: Array<{ code: string; name: string }>
}

interface Area {
  code: string
  name: string
}

export default function RegionManagementPage() {
  const [regions, setRegions] = useState<Region[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRegion, setEditingRegion] = useState<Region | null>(null)
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  // 권역 목록 로드
  useEffect(() => {
    loadRegions()
    loadAreas()
    
    // 다른 탭에서의 변경사항 감지
    const handleDataChange = () => {
      loadRegions()
      loadAreas()
    }
    window.addEventListener('regionDataChanged', handleDataChange)
    
    return () => {
      window.removeEventListener('regionDataChanged', handleDataChange)
    }
  }, [])

  const loadRegions = () => {
    try {
      const regionsData = getAllRegions()
      setRegions(regionsData)
    } catch (error: any) {
      console.error('권역 로드 실패:', error)
      message.error(`권역 목록을 불러오는데 실패했습니다: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadAreas = () => {
    try {
      const areasData = getAllAreas()
      setAreas(areasData)
    } catch (error: any) {
      console.error('행정구역 로드 실패:', error)
      message.error(`행정구역 목록을 불러오는데 실패했습니다: ${error.message}`)
    }
  }

  const handleEdit = (region: Region) => {
    setEditingRegion(region)
    setSelectedAreas(region.areas.map(area => area.code))
  }

  const handleSave = () => {
    if (!editingRegion) return

    if (selectedAreas.length === 0) {
      message.warning('최소 1개 이상의 행정구역을 선택해주세요.')
      return
    }

    setSaving(true)
    try {
      const selectedAreaObjects = areas
        .filter(area => selectedAreas.includes(area.code))
        .map(area => ({ code: area.code, name: area.name }))

      updateRegion(editingRegion.id, {
        name: editingRegion.name,
        color: editingRegion.color,
        mode: editingRegion.mode,
        areas: selectedAreaObjects,
      })

      message.success('권역이 저장되었습니다.')
      setEditingRegion(null)
      setSelectedAreas([])
      loadRegions()
    } catch (error: any) {
      console.error('권역 저장 실패:', error)
      message.error(error.message || '권역 저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditingRegion(null)
    setSelectedAreas([])
  }

  const regionColors = [
    { value: '#FF5733', label: '빨강' },
    { value: '#33FF57', label: '초록' },
    { value: '#3357FF', label: '파랑' },
    { value: '#FF33F5', label: '보라' },
    { value: '#F5FF33', label: '노랑' },
    { value: '#33FFF5', label: '청록' },
  ]

  if (loading) {
    return (
      <ProtectedRoute requiredRole="admin">
        <div className="p-6">
          <div className="text-center py-12">로딩 중...</div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">권역 관리</h1>
          <p className="text-gray-600 mt-1">1~6권역에 행정구역을 할당합니다.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 지도 영역 */}
          <div className="lg:col-span-2">
            <Card title="권역 지도" className="h-full">
              <RegionAssignmentMap
                mode="PARTIAL"
                value={editingRegion ? [editingRegion.id] : []}
                onChange={(ids) => {
                  if (ids.length > 0 && editingRegion) {
                    // 지도에서 권역 선택 시 해당 권역 편집 모드로 전환
                    const selectedRegion = regions.find(r => r.id === ids[0])
                    if (selectedRegion) {
                      handleEdit(selectedRegion)
                    }
                  }
                }}
                className="w-full h-[600px]"
              />
            </Card>
          </div>

          {/* 권역 목록 */}
          <div className="space-y-4">
            {regions.map(region => (
              <Card
                key={region.id}
                title={
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: region.color }}
                    />
                    <span>{region.name}</span>
                  </div>
                }
                extra={
                  <Button
                    icon={<Edit className="w-4 h-4" />}
                    onClick={() => handleEdit(region)}
                    size="small"
                    type={editingRegion?.id === region.id ? 'primary' : 'default'}
                  >
                    편집
                  </Button>
                }
                className={editingRegion?.id === region.id ? 'border-2 border-blue-500' : ''}
              >
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    할당된 행정구역: <strong>{region.areas.length}개</strong>
                  </div>
                  {region.areas.length > 0 && (
                    <div className="text-xs text-gray-500 max-h-32 overflow-y-auto">
                      {region.areas.map(area => (
                        <div key={area.code}>{area.name}</div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* 편집 모달 */}
        <Modal
          title={editingRegion ? `${editingRegion.name} 편집` : '권역 편집'}
          open={!!editingRegion}
          onOk={handleSave}
          onCancel={handleCancel}
          okText="저장"
          cancelText="취소"
          confirmLoading={saving}
          width={1200}
        >
          {editingRegion && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 왼쪽: 지도 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  지도에서 행정구역 선택
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <RegionAssignmentMap
                    mode="PARTIAL"
                    value={[editingRegion.id]}
                    onChange={() => {}}
                    className="w-full h-[400px]"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  지도에서 권역을 클릭하여 선택할 수 있습니다.
                </p>
              </div>

              {/* 오른쪽: 설정 폼 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    권역 이름
                  </label>
                  <input
                    type="text"
                    value={editingRegion.name}
                    onChange={e => setEditingRegion({ ...editingRegion, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    색상
                  </label>
                  <Select
                    value={editingRegion.color}
                    onChange={color => setEditingRegion({ ...editingRegion, color })}
                    className="w-full"
                    options={regionColors}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    행정구역 선택 (다중 선택 가능)
                  </label>
                  <Select
                    mode="multiple"
                    value={selectedAreas}
                    onChange={setSelectedAreas}
                    className="w-full"
                    placeholder="행정구역을 선택하세요"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={areas.map(area => ({
                      value: area.code,
                      label: `${area.name} (${area.code})`,
                    }))}
                    maxTagCount="responsive"
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    선택된 행정구역: {selectedAreas.length}개
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </ProtectedRoute>
  )
}
