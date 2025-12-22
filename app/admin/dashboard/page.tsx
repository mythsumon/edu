'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { RegionCard } from '@/components/dashboard/RegionCard'
import { RegionCardLarge } from '@/components/dashboard/RegionCardLarge'
import { RegionDetailPanel } from '@/components/dashboard/RegionDetailPanel'
import { RegionDetailPanelWrapper } from '@/components/dashboard/RegionDetailPanelWrapper'
import { SpecialItemCards } from '@/components/dashboard/SpecialItemCards'
import { SpecialItemDetailPanel } from '@/components/dashboard/SpecialItemDetailPanel'
import { SearchPanel } from '@/components/dashboard/SearchPanel'
import { ResultPanel } from '@/components/dashboard/ResultPanel'
import { RegionMap } from '@/components/dashboard/RegionMap'
import { KPIStrip } from '@/components/dashboard/KPIStrip'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { LoadingSkeleton } from '@/components/dashboard/LoadingSkeleton'
import { ErrorToast } from '@/components/dashboard/ErrorToast'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

// Mock data imports - using absolute path
import { 
  mockRegionData, 
  mockSpecialItems, 
  mockKpiData,
  mockChartData
} from '@/mock/dashboardData'

// Types - using the correct types from region.ts
import type { RegionData } from '@/types/region'

// Define types for special items and KPI data based on mock data structure
interface SpecialItem {
  id: string
  name: string
  totalCount: number
  completedCount: number
  inProgressCount: number
  notStartedCount: number
  progress: number
  target: string
}

interface KPI {
  id: string
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative'
  description: string
}

export default function DashboardPage() {
  const router = useRouter()
  
  // Redirect to home page immediately
  useEffect(() => {
    router.replace('/')
  }, [router])
  
  // Return null while redirecting
  return null
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedSpecialItem, setSelectedSpecialItem] = useState<string | null>(null)
  const [showSearchPanel, setShowSearchPanel] = useState(true)
  const [showResultPanel, setShowResultPanel] = useState(false)
  const [regionData, setRegionData] = useState<RegionData[]>([])
  const [specialItems, setSpecialItems] = useState<SpecialItem[]>([])
  const [kpiData, setKpiData] = useState<KPI[]>([])
  const [chartData, setChartData] = useState<any[]>([])

  // Refs
  const detailPanelRef = useRef<HTMLDivElement>(null)

  // Initialize data
  useEffect(() => {
    try {
      // Simulate API call
      setTimeout(() => {
        setRegionData(mockRegionData)
        setSpecialItems(mockSpecialItems)
        setKpiData(mockKpiData)
        setChartData(mockChartData)
        setIsLoading(false)
      }, 800)
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.')
      setIsLoading(false)
    }
  }, [])

  // Handle region selection
  const handleRegionSelect = (regionId: string) => {
    setSelectedRegion(regionId)
    setSelectedSpecialItem(null)
    setShowSearchPanel(false)
    setShowResultPanel(true)
    
    // Scroll to detail panel
    setTimeout(() => {
      detailPanelRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // Handle special item selection
  const handleSpecialItemSelect = (itemId: string) => {
    setSelectedSpecialItem(itemId)
    setSelectedRegion(null)
    setShowSearchPanel(false)
    setShowResultPanel(true)
    
    // Scroll to detail panel
    setTimeout(() => {
      detailPanelRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // Reset to initial state
  const handleReset = () => {
    setSelectedRegion(null)
    setSelectedSpecialItem(null)
    setShowSearchPanel(true)
    setShowResultPanel(false)
  }

  // Render loading state
  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="admin">
        <div className="p-6">
          <LoadingSkeleton />
        </div>
      </ProtectedRoute>
    )
  }

  // Render error state
  if (error) {
    return (
      <ProtectedRoute requiredRole="admin">
        <div className="p-6">
          <ErrorToast message={error} onRetry={() => window.location.reload()} />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="p-6">

        {/* Page Header */}
        <div className="mb-6">
        </div>

        {/* KPI Strip */}
        <KPIStrip kpiData={kpiData} defaultExpanded={false} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column - Search Panel & Region Cards */}
          <div className="lg:col-span-2 space-y-6">
            {showSearchPanel && (
              <div className="card card-hover">
                <SearchPanel onReset={handleReset} />
              </div>
            )}

            {showResultPanel && (
              <div className="card card-hover">
                <ResultPanel 
                  onBack={handleReset}
                  title={
                    selectedRegion 
                      ? regionData.find(r => r.id === selectedRegion)?.name || '' 
                      : selectedSpecialItem 
                        ? specialItems.find(s => s.id === selectedSpecialItem)?.name || ''
                        : ''
                  }
                />
              </div>
            )}

            {/* Region Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {regionData.map((region) => (
                <RegionCard 
                  key={region.id}
                  region={region}
                  isSelected={selectedRegion === region.id}
                  onSelect={() => handleRegionSelect(region.id)}
                />
              ))}
            </div>

            {/* Special Items */}
            <div className="card card-hover">
              <SpecialItemCards 
                items={specialItems}
                selectedItemId={selectedSpecialItem}
                onSelect={handleSpecialItemSelect}
              />
            </div>
          </div>

          {/* Right Column - Map & Detail Panel */}
          <div className="space-y-6">
            {/* Region Map */}
            <div className="card card-hover">
              <RegionMap 
                regions={regionData}
                selectedRegion={selectedRegion}
                onSelectRegion={handleRegionSelect}
              />
            </div>

            {/* Detail Panel Wrapper */}
            <RegionDetailPanelWrapper ref={detailPanelRef}>
              {selectedRegion && (
                <div className="card card-hover">
                  <RegionDetailPanel 
                    region={regionData.find(r => r.id === selectedRegion)!}
                    chartData={chartData}
                  />
                </div>
              )}
              
              {selectedSpecialItem && (
                <div className="card card-hover">
                  <SpecialItemDetailPanel 
                    item={specialItems.find(s => s.id === selectedSpecialItem)!}
                  />
                </div>
              )}
            </RegionDetailPanelWrapper>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}