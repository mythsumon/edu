'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from 'antd'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { KPIStrip } from '@/components/dashboard/KPIStrip'
import { ProgramList } from '@/components/dashboard/ProgramList'
import { ErrorToast } from '@/components/dashboard/ErrorToast'
import { CollapsibleSection } from '@/components/dashboard/CollapsibleSection'
import { SearchPanel } from '@/components/dashboard/SearchPanel'
import { ResultPanel } from '@/components/dashboard/ResultPanel'
import { RegionMap } from '@/components/dashboard/RegionMap'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { type SpecialCategory } from '@/types/region'

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const [selectedRegion, setSelectedRegion] = useState<number | undefined>()
  const [selectedSpecialCategory, setSelectedSpecialCategory] = useState<SpecialCategory | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [showRegionSelection, setShowRegionSelection] = useState(true)

  const handleBackClick = () => {
    console.log('handleBackClick called, setting showRegionSelection to true')
    setShowRegionSelection(true)
  }

  // Initialize region from URL parameter
  useEffect(() => {
    if (searchParams) {
      const regionParam = searchParams.get('region')
      if (regionParam) {
        const regionId = parseInt(regionParam, 10)
        if (!isNaN(regionId) && regionId >= 1 && regionId <= 6) {
          setSelectedRegion(regionId)
          setSelectedSpecialCategory(undefined)
        }
      }
    }
  }, [searchParams])

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="p-6">
        {error && (
          <ErrorToast
            message={error}
            onClose={() => setError(null)}
          />
        )}
        
        <PageHeader />

        <CollapsibleSection 
          title="주요 지표"
          defaultExpanded={false}
        >
          <div className="space-y-6">
            {/* KPI Section */}
            <div>
              <KPIStrip />
            </div>

            {/* Divider with label */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-[#3a2e2a]">권역별 교육 진행 현황</span>
              </div>
            </div>

            {/* Region Selection Mode - Large Cards + Map */}
            {showRegionSelection ? (
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
                  {/* Left Side - Region Cards (Big Cards) + Special Items */}
                  <div className="space-y-6">
                    {/* Region Cards */}
                    <div>
                      <h3 className="text-lg font-semibold text-[#3a2e2a] mb-4">권역별 교육 진행 현황</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((regionNumber) => {
                          const regionData = [
                            { regionNumber: 1, progress: 60, educationProgress: 60, items: { 도서벽지: 10, '50차시': 50, 특수학급: 1000 } },
                            { regionNumber: 2, progress: 75, educationProgress: 70, items: { 도서벽지: 15, '50차시': 60, 특수학급: 1200 } },
                            { regionNumber: 3, progress: 45, educationProgress: 50, items: { 도서벽지: 8, '50차시': 40, 특수학급: 800 } },
                            { regionNumber: 4, progress: 80, educationProgress: 75, items: { 도서벽지: 20, '50차시': 70, 특수학급: 1500 } },
                            { regionNumber: 5, progress: 55, educationProgress: 55, items: { 도서벽지: 12, '50차시': 45, 특수학급: 900 } },
                            { regionNumber: 6, progress: 70, educationProgress: 65, items: { 도서벽지: 18, '50차시': 55, 특수학급: 1100 } },
                          ]
                          const region = regionData.find(r => r.regionNumber === regionNumber)
                          if (!region) return null
                          
                          return (
                            <div
                              key={regionNumber}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                try {
                                  setSelectedRegion(regionNumber)
                                  setSelectedSpecialCategory(undefined)
                                  setShowRegionSelection(false)
                                } catch (error) {
                                  console.error('Error selecting region:', error)
                                }
                              }}
                              className={`bg-white rounded-2xl shadow-md border-2 p-6 cursor-pointer transition-all hover:shadow-lg ${
                                selectedRegion === regionNumber ? 'border-primary bg-blue-50' : 'border-slate-100 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <span className={`text-lg font-bold ${
                                  regionNumber === 1 ? 'text-blue-600' :
                                  regionNumber === 2 ? 'text-orange-600' :
                                  regionNumber === 3 ? 'text-yellow-600' :
                                  regionNumber === 4 ? 'text-green-600' :
                                  regionNumber === 5 ? 'text-purple-600' :
                                  'text-teal-600'
                                }`}>
                                  {regionNumber}권역
                                </span>
                              </div>
                              <div className="text-sm text-gray-500 mb-4">교육: {region.educationProgress}%</div>
                              <div className="flex justify-center mb-4">
                                <div className="text-2xl font-bold" style={{
                                  color: regionNumber === 1 ? '#2563EB' :
                                         regionNumber === 2 ? '#F97316' :
                                         regionNumber === 3 ? '#EAB308' :
                                         regionNumber === 4 ? '#22C55E' :
                                         regionNumber === 5 ? '#A855F7' :
                                         '#14B8A6'
                                }}>
                                  {region.progress}%
                                </div>
                              </div>
                              <div className="space-y-1 text-sm text-gray-600">
                                <div>도서·벽지: {region.items.도서벽지}</div>
                                <div>50차시: {region.items['50차시']}</div>
                                <div>특수학급: {region.items.특수학급}</div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    
                    {/* Special Items Cards */}
                    <div>
                      <h3 className="text-lg font-semibold text-[#3a2e2a] mb-4">특수 항목별 세부조회</h3>
                      <div className="grid grid-cols-1 gap-4">
                        {[
                          { label: '도서·벽지 진행률', category: '도서·벽지' as SpecialCategory, progress: 50, completed: 10, target: 20, color: '#F97316' },
                          { label: '50차시 진행률', category: '50차시' as SpecialCategory, progress: 75, completed: 15, target: 20, color: '#22C55E' },
                          { label: '특수학급 진행률', category: '특수학급' as SpecialCategory, progress: 60, completed: 12, target: 20, color: '#EC4899' },
                        ].map((item) => (
                          <div
                            key={item.label}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              try {
                                setSelectedSpecialCategory(item.category)
                                setSelectedRegion(undefined)
                                setShowRegionSelection(false)
                              } catch (error) {
                                console.error('Error selecting special category:', error)
                              }
                            }}
                            className={`bg-white rounded-2xl shadow-md border-2 p-6 cursor-pointer transition-all hover:shadow-lg ${
                              selectedSpecialCategory === item.category ? 'border-primary bg-blue-50' : 'border-slate-100 hover:border-gray-300'
                            }`}
                          >
                            <div className="mb-3">
                              <div className="text-sm text-gray-500 mb-1">{item.label}</div>
                              <div className="text-2xl font-semibold text-gray-900 mb-1">{item.progress}%</div>
                              <div className="text-xs text-gray-600">목표 {item.target}개 중 {item.completed}개 완료</div>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${item.progress}%`,
                                  backgroundColor: item.color,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Right Side - Region Map */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#3a2e2a] mb-4">권역 지도</h3>
                    <RegionMap 
                      selectedRegion={selectedRegion} 
                      onRegionSelect={(id) => {
                        setSelectedRegion(id)
                        setSelectedSpecialCategory(undefined)
                        setShowRegionSelection(false)
                      }} 
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Search Panel + Result Panel Layout */
              <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.6fr] gap-6">
                {/* Search Panel - Left Side (Desktop) / Top (Mobile) */}
                <div className="lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
                  {/* Back Button - Separate */}
                  <div className="mb-4">
                    <Button
                      icon={<ArrowLeft className="w-4 h-4" />}
                      onClick={handleBackClick}
                      className="w-full h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
                    >
                      뒤로
                    </Button>
                  </div>
                  <SearchPanel
                    selectedRegion={selectedRegion}
                    selectedSpecialCategory={selectedSpecialCategory}
                    onRegionSelect={(id) => {
                      try {
                        setSelectedRegion(id)
                        setSelectedSpecialCategory(undefined)
                        // Ensure result panel is visible
                        setShowRegionSelection(false)
                      } catch (error) {
                        console.error('Error selecting region:', error)
                      }
                    }}
                    onCategorySelect={(category) => {
                      try {
                        setSelectedSpecialCategory(category)
                        setSelectedRegion(undefined)
                      } catch (error) {
                        console.error('Error selecting category:', error)
                      }
                    }}
                    onReset={() => {
                      try {
                        setSelectedRegion(undefined)
                        setSelectedSpecialCategory(undefined)
                      } catch (error) {
                        console.error('Error resetting selection:', error)
                      }
                    }}
                  />
                </div>

                {/* Result Panel - Right Side (Desktop) / Bottom (Mobile) */}
                <div className="min-h-[600px]">
                  <ResultPanel
                    selectedRegion={selectedRegion}
                    selectedSpecialCategory={selectedSpecialCategory}
                    onRegionChange={(id) => {
                      try {
                        setSelectedRegion(id)
                        setSelectedSpecialCategory(undefined)
                      } catch (error) {
                        console.error('Error changing region:', error)
                      }
                    }}
                    onCategoryClose={() => {
                      try {
                        setSelectedSpecialCategory(undefined)
                      } catch (error) {
                        console.error('Error closing category:', error)
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* Program List - not collapsible */}
        <div className="mb-8 mt-8">
          <ProgramList selectedRegion={selectedRegion} />
        </div>
      </div>
    </ProtectedRoute>
  )
}

