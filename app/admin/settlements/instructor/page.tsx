'use client'

import { useState, useMemo } from 'react'
import { Card, Table, Select, Button, Badge, Collapse } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Download, Copy, ChevronDown, ChevronRight } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import {
  dailyActivities,
  instructors,
  institutions,
  cityDistanceMatrix,
  type DailyActivity,
  type Instructor,
} from '@/lib/mock/settlementMock'
import {
  groupByInstructorAndDate,
  computeDailySettlement,
  computeMonthlySettlement,
  formatCurrency,
  formatNumber,
  type DailySettlement,
  type MonthlySettlement,
} from '@/lib/settlementEngine'
import { message } from 'antd'
import dayjs from 'dayjs'

const { Panel } = Collapse

export default function InstructorSettlementPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>('2025-01')
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>('all')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Build institutions map
  const institutionsById = useMemo(() => {
    const map = new Map<string, typeof institutions[0]>()
    for (const inst of institutions) {
      map.set(inst.id, inst)
    }
    return map
  }, [])

  // Build instructors map
  const instructorsById = useMemo(() => {
    const map = new Map<string, Instructor>()
    for (const inst of instructors) {
      map.set(inst.id, inst)
    }
    return map
  }, [])

  // Filter activities by month and instructor
  const filteredActivities = useMemo(() => {
    return dailyActivities.filter(activity => {
      const activityMonth = activity.date.substring(0, 7) // YYYY-MM
      if (activityMonth !== selectedMonth) return false
      if (selectedInstructorId !== 'all' && activity.instructorId !== selectedInstructorId) {
        return false
      }
      return true
    })
  }, [selectedMonth, selectedInstructorId])

  // Group and compute daily settlements
  const dailySettlements = useMemo(() => {
    const grouped = groupByInstructorAndDate(filteredActivities)
    const results: DailySettlement[] = []

    for (const [instructorId, dateMap] of grouped.entries()) {
      const instructor = instructorsById.get(instructorId)
      if (!instructor) continue

      for (const [date, activities] of dateMap.entries()) {
        const settlement = computeDailySettlement(
          instructor,
          activities,
          institutionsById,
          cityDistanceMatrix
        )
        results.push(settlement)
      }
    }

    // Sort by date
    return results.sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredActivities, instructorsById, institutionsById])

  // Group by instructor and compute monthly settlements
  const monthlySettlements = useMemo(() => {
    const byInstructor = new Map<string, DailySettlement[]>()
    
    for (const daily of dailySettlements) {
      if (!byInstructor.has(daily.instructorId)) {
        byInstructor.set(daily.instructorId, [])
      }
      byInstructor.get(daily.instructorId)!.push(daily)
    }

    const results: MonthlySettlement[] = []
    for (const [instructorId, dailyList] of byInstructor.entries()) {
      const monthly = computeMonthlySettlement(dailyList)
      results.push(monthly)
    }

    return results.sort((a, b) => a.instructorName.localeCompare(b.instructorName))
  }, [dailySettlements])

  // Daily table columns
  const dailyColumns: ColumnsType<DailySettlement> = [
    {
      title: '날짜',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD (ddd)'),
    },
    {
      title: '강사',
      dataIndex: 'instructorName',
      key: 'instructorName',
      width: 100,
    },
    {
      title: '수업 수',
      dataIndex: 'classCount',
      key: 'classCount',
      width: 80,
      align: 'right',
    },
    {
      title: '차시',
      dataIndex: 'totalSessions',
      key: 'totalSessions',
      width: 80,
      align: 'right',
    },
    {
      title: '기본강사료',
      dataIndex: 'teachingBaseAmount',
      key: 'teachingBaseAmount',
      width: 120,
      align: 'right',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: '수당',
      key: 'allowances',
      width: 150,
      align: 'right',
      render: (_: any, record: DailySettlement) => {
        const total = 
          record.allowancesAmountBreakdown.remote +
          record.allowancesAmountBreakdown.special +
          record.allowancesAmountBreakdown.weekend +
          record.allowancesAmountBreakdown.noAssistant15Plus
        return formatCurrency(total)
      },
    },
    {
      title: '교구운반',
      dataIndex: 'equipmentTransportAmount',
      key: 'equipmentTransportAmount',
      width: 100,
      align: 'right',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: '행사',
      dataIndex: 'eventAmount',
      key: 'eventAmount',
      width: 100,
      align: 'right',
      render: (amount: number) => amount > 0 ? formatCurrency(amount) : '-',
    },
    {
      title: '출장거리',
      dataIndex: 'travelKm',
      key: 'travelKm',
      width: 100,
      align: 'right',
      render: (km: number) => `${formatNumber(km)} km`,
    },
    {
      title: '출장수당',
      dataIndex: 'travelAllowance',
      key: 'travelAllowance',
      width: 120,
      align: 'right',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: '합계',
      dataIndex: 'grossTotal',
      key: 'grossTotal',
      width: 120,
      align: 'right',
      render: (amount: number) => (
        <span className="font-semibold">{formatCurrency(amount)}</span>
      ),
    },
  ]

  // Monthly summary columns
  const monthlyColumns: ColumnsType<MonthlySettlement> = [
    {
      title: '강사',
      dataIndex: 'instructorName',
      key: 'instructorName',
      width: 120,
    },
    {
      title: '일수',
      dataIndex: 'totalDays',
      key: 'totalDays',
      width: 80,
      align: 'right',
    },
    {
      title: '차시',
      dataIndex: 'totalSessions',
      key: 'totalSessions',
      width: 80,
      align: 'right',
    },
    {
      title: '기본강사료',
      dataIndex: 'teachingBaseAmount',
      key: 'teachingBaseAmount',
      width: 120,
      align: 'right',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: '수당합계',
      dataIndex: 'allowancesTotal',
      key: 'allowancesTotal',
      width: 120,
      align: 'right',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: '교구운반',
      dataIndex: 'equipmentTransportAmount',
      key: 'equipmentTransportAmount',
      width: 120,
      align: 'right',
      render: (amount: number, record: MonthlySettlement) => (
        <div>
          {formatCurrency(amount)}
          {record.equipmentTransportCapApplied && (
            <Badge count="CAP" style={{ backgroundColor: '#ff4d4f', marginLeft: 8 }} />
          )}
        </div>
      ),
    },
    {
      title: '행사',
      dataIndex: 'eventAmount',
      key: 'eventAmount',
      width: 100,
      align: 'right',
      render: (amount: number) => amount > 0 ? formatCurrency(amount) : '-',
    },
    {
      title: '출장수당',
      dataIndex: 'travelAllowanceTotal',
      key: 'travelAllowanceTotal',
      width: 120,
      align: 'right',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: '총액',
      dataIndex: 'grossTotal',
      key: 'grossTotal',
      width: 120,
      align: 'right',
      render: (amount: number) => (
        <span className="font-semibold">{formatCurrency(amount)}</span>
      ),
    },
    {
      title: '세금 (3.3%)',
      dataIndex: 'tax',
      key: 'tax',
      width: 120,
      align: 'right',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: '실지급액',
      dataIndex: 'netTotal',
      key: 'netTotal',
      width: 120,
      align: 'right',
      render: (amount: number) => (
        <span className="font-semibold text-blue-600">{formatCurrency(amount)}</span>
      ),
    },
  ]

  const handleCopyJSON = () => {
    const jsonData = {
      month: selectedMonth,
      dailySettlements,
      monthlySettlements,
    }
    const jsonString = JSON.stringify(jsonData, null, 2)
    navigator.clipboard.writeText(jsonString)
    message.success('JSON 데이터가 클립보드에 복사되었습니다.')
  }

  const handleDownloadCSV = () => {
    if (monthlySettlements.length === 0) {
      message.warning('다운로드할 데이터가 없습니다.')
      return
    }

    // CSV header
    const headers = [
      '강사명',
      '월',
      '일수',
      '차시',
      '기본강사료',
      '수당합계',
      '교구운반',
      '교구운반캡적용',
      '행사',
      '출장수당',
      '총액',
      '세금(3.3%)',
      '실지급액',
    ]

    // CSV rows
    const rows = monthlySettlements.map(ms => [
      ms.instructorName,
      ms.month,
      ms.totalDays,
      ms.totalSessions,
      ms.teachingBaseAmount,
      ms.allowancesTotal,
      ms.equipmentTransportAmount,
      ms.equipmentTransportCapApplied ? 'Y' : 'N',
      ms.eventAmount,
      ms.travelAllowanceTotal,
      ms.grossTotal,
      ms.tax,
      ms.netTotal,
    ])

    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n')

    // Create blob and download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `instructor_settlement_${selectedMonth}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    message.success('CSV 파일이 다운로드되었습니다.')
  }

  const toggleRowExpand = (rowKey: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(rowKey)) {
      newExpanded.delete(rowKey)
    } else {
      newExpanded.add(rowKey)
    }
    setExpandedRows(newExpanded)
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              강사 정산 계산기
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              강사의 일별 및 월별 정산을 계산하고 내보낼 수 있습니다.
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  월:
                </label>
                <Select
                  value={selectedMonth}
                  onChange={setSelectedMonth}
                  style={{ width: 150 }}
                  options={[
                    { label: '2025년 1월', value: '2025-01' },
                    { label: '2025년 2월', value: '2025-02' },
                    { label: '2025년 3월', value: '2025-03' },
                  ]}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  강사:
                </label>
                <Select
                  value={selectedInstructorId}
                  onChange={setSelectedInstructorId}
                  style={{ width: 200 }}
                  options={[
                    { label: '전체', value: 'all' },
                    ...instructors.map(inst => ({
                      label: inst.name,
                      value: inst.id,
                    })),
                  ]}
                />
              </div>
              <div className="flex-1" />
              <Button icon={<Copy className="w-4 h-4" />} onClick={handleCopyJSON}>
                JSON 복사
              </Button>
              <Button
                type="primary"
                icon={<Download className="w-4 h-4" />}
                onClick={handleDownloadCSV}
              >
                CSV 다운로드
              </Button>
            </div>
          </Card>

          {/* Monthly Summary */}
          <Card title="월별 정산 요약" className="mb-6">
            <Table
              columns={monthlyColumns}
              dataSource={monthlySettlements}
              rowKey="instructorId"
              pagination={false}
              summary={() => {
                const totals = monthlySettlements.reduce(
                  (acc, ms) => ({
                    totalDays: acc.totalDays + ms.totalDays,
                    totalSessions: acc.totalSessions + ms.totalSessions,
                    teachingBaseAmount: acc.teachingBaseAmount + ms.teachingBaseAmount,
                    allowancesTotal: acc.allowancesTotal + ms.allowancesTotal,
                    equipmentTransportAmount:
                      acc.equipmentTransportAmount + ms.equipmentTransportAmount,
                    eventAmount: acc.eventAmount + ms.eventAmount,
                    travelAllowanceTotal: acc.travelAllowanceTotal + ms.travelAllowanceTotal,
                    grossTotal: acc.grossTotal + ms.grossTotal,
                    tax: acc.tax + ms.tax,
                    netTotal: acc.netTotal + ms.netTotal,
                  }),
                  {
                    totalDays: 0,
                    totalSessions: 0,
                    teachingBaseAmount: 0,
                    allowancesTotal: 0,
                    equipmentTransportAmount: 0,
                    eventAmount: 0,
                    travelAllowanceTotal: 0,
                    grossTotal: 0,
                    tax: 0,
                    netTotal: 0,
                  }
                )

                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>
                        <strong>합계</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <strong>{totals.totalDays}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="right">
                        <strong>{totals.totalSessions}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} align="right">
                        <strong>{formatCurrency(totals.teachingBaseAmount)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4} align="right">
                        <strong>{formatCurrency(totals.allowancesTotal)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5} align="right">
                        <strong>{formatCurrency(totals.equipmentTransportAmount)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6} align="right">
                        <strong>
                          {totals.eventAmount > 0 ? formatCurrency(totals.eventAmount) : '-'}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={7} align="right">
                        <strong>{formatCurrency(totals.travelAllowanceTotal)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={8} align="right">
                        <strong>{formatCurrency(totals.grossTotal)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={9} align="right">
                        <strong>{formatCurrency(totals.tax)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={10} align="right">
                        <strong className="text-blue-600">
                          {formatCurrency(totals.netTotal)}
                        </strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )
              }}
            />
          </Card>

          {/* Daily Details */}
          <Card title="일별 정산 상세">
            <Table
              columns={dailyColumns}
              dataSource={dailySettlements}
              rowKey={(record) => `${record.instructorId}_${record.date}`}
              pagination={{ pageSize: 20 }}
              expandable={{
                expandedRowRender: (record: DailySettlement) => {
                  const details = record.calculationDetails
                  
                  return (
                    <div className="p-4 space-y-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      {/* 수업별 계산 상세 */}
                      {details.classCalculations.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3 text-lg">수업별 계산 상세</h4>
                          <div className="space-y-4">
                            {details.classCalculations.map((calc, idx) => (
                              <Card key={idx} size="small" className="mb-2">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      color={calc.status === 'CONFIRMED' ? 'green' : 'default'}
                                      text={calc.status}
                                    />
                                    <span className="font-semibold">{calc.institutionName}</span>
                                    <span className="text-gray-500">
                                      ({calc.institutionLevel}) {calc.role === 'MAIN' ? '주강사' : '보조강사'}
                                    </span>
                                  </div>
                                  
                                  {/* 기본 강사료 계산 */}
                                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                                    <div className="text-sm font-medium mb-1">기본 강사료</div>
                                    <div className="text-sm">
                                      {formatNumber(calc.baseFeePerSession)}원 × {calc.sessions}차시 ={' '}
                                      <strong>{formatCurrency(calc.baseAmount)}</strong>
                                    </div>
                                  </div>
                                  
                                  {/* 수당 계산 */}
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                        도서벽지
                                      </div>
                                      <div className="text-sm">
                                        {calc.allowances.remote.perSession > 0 ? (
                                          <>
                                            {formatNumber(calc.allowances.remote.perSession)}원 × {calc.sessions}차시 ={' '}
                                            <strong>{formatCurrency(calc.allowances.remote.total)}</strong>
                                            <div className="text-xs text-gray-500 mt-1">
                                              {calc.allowances.remote.reason}
                                            </div>
                                          </>
                                        ) : (
                                          <span className="text-gray-400">해당없음</span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                        특수
                                      </div>
                                      <div className="text-sm">
                                        {calc.allowances.special.perSession > 0 ? (
                                          <>
                                            {formatNumber(calc.allowances.special.perSession)}원 × {calc.sessions}차시 ={' '}
                                            <strong>{formatCurrency(calc.allowances.special.total)}</strong>
                                            <div className="text-xs text-gray-500 mt-1">
                                              {calc.allowances.special.reason}
                                            </div>
                                          </>
                                        ) : (
                                          <span className="text-gray-400">해당없음</span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                        주말수당
                                      </div>
                                      <div className="text-sm">
                                        {calc.allowances.weekend.perSession > 0 ? (
                                          <>
                                            {formatNumber(calc.allowances.weekend.perSession)}원 × {calc.sessions}차시 ={' '}
                                            <strong>{formatCurrency(calc.allowances.weekend.total)}</strong>
                                            <div className="text-xs text-gray-500 mt-1">
                                              {calc.allowances.weekend.reason}
                                            </div>
                                          </>
                                        ) : (
                                          <span className="text-gray-400">해당없음</span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                        15명+보조없음
                                      </div>
                                      <div className="text-sm">
                                        {calc.allowances.noAssistant15Plus.perSession > 0 ? (
                                          <>
                                            {formatNumber(calc.allowances.noAssistant15Plus.perSession)}원 × {calc.sessions}차시 ={' '}
                                            <strong>{formatCurrency(calc.allowances.noAssistant15Plus.total)}</strong>
                                            <div className="text-xs text-gray-500 mt-1">
                                              {calc.allowances.noAssistant15Plus.reason}
                                            </div>
                                          </>
                                        ) : (
                                          <span className="text-gray-400">해당없음</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="text-xs text-gray-500">
                                    학생 {calc.students}명, 보조강사 {calc.hasAssistant ? '있음' : '없음'}
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* 출장거리 및 출장수당 계산 */}
                      {details.travelCalculation && (
                        <div>
                          <h4 className="font-semibold mb-3 text-lg">출장거리 및 출장수당 계산</h4>
                          <Card size="small">
                            <div className="space-y-2">
                              <div>
                                <span className="text-sm font-medium">출발지:</span>{' '}
                                <span className="text-sm">{details.travelCalculation.homeCity}</span>
                              </div>
                              <div>
                                <span className="text-sm font-medium">경로:</span>{' '}
                                <span className="text-sm">
                                  {details.travelCalculation.route.join(' → ')}
                                </span>
                              </div>
                              <div className="mt-3">
                                <div className="text-sm font-medium mb-2">구간별 거리:</div>
                                <div className="space-y-1">
                                  {details.travelCalculation.routeDistances.map((segment, idx) => (
                                    <div key={idx} className="text-sm pl-4">
                                      {segment.from} → {segment.to}:{' '}
                                      <strong>{formatNumber(segment.km)} km</strong>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                                <div className="text-sm">
                                  총 거리: <strong>{formatNumber(details.travelCalculation.totalKm)} km</strong>
                                </div>
                                <div className="text-sm mt-1">
                                  출장수당 구간: {details.travelCalculation.allowanceBracket}
                                </div>
                                <div className="text-sm mt-1 font-semibold">
                                  출장수당: {formatCurrency(details.travelCalculation.allowanceAmount)}
                                </div>
                              </div>
                            </div>
                          </Card>
                        </div>
                      )}
                      
                      {/* 행사 계산 */}
                      {details.eventCalculations.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3 text-lg">행사 참여 계산</h4>
                          <div className="space-y-2">
                            {details.eventCalculations.map((event, idx) => (
                              <Card key={idx} size="small">
                                <div className="text-sm">
                                  {event.hours}시간 × {formatNumber(event.ratePerHour)}원/시간 ={' '}
                                  <strong>{formatCurrency(event.amount)}</strong>
                                  {event.status === 'CANCELLED' && (
                                    <Badge color="red" text="취소됨" style={{ marginLeft: 8 }} />
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* 교구운반 수당 */}
                      <div>
                        <h4 className="font-semibold mb-3 text-lg">교구운반 수당</h4>
                        <Card size="small">
                          <div className="text-sm">
                            {details.equipmentTransport.hasTransport ? (
                              <>
                                교구 운반 수행: <strong>{formatCurrency(details.equipmentTransport.amount)}</strong>
                                <div className="text-xs text-gray-500 mt-1">
                                  {details.equipmentTransport.reason}
                                </div>
                              </>
                            ) : (
                              <span className="text-gray-400">해당없음</span>
                            )}
                          </div>
                        </Card>
                      </div>
                      
                      {/* 합계 계산 */}
                      <div>
                        <h4 className="font-semibold mb-3 text-lg">일일 합계 계산</h4>
                        <Card size="small" className="bg-gray-100 dark:bg-gray-700">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>기본 강사료:</span>
                              <strong>{formatCurrency(details.summary.teachingBase)}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>수당 합계:</span>
                              <strong>{formatCurrency(details.summary.allowancesTotal)}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>교구운반:</span>
                              <strong>{formatCurrency(details.summary.equipmentTransport)}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>행사:</span>
                              <strong>{formatCurrency(details.summary.event)}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>출장수당:</span>
                              <strong>{formatCurrency(details.summary.travel)}</strong>
                            </div>
                            <div className="border-t pt-2 mt-2 flex justify-between font-semibold text-base">
                              <span>총액:</span>
                              <strong className="text-blue-600">
                                {formatCurrency(details.summary.grossTotal)}
                              </strong>
                            </div>
                          </div>
                        </Card>
                      </div>
                      
                      {/* 취소된 수업 */}
                      {record.cancelledSessions > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
                          <div className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                            취소된 수업 (정산 제외)
                          </div>
                          <div className="text-sm text-red-600 dark:text-red-400">
                            {record.cancelledSessions}차시 (예상 금액: {formatCurrency(record.cancelledAmountPreview)})
                          </div>
                        </div>
                      )}
                    </div>
                  )
                },
                expandIcon: ({ expanded, onExpand, record }) => (
                  <button
                    onClick={(e) => {
                      onExpand(record, e)
                    }}
                    className="p-1"
                  >
                    {expanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                ),
              }}
            />
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
