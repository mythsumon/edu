'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Table, Card, Input, Button, Select, DatePicker, Modal, Space, Badge, Tooltip, Tabs } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Search, Eye, Info, Calendar, DollarSign, MapPin } from 'lucide-react'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/ko'
import type { TravelSettlementRow, DailyTravelRecord } from '@/entities/settlement'
import { 
  getSettlementRows,
  getDailyTravelRecords
} from '@/entities/settlement/settlement-store'
import { useAuth } from '@/contexts/AuthContext'
import { AllowanceRateTable } from '@/components/shared/common'

dayjs.locale('ko')

const { RangePicker } = DatePicker

// Tooltip texts
const TRAVEL_EXPENSE_TOOLTIP = "여비(출장비)는 강사 기준으로 일별로 계산됩니다.\n• 같은 날 여러 교육이 있는 경우: 집 → 기관1 → 기관2 → ... → 집 경로의 총 거리로 계산\n• 같은 시군 내 이동은 0km로 처리\n• 거리 구간별 정책: 50~70km=2만원, 70~90km=3만원, 90~110km=4만원, 110~130km=5만원, 130km 이상=6만원\n• 같은 날 여러 교육이 있어도 여비는 하루에 한 번만 지급"
const ALLOWANCE_TOOLTIP = "기본 강사료는 차시 × 역할별 금액으로 계산됩니다.\n• 주강사: 차시당 40,000원\n• 보조강사: 차시당 30,000원\n• 학교 유형(초등/중/고/특수/도서벽지)에 따른 추가 수당은 별도로 계산됩니다."
const WEEKEND_ALLOWANCE_TOOLTIP = "휴일/주말수당: 주말(토요일/일요일) 차시당 5,000원\n• 단, 행사참여인 경우 주말수당은 지급되지 않습니다."
const EXTRA_ALLOWANCE_TOOLTIP = "추가 수당: 학생 15명 이상 + 보조강사 없음 → 차시당 5,000원\n• 주강사에게만 지급되며, 보조강사는 제외됩니다."
const REMOTE_ISLAND_TOOLTIP = "도서·벽지 수당: 차시당 5,000원\n• 도서·벽지 학교에서 교육 시 지급\n• 지역 내외 관계없이 지급됩니다."
const SPECIAL_EDUCATION_TOOLTIP = "특별수당: 차시당 10,000원\n• 특수학교 또는 일반학교의 특수학급에서 교육 시 지급됩니다."
const MIDDLE_HIGH_TOOLTIP = "중고등부 수당:\n• 중학교: 차시당 5,000원\n• 고등학교: 차시당 10,000원"
const EQUIPMENT_TRANSPORT_TOOLTIP = "교구 운반 수당: 일당 20,000원\n• 교구를 픽업하거나 반납하는 날 지급\n• 월 최대 300,000원까지 지급 (월 한도 적용)"
const EVENT_PARTICIPATION_TOOLTIP = "행사참여수당: 시간당 25,000원\n• 공식 행사 지원 시 지급\n• 행사참여 시 주말수당은 지급되지 않습니다."
const MENTORING_TOOLTIP = "멘토링 수당:\n• 방법 A: 차시당 10,000원\n• 방법 B: 시간당 40,000원 (1-3시간, 일 최대 3시간)"
const TAX_TOOLTIP = "세금 공제: 3.3% (사업소득세 포함 지방소득세)\n• 총액에서 세금을 공제한 순지급액이 입금됩니다."

