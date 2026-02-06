'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, Button, Select, Space, Badge, Collapse, Image, Modal, Tooltip, Divider, Input, Table, Tabs, DatePicker } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { Dayjs } from 'dayjs'
import { Calendar, DollarSign, MapPin, Info, Eye, ChevronDown, ChevronRight, Search, User, Download, Filter } from 'lucide-react'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import type { InstructorPaymentSummary, InstructorYearlyPayment, InstructorMonthlyPayment, InstructorDailyPayment } from '@/entities/settlement/instructor-payment-types'
import { calculateAllInstructorPayments } from '@/entities/settlement/instructor-payment-calculator'
import { dataStore } from '@/lib/dataStore'

dayjs.locale('ko')

const { Panel } = Collapse

/**
 * Admin Instructor-Centric Payment Page
 * 
 * 관리자가 모든 강사들의 정산 내역을 확인할 수 있는 페이지
 * Organization: Instructor → Month → Day
 */
export default function AdminInstructorPaymentsPage() {
  const [loading, setLoading] = useState(false)
  const [paymentSummaries, setPaymentSummaries] = useState<InstructorPaymentSummary[]>([])
  const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [mapModalOpen, setMapModalOpen] = useState(false)
  const [selectedMapUrl, setSelectedMapUrl] = useState<string | undefined>(undefined)
  const [selectedRouteDescription, setSelectedRouteDescription] = useState<string>('')
  const [searchText, setSearchText] = useState('')
  const [activeTab, setActiveTab] = useState<'summary' | 'detail'>('summary')
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set())
  const [expandedMonths, setExpandedMonths] = useState<Map<string, Set<string>>>(new Map()) // year -> Set<month>

  useEffect(() => {
    loadPaymentSummaries()
    
    // Listen for data updates
    const handleDataUpdate = () => {
      loadPaymentSummaries()
    }
    window.addEventListener('educationUpdated', handleDataUpdate)
    window.addEventListener('settlementUpdated', handleDataUpdate)
    
    return () => {
      window.removeEventListener('educationUpdated', handleDataUpdate)
      window.removeEventListener('settlementUpdated', handleDataUpdate)
    }
  }, [])

  const loadPaymentSummaries = () => {
    setLoading(true)
    try {
      const educations = dataStore.getEducations()
      const assignments = dataStore.getInstructorAssignments()
      
      const summaries = calculateAllInstructorPayments(educations, assignments)
      setPaymentSummaries(summaries)
      
      // Auto-select first instructor if available
      if (summaries.length > 0 && !selectedInstructorId) {
        setSelectedInstructorId(summaries[0].instructorId)
      }
    } catch (error) {
      console.error('Failed to load payment summaries:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedSummary = useMemo(() => {
    if (!selectedInstructorId) return null
    return paymentSummaries.find(s => s.instructorId === selectedInstructorId) || null
  }, [paymentSummaries, selectedInstructorId])

  const filteredSummaries = useMemo(() => {
    let filtered = paymentSummaries
    
    // Text search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(s => 
        s.instructorName.toLowerCase().includes(searchLower) ||
        s.instructorId.toLowerCase().includes(searchLower) ||
        s.homeRegion.cityCounty.toLowerCase().includes(searchLower)
      )
    }
    
    // Date range filter
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf('day')
      const endDate = dateRange[1].endOf('day')
      
      filtered = filtered.map(summary => {
        // Filter yearly payments by date range
        const filteredYearlyPayments = summary.yearlyPayments.map(yearly => {
          const filteredMonthlyPayments = yearly.monthlyPayments.map(monthly => {
            const filteredDailyPayments = monthly.dailyPayments.filter(daily => {
              const dailyDate = dayjs(daily.date)
              return dailyDate.isAfter(startDate.subtract(1, 'day')) && dailyDate.isBefore(endDate.add(1, 'day'))
            })
            
            if (filteredDailyPayments.length === 0) return null
            
            // Recalculate monthly stats with filtered daily payments
            const totalDays = filteredDailyPayments.length
            const totalSessions = filteredDailyPayments.reduce((sum, d) => 
              sum + d.trainings.reduce((s, t) => s + t.sessionCount, 0), 0)
            const totalTrainingPayment = filteredDailyPayments.reduce((sum, d) => 
              sum + d.trainingPayments.reduce((s, p) => s + p.totalAmount, 0), 0)
            const totalTravelAllowance = filteredDailyPayments.reduce((sum, d) => sum + d.travelAllowance.amount, 0)
            const totalPayment = totalTrainingPayment + totalTravelAllowance
            const eligibleDays = filteredDailyPayments.filter(d => 
              d.trainings.some(t => t.isCountingEligible)
            ).length
            const eligiblePayment = filteredDailyPayments.reduce((sum, d) => {
              const eligibleTrainingPayment = d.trainingPayments
                .filter(p => p.training.isCountingEligible)
                .reduce((s, p) => s + p.totalAmount, 0)
              const travelAllowance = d.trainings.some(t => t.isCountingEligible)
                ? d.travelAllowance.amount
                : 0
              return sum + eligibleTrainingPayment + travelAllowance
            }, 0)
            
            return {
              ...monthly,
              dailyPayments: filteredDailyPayments,
              totalDays,
              totalSessions,
              totalTrainingPayment,
              totalTravelAllowance,
              totalPayment,
              eligibleDays,
              eligiblePayment,
            }
          }).filter((m): m is InstructorMonthlyPayment => m !== null)
          
          if (filteredMonthlyPayments.length === 0) return null
          
          // Recalculate yearly stats
          const totalMonths = filteredMonthlyPayments.length
          const totalDays = filteredMonthlyPayments.reduce((sum, m) => sum + m.totalDays, 0)
          const totalSessions = filteredMonthlyPayments.reduce((sum, m) => sum + m.totalSessions, 0)
          const totalTrainingPayment = filteredMonthlyPayments.reduce((sum, m) => sum + m.totalTrainingPayment, 0)
          const totalTravelAllowance = filteredMonthlyPayments.reduce((sum, m) => sum + m.totalTravelAllowance, 0)
          const totalPayment = filteredMonthlyPayments.reduce((sum, m) => sum + m.totalPayment, 0)
          const eligibleDays = filteredMonthlyPayments.reduce((sum, m) => sum + m.eligibleDays, 0)
          const eligiblePayment = filteredMonthlyPayments.reduce((sum, m) => sum + m.eligiblePayment, 0)
          
          return {
            ...yearly,
            monthlyPayments: filteredMonthlyPayments,
            totalMonths,
            totalDays,
            totalSessions,
            totalTrainingPayment,
            totalTravelAllowance,
            totalPayment,
            eligibleDays,
            eligiblePayment,
          }
        }).filter((y): y is InstructorYearlyPayment => y !== null)
        
        if (filteredYearlyPayments.length === 0) return null
        
        // Recalculate overall stats
        const totalYears = filteredYearlyPayments.length
        const totalMonths = filteredYearlyPayments.reduce((sum, y) => sum + y.totalMonths, 0)
        const totalDays = filteredYearlyPayments.reduce((sum, y) => sum + y.totalDays, 0)
        const totalSessions = filteredYearlyPayments.reduce((sum, y) => sum + y.totalSessions, 0)
        const totalPayment = filteredYearlyPayments.reduce((sum, y) => sum + y.totalPayment, 0)
        const eligiblePayment = filteredYearlyPayments.reduce((sum, y) => sum + y.eligiblePayment, 0)
        
        return {
          ...summary,
          yearlyPayments: filteredYearlyPayments,
          totalYears,
          totalMonths,
          totalDays,
          totalSessions,
          totalPayment,
          eligiblePayment,
        }
      }).filter((s): s is InstructorPaymentSummary => s !== null)
    }
    
    return filtered
  }, [paymentSummaries, searchText, dateRange])

  const handleYearToggle = (year: string) => {
    const newExpanded = new Set(expandedYears)
    if (newExpanded.has(year)) {
      newExpanded.delete(year)
    } else {
      newExpanded.add(year)
    }
    setExpandedYears(newExpanded)
  }

  const handleMonthToggle = (year: string, month: string) => {
    const newExpanded = new Map(expandedMonths)
    const yearMonths = newExpanded.get(year) || new Set<string>()
    const newYearMonths = new Set(yearMonths)
    
    if (newYearMonths.has(month)) {
      newYearMonths.delete(month)
    } else {
      newYearMonths.add(month)
    }
    
    newExpanded.set(year, newYearMonths)
    setExpandedMonths(newExpanded)
    setSelectedMonth(month)
  }

  const handleMapClick = (mapUrl: string | undefined, routeDescription: string) => {
    setSelectedMapUrl(mapUrl)
    setSelectedRouteDescription(routeDescription)
    setMapModalOpen(true)
  }

  const handleInstructorSelect = (instructorId: string) => {
    setSelectedInstructorId(instructorId)
    setActiveTab('detail')
    // Reset expanded years and months
    setExpandedYears(new Set())
    setExpandedMonths(new Map())
  }

  // Summary table columns
  const summaryColumns: ColumnsType<InstructorPaymentSummary> = [
    {
      title: '강사명',
      dataIndex: 'instructorName',
      key: 'instructorName',
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => handleInstructorSelect(record.instructorId)}
          className="p-0"
        >
          {text}
        </Button>
      ),
    },
    {
      title: '집 주소',
      dataIndex: 'homeRegion',
      key: 'homeRegion',
      render: (region) => `${region.cityCounty} ${region.address || ''}`,
    },
    {
      title: '정산 월수',
      dataIndex: 'totalMonths',
      key: 'totalMonths',
      align: 'right',
    },
    {
      title: '교육 일수',
      dataIndex: 'totalDays',
      key: 'totalDays',
      align: 'right',
    },
    {
      title: '총 차시',
      dataIndex: 'totalSessions',
      key: 'totalSessions',
      align: 'right',
    },
    {
      title: '정산 금액',
      dataIndex: 'eligiblePayment',
      key: 'eligiblePayment',
      align: 'right',
      render: (amount) => <span className="font-semibold text-orange-600">{amount.toLocaleString()}원</span>,
    },
  ]

  // Calculate totals
  const totals = useMemo(() => {
    return paymentSummaries.reduce((acc, summary) => ({
      totalInstructors: acc.totalInstructors + 1,
      totalMonths: acc.totalMonths + summary.totalMonths,
      totalDays: acc.totalDays + summary.totalDays,
      totalSessions: acc.totalSessions + summary.totalSessions,
      totalPayment: acc.totalPayment + summary.eligiblePayment,
    }), {
      totalInstructors: 0,
      totalMonths: 0,
      totalDays: 0,
      totalSessions: 0,
      totalPayment: 0,
    })
  }, [paymentSummaries])

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">강사별 정산 내역 (관리자)</h1>
            <p className="text-gray-500 mt-1">
              모든 강사들의 정산 내역을 확인할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Overall Summary */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totals.totalInstructors}
              </div>
              <div className="text-sm text-gray-500 mt-1">강사 수</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {totals.totalMonths}
              </div>
              <div className="text-sm text-gray-500 mt-1">총 정산 월수</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {totals.totalDays}
              </div>
              <div className="text-sm text-gray-500 mt-1">총 교육 일수</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {totals.totalSessions}
              </div>
              <div className="text-sm text-gray-500 mt-1">총 차시</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {totals.totalPayment.toLocaleString()}원
              </div>
              <div className="text-sm text-gray-500 mt-1">총 정산 금액</div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as 'summary' | 'detail')}
            items={[
              {
                key: 'summary',
                label: '전체 요약',
                children: (
                  <div className="space-y-4">
                    {/* Search and Filters */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Input
                        placeholder="강사명, 강사 ID, 지역으로 검색"
                        prefix={<Search className="w-4 h-4 text-gray-400" />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="max-w-md"
                      />
                      <DatePicker.RangePicker
                        placeholder={['시작일', '종료일']}
                        value={dateRange}
                        onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
                        format="YYYY-MM-DD"
                        className="max-w-md"
                        allowClear
                      />
                      {dateRange && (
                        <Button
                          size="small"
                          onClick={() => setDateRange(null)}
                          icon={<Filter className="w-4 h-4" />}
                        >
                          날짜 필터 초기화
                        </Button>
                      )}
                    </div>

                    {/* Summary Table */}
                    <Table
                      columns={summaryColumns}
                      dataSource={filteredSummaries}
                      rowKey="instructorId"
                      loading={loading}
                      pagination={{
                        pageSize: 20,
                        showSizeChanger: true,
                        showTotal: (total) => `총 ${total}명`,
                      }}
                    />
                  </div>
                ),
              },
              {
                key: 'detail',
                label: '상세 내역',
                children: selectedSummary ? (
                  <InstructorDetailView
                    summary={selectedSummary}
                    expandedMonths={expandedMonths}
                    selectedMonth={selectedMonth}
                    onMonthToggle={handleMonthToggle}
                    onMapClick={handleMapClick}
                    onInstructorChange={(instructorId) => {
                      setSelectedInstructorId(instructorId)
                    }}
                    allSummaries={paymentSummaries}
                    expandedYears={expandedYears}
                    onYearToggle={handleYearToggle}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    강사를 선택해주세요.
                  </div>
                ),
              },
            ]}
          />
        </Card>

        {/* Map Modal */}
        <Modal
          title="경로 지도"
          open={mapModalOpen}
          onCancel={() => setMapModalOpen(false)}
          footer={[
            <Button key="close" onClick={() => setMapModalOpen(false)}>
              닫기
            </Button>,
          ]}
          width={900}
        >
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <strong>경로:</strong> {selectedRouteDescription}
            </div>
            {selectedMapUrl ? (
              <Image
                src={selectedMapUrl}
                alt="경로 지도"
                className="w-full"
                fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjYiPuaXoOaXoOaXoOaXoDwvdGV4dD48L3N2Zz4="
              />
            ) : (
              <div className="w-full h-96 bg-gray-100 flex items-center justify-center text-gray-500">
                지도 이미지를 불러올 수 없습니다.
              </div>
            )}
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  )
}

