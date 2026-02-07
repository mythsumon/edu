/**
 * Payment Statement Detail Table Component
 * Displays payment statement in table format matching the official statement format
 */

import { Table, Tag, Button, Tooltip, Card, Alert } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Eye, AlertCircle, CheckCircle, Info } from 'lucide-react'
import type { InstructorPaymentSummary, InstructorMonthlyPayment, InstructorDailyPayment } from '@/entities/settlement/instructor-payment-types'
import { generatePaymentStatement, generateDailyPaymentStatement, type PaymentStatementRow } from '@/entities/settlement/payment-statement-generator'

interface PaymentStatementDetailTableProps {
  summary: InstructorPaymentSummary
  onMapClick: (mapUrl: string | undefined, routeDescription: string) => void
}

/**
 * Payment Statement Detail Table
 * Shows monthly payment statements in table format
 */
export default function PaymentStatementDetailTable({
  summary,
  onMapClick,
}: PaymentStatementDetailTableProps) {
  // Validate payment statement data against system rules
  const validatePaymentStatement = (statement: PaymentStatementRow, monthlyPayment: InstructorMonthlyPayment): {
    isValid: boolean
    warnings: string[]
  } => {
    const warnings: string[] = []
    
    // Check base rates: Should be 32,000 for main, 24,000 for assistant
    const BASE_RATE_MAIN = 32000
    const BASE_RATE_ASSISTANT = 24000
    
    if (statement.mainInstructorSessions > 0) {
      const expectedBaseFee = statement.mainInstructorSessions * BASE_RATE_MAIN
      if (statement.mainInstructorBaseFee !== expectedBaseFee) {
        warnings.push(`주강사 기본료 불일치: 예상 ${expectedBaseFee.toLocaleString()}원, 실제 ${statement.mainInstructorBaseFee.toLocaleString()}원`)
      }
    }
    
    if (statement.assistantInstructorSessions > 0) {
      const expectedBaseFee = statement.assistantInstructorSessions * BASE_RATE_ASSISTANT
      if (statement.assistantInstructorBaseFee !== expectedBaseFee) {
        warnings.push(`보조강사 기본료 불일치: 예상 ${expectedBaseFee.toLocaleString()}원, 실제 ${statement.assistantInstructorBaseFee.toLocaleString()}원`)
      }
    }
    
    // Check tax calculation: 3% income tax + 0.3% local income tax = 3.3% total
    const expectedIncomeTax = Math.floor(statement.totalAllowance * 0.03)
    const expectedLocalIncomeTax = Math.floor(statement.totalAllowance * 0.003)
    const expectedTotalTax = expectedIncomeTax + expectedLocalIncomeTax
    
    if (Math.abs(statement.incomeTax - expectedIncomeTax) > 1) {
      warnings.push(`소득세 계산 오차: 예상 ${expectedIncomeTax.toLocaleString()}원, 실제 ${statement.incomeTax.toLocaleString()}원`)
    }
    
    if (Math.abs(statement.localIncomeTax - expectedLocalIncomeTax) > 1) {
      warnings.push(`지방소득세 계산 오차: 예상 ${expectedLocalIncomeTax.toLocaleString()}원, 실제 ${statement.localIncomeTax.toLocaleString()}원`)
    }
    
    if (Math.abs(statement.totalTax - expectedTotalTax) > 1) {
      warnings.push(`총 세액 계산 오차: 예상 ${expectedTotalTax.toLocaleString()}원, 실제 ${statement.totalTax.toLocaleString()}원`)
    }
    
    // Check actual payment: totalAllowance - totalTax
    const expectedActualPayment = statement.totalAllowance - statement.totalTax
    if (Math.abs(statement.actualPayment - expectedActualPayment) > 1) {
      warnings.push(`실지급액 계산 오차: 예상 ${expectedActualPayment.toLocaleString()}원, 실제 ${statement.actualPayment.toLocaleString()}원`)
    }
    
    // Check total allowance calculation
    const expectedTotalAllowance = 
      statement.mainInstructorBaseFee +
      statement.assistantInstructorBaseFee +
      statement.specialAllowance +
      statement.remoteIslandAllowance +
      statement.weekendAllowance +
      statement.eventParticipationAllowance +
      statement.otherAllowance +
      statement.equipmentTransportAllowance +
      statement.travelAllowance +
      statement.middleHighSchoolAllowance
    
    if (Math.abs(statement.totalAllowance - expectedTotalAllowance) > 1) {
      warnings.push(`수당총합계 계산 오차: 예상 ${expectedTotalAllowance.toLocaleString()}원, 실제 ${statement.totalAllowance.toLocaleString()}원`)
    }
    
    return {
      isValid: warnings.length === 0,
      warnings,
    }
  }

  // Generate statement rows for all daily payments (교육 날짜별 지급)
  const statementRows: (PaymentStatementRow & { 
    date: string
    month: string
    year: string
    key: string
    dailyPayment?: InstructorDailyPayment // Include daily payment data for detailed tooltip
    validation?: { isValid: boolean; warnings: string[] }
  })[] = []
  
  summary.yearlyPayments.forEach(yearlyPayment => {
    yearlyPayment.monthlyPayments.forEach(monthlyPayment => {
      // Generate statement for each daily payment
      monthlyPayment.dailyPayments.forEach(dailyPayment => {
        const statement = generateDailyPaymentStatement(dailyPayment)
        
        // Validate statement (simplified validation for daily)
        const validation = {
          isValid: true,
          warnings: [] as string[],
        }
        
        statementRows.push({
          ...statement,
          date: dailyPayment.date,
          month: monthlyPayment.month,
          year: yearlyPayment.year,
          dailyPayment, // Store daily payment for tooltip
          validation,
          key: `${yearlyPayment.year}-${monthlyPayment.month}-${dailyPayment.date}`,
        })
      })
    })
  })
  
  // Log validation results for debugging
  if (statementRows.some(r => r.validation && !r.validation.isValid)) {
    console.warn('Payment statement validation warnings:', statementRows.filter(r => r.validation && !r.validation.isValid))
  }

  // Sort by year, month, and date
  statementRows.sort((a, b) => {
    if (a.year !== b.year) {
      return a.year.localeCompare(b.year)
    }
    if (a.month !== b.month) {
      return a.month.localeCompare(b.month)
    }
    return a.date.localeCompare(b.date)
  })

  const columns: ColumnsType<PaymentStatementRow & { 
    date: string
    month: string
    year: string
    dailyPayment?: InstructorDailyPayment
    validation?: { isValid: boolean; warnings: string[] }
  }> = [
    {
      title: '연도',
      dataIndex: 'year',
      key: 'year',
      width: 80,
      fixed: 'left',
      onHeaderCell: () => ({ className: 'bg-blue-100' }),
      render: (year: string, record: any, index: number) => {
        // Group by year - show year only for first row of each year
        const rowIndex = statementRows.findIndex(r => r.key === record.key)
        const firstIndexInYear = statementRows.findIndex(r => r.year === year)
        if (rowIndex === firstIndexInYear) {
          const yearRowCount = statementRows.filter(r => r.year === year).length
          return { children: year, props: { rowSpan: yearRowCount } }
        }
        return { children: null, props: { rowSpan: 0 } }
      },
    },
    {
      title: '월',
      dataIndex: 'month',
      key: 'month',
      width: 100,
      fixed: 'left',
      onHeaderCell: () => ({ className: 'bg-gray-100' }),
      render: (month: string, record: any, index: number) => {
        // Group by month - show month only for first row of each month
        const rowIndex = statementRows.findIndex(r => r.key === record.key)
        const firstIndexInMonth = statementRows.findIndex(r => r.month === month && r.year === record.year)
        if (rowIndex === firstIndexInMonth) {
          const monthRowCount = statementRows.filter(r => r.month === month && r.year === record.year).length
          const monthNum = month.split('-')[1]
          return { children: `${monthNum}월`, props: { rowSpan: monthRowCount } }
        }
        return { children: null, props: { rowSpan: 0 } }
      },
    },
    {
      title: '교육 날짜',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      fixed: 'left',
      onHeaderCell: () => ({ className: 'bg-gray-100' }),
      render: (date: string) => {
        const dateObj = new Date(date)
        return `${dateObj.getMonth() + 1}/${dateObj.getDate()}`
      },
    },
    {
      title: (
        <div className="flex items-center gap-1">
          <span>강사구분</span>
          <Tooltip
            title={
              <div className="text-sm">
                <div className="font-semibold mb-1">강사구분 기준</div>
                <div>• 주강사: 주강사로만 출강한 경우</div>
                <div>• 보조강사: 보조강사로만 출강한 경우</div>
                <div>• 주강사/보조강사: 한 달 동안 주강사와 보조강사 모두 출강한 경우</div>
                <div className="mt-2 text-orange-500 font-semibold">⚠️ 중요: 한 차시에 두 역할을 동시에 할 수 없습니다.</div>
                <div className="text-xs text-gray-400 mt-1">(한 차시는 주강사이거나 보조강사 중 하나만 가능)</div>
              </div>
            }
          >
            <Info className="w-3 h-3 text-gray-400 cursor-help" />
          </Tooltip>
        </div>
      ),
      dataIndex: 'instructorClassification',
      key: 'instructorClassification',
      width: 140,
      align: 'center',
      onHeaderCell: () => ({ className: 'bg-blue-100' }),
      render: (classification: string, record) => {
        if (classification === '주강사') {
          return <Tag color="blue">주강사</Tag>
        } else if (classification === '보조강사') {
          return <Tag color="green">보조강사</Tag>
        } else if (classification === '주강사/보조강사') {
          return (
            <Tooltip
              title={
                <div className="text-xs">
                  <div>주강사: {record.mainInstructorSessions}차시</div>
                  <div>보조강사: {record.assistantInstructorSessions}차시</div>
                  <div className="mt-1 text-orange-300">한 차시에 두 역할 동시 불가</div>
                </div>
              }
            >
              <Tag color="purple">주강사/보조강사</Tag>
            </Tooltip>
          )
        }
        return <Tag>{classification}</Tag>
      },
    },
    {
      title: '이름',
      dataIndex: 'instructorName',
      key: 'instructorName',
      width: 120,
      fixed: 'left',
      onHeaderCell: () => ({ className: 'bg-gray-100' }),
    },
    {
      title: (
        <div className="flex items-center gap-1">
          <span>특별수당</span>
          <Tooltip
            title={
              <div className="text-sm">
                <div className="font-semibold mb-1">특별수당 지급 기준</div>
                <div>• 특수학급 교육 시 차시당 10,000원 지급</div>
                <div>• 교육명 또는 기관명에 "특수" 포함 시 지급</div>
              </div>
            }
          >
            <Info className="w-3 h-3 text-gray-400 cursor-help" />
          </Tooltip>
        </div>
      ),
      dataIndex: 'specialAllowance',
      key: 'specialAllowance',
      width: 110,
      align: 'right',
      onHeaderCell: () => ({ className: 'bg-blue-100' }),
      render: (value: number) => value > 0 ? value.toLocaleString() : '',
    },
    {
      title: (
        <div className="flex items-center gap-1">
          <span>도서벽지수당</span>
          <Tooltip
            title={
              <div className="text-sm">
                <div className="font-semibold mb-1">도서벽지수당 지급 기준</div>
                <div>• 도서벽지 지역 교육 시 차시당 5,000원 지급</div>
                <div>• 기관명 또는 지역명에 "도서" 또는 "벽지" 포함 시 지급</div>
              </div>
            }
          >
            <Info className="w-3 h-3 text-gray-400 cursor-help" />
          </Tooltip>
        </div>
      ),
      dataIndex: 'remoteIslandAllowance',
      key: 'remoteIslandAllowance',
      width: 120,
      align: 'right',
      render: (value: number) => value > 0 ? value.toLocaleString() : '',
    },
    {
      title: (
        <div className="flex items-center gap-1">
          <span>휴일(주말) 수당</span>
          <Tooltip
            title={
              <div className="text-sm">
                <div className="font-semibold mb-1">휴일(주말) 수당 지급 기준</div>
                <div>• 토요일 또는 일요일 교육 시 차시당 5,000원 지급</div>
                <div>• 행사참여수당과 중복 지급 불가</div>
              </div>
            }
          >
            <Info className="w-3 h-3 text-gray-400 cursor-help" />
          </Tooltip>
        </div>
      ),
      dataIndex: 'weekendAllowance',
      key: 'weekendAllowance',
      width: 130,
      align: 'right',
      onHeaderCell: () => ({ className: 'bg-yellow-100' }),
      render: (value: number) => value > 0 ? value.toLocaleString() : '',
    },
    {
      title: (
        <div className="flex items-center gap-1">
          <span>행사참여수당</span>
          <Tooltip
            title={
              <div className="text-sm">
                <div className="font-semibold mb-1">행사참여수당 지급 기준</div>
                <div>• 행사 참여 시 시간당 25,000원 지급</div>
                <div>• 주말수당과 중복 지급 불가</div>
              </div>
            }
          >
            <Info className="w-3 h-3 text-gray-400 cursor-help" />
          </Tooltip>
        </div>
      ),
      dataIndex: 'eventParticipationAllowance',
      key: 'eventParticipationAllowance',
      width: 130,
      align: 'right',
      onHeaderCell: () => ({ className: 'bg-orange-100' }),
      render: (value: number) => value > 0 ? value.toLocaleString() : '',
    },
    {
      title: (
        <div className="flex items-center gap-1">
          <div>
            <div>기타 수당</div>
            <div className="text-xs font-normal text-gray-500">(멘토/멘티 수당 등)</div>
          </div>
          <Tooltip
            title={
              <div className="text-sm">
                <div className="font-semibold mb-1">기타 수당 지급 기준</div>
                <div>• 멘토/멘티 프로그램 참여 시 지급</div>
                <div>• 강사 역량강화 프로그램 참여 시 지급</div>
                <div>• 정책에 따라 별도로 정의된 수당</div>
              </div>
            }
          >
            <Info className="w-3 h-3 text-gray-400 cursor-help" />
          </Tooltip>
        </div>
      ),
      dataIndex: 'otherAllowance',
      key: 'otherAllowance',
      width: 110,
      align: 'right',
      onHeaderCell: () => ({ className: 'bg-orange-100' }),
      render: (value: number) => value > 0 ? value.toLocaleString() : '',
    },
    {
      title: (
        <div className="flex items-center gap-1">
          <span>교구운반수당</span>
          <Tooltip
            title={
              <div className="text-sm">
                <div className="font-semibold mb-1">교구운반수당 지급 기준</div>
                <div>• 교구 운반 시 일당 20,000원 지급</div>
                <div>• 월 최대 300,000원까지 지급 (월 15일 이상 시)</div>
              </div>
            }
          >
            <Info className="w-3 h-3 text-gray-400 cursor-help" />
          </Tooltip>
        </div>
      ),
      dataIndex: 'equipmentTransportAllowance',
      key: 'equipmentTransportAllowance',
      width: 130,
      align: 'right',
      onHeaderCell: () => ({ className: 'bg-green-100' }),
      render: (value: number) => value > 0 ? value.toLocaleString() : '',
    },
    {
      title: (
        <div className="flex items-center gap-1">
          <span>출장수당</span>
          <Tooltip
            title={
              <div className="text-sm">
                <div className="font-semibold mb-1">출장수당 지급 기준</div>
                <div>• 강사당 하루 1회만 지급 (여러 기관 방문 시에도 1회)</div>
                <div>• 경로: 집 → 기관1 → 기관2 → ... → 집 (총 거리 합산)</div>
                <div>• 거리 기준: 고정 거리표 (31개 시군청간 거리표)</div>
                <div>• 50km 미만 또는 동일 시/군 = 지급 없음</div>
                <div>• 거리 구간별: 50-70km=2만원, 70-90km=3만원, 90-110km=4만원, 110-130km=5만원, 130km 이상=6만원</div>
              </div>
            }
          >
            <Info className="w-3 h-3 text-gray-400 cursor-help" />
          </Tooltip>
        </div>
      ),
      dataIndex: 'travelAllowance',
      key: 'travelAllowance',
      width: 110,
      align: 'right',
      onHeaderCell: () => ({ className: 'bg-yellow-100' }),
      render: (value: number, record: any) => {
        if (value === 0) return ''
        
        const dailyPayment = record.dailyPayment as InstructorDailyPayment | undefined
        if (!dailyPayment) {
          return value > 0 ? value.toLocaleString() : ''
        }
        
        const travelAllowance = dailyPayment.travelAllowance
        const institutions = dailyPayment.trainings.map(t => t.institution.institutionName).join(', ')
        const distanceKm = travelAllowance.totalDistanceKm
        const bracket = travelAllowance.distanceBracket
        const bracketText = bracket.maxKm === null 
          ? `${bracket.minKm}km 이상`
          : `${bracket.minKm}km ~ ${bracket.maxKm}km`
        
        return (
          <Tooltip
            title={
              <div className="text-sm max-w-md">
                <div className="font-semibold mb-2">출장수당 상세 내역</div>
                <div className="space-y-1">
                  <div><strong>총 이동거리:</strong> {distanceKm.toFixed(1)}km</div>
                  <div><strong>거리 구간:</strong> {bracketText}</div>
                  <div><strong>출장수당:</strong> {value.toLocaleString()}원</div>
                  <div className="mt-2"><strong>방문 기관:</strong></div>
                  <div className="text-xs pl-2">
                    {dailyPayment.trainings.length > 0 ? (
                      dailyPayment.trainings.map((t, idx) => (
                        <div key={idx}>
                          {idx + 1}. {t.institution.institutionName} ({t.institution.cityCounty})
                        </div>
                      ))
                    ) : (
                      <div>방문 기관 정보 없음</div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-300">
                    {travelAllowance.explanation.split('\n').map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </div>
                </div>
              </div>
            }
          >
            <span className="cursor-help underline decoration-dotted">
              {value.toLocaleString()}
            </span>
          </Tooltip>
        )
      },
    },
    {
      title: (
        <div className="flex items-center gap-1">
          <span>중,고등부 수당</span>
          <Tooltip
            title={
              <div className="text-sm">
                <div className="font-semibold mb-1">중,고등부 수당 지급 기준</div>
                <div>• 중학교 교육 시 차시당 5,000원 지급</div>
                <div>• 고등학교 교육 시 차시당 10,000원 지급</div>
                <div>• 교육명 또는 기관명에 "중학교" 또는 "고등학교" 포함 시 지급</div>
              </div>
            }
          >
            <Info className="w-3 h-3 text-gray-400 cursor-help" />
          </Tooltip>
        </div>
      ),
      dataIndex: 'middleHighSchoolAllowance',
      key: 'middleHighSchoolAllowance',
      width: 140,
      align: 'right',
      onHeaderCell: () => ({ className: 'bg-gray-100' }),
      render: (value: number) => value > 0 ? value.toLocaleString() : '',
    },
    {
      title: (
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1">
            <span>출강 차시</span>
            <Tooltip
              title={
                <div className="text-sm">
                  <div className="font-semibold mb-1">주강사 출강 차시</div>
                  <div>• 주강사로 출강한 차시 수</div>
                  <div>• 기본료: 차시당 32,000원</div>
                  <div className="mt-1 text-orange-300">⚠️ 한 차시에 주강사와 보조강사를 동시에 할 수 없습니다.</div>
                </div>
              }
            >
              <Info className="w-3 h-3 text-gray-400 cursor-help" />
            </Tooltip>
          </div>
          <div className="text-xs font-normal">주강사 (₩32,000)</div>
        </div>
      ),
      dataIndex: 'mainInstructorSessions',
      key: 'mainInstructorSessions',
      width: 150,
      align: 'center',
      onHeaderCell: () => ({ className: 'bg-gray-100' }),
      render: (sessions: number, record) => (
        <div className="text-center">
          <div className="font-medium">{sessions}차시</div>
          {sessions > 0 && (
            <div className="text-xs text-gray-500">
              {record.mainInstructorBaseFee.toLocaleString()}원
            </div>
          )}
        </div>
      ),
    },
    {
      title: (
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1">
            <span>출강 차시</span>
            <Tooltip
              title={
                <div className="text-sm">
                  <div className="font-semibold mb-1">보조강사 출강 차시</div>
                  <div>• 보조강사로 출강한 차시 수</div>
                  <div>• 기본료: 차시당 24,000원</div>
                  <div className="mt-1 text-orange-300">⚠️ 한 차시에 주강사와 보조강사를 동시에 할 수 없습니다.</div>
                </div>
              }
            >
              <Info className="w-3 h-3 text-gray-400 cursor-help" />
            </Tooltip>
          </div>
          <div className="text-xs font-normal">보조강사 (₩24,000)</div>
        </div>
      ),
      dataIndex: 'assistantInstructorSessions',
      key: 'assistantInstructorSessions',
      width: 150,
      align: 'center',
      onHeaderCell: () => ({ className: 'bg-gray-100' }),
      render: (sessions: number, record) => (
        <div className="text-center">
          <div className="font-medium">{sessions}차시</div>
          {sessions > 0 && (
            <div className="text-xs text-gray-500">
              {record.assistantInstructorBaseFee.toLocaleString()}원
            </div>
          )}
        </div>
      ),
    },
    {
      title: '수당총합계',
      dataIndex: 'totalAllowance',
      key: 'totalAllowance',
      width: 120,
      align: 'right',
      onHeaderCell: () => ({ className: 'bg-blue-100' }),
      render: (value: number) => (
        <span className="font-semibold text-blue-600">{value.toLocaleString()}</span>
      ),
    },
    {
      title: (
        <div>
          <div>근로자세액</div>
          <div className="text-xs font-normal">소득세</div>
        </div>
      ),
      dataIndex: 'incomeTax',
      key: 'incomeTax',
      width: 100,
      align: 'right',
      onHeaderCell: () => ({ className: 'bg-blue-100' }),
      render: (value: number) => value > 0 ? value.toLocaleString() : '',
    },
    {
      title: (
        <div>
          <div>근로자세액</div>
          <div className="text-xs font-normal">지방소득세</div>
        </div>
      ),
      dataIndex: 'localIncomeTax',
      key: 'localIncomeTax',
      width: 120,
      align: 'right',
      onHeaderCell: () => ({ className: 'bg-blue-100' }),
      render: (value: number) => value > 0 ? value.toLocaleString() : '',
    },
    {
      title: '실지급액',
      dataIndex: 'actualPayment',
      key: 'actualPayment',
      width: 120,
      align: 'right',
      fixed: 'right',
      onHeaderCell: () => ({ className: 'bg-blue-100' }),
      render: (value: number) => (
        <span className="font-bold text-orange-600">{value.toLocaleString()}</span>
      ),
    },
  ]

  // Calculate totals
  const totals: PaymentStatementRow = {
    instructorClassification: '',
    instructorName: '합계',
    specialAllowance: statementRows.reduce((sum, r) => sum + r.specialAllowance, 0),
    remoteIslandAllowance: statementRows.reduce((sum, r) => sum + r.remoteIslandAllowance, 0),
    weekendAllowance: statementRows.reduce((sum, r) => sum + r.weekendAllowance, 0),
    eventParticipationAllowance: statementRows.reduce((sum, r) => sum + r.eventParticipationAllowance, 0),
    otherAllowance: statementRows.reduce((sum, r) => sum + r.otherAllowance, 0),
    equipmentTransportAllowance: statementRows.reduce((sum, r) => sum + r.equipmentTransportAllowance, 0),
    travelAllowance: statementRows.reduce((sum, r) => sum + r.travelAllowance, 0),
    middleHighSchoolAllowance: statementRows.reduce((sum, r) => sum + r.middleHighSchoolAllowance, 0),
    mainInstructorSessions: statementRows.reduce((sum, r) => sum + r.mainInstructorSessions, 0),
    assistantInstructorSessions: statementRows.reduce((sum, r) => sum + r.assistantInstructorSessions, 0),
    mainInstructorBaseFee: statementRows.reduce((sum, r) => sum + r.mainInstructorBaseFee, 0),
    assistantInstructorBaseFee: statementRows.reduce((sum, r) => sum + r.assistantInstructorBaseFee, 0),
    totalAllowance: statementRows.reduce((sum, r) => sum + r.totalAllowance, 0),
    incomeTax: statementRows.reduce((sum, r) => sum + r.incomeTax, 0),
    localIncomeTax: statementRows.reduce((sum, r) => sum + r.localIncomeTax, 0),
    totalTax: statementRows.reduce((sum, r) => sum + r.totalTax, 0),
    actualPayment: statementRows.reduce((sum, r) => sum + r.actualPayment, 0),
  }

  if (statementRows.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        정산 데이터가 없습니다.
      </div>
    )
  }

  // Check for validation warnings
  const hasValidationWarnings = statementRows.some(r => r.validation && !r.validation.isValid)
  const validationWarnings = statementRows
    .filter(r => r.validation && !r.validation.isValid)
    .flatMap(r => r.validation!.warnings.map(w => `${r.month}: ${w}`))

  return (
    <div className="space-y-4">
      {hasValidationWarnings && (
        <Alert
          type="warning"
          icon={<AlertCircle className="w-4 h-4" />}
          message="데이터 검증 경고"
          description={
            <div className="text-sm">
              <div className="mb-2">다음 항목에서 계산 불일치가 발견되었습니다:</div>
              <ul className="list-disc list-inside space-y-1">
                {validationWarnings.slice(0, 5).map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
                {validationWarnings.length > 5 && (
                  <li className="text-gray-500">... 외 {validationWarnings.length - 5}건</li>
                )}
              </ul>
            </div>
          }
          showIcon
          closable
        />
      )}
      {!hasValidationWarnings && statementRows.length > 0 && (
        <Alert
          type="success"
          icon={<CheckCircle className="w-4 h-4" />}
          message="데이터 검증 완료"
          description="모든 계산이 시스템 규칙과 일치합니다."
          showIcon
          closable
        />
      )}
      <Card title="수당명세서 상세 내역" size="small">
        <Table
          columns={columns}
          dataSource={statementRows}
          pagination={false}
          scroll={{ x: 2000 }}
          bordered
          size="small"
          rowClassName={(record, index) => index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
          summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row className="bg-blue-50 font-semibold">
              <Table.Summary.Cell index={0} colSpan={5} align="right">
                합계
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                {totals.specialAllowance > 0 ? totals.specialAllowance.toLocaleString() : ''}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="right">
                {totals.remoteIslandAllowance > 0 ? totals.remoteIslandAllowance.toLocaleString() : ''}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3} align="right">
                {totals.weekendAllowance > 0 ? totals.weekendAllowance.toLocaleString() : ''}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4} align="right">
                {totals.eventParticipationAllowance > 0 ? totals.eventParticipationAllowance.toLocaleString() : ''}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={5} align="right">
                {totals.otherAllowance > 0 ? totals.otherAllowance.toLocaleString() : ''}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6} align="right">
                {totals.equipmentTransportAllowance > 0 ? totals.equipmentTransportAllowance.toLocaleString() : ''}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={7} align="right">
                {totals.travelAllowance > 0 ? totals.travelAllowance.toLocaleString() : ''}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={8} align="right">
                {totals.middleHighSchoolAllowance > 0 ? totals.middleHighSchoolAllowance.toLocaleString() : ''}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={9} align="center">
                <div>
                  <div>{totals.mainInstructorSessions}차시</div>
                  {totals.mainInstructorSessions > 0 && (
                    <div className="text-xs">{totals.mainInstructorBaseFee.toLocaleString()}원</div>
                  )}
                </div>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={10} align="center">
                <div>
                  <div>{totals.assistantInstructorSessions}차시</div>
                  {totals.assistantInstructorSessions > 0 && (
                    <div className="text-xs">{totals.assistantInstructorBaseFee.toLocaleString()}원</div>
                  )}
                </div>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={11} align="right">
                <span className="font-semibold text-blue-600">{totals.totalAllowance.toLocaleString()}</span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={12} align="right">
                {totals.incomeTax > 0 ? totals.incomeTax.toLocaleString() : ''}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={13} align="right">
                {totals.localIncomeTax > 0 ? totals.localIncomeTax.toLocaleString() : ''}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={14} align="right">
                <span className="font-bold text-orange-600">{totals.actualPayment.toLocaleString()}</span>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
        />
      </Card>
    </div>
  )
}
