'use client'

import { useState, useEffect } from 'react'
import { REGIONS, type RegionData, type SpecialCategory, type LocalStat } from '@/types/region'

interface RegionDetailPanelProps {
  selectedRegionId: number | undefined
  onRegionChange: (regionId: number) => void
  onCategorySelect?: (category: SpecialCategory | undefined) => void
}

export function RegionDetailPanel({ selectedRegionId, onRegionChange, onCategorySelect }: RegionDetailPanelProps) {
  const [selectedSpecialCategory, setSelectedSpecialCategory] = useState<SpecialCategory>('도서·벽지')

  // Reset special category when region changes
  useEffect(() => {
    setSelectedSpecialCategory('도서·벽지')
  }, [selectedRegionId])

  if (!selectedRegionId) {
    return null
  }

  const region = REGIONS.find((r) => r.id === selectedRegionId)
  if (!region) {
    return null
  }

  // Safety check for locals array
  if (!region.locals || region.locals.length === 0) {
    return (
      <div className="bg-white rounded-card shadow-card p-6 mt-8">
        <p className="text-gray-600">데이터를 불러올 수 없습니다.</p>
      </div>
    )
  }

  const getCategoryValue = (category: SpecialCategory, local: LocalStat) => {
    switch (category) {
      case '도서·벽지':
        return local.bookWall
      case '50차시':
        return local.fiftyHours
      case '특수학급':
        return local.specialClass
    }
  }

  const getCategoryTotal = (category: SpecialCategory) => {
    switch (category) {
      case '도서·벽지':
        return region.summary.bookWall
      case '50차시':
        return region.summary.fiftyHours
      case '특수학급':
        return region.summary.specialClass
    }
  }

  const categoryColors = {
    '도서·벽지': '#F97316',
    '50차시': '#22C55E',
    '특수학급': '#EC4899',
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Region Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-200 pb-4">
        {REGIONS.map((r) => (
          <button
            key={r.id}
            onClick={() => onRegionChange(r.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedRegionId === r.id
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={
              selectedRegionId === r.id
                ? { backgroundColor: r.color, color: 'white' }
                : undefined
            }
          >
            {r.name}
          </button>
        ))}
      </div>

      {/* Special Category Tabs - Moved right below Region Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-4">
        {(['도서·벽지', '50차시', '특수학급'] as SpecialCategory[]).map((category) => (
          <button
            key={category}
            onClick={() => {
              if (onCategorySelect) {
                // Navigate to special item detail panel
                onCategorySelect(category)
              } else {
                // Fallback to local filtering
                setSelectedSpecialCategory(category)
              }
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedSpecialCategory === category
                ? 'text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={
              selectedSpecialCategory === category
                ? { backgroundColor: categoryColors[category] }
                : undefined
            }
          >
            {category}
          </button>
        ))}
      </div>

      {/* Title and Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-[#3a2e2a]">{region.name} 교육 진행 현황</h3>
          <span className="text-2xl font-semibold" style={{ color: region.color }}>
            {region.educationPercent}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${region.educationPercent}%`,
              backgroundColor: region.color,
            }}
          />
        </div>
      </div>

      {/* 자치단체 Table */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
          자치단체별 현황
        </h4>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <tr>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">자치단체</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">교육기관수</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">학급</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">학생수</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">도서·벽지</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">50차시</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">특수학급</th>
              </tr>
            </thead>
              <tbody className="bg-white divide-y divide-slate-100">
              {region.locals.map((local, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 text-sm font-medium text-slate-900">{local.name}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">{local.institutions}개</td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">{local.classes}개</td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">{local.students}명</td>
                    <td className="px-4 py-3.5 text-sm text-slate-700 font-medium">{local.bookWall}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-700 font-medium">{local.fiftyHours}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-700 font-medium">{local.specialClass}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Summary Table - Redesigned */}
      <div>
        <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
          요약
        </h4>
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">구분</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">수치</th>
              </tr>
            </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">교육 퍼센트</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{region.summary.percent}%</td>
              </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">도서·벽지</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{region.summary.bookWall}</td>
              </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">50차시</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{region.summary.fiftyHours}</td>
              </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">특수학급</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{region.summary.specialClass}</td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  )
}