/**
 * Instructor Detail View Component
 */
function InstructorDetailView({
  summary,
  expandedMonths,
  selectedMonth,
  onMonthToggle,
  onMapClick,
  onInstructorChange,
  allSummaries,
  expandedYears,
  onYearToggle,
}: {
  summary: InstructorPaymentSummary
  expandedMonths: Map<string, Set<string>>
  selectedMonth: string | null
  onMonthToggle: (year: string, month: string) => void
  onMapClick: (mapUrl: string | undefined, routeDescription: string) => void
  onInstructorChange: (instructorId: string) => void
  allSummaries: InstructorPaymentSummary[]
  expandedYears: Set<string>
  onYearToggle: (year: string) => void
}) {
  return (
    <div className="space-y-4">
      {/* Instructor Selector */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium">강사 선택:</span>
        <Select
          value={summary.instructorId}
          onChange={onInstructorChange}
          className="min-w-[200px]"
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={allSummaries.map(s => ({
            value: s.instructorId,
            label: `${s.instructorName} (${s.homeRegion.cityCounty})`,
          }))}
        />
      </div>

      {/* Instructor Info */}
      <Card size="small" className="bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-lg">{summary.instructorName}</div>
            <div className="text-sm text-gray-500 mt-1">
              집 주소: {summary.homeRegion.cityCounty} {summary.homeRegion.address}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">총 정산액</div>
            <div className="text-xl font-bold text-orange-600">
              {summary.eligiblePayment.toLocaleString()}원
            </div>
          </div>
        </div>
      </Card>

      {/* Yearly Breakdown */}
      <div className="space-y-4">
        {summary.yearlyPayments.map(yearlyPayment => (
          <YearlyPaymentCard
            key={yearlyPayment.year}
            yearlyPayment={yearlyPayment}
            isExpanded={expandedYears.has(yearlyPayment.year)}
            expandedMonths={expandedMonths.get(yearlyPayment.year) || new Set()}
            onYearToggle={() => onYearToggle(yearlyPayment.year)}
            onMonthToggle={(month) => onMonthToggle(yearlyPayment.year, month)}
            onMapClick={onMapClick}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Yearly Payment Card Component
 */
function YearlyPaymentCard({
  yearlyPayment,
  isExpanded,
  expandedMonths,
  onYearToggle,
  onMonthToggle,
  onMapClick,
}: {
  yearlyPayment: InstructorYearlyPayment
  isExpanded: boolean
  expandedMonths: Set<string>
  onYearToggle: () => void
  onMonthToggle: (month: string) => void
  onMapClick: (mapUrl: string | undefined, routeDescription: string) => void
}) {
  return (
    <Card
      className="border-2 border-blue-200"
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-lg">{yearlyPayment.year}년</span>
            <Badge count={yearlyPayment.totalMonths} showZero color="blue" />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">연간 정산액</div>
              <div className="text-xl font-bold text-orange-600">
                {yearlyPayment.eligiblePayment.toLocaleString()}원
              </div>
            </div>
            <Button
              type="text"
              icon={isExpanded ? <ChevronDown /> : <ChevronRight />}
              onClick={onYearToggle}
            />
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-500">정산 월수</div>
          <div className="text-lg font-semibold">{yearlyPayment.totalMonths}개월</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">교육 일수</div>
          <div className="text-lg font-semibold">{yearlyPayment.totalDays}일</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">총 차시</div>
          <div className="text-lg font-semibold">{yearlyPayment.totalSessions}차시</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">총 정산액</div>
          <div className="text-lg font-semibold">
            {yearlyPayment.totalPayment.toLocaleString()}원
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 mt-4">
          <Divider />
          {yearlyPayment.monthlyPayments.map(monthlyPayment => (
            <MonthlyPaymentCard
              key={monthlyPayment.month}
              monthlyPayment={monthlyPayment}
              isExpanded={expandedMonths.has(monthlyPayment.month)}
              onToggle={() => onMonthToggle(monthlyPayment.month)}
              onMapClick={onMapClick}
            />
          ))}
        </div>
      )}
    </Card>
  )
}

/**
 * Monthly Payment Card Component
 */
function MonthlyPaymentCard({
  monthlyPayment,
  isExpanded,
  onToggle,
  onMapClick,
}: {
  monthlyPayment: InstructorMonthlyPayment
  isExpanded: boolean
  onToggle: () => void
  onMapClick: (mapUrl: string | undefined, routeDescription: string) => void
}) {
  return (
    <Card
      className="border-2"
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="font-semibold">{monthlyPayment.month}</span>
            <Badge count={monthlyPayment.totalDays} showZero />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">총 정산액</div>
              <div className="text-lg font-bold text-orange-600">
                {monthlyPayment.eligiblePayment.toLocaleString()}원
              </div>
            </div>
            <Button
              type="text"
              icon={isExpanded ? <ChevronDown /> : <ChevronRight />}
              onClick={onToggle}
            />
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-500">교육 일수</div>
          <div className="text-lg font-semibold">{monthlyPayment.totalDays}일</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">총 차시</div>
          <div className="text-lg font-semibold">{monthlyPayment.totalSessions}차시</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">강사비</div>
          <div className="text-lg font-semibold">
            {monthlyPayment.totalTrainingPayment.toLocaleString()}원
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">출장수당</div>
          <div className="text-lg font-semibold">
            {monthlyPayment.totalTravelAllowance.toLocaleString()}원
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 mt-4">
          <Divider />
          {monthlyPayment.dailyPayments.map(dailyPayment => (
            <DailyPaymentCard
              key={dailyPayment.date}
              dailyPayment={dailyPayment}
              onMapClick={onMapClick}
            />
          ))}
        </div>
      )}
    </Card>
  )
}

/**
 * Daily Payment Card Component
 */
function DailyPaymentCard({
  dailyPayment,
  onMapClick,
}: {
  dailyPayment: InstructorDailyPayment
  onMapClick: (mapUrl: string | undefined, routeDescription: string) => void
}) {
  return (
    <Card
      size="small"
      className="border"
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{dayjs(dailyPayment.date).format('YYYY년 MM월 DD일 (ddd)')}</span>
            <Badge count={dailyPayment.trainings.length} showZero />
          </div>
          <div className="text-lg font-bold text-orange-600">
            {dailyPayment.totalPayment.toLocaleString()}원
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Trainings */}
        <div>
          <div className="text-sm font-semibold mb-2">교육 내역</div>
          <div className="space-y-2">
            {dailyPayment.trainings.map((training, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      color={training.role === 'main' ? 'blue' : 'green'}
                      text={training.role === 'main' ? '주강사' : '보조강사'}
                    />
                    <span className="font-medium">{training.educationName}</span>
                    <span className="text-sm text-gray-500">
                      ({training.institution.cityCounty} {training.institution.institutionName})
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {training.sessionCount}차시
                    {training.startTime && training.endTime && (
                      <span className="ml-2">
                        {training.startTime} ~ {training.endTime}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {dailyPayment.trainingPayments
                    .filter(p => p.training.educationId === training.educationId && p.role === training.role)
                    .map(p => (
                      <div key={p.role} className="text-sm">
                        <div className="font-semibold">{p.totalAmount.toLocaleString()}원</div>
                        <div className="text-xs text-gray-500">{p.paymentFormula}</div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Travel Allowance */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-semibold">출장수당</span>
              <Tooltip title={dailyPayment.travelAllowance.explanation}>
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="font-semibold">
                  {dailyPayment.travelAllowance.amount.toLocaleString()}원
                </div>
                <div className="text-xs text-gray-500">
                  {dailyPayment.travelAllowance.totalDistanceKm.toFixed(1)}km
                </div>
              </div>
              {dailyPayment.travelAllowance.mapImageUrl && (
                <Button
                  type="link"
                  size="small"
                  icon={<Eye />}
                  onClick={() =>
                    onMapClick(
                      dailyPayment.travelAllowance.mapImageUrl,
                      dailyPayment.travelAllowance.explanation
                    )
                  }
                >
                  지도 보기
                </Button>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {dailyPayment.travelAllowance.explanation}
          </div>
        </div>

        {/* Payment Explanation */}
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-sm font-semibold text-blue-900 mb-1">정산 내역</div>
          <div className="text-sm text-blue-800">{dailyPayment.paymentExplanation}</div>
        </div>
      </div>
    </Card>
  )
}
