'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, Button, Select, Space, Badge, Collapse, Image, Modal, Tooltip, Divider, DatePicker, Input } from 'antd'
import type { Dayjs } from 'dayjs'
import { Calendar, DollarSign, MapPin, Info, Eye, ChevronDown, ChevronRight, Search, Filter } from 'lucide-react'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import type { InstructorPaymentSummary, InstructorYearlyPayment, InstructorMonthlyPayment, InstructorDailyPayment } from '@/entities/settlement/instructor-payment-types'
import { calculateAllInstructorPayments } from '@/entities/settlement/instructor-payment-calculator'
import { dataStore } from '@/lib/dataStore'
import { useAuth } from '@/contexts/AuthContext'

dayjs.locale('ko')

const { Panel } = Collapse

/**
 * Instructor-Centric Payment Page
 * 
 * Core Principle: All calculations are based on the INSTRUCTOR, not the training.
 * The instructor must clearly understand: "Why am I paid this amount?"
 * 
 * Organization: Instructor → Month → Day
 */
export default function InstructorPaymentsPage() {
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [paymentSummary, setPaymentSummary] = useState<InstructorPaymentSummary | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set())
  const [expandedMonths, setExpandedMonths] = useState<Map<string, Set<string>>>(new Map()) // year -> Set<month>
  const [mapModalOpen, setMapModalOpen] = useState(false)
  const [selectedMapUrl, setSelectedMapUrl] = useState<string | undefined>(undefined)
  const [selectedRouteDescription, setSelectedRouteDescription] = useState<string>('')
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)

  // Get current instructor ID
  const currentInstructorId = userProfile?.userId?.toString() || 'instructor-1'

  useEffect(() => {
    loadPaymentSummary()
    
    // Listen for data updates
    const handleDataUpdate = () => {
      loadPaymentSummary()
    }
    window.addEventListener('educationUpdated', handleDataUpdate)
    window.addEventListener('settlementUpdated', handleDataUpdate)
    
    return () => {
      window.removeEventListener('educationUpdated', handleDataUpdate)
      window.removeEventListener('settlementUpdated', handleDataUpdate)
    }
  }, [currentInstructorId])

  const loadPaymentSummary = () => {
    setLoading(true)
    try {
      const educations = dataStore.getEducations()
      const assignments = dataStore.getInstructorAssignments()
      
      const allSummaries = calculateAllInstructorPayments(educations, assignments)
      const summary = allSummaries.find(s => s.instructorId === currentInstructorId)
      
      setPaymentSummary(summary || null)
      
      // Auto-expand current year and month
      if (summary && summary.yearlyPayments.length > 0) {
        const currentYear = dayjs().format('YYYY')
        const currentMonth = dayjs().format('YYYY-MM')
        const currentYearData = summary.yearlyPayments.find(y => y.year === currentYear)
        
        if (currentYearData) {
          setExpandedYears(new Set([currentYear]))
          const hasCurrentMonth = currentYearData.monthlyPayments.some(m => m.month === currentMonth)
          if (hasCurrentMonth) {
            const newExpandedMonths = new Map()
            newExpandedMonths.set(currentYear, new Set([currentMonth]))
            setExpandedMonths(newExpandedMonths)
            setSelectedMonth(currentMonth)
          } else {
            // Expand most recent month
            const mostRecentMonth = currentYearData.monthlyPayments[currentYearData.monthlyPayments.length - 1]?.month
            if (mostRecentMonth) {
              const newExpandedMonths = new Map()
              newExpandedMonths.set(currentYear, new Set([mostRecentMonth]))
              setExpandedMonths(newExpandedMonths)
              setSelectedMonth(mostRecentMonth)
            }
          }
        } else {
          // Expand most recent year
          const mostRecentYear = summary.yearlyPayments[summary.yearlyPayments.length - 1]
          if (mostRecentYear) {
            setExpandedYears(new Set([mostRecentYear.year]))
            const mostRecentMonth = mostRecentYear.monthlyPayments[mostRecentYear.monthlyPayments.length - 1]?.month
            if (mostRecentMonth) {
              const newExpandedMonths = new Map()
              newExpandedMonths.set(mostRecentYear.year, new Set([mostRecentMonth]))
              setExpandedMonths(newExpandedMonths)
              setSelectedMonth(mostRecentMonth)
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load payment summary:', error)
    } finally {
      setLoading(false)
    }
  }

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

  // Filter payment summary by date range
  const filteredSummary = useMemo(() => {
    if (!paymentSummary || !dateRange || !dateRange[0] || !dateRange[1]) {
      return paymentSummary
    }
    
    const startDate = dateRange[0].startOf('day')
    const endDate = dateRange[1].endOf('day')
    
    // Filter yearly payments by date range
    const filteredYearlyPayments = paymentSummary.yearlyPayments.map(yearly => {
      const filteredMonthlyPayments = yearly.monthlyPayments.map(monthly => {
        const filteredDailyPayments = monthly.dailyPayments.filter(daily => {
          const dailyDate = dayjs(daily.date)
          return dailyDate.isAfter(startDate.subtract(1, 'day')) && dailyDate.isBefore(endDate.add(1, 'day'))
        })
        
        if (filteredDailyPayments.length === 0) return null
        
        // Recalculate monthly stats
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
      ...paymentSummary,
      yearlyPayments: filteredYearlyPayments,
      totalYears,
      totalMonths,
      totalDays,
      totalSessions,
      totalPayment,
      eligiblePayment,
    }
  }, [paymentSummary, dateRange])

  const handleMapClick = (mapUrl: string | undefined, routeDescription: string) => {
    setSelectedMapUrl(mapUrl)
    setSelectedRouteDescription(routeDescription)
    setMapModalOpen(true)
  }

  if (!paymentSummary) {
    return (
      <ProtectedRoute requiredRole="instructor">
        <div className="p-6">
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500">정산 데이터가 없습니다.</p>
            </div>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="instructor">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">강사 정산 내역</h1>
              <Tooltip
                title={
                  <div className="max-w-md">
                    <div className="font-semibold mb-2">정산 계산 방식 안내</div>
                    <div className="text-sm space-y-1">
                      <div><strong>출장수당 계산:</strong></div>
                      <div>• 강사당 하루 1회만 지급 (여러 기관 방문 시에도 1회)</div>
                      <div>• 경로: 집 → 기관1 → 기관2 → ... → 집 (총 거리 합산)</div>
                      <div>• 거리 기준: 고정 거리표 (31개 시군청간 거리표)</div>
                      <div>• 50km 미만 또는 동일 시/군 = 지급 없음</div>
                      <div>• 거리 구간별: 50-70km=2만원, 70-90km=3만원, 90-110km=4만원, 110-130km=5만원, 130km 이상=6만원</div>
                      <div>• 지도 이미지: 출장수당 지급 시 참고용 증빙 자료</div>
                      <div className="mt-2"><strong>강사료:</strong></div>
                      <div>• 주강사: 40,000원/차시, 보조강사: 30,000원/차시</div>
                      <div>• 추가 수당: 도서벽지(5천원), 특수교육(1만원), 주말(5천원), 중학교(5천원), 고등학교(1만원) 등</div>
                      <div className="mt-2"><strong>정산 대상:</strong> 확정 또는 완료 상태의 교육만 실제 지급</div>
                      <div className="mt-2"><strong>원천징수:</strong> 총 정산액의 3.3% (소득세 + 지방소득세)</div>
                    </div>
                  </div>
                }
                placement="right"
              >
                <Info className="w-5 h-5 text-blue-500 cursor-help" />
              </Tooltip>
            </div>
            <p className="text-gray-500 mt-1">
              {filteredSummary?.instructorName || paymentSummary.instructorName} 강사님의 정산 내역입니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DatePicker.RangePicker
              placeholder={['시작일', '종료일']}
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
              format="YYYY-MM-DD"
              allowClear
            />
            {dateRange && (
              <Button
                size="small"
                onClick={() => setDateRange(null)}
                icon={<Filter className="w-4 h-4" />}
              >
                필터 초기화
              </Button>
            )}
          </div>
        </div>

        {/* Overall Summary */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredSummary?.totalYears || paymentSummary.totalYears || 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">정산 연수</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {filteredSummary?.totalMonths || paymentSummary.totalMonths || 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">정산 월수</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredSummary?.totalDays || paymentSummary.totalDays || 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">교육 일수</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filteredSummary?.totalSessions || paymentSummary.totalSessions || 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">총 차시</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {(filteredSummary?.eligiblePayment || paymentSummary.eligiblePayment || 0).toLocaleString()}원
              </div>
              <div className="text-sm text-gray-500 mt-1">정산 금액</div>
            </div>
          </div>
        </Card>

        {/* Yearly Breakdown */}
        <Card title="연도별 정산 내역" extra={
          <div className="text-sm text-gray-500">
            집 주소: {paymentSummary.homeRegion.cityCounty} {paymentSummary.homeRegion.address}
          </div>
        }>
          {filteredSummary ? (
            <div className="space-y-4">
              {filteredSummary.yearlyPayments.map(yearlyPayment => (
                <YearlyPaymentCard
                  key={yearlyPayment.year}
                  yearlyPayment={yearlyPayment}
                  isExpanded={expandedYears.has(yearlyPayment.year)}
                  expandedMonths={expandedMonths.get(yearlyPayment.year) || new Set()}
                  onYearToggle={() => handleYearToggle(yearlyPayment.year)}
                  onMonthToggle={(month) => handleMonthToggle(yearlyPayment.year, month)}
                  onMapClick={handleMapClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              선택한 날짜 범위에 해당하는 정산 내역이 없습니다.
            </div>
          )}
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
              <Tooltip
                title={
                  <div className="max-w-sm">
                    <div className="font-semibold mb-2">출장수당 계산 방식</div>
                    <div className="text-sm space-y-1 whitespace-pre-line">
                      {dailyPayment.travelAllowance.explanation}
                      {'\n\n'}
                      <strong>계산 원칙:</strong>
                      {'\n'}• 강사당 하루 1회만 지급
                      {'\n'}• 여러 기관 방문 시 총 거리 합산
                      {'\n'}• 고정 거리표 기준 (실시간 API 사용 안 함)
                      {'\n'}• 50km 미만 또는 동일 지역 = 지급 없음
                      {'\n'}• 지도 이미지는 참고용 증빙 자료
                    </div>
                  </div>
                }
                placement="top"
              >
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
