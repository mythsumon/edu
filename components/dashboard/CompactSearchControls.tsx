'use client'

import { X } from 'lucide-react'
import { type SpecialCategory } from '@/types/region'

interface CompactSearchControlsProps {
  searchType: 'region' | 'special' | 'map'
  selectedRegion?: number
  selectedSpecialCategory?: SpecialCategory
  onRegionSelect: (region: number | undefined) => void
  onCategorySelect: (category: SpecialCategory | undefined) => void
  onReset: () => void
  onBack?: () => void
}

export function CompactSearchControls({
  searchType,
  selectedRegion,
  selectedSpecialCategory,
  onRegionSelect,
  onCategorySelect,
  onReset,
  onBack,
}: CompactSearchControlsProps) {
  const regionColors = {
    1: { bg: '#2563EB', light: '#DBEAFE', text: '#1E40AF' },
    2: { bg: '#F97316', light: '#FFEDD5', text: '#C2410C' },
    3: { bg: '#EAB308', light: '#FEF9C3', text: '#A16207' },
    4: { bg: '#22C55E', light: '#D1FAE5', text: '#15803D' },
    5: { bg: '#A855F7', light: '#E9D5FF', text: '#7C3AED' },
    6: { bg: '#14B8A6', light: '#CCFBF1', text: '#0D9488' },
  }

  const getSearchTypeLabel = () => {
    switch (searchType) {
      case 'region':
        return '권역별 교육 진행'
      case 'special':
        return '특수 항목별 조회'
      case 'map':
        return '권역 지도'
      default:
        return '검색'
    }
  }

  return (
    <div className="w-full md:w-[280px] lg:w-[300px] flex-shrink-0">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-5 sticky top-4">
        {/* Selected Search Type Badge */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm font-semibold text-blue-700">{getSearchTypeLabel()}</span>
          </div>
        </div>

        {/* Primary Filters */}
        <div className="space-y-4 mb-4">
          {searchType === 'region' || searchType === 'map' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                권역 선택
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4, 5, 6].map((regionNumber) => {
                  const color = regionColors[regionNumber as keyof typeof regionColors]
                  const isSelected = selectedRegion === regionNumber
                  
                  return (
                    <button
                      key={regionNumber}
                      onClick={() => onRegionSelect(isSelected ? undefined : regionNumber)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-2 text-blue-700'
                          : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                      style={isSelected ? { borderColor: color.bg } : {}}
                    >
                      {regionNumber}권역
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}

          {searchType === 'special' || searchType === 'map' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                특수 항목 선택
              </label>
              <div className="space-y-2">
                {[
                  { category: '도서·벽지' as SpecialCategory, color: '#F97316' },
                  { category: '50차시' as SpecialCategory, color: '#22C55E' },
                  { category: '특수학급' as SpecialCategory, color: '#3B82F6' },
                ].map((item) => {
                  const isSelected = selectedSpecialCategory === item.category
                  
                  return (
                    <button
                      key={item.category}
                      onClick={() => onCategorySelect(isSelected ? undefined : item.category)}
                      className={`w-full px-3 py-2 rounded-lg text-xs font-medium text-left transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-2 text-blue-700'
                          : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                      style={isSelected ? { borderColor: item.color } : {}}
                    >
                      {item.category}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>

        {/* Reset Action */}
        <div className="mt-5 pt-4 border-t border-slate-200">
          <button
            onClick={() => {
              onReset()
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            <X className="w-4 h-4" />
            <span>초기화</span>
          </button>
        </div>
      </div>
    </div>
  )
}

