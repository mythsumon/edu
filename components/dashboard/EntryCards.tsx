'use client'

import { MapPin, TrendingUp, BookOpen } from 'lucide-react'
import { type SpecialCategory } from '@/types/region'

interface EntryCardsProps {
  onRegionSelect: () => void
  onSpecialItemSelect: () => void
  onMapSelect: () => void
}

export function EntryCards({
  onRegionSelect,
  onSpecialItemSelect,
  onMapSelect,
}: EntryCardsProps) {
  // Calculate aggregate data for cards
  const regionData = [
    { regionNumber: 1, progress: 60, educationProgress: 60 },
    { regionNumber: 2, progress: 75, educationProgress: 70 },
    { regionNumber: 3, progress: 45, educationProgress: 50 },
    { regionNumber: 4, progress: 80, educationProgress: 75 },
    { regionNumber: 5, progress: 55, educationProgress: 55 },
    { regionNumber: 6, progress: 70, educationProgress: 65 },
  ]

  const avgProgress = Math.round(
    regionData.reduce((sum, r) => sum + r.progress, 0) / regionData.length
  )
  const totalRegions = regionData.length

  const specialItemData = [
    { category: '도서·벽지' as SpecialCategory, progress: 50, completed: 10, target: 20 },
    { category: '50차시' as SpecialCategory, progress: 75, completed: 15, target: 20 },
    { category: '특수학급' as SpecialCategory, progress: 60, completed: 12, target: 20 },
  ]

  const avgSpecialProgress = Math.round(
    specialItemData.reduce((sum, item) => sum + item.progress, 0) / specialItemData.length
  )
  const totalSpecialItems = specialItemData.length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {/* Card 1: Region-based Education Progress */}
      <button
        onClick={onRegionSelect}
        className="group relative bg-white rounded-[20px] p-8 shadow-lg border-2 border-slate-200 hover:border-blue-500 hover:bg-gradient-to-br hover:from-blue-500 hover:to-blue-600 hover:shadow-xl transition-all duration-300 text-left cursor-pointer"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md group-hover:bg-white/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-white transition-colors">권역별 교육 진행</h3>
          </div>
          
          <p className="text-sm text-slate-600 mb-6 group-hover:text-white/90 transition-colors">
            6개 권역의 교육 진행 현황을 조회합니다
          </p>
          
          <div className="flex items-end gap-4">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-1 group-hover:text-white transition-colors">{avgProgress}%</div>
              <div className="text-xs text-slate-500 group-hover:text-white/80 transition-colors">평균 진행률</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-2xl font-semibold text-slate-900 group-hover:text-white transition-colors">{totalRegions}</div>
              <div className="text-xs text-slate-500 group-hover:text-white/80 transition-colors">권역</div>
            </div>
          </div>
          
          {/* Mini progress indicator */}
          <div className="mt-6 pt-6 border-t border-slate-100 group-hover:border-white/20 transition-colors">
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden group-hover:bg-white/20 transition-colors">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 group-hover:from-white group-hover:to-white/80"
                style={{ width: `${avgProgress}%` }}
              />
            </div>
          </div>
        </div>
      </button>

      {/* Card 2: Special Item Progress */}
      <button
        onClick={onSpecialItemSelect}
        className="group relative bg-white rounded-[20px] p-8 shadow-lg border-2 border-slate-200 hover:border-purple-500 hover:bg-gradient-to-br hover:from-purple-500 hover:to-purple-600 hover:shadow-xl transition-all duration-300 text-left cursor-pointer"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md group-hover:bg-white/20">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-white transition-colors">특수 항목별 조회</h3>
          </div>
          
          <p className="text-sm text-slate-600 mb-6 group-hover:text-white/90 transition-colors">
            도서·벽지, 50차시, 특수학급 진행률을 확인합니다
          </p>
          
          <div className="flex items-end gap-4">
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-1 group-hover:text-white transition-colors">{avgSpecialProgress}%</div>
              <div className="text-xs text-slate-500 group-hover:text-white/80 transition-colors">평균 진행률</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-2xl font-semibold text-slate-900 group-hover:text-white transition-colors">{totalSpecialItems}</div>
              <div className="text-xs text-slate-500 group-hover:text-white/80 transition-colors">항목</div>
            </div>
          </div>
          
          {/* Mini progress indicator */}
          <div className="mt-6 pt-6 border-t border-slate-100 group-hover:border-white/20 transition-colors">
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden group-hover:bg-white/20 transition-colors">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500 group-hover:from-white group-hover:to-white/80"
                style={{ width: `${avgSpecialProgress}%` }}
              />
            </div>
          </div>
        </div>
      </button>

      {/* Card 3: Visual Map Overview */}
      <button
        onClick={onMapSelect}
        className="group relative bg-white rounded-[20px] p-8 shadow-lg border-2 border-slate-200 hover:border-green-500 hover:bg-gradient-to-br hover:from-green-500 hover:to-green-600 hover:shadow-xl transition-all duration-300 text-left cursor-pointer"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md group-hover:bg-white/20">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-white transition-colors">권역 지도</h3>
          </div>
          
          <p className="text-sm text-slate-600 mb-6 group-hover:text-white/90 transition-colors">
            지도에서 권역을 선택하여 상세 정보를 확인합니다
          </p>
          
          <div className="flex items-end gap-4">
            <div>
              <div className="text-4xl font-bold text-green-600 mb-1 group-hover:text-white transition-colors">{totalRegions}</div>
              <div className="text-xs text-slate-500 group-hover:text-white/80 transition-colors">권역</div>
            </div>
            <div className="ml-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-50 rounded-xl border-2 border-green-200 flex items-center justify-center group-hover:bg-white/20 group-hover:border-white/30 transition-colors">
                <MapPin className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
          
          {/* Mini visual indicator */}
          <div className="mt-6 pt-6 border-t border-slate-100 group-hover:border-white/20 transition-colors">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div
                  key={num}
                  className="flex-1 h-2 bg-gradient-to-br from-green-400 to-green-500 rounded-full opacity-60 group-hover:bg-white group-hover:opacity-80 transition-colors"
                />
              ))}
            </div>
          </div>
        </div>
      </button>
    </div>
  )
}