export default function InstructorSettlementsPage() {
  const { userProfile } = useAuth()
  const [rows, setRows] = useState<TravelSettlementRow[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [monthFilter, setMonthFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<TravelSettlementRow | null>(null)
  const [activeTab, setActiveTab] = useState<'list' | 'daily'>('list')

  // Get current instructor ID and name
  const currentInstructorId = userProfile?.userId || 'instructor-1'
  const currentInstructorName = userProfile?.name || '홍길동'

  useEffect(() => {
    loadSettlements()
    
    // Listen for settlement updates
    const handleSettlementUpdate = () => {
      loadSettlements()
    }
    window.addEventListener('settlementUpdated', handleSettlementUpdate)
    
    return () => {
      window.removeEventListener('settlementUpdated', handleSettlementUpdate)
    }
  }, [currentInstructorId])

  const loadSettlements = () => {
    setLoading(true)
    try {
      const allRows = getSettlementRows()
      // Filter by current instructor
      const instructorRows = allRows.filter(row => 
        row.instructorId === currentInstructorId || 
        row.instructorName === currentInstructorName
      )
      setRows(instructorRows)
    } catch (error) {
      console.error('Failed to load settlements:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter data
  const filteredData = useMemo(() => {
    return rows.filter((row) => {
      // Search filter
      if (searchText) {
        const searchLower = searchText.toLowerCase()
        const matchesSearch = 
          row.educationId.toLowerCase().includes(searchLower) ||
          row.educationName.toLowerCase().includes(searchLower) ||
          row.institutionName.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Status filter
      if (statusFilter !== 'all' && row.educationStatus !== statusFilter) {
        return false
      }

      // Month filter
      if (monthFilter) {
        const rowMonth = dayjs(row.periodStart).format('YYYY-MM')
        if (rowMonth !== monthFilter) {
          return false
        }
      }

      return true
    })
  }, [rows, searchText, monthFilter, statusFilter])

  // Group by month for summary
  const monthlySummary = useMemo(() => {
    const summary = new Map<string, {
      totalRows: number
      totalTravelExpense: number
      totalAllowance: number
      totalPay: number
    }>()

    filteredData.forEach(row => {
      const month = dayjs(row.periodStart).format('YYYY-MM')
      const existing = summary.get(month) || {
        totalRows: 0,
        totalTravelExpense: 0,
        totalAllowance: 0,
        totalPay: 0,
      }

      existing.totalRows++
      existing.totalTravelExpense += row.travelExpense
      existing.totalAllowance += row.allowanceTotal
      existing.totalPay += row.totalPay

      summary.set(month, existing)
    })

    return Array.from(summary.entries()).map(([month, data]) => ({
      month,
      ...data,
    }))
  }, [filteredData])

  // Group by date for daily travel view
  const dailyTravelData = useMemo(() => {
    const dailyTravelRecords = getDailyTravelRecords()
    const instructorDailyRecords = dailyTravelRecords.filter(record =>
      record.instructorId === currentInstructorId || 
      record.instructorName === currentInstructorName
    )

    // Group settlement rows by date
    const rowsByDate = new Map<string, TravelSettlementRow[]>()
    filteredData.forEach(row => {
      if (row.date) {
        const dateKey = row.date
        const existing = rowsByDate.get(dateKey) || []
        existing.push(row)
        rowsByDate.set(dateKey, existing)
      }
    })

    return Array.from(rowsByDate.entries())
      .map(([date, rows]) => {
        const dailyRecord = instructorDailyRecords.find(r => r.date === date)
        return {
          date,
          dailyRecord,
          rows,
          totalTravelExpense: dailyRecord?.travelExpense || rows[0]?.travelExpense || 0,
          totalAllowance: rows.reduce((sum, r) => sum + r.allowanceTotal, 0),
          totalPay: (dailyRecord?.travelExpense || rows[0]?.travelExpense || 0) + rows.reduce((sum, r) => sum + r.allowanceTotal, 0),
        }
      })
      .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
  }, [filteredData, currentInstructorId, currentInstructorName])

  // Table columns for list view
  const columns: ColumnsType<TravelSettlementRow> = useMemo(() => [
    {
      title: '교육ID',
      dataIndex: 'educationId',
      key: 'educationId',
      width: 120,
      fixed: 'left',
    },
    {
      title: '교육명',
      dataIndex: 'educationName',
      key: 'educationName',
      width: 200,
      ellipsis: true,
    },
    {
      title: '기관명',
      dataIndex: 'institutionName',
      key: 'institutionName',
      width: 150,
    },
    {
      title: '기간',
      key: 'period',
      width: 180,
      render: (_, record) => (
        <span>
          {dayjs(record.periodStart).format('YYYY.MM.DD')} ~ {dayjs(record.periodEnd).format('YYYY.MM.DD')}
        </span>
      ),
    },
    {
      title: '역할',
      dataIndex: 'role',
      key: 'role',
      width: 80,
      render: (role: string) => role === 'main' ? '주강사' : '보조강사',
    },
    {
      title: '차시',
      dataIndex: 'totalSessions',
      key: 'totalSessions',
      width: 60,
      align: 'center',
    },
    {
      title: (
        <span className="flex items-center gap-1">
          출장비
          <Tooltip title={TRAVEL_EXPENSE_TOOLTIP}>
            <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
          </Tooltip>
        </span>
      ),
      dataIndex: 'travelExpense',
      key: 'travelExpense',
      width: 100,
      align: 'right',
      render: (amount: number, record) => (
        <span>
          {amount.toLocaleString()}원
          {record.dailyTravelRecordId && (
            <Tooltip title="이 출장비는 같은 날 다른 교육과 함께 일별 경로로 계산되었습니다.">
              <Badge count="일별" style={{ backgroundColor: '#1890ff', marginLeft: 4 }} />
            </Tooltip>
          )}
        </span>
      ),
    },
    {
      title: (
        <span className="flex items-center gap-1">
          수당
          <Tooltip title={ALLOWANCE_TOOLTIP + '\n\n' + WEEKEND_ALLOWANCE_TOOLTIP + '\n\n' + EXTRA_ALLOWANCE_TOOLTIP}>
            <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
          </Tooltip>
        </span>
      ),
      dataIndex: 'allowanceTotal',
      key: 'allowanceTotal',
      width: 120,
      align: 'right',
      render: (amount: number, record) => (
        <span>
          {amount.toLocaleString()}원
          {record.allowanceExtra && record.allowanceExtra > 0 && (
            <Tooltip title={`추가 수당: ${record.allowanceExtra.toLocaleString()}원 (15명 이상 + 보조강사 없음)`}>
              <Badge count="추가" style={{ backgroundColor: '#faad14', marginLeft: 4 }} />
            </Tooltip>
          )}
        </span>
      ),
    },
    {
      title: '총 지급액',
      dataIndex: 'totalPay',
      key: 'totalPay',
      width: 120,
      align: 'right',
      render: (amount: number) => <strong>{amount.toLocaleString()}원</strong>,
    },
    {
      title: '상태',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <Badge 
          status={record.isCountingEligible ? 'success' : 'default'} 
          text={record.educationStatus}
        />
      ),
    },
    {
      title: '작업',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          icon={<Eye className="w-4 h-4" />}
          onClick={() => {
            setSelectedRow(record)
            setDetailModalOpen(true)
          }}
        >
          상세
        </Button>
      ),
    },
  ], [])

  // Generate month options for filter
  const monthOptions = useMemo(() => {
    const months = new Set<string>()
    rows.forEach(row => {
      if (row.periodStart) {
        months.add(dayjs(row.periodStart).format('YYYY-MM'))
      }
    })
    return Array.from(months).sort().reverse()
  }, [rows])

  // Get unique statuses for filter
  const statusOptions = useMemo(() => {
    const statuses = new Set<string>()
    rows.forEach(row => {
      if (row.educationStatus) {
        statuses.add(row.educationStatus)
      }
    })
    return Array.from(statuses).sort()
  }, [rows])

  return (
    <ProtectedRoute requiredRole="instructor">
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800">정산 내역</h1>
            <p className="text-sm text-slate-500 mt-1">
              내 출장비와 수당 내역을 확인할 수 있습니다.
            </p>
          </div>

          {/* Summary Cards */}
          {monthlySummary.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {monthlySummary.map(summary => (
                <Card key={summary.month} className="text-center">
                  <div className="text-sm text-slate-500 mb-2">
                    {dayjs(summary.month).format('YYYY년 MM월')}
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mb-1">
                    {summary.totalPay.toLocaleString()}원
                  </div>
                  <div className="text-xs text-slate-400">
                    {summary.totalRows}건
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Tabs */}
          <Card className="mb-6">
            <Tabs
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key as 'list' | 'daily')}
              items={[
                {
                  key: 'list',
                  label: '교육별 내역',
                  children: (
                    <>
                      {/* Filters */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <Input
                          placeholder="교육ID, 교육명, 기관명 검색"
                          prefix={<Search className="w-4 h-4 text-gray-400" />}
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          allowClear
                        />
                        <Select
                          placeholder="월 선택"
                          value={monthFilter}
                          onChange={setMonthFilter}
                          allowClear
                          className="w-full"
                        >
                          {monthOptions.map(month => (
                            <Select.Option key={month} value={month}>
                              {dayjs(month).format('YYYY년 MM월')}
                            </Select.Option>
                          ))}
                        </Select>
                        <Select
                          placeholder="상태 선택"
                          value={statusFilter}
                          onChange={setStatusFilter}
                          className="w-full"
                        >
                          <Select.Option value="all">전체</Select.Option>
                          {statusOptions.map(status => (
                            <Select.Option key={status} value={status}>
                              {status}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>

                      {/* Table */}
                      <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                          pageSize: 20,
                          showSizeChanger: true,
                          showTotal: (total) => `총 ${total}건`,
                        }}
                        scroll={{ x: 'max-content' }}
                      />
                    </>
                  ),
                },
                {
                  key: 'daily',
                  label: '일별 출장비',
                  children: (
                    <div className="space-y-4">
                      {dailyTravelData.map(({ date, dailyRecord, rows, totalTravelExpense, totalAllowance, totalPay }) => (
                        <Card key={date} className="border-l-4 border-l-blue-500">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                <span className="font-semibold text-lg">
                                  {dayjs(date).format('YYYY년 MM월 DD일 (ddd)')}
                                </span>
                              </div>
                              {dailyRecord && (
                                <div className="text-sm text-slate-600 ml-6">
                                  <div className="flex items-center gap-2 mb-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>방문 기관: {dailyRecord.institutions.length}곳</span>
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {dailyRecord.institutions.map((inst, idx) => (
                                      <span key={idx}>
                                        {inst.institutionName}
                                        {idx < dailyRecord.institutions.length - 1 && ', '}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-slate-500 mb-1">총 지급액</div>
                              <div className="text-2xl font-bold text-blue-600">
                                {totalPay.toLocaleString()}원
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                              <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                                출장비
                                <Tooltip title={TRAVEL_EXPENSE_TOOLTIP}>
                                  <Info className="w-3 h-3 text-slate-400 cursor-help" />
                                </Tooltip>
                              </div>
                              <div className="font-semibold">{totalTravelExpense.toLocaleString()}원</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 mb-1">수당 합계</div>
                              <div className="font-semibold">{totalAllowance.toLocaleString()}원</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 mb-1">교육 수</div>
                              <div className="font-semibold">{rows.length}건</div>
                            </div>
                          </div>
                          <div className="border-t pt-3">
                            <div className="text-xs text-slate-500 mb-2">교육 내역:</div>
                            <div className="space-y-1">
                              {rows.map((row) => (
                                <div key={row.id} className="flex items-center justify-between text-sm">
                                  <span>
                                    {row.educationName} ({row.role === 'main' ? '주강사' : '보조강사'})
                                  </span>
                                  <span className="font-medium">
                                    {row.allowanceTotal.toLocaleString()}원
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Card>
                      ))}
                      {dailyTravelData.length === 0 && (
                        <div className="text-center py-8 text-slate-400">
                          일별 출장비 내역이 없습니다.
                        </div>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </Card>

          {/* Detail Modal */}
          <Modal
            title="정산 상세 정보"
            open={detailModalOpen}
            onCancel={() => {
              setDetailModalOpen(false)
              setSelectedRow(null)
            }}
            footer={[
              <Button key="close" onClick={() => {
                setDetailModalOpen(false)
                setSelectedRow(null)
              }}>
                닫기
              </Button>,
            ]}
            width={800}
          >
            {selectedRow && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-500">교육ID</div>
                    <div className="font-medium">{selectedRow.educationId}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">교육명</div>
                    <div className="font-medium">{selectedRow.educationName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">기관명</div>
                    <div className="font-medium">{selectedRow.institutionName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">역할</div>
                    <div className="font-medium">
                      {selectedRow.role === 'main' ? '주강사' : '보조강사'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">차시 수</div>
                    <div className="font-medium">{selectedRow.totalSessions}회</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">상태</div>
                    <div className="font-medium">{selectedRow.educationStatus}</div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">정산 내역</h3>
                  
                  {/* 학교 유형별 차시당 단가 표 */}
                  <AllowanceRateTable />
                  
                  {/* 계산 흐름 표시 */}
                  <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      계산 흐름
                      <Tooltip title="정산 계산은 다음 순서로 진행됩니다: 1) 여비 계산, 2) 기본 강사료, 3) 각종 수당, 4) 합계, 5) 세금 공제 후 순지급액">
                        <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
                      </Tooltip>
                    </h4>
                    <div className="space-y-2.5 text-sm text-slate-600">
                      <div className="flex items-start gap-2">
                        <span className="text-slate-400 font-mono">1.</span>
                        <div className="flex-1">
                          <span className="font-medium text-slate-700 flex items-center gap-1">
                            여비(출장비)
                            <Tooltip title={TRAVEL_EXPENSE_TOOLTIP}>
                              <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
                            </Tooltip>
                          </span>
                          {selectedRow.dailyTravelRecordId ? (
                            <>
                              <div className="text-xs text-slate-500 mt-0.5 ml-4">
                                같은 날({selectedRow.date}) 다른 교육과 함께 일별 경로로 계산
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5 ml-4">
                                집 → 기관1 → 기관2 → ... → 집 경로의 총 거리에 따른 정책 금액
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5 ml-4">
                                (31개 시군청간 거리표 기준, 같은 시군 내 이동 = 0km)
                              </div>
                            </>
                          ) : (
                            <div className="text-xs text-slate-500 mt-0.5 ml-4">
                              거리 {selectedRow.distanceKm.toFixed(1)}km에 따른 정책 금액
                            </div>
                          )}
                          <div className="text-slate-700 mt-1 ml-4">
                            = <span className="font-semibold">{selectedRow.travelExpense.toLocaleString()}원</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-slate-400 font-mono">2.</span>
                        <div className="flex-1">
                          <span className="font-medium text-slate-700 flex items-center gap-1">
                            기본 강사료
                            <Tooltip title={ALLOWANCE_TOOLTIP}>
                              <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
                            </Tooltip>
                          </span>
                          <div className="text-xs text-slate-500 mt-0.5 ml-4">
                            차시 {selectedRow.totalSessions}회 × {selectedRow.role === 'main' ? '40,000원 (주강사)' : '30,000원 (보조강사)'}
                          </div>
                          <div className="text-slate-700 mt-1 ml-4">
                            = {selectedRow.totalSessions} × {selectedRow.role === 'main' ? '40,000' : '30,000'} = <span className="font-semibold">{selectedRow.allowanceBase.toLocaleString()}원</span>
                          </div>
                        </div>
                      </div>
                      {selectedRow.allowanceWeekend && selectedRow.allowanceWeekend > 0 && (
                        <div className="flex items-start gap-2">
                          <span className="text-slate-400 font-mono">3.</span>
                          <div className="flex-1">
                            <span className="font-medium text-slate-700 flex items-center gap-1">
                              휴일/주말수당
                              <Tooltip title={WEEKEND_ALLOWANCE_TOOLTIP}>
                                <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
                              </Tooltip>
                            </span>
                            <div className="text-xs text-slate-500 mt-0.5 ml-4">
                              주말 차시(토/일) × 5,000원
                              {selectedRow.allowanceWeekend ? ` (주말 ${Math.round((selectedRow.allowanceWeekend || 0) / 5000)}회)` : ' (주말 차시 없음)'}
                            </div>
                            <div className="text-slate-700 mt-1 ml-4">
                              = {selectedRow.allowanceWeekend ? `${Math.round((selectedRow.allowanceWeekend || 0) / 5000)} × 5,000` : '0'} = <span className="font-semibold">{(selectedRow.allowanceWeekend || 0).toLocaleString()}원</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {selectedRow.allowanceExtra && selectedRow.allowanceExtra > 0 && (
                        <div className="flex items-start gap-2">
                          <span className="text-slate-400 font-mono">{selectedRow.allowanceWeekend && selectedRow.allowanceWeekend > 0 ? '4.' : '3.'}</span>
                          <div className="flex-1">
                            <span className="font-medium text-slate-700 flex items-center gap-1">
                              추가 수당 (15명 이상 + 보조강사 없음)
                              <Tooltip title={EXTRA_ALLOWANCE_TOOLTIP}>
                                <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
                              </Tooltip>
                            </span>
                            <div className="text-xs text-slate-500 mt-0.5 ml-4">
                              학생 15명 이상 + 보조강사 없음 → 차시당 5,000원
                            </div>
                            <div className="text-slate-700 mt-1 ml-4">
                              = {selectedRow.totalSessions} × 5,000 = <span className="font-semibold">{selectedRow.allowanceExtra.toLocaleString()}원</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <span className="text-slate-400 font-mono">
                          {(() => {
                            let step = 3
                            if (selectedRow.allowanceWeekend && selectedRow.allowanceWeekend > 0) step++
                            if (selectedRow.allowanceExtra && selectedRow.allowanceExtra > 0) step++
                            return step
                          })()}.
                        </span>
                        <div className="flex-1">
                          <span className="font-medium text-slate-700">수당 합계</span>
                          <div className="text-slate-700 mt-1 ml-4">
                            = 기본금{selectedRow.allowanceWeekend && selectedRow.allowanceWeekend > 0 ? ' + 주말수당' : ''}{selectedRow.allowanceExtra && selectedRow.allowanceExtra > 0 ? ' + 추가수당' : ''} = {selectedRow.allowanceBase.toLocaleString()}{selectedRow.allowanceWeekend && selectedRow.allowanceWeekend > 0 ? ` + ${(selectedRow.allowanceWeekend || 0).toLocaleString()}` : ''}{selectedRow.allowanceExtra && selectedRow.allowanceExtra > 0 ? ` + ${selectedRow.allowanceExtra.toLocaleString()}` : ''} = <span className="font-semibold">{selectedRow.allowanceTotal.toLocaleString()}원</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 pt-2 border-t-2 border-slate-300">
                        <span className="text-blue-600 font-bold font-mono">총</span>
                        <div className="flex-1">
                          <span className="font-bold text-blue-600 text-base">총액 (세전)</span>
                          <div className="text-blue-600 font-bold mt-1 ml-4 text-base">
                            = 여비 + 수당 합계 = {selectedRow.travelExpense.toLocaleString()} + {selectedRow.allowanceTotal.toLocaleString()} = <span className="text-lg">{selectedRow.totalPay.toLocaleString()}원</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 pt-2 border-t border-slate-200">
                        <span className="text-green-600 font-bold font-mono">세</span>
                        <div className="flex-1">
                          <span className="font-bold text-green-600 text-base flex items-center gap-1">
                            세금 공제 후 순지급액
                            <Tooltip title={TAX_TOOLTIP}>
                              <Info className="w-3 h-3 text-green-400 hover:text-green-600 transition-colors cursor-help" />
                            </Tooltip>
                          </span>
                          <div className="text-green-600 font-bold mt-1 ml-4 text-base">
                            = 총액 {selectedRow.totalPay.toLocaleString()}원 - 세금 {Math.round(selectedRow.totalPay * 0.033).toLocaleString()}원 (3.3%) = <span className="text-lg">{Math.round(selectedRow.totalPay * 0.967).toLocaleString()}원</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        출장비
                        <Tooltip title={TRAVEL_EXPENSE_TOOLTIP}>
                          <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
                        </Tooltip>
                      </div>
                      <div className="font-medium text-lg">
                        {selectedRow.travelExpense.toLocaleString()}원
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        기본금
                        <Tooltip title={ALLOWANCE_TOOLTIP}>
                          <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
                        </Tooltip>
                      </div>
                      <div className="font-medium">{selectedRow.allowanceBase.toLocaleString()}원</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        주말수당
                        <Tooltip title={WEEKEND_ALLOWANCE_TOOLTIP}>
                          <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
                        </Tooltip>
                      </div>
                      <div className="font-medium">{(selectedRow.allowanceWeekend || 0).toLocaleString()}원</div>
                    </div>
                    {selectedRow.allowanceExtra && selectedRow.allowanceExtra > 0 && (
                      <div>
                        <div className="text-sm text-slate-500 flex items-center gap-1">
                          추가 수당
                          <Tooltip title={EXTRA_ALLOWANCE_TOOLTIP}>
                            <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
                          </Tooltip>
                        </div>
                        <div className="font-medium">{selectedRow.allowanceExtra.toLocaleString()}원</div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        수당 (합계)
                        <Tooltip title={ALLOWANCE_TOOLTIP + '\n\n' + WEEKEND_ALLOWANCE_TOOLTIP + '\n\n' + EXTRA_ALLOWANCE_TOOLTIP}>
                          <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
                        </Tooltip>
                      </div>
                      <div className="font-medium text-lg">
                        {selectedRow.allowanceTotal.toLocaleString()}원
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm text-slate-500">총 지급액</div>
                      <div className="font-bold text-2xl text-blue-600">
                        {selectedRow.totalPay.toLocaleString()}원
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </ProtectedRoute>
  )
}
