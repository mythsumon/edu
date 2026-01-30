'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Table, Card, Input, Button, Select, DatePicker, Modal, Form, InputNumber, Space, Badge, message, Switch, Tooltip } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Search, Filter, Download, Eye, Edit, RotateCcw, Settings, Info, MapPin, Calendar, User } from 'lucide-react'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/ko'
import type { TravelSettlementRow, PaymentCountingMode, DailyTravelRecord } from '@/entities/settlement'
import { 
  getSettlementRows, 
  getDailyTravelRecords,
  updateSettlementRow, 
  removeSettlementOverride,
  initializeSettlementStore 
} from '@/entities/settlement/settlement-store'
import { 
  getPaymentCountingMode, 
  setPaymentCountingMode 
} from '@/entities/settlement/payment-counting-mode'
import { AllowanceRateTable } from '@/components/shared/common'

dayjs.locale('ko')

const { RangePicker } = DatePicker
const { TextArea } = Input

// Tooltip texts for settlement explanations
const TRAVEL_EXPENSE_TOOLTIP = "출장비는 강사 기준으로 일별로 계산됩니다.\n같은 날 여러 교육이 있는 경우, 집 → 기관1 → 기관2 → ... → 집 경로의 총 거리로 계산됩니다.\n최종 구현에서는 카카오맵 API를 사용하여 실제 경로 거리를 계산하고 지도 이미지를 저장합니다."
const DISTANCE_RULE_TOOLTIP = "거리 기반 출장비는 연도별 사업 규칙을 따릅니다 (예: 100km 이상 → 60,000원).\n같은 날 여러 교육이 있어도 출장비는 하루에 한 번만 지급됩니다.\n이 규칙은 연도별로 설정 가능합니다."
const ALLOWANCE_TOOLTIP = "기본금은 차시 × 학교유형별 금액으로 계산됩니다.\n(초등/중/고/특수/도서벽지별 차시당 금액)\n주강사와 보조강사는 별도의 단가가 적용됩니다."
const WEEKEND_ALLOWANCE_TOOLTIP = "주말수당은 주말(토요일/일요일) 차시당 5천원이 지급됩니다.\n차시별로 계산되며, 교육별로 합산됩니다."
const EXTRA_ALLOWANCE_TOOLTIP = "추가 수당: 학생 15명 이상 + 보조강사 없음 → 차시당 5천원\n주강사에게만 지급되며, 보조강사는 제외됩니다."
const ADDITIONAL_ALLOWANCE_TOOLTIP = "중학교, 특수학급, 농어촌 학교는 고정된 추가 수당을 받습니다."
const STATUS_POLICY_TOOLTIP = "정산 계산은 선택된 정책을 따릅니다:\n옵션 A: 확정 및 종료 상태의 교육만 계산됩니다.\n옵션 B: 배정된 강사는 상태와 관계없이 계산됩니다.\n(현재 프로토타입에서는 설명을 위해 하나의 정책을 가정합니다.)"
const COMPLETION_TOOLTIP = "완료 건수는 성과 분석에만 사용됩니다.\n정산이나 문서 승인과는 관련이 없습니다."
const SESSION_RULE_TOOLTIP = "총 차시가 4회 이상인 교육만 완료 통계에 포함됩니다.\n2-3회 교육은 완료 건수에서 제외됩니다."
const TBD_TOOLTIP = "주강사가 없는 교육은 현재 완료 건수에서 제외됩니다.\n이 규칙은 확인이 필요합니다."
const COUNTING_ELIGIBLE_TOOLTIP = "정산 계산 대상만 표시합니다.\n현재 설정된 정산 계산 모드에 따라 결정됩니다."
const DAILY_TRAVEL_TOOLTIP = "출장비는 강사별, 일별로 집계됩니다.\n같은 날 여러 교육이 있으면 하나의 경로로 계산되어 하루에 한 번만 지급됩니다."

export default function TravelSettlementPage() {
  const [rows, setRows] = useState<TravelSettlementRow[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [monthFilter, setMonthFilter] = useState<string | null>(null)
  const [institutionFilter, setInstitutionFilter] = useState<string>('')
  const [instructorFilter, setInstructorFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [countingEligibleOnly, setCountingEligibleOnly] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [overrideModalOpen, setOverrideModalOpen] = useState(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<TravelSettlementRow | null>(null)
  const [selectedDailyRecord, setSelectedDailyRecord] = useState<DailyTravelRecord | null>(null)
  const [dailyTravelModalOpen, setDailyTravelModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'education' | 'daily'>('education')
  const [paymentCountingMode, setPaymentCountingModeState] = useState<PaymentCountingMode>(getPaymentCountingMode())
  const [form] = Form.useForm()

  // Initialize store on mount
  useEffect(() => {
    initializeSettlementStore()
    loadSettlements()
    
    // Listen for settlement updates
    const handleSettlementUpdate = () => {
      loadSettlements()
    }
    window.addEventListener('settlementUpdated', handleSettlementUpdate)
    
    return () => {
      window.removeEventListener('settlementUpdated', handleSettlementUpdate)
    }
  }, [])

  const loadSettlements = () => {
    setLoading(true)
    try {
      const settlementRows = getSettlementRows()
      setRows(settlementRows)
    } catch (error) {
      console.error('Failed to load settlements:', error)
      message.error('정산 데이터를 불러오는데 실패했습니다.')
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
          row.institutionName.toLowerCase().includes(searchLower) ||
          row.instructorName.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Institution filter
      if (institutionFilter) {
        if (!row.institutionName.toLowerCase().includes(institutionFilter.toLowerCase())) {
          return false
        }
      }

      // Instructor filter
      if (instructorFilter) {
        if (!row.instructorName.toLowerCase().includes(instructorFilter.toLowerCase())) {
          return false
        }
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

      // Counting eligible only
      if (countingEligibleOnly && !row.isCountingEligible) {
        return false
      }

      return true
    })
  }, [rows, searchText, monthFilter, institutionFilter, instructorFilter, statusFilter, countingEligibleOnly])

  // Group by instructor and date for instructor-based view
  const instructorGroupedData = useMemo(() => {
    // First group by instructor
    const instructorMap = new Map<string, {
      instructorId: string
      instructorName: string
      rows: TravelSettlementRow[]
      totalTravelExpense: number
      totalAllowance: number
      totalPay: number
      educationCount: number
      dateGroups: Map<string, TravelSettlementRow[]>
    }>()

    filteredData.forEach(row => {
      const instructorKey = `${row.instructorId}_${row.instructorName}`
      const existing = instructorMap.get(instructorKey) || {
        instructorId: row.instructorId,
        instructorName: row.instructorName,
        rows: [],
        totalTravelExpense: 0,
        totalAllowance: 0,
        totalPay: 0,
        educationCount: 0,
        dateGroups: new Map<string, TravelSettlementRow[]>(),
      }

      existing.rows.push(row)
      existing.totalTravelExpense += row.travelExpense
      existing.totalAllowance += row.allowanceTotal
      existing.totalPay += row.totalPay
      existing.educationCount = new Set(existing.rows.map(r => r.educationId)).size

      // Group by date within instructor
      const dateKey = row.date || row.periodStart || ''
      if (dateKey) {
        const dateGroup = existing.dateGroups.get(dateKey) || []
        dateGroup.push(row)
        existing.dateGroups.set(dateKey, dateGroup)
      }

      instructorMap.set(instructorKey, existing)
    })

    // Sort rows within each instructor by date (newest first, then by date)
    const result = Array.from(instructorMap.values()).map(group => {
      // Sort rows by date (periodStart or date) - oldest first
      group.rows.sort((a, b) => {
        const dateA = a.date || a.periodStart || ''
        const dateB = b.date || b.periodStart || ''
        const dateDiff = dayjs(dateA).valueOf() - dayjs(dateB).valueOf()
        // If same date, sort by education name
        if (dateDiff === 0) {
          return a.educationName.localeCompare(b.educationName)
        }
        return dateDiff
      })
      
      return group
    }).sort((a, b) => {
      // Sort instructors by name
      const nameCompare = a.instructorName.localeCompare(b.instructorName)
      if (nameCompare !== 0) return nameCompare
      // If same name, sort by total pay (descending)
      return b.totalPay - a.totalPay
    })

    return result
  }, [filteredData])

  // Group by month for summary
  const monthlySummary = useMemo(() => {
    const summary = new Map<string, {
      totalRows: number
      totalTravelExpense: number
      totalAllowance: number
      totalPay: number
      eligibleRows: number
    }>()

    filteredData.forEach(row => {
      const month = dayjs(row.periodStart).format('YYYY-MM')
      const existing = summary.get(month) || {
        totalRows: 0,
        totalTravelExpense: 0,
        totalAllowance: 0,
        totalPay: 0,
        eligibleRows: 0,
      }

      existing.totalRows++
      existing.totalTravelExpense += row.travelExpense
      existing.totalAllowance += row.allowanceTotal
      existing.totalPay += row.totalPay
      if (row.isCountingEligible) {
        existing.eligibleRows++
      }

      summary.set(month, existing)
    })

    return Array.from(summary.entries()).map(([month, data]) => ({
      month,
      ...data,
    }))
  }, [filteredData])

  // Group by instructor and date for daily travel view
  const dailyTravelData = useMemo(() => {
    const dailyTravelRecords = getDailyTravelRecords()
    
    // Filter by search and filters
    let filteredRecords = dailyTravelRecords
    
    if (instructorFilter) {
      filteredRecords = filteredRecords.filter(record =>
        record.instructorName.toLowerCase().includes(instructorFilter.toLowerCase())
      )
    }
    
    if (monthFilter) {
      filteredRecords = filteredRecords.filter(record => {
        const recordMonth = dayjs(record.date).format('YYYY-MM')
        return recordMonth === monthFilter
      })
    }

    // Group by instructor and month for display
    const grouped = new Map<string, DailyTravelRecord[]>()
    filteredRecords.forEach(record => {
      const key = `${record.instructorId}_${dayjs(record.date).format('YYYY-MM')}`
      const existing = grouped.get(key) || []
      existing.push(record)
      grouped.set(key, existing)
    })

    return Array.from(grouped.entries()).map(([key, records]) => {
      const [instructorId, month] = key.split('_')
      const instructorName = records[0]?.instructorName || ''
      const totalTravelExpense = records.reduce((sum, r) => sum + (r.travelExpenseOverride ?? r.travelExpense), 0)
      const totalDistance = records.reduce((sum, r) => sum + (r.distanceKmOverride ?? r.totalDistanceKm), 0)
      
      return {
        instructorId,
        instructorName,
        month,
        records: records.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()),
        totalTravelExpense,
        totalDistance,
      }
    }).sort((a, b) => {
      // Sort by instructor name, then by month
      if (a.instructorName !== b.instructorName) {
        return a.instructorName.localeCompare(b.instructorName)
      }
      return b.month.localeCompare(a.month)
    })
  }, [instructorFilter, monthFilter, rows, filteredData])

  // Table columns (instructor-based view)
  const columns: ColumnsType<TravelSettlementRow> = useMemo(() => [
    {
      title: '날짜',
      key: 'date',
      width: 100,
      fixed: 'left',
      render: (_, record) => {
        const date = record.date || record.periodStart
        if (!date) return '-'
        return (
          <span className="font-medium text-slate-700">
            {dayjs(date).format('M.DD')}
          </span>
        )
      },
      sorter: (a, b) => {
        const dateA = a.date || a.periodStart || ''
        const dateB = b.date || b.periodStart || ''
        return dayjs(dateA).valueOf() - dayjs(dateB).valueOf()
      },
    },
    {
      title: '교육ID',
      dataIndex: 'educationId',
      key: 'educationId',
      width: 120,
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
        <span className="text-sm">
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
      title: (
        <span className="flex items-center gap-1">
          차시
          <Tooltip title={SESSION_RULE_TOOLTIP + '\n\n' + COMPLETION_TOOLTIP}>
            <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
          </Tooltip>
        </span>
      ),
      dataIndex: 'totalSessions',
      key: 'totalSessions',
      width: 60,
      align: 'center',
    },
    {
      title: (
        <span className="flex items-center gap-1">
          거리 (km)
          <Tooltip title={DAILY_TRAVEL_TOOLTIP + '\n\n' + TRAVEL_EXPENSE_TOOLTIP}>
            <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
          </Tooltip>
        </span>
      ),
      dataIndex: 'distanceKm',
      key: 'distanceKm',
      width: 100,
      align: 'right',
      render: (distance: number, record) => (
        <span>
          {distance.toFixed(1)}
          {record.dailyTravelRecordId && (
            <Tooltip title="이 출장비는 같은 날 다른 교육과 함께 일별 경로로 계산되었습니다.">
              <Badge count="일별" style={{ backgroundColor: '#1890ff', marginLeft: 4 }} />
            </Tooltip>
          )}
          {record.distanceKmOverride !== undefined && (
            <Badge count="수정" style={{ backgroundColor: '#52c41a', marginLeft: 4 }} />
          )}
        </span>
      ),
    },
    {
      title: (
        <span className="flex items-center gap-1">
          출장비
          <Tooltip title={DISTANCE_RULE_TOOLTIP}>
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
          {record.travelExpenseOverride !== undefined && (
            <Badge count="수정" style={{ backgroundColor: '#52c41a', marginLeft: 4 }} />
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
          {record.allowanceOverride !== undefined && (
            <Badge count="수정" style={{ backgroundColor: '#52c41a', marginLeft: 4 }} />
          )}
        </span>
      ),
    },
    {
      title: (
        <span className="flex items-center gap-1">
          총 지급액
          <Tooltip title="출장비와 수당의 합계입니다.">
            <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
          </Tooltip>
        </span>
      ),
      dataIndex: 'totalPay',
      key: 'totalPay',
      width: 120,
      align: 'right',
      render: (amount: number) => <strong>{amount.toLocaleString()}원</strong>,
    },
    {
      title: (
        <span className="flex items-center gap-1">
          상태
          <Tooltip title={STATUS_POLICY_TOOLTIP}>
            <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
          </Tooltip>
        </span>
      ),
      key: 'status',
      width: 100,
      render: (_, record) => (
        <Space>
          <Badge 
            status={record.isCountingEligible ? 'success' : 'default'} 
            text={record.educationStatus}
          />
          {record.isCountingEligible && (
            <Badge status="processing" text="계산대상" />
          )}
        </Space>
      ),
    },
    {
      title: '작업',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
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
          <Button
            type="link"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => {
              setSelectedRow(record)
              form.setFieldsValue({
                distanceKmOverride: record.distanceKmOverride ?? record.distanceKm,
                travelExpenseOverride: record.travelExpenseOverride ?? record.travelExpense,
                allowanceOverride: record.allowanceOverride ?? record.allowanceTotal,
                overrideReason: record.overrideReason,
              })
              setOverrideModalOpen(true)
            }}
          >
            수정
          </Button>
        </Space>
      ),
    },
  ], [form])

  const handleOverrideSubmit = async () => {
    if (!selectedRow) return

    try {
      const values = await form.validateFields()
      updateSettlementRow(selectedRow.id, {
        distanceKmOverride: values.distanceKmOverride,
        travelExpenseOverride: values.travelExpenseOverride,
        allowanceOverride: values.allowanceOverride,
        overrideReason: values.overrideReason,
        overrideBy: '관리자', // TODO: Get from auth context
      })
      message.success('정산 정보가 수정되었습니다.')
      setOverrideModalOpen(false)
      setSelectedRow(null)
      form.resetFields()
      loadSettlements()
    } catch (error) {
      console.error('Failed to update settlement:', error)
    }
  }

  const handleRemoveOverride = () => {
    if (!selectedRow) return

    removeSettlementOverride(selectedRow.id)
    message.success('수정 사항이 취소되었습니다.')
    setOverrideModalOpen(false)
    setSelectedRow(null)
    form.resetFields()
    loadSettlements()
  }

  const handlePaymentCountingModeChange = (mode: PaymentCountingMode) => {
    setPaymentCountingMode(mode)
    setPaymentCountingModeState(mode)
    message.success('정산 계산 모드가 변경되었습니다. 정산 데이터를 재계산합니다.')
    loadSettlements()
  }

  const handleExport = () => {
    // TODO: Implement Excel export
    message.info('엑셀 내보내기 기능은 준비 중입니다.')
  }

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
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">출장비 정산 관리</h1>
              <p className="text-sm text-slate-500 mt-1">
                강사의 출장비와 수당을 자동 계산하고 관리합니다. 여비는 강사 기준으로 일별로 계산됩니다.
              </p>
            </div>
            <Space>
              <Button
                type={viewMode === 'education' ? 'primary' : 'default'}
                onClick={() => setViewMode('education')}
              >
                교육별 보기
              </Button>
              <Button
                type={viewMode === 'daily' ? 'primary' : 'default'}
                onClick={() => setViewMode('daily')}
              >
                강사별 일별 여비
              </Button>
              <Button
                icon={<Settings className="w-4 h-4" />}
                onClick={() => setSettingsModalOpen(true)}
              >
                설정
              </Button>
              <Button
                type="primary"
                icon={<Download className="w-4 h-4" />}
                onClick={handleExport}
              >
                내보내기
              </Button>
            </Space>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                placeholder="교육ID, 교육명, 기관명, 강사명 검색"
                prefix={<Search className="w-4 h-4 text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
              <Input
                placeholder="기관명 검색"
                prefix={<Search className="w-4 h-4 text-gray-400" />}
                value={institutionFilter}
                onChange={(e) => setInstitutionFilter(e.target.value)}
                allowClear
              />
              <Input
                placeholder="강사명 검색"
                prefix={<Search className="w-4 h-4 text-gray-400" />}
                value={instructorFilter}
                onChange={(e) => setInstructorFilter(e.target.value)}
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
              <div className="flex items-center">
                <Switch
                  checked={countingEligibleOnly}
                  onChange={setCountingEligibleOnly}
                />
                <span className="ml-2 text-sm">계산 대상만 보기</span>
                <Tooltip title={COUNTING_ELIGIBLE_TOOLTIP}>
                  <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 transition-colors cursor-help ml-1" />
                </Tooltip>
              </div>
            </div>
          </Card>

          {/* Summary Cards */}
          {monthlySummary.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {monthlySummary.map(summary => (
                <Card key={summary.month} className="text-center">
                  <div className="text-sm text-slate-500 mb-2 flex items-center justify-center gap-1">
                    {dayjs(summary.month).format('YYYY년 MM월')}
                    <Tooltip title={STATUS_POLICY_TOOLTIP}>
                      <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
                    </Tooltip>
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mb-1">
                    {summary.totalPay.toLocaleString()}원
                  </div>
                  <div className="text-xs text-slate-400">
                    {summary.totalRows}건 ({summary.eligibleRows}건 계산대상)
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Table or Daily Travel View */}
          {viewMode === 'education' ? (
            <div className="space-y-6">
              {instructorGroupedData.length === 0 ? (
                <Card>
                  <div className="text-center py-8 text-slate-400">
                    정산 데이터가 없습니다.
                  </div>
                </Card>
              ) : (
                instructorGroupedData.map((group) => (
                  <Card 
                    key={group.instructorId} 
                    className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    {/* 강사 헤더 */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-md">
                          <User className="w-7 h-7 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-bold text-2xl text-slate-800 mb-1">{group.instructorName}</div>
                          <div className="text-sm text-slate-500">
                            교육 {group.educationCount}건 · 총 {group.rows.length}건
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl px-6 py-5 border-2 border-blue-200 shadow-sm min-w-[200px]">
                        <div className="text-sm font-semibold text-slate-600 mb-2">총 지급액</div>
                        <div className="text-3xl font-bold text-blue-600 mb-3">
                          {group.totalPay.toLocaleString()}원
                        </div>
                        <div className="space-y-1 text-xs text-slate-600">
                          <div className="flex justify-between">
                            <span>출장비:</span>
                            <span className="font-medium">{group.totalTravelExpense.toLocaleString()}원</span>
                          </div>
                          <div className="flex justify-between">
                            <span>수당:</span>
                            <span className="font-medium">{group.totalAllowance.toLocaleString()}원</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 교육 목록 테이블 */}
                    <div className="overflow-x-auto -mx-6 px-6">
                      <Table
                        columns={columns}
                        dataSource={group.rows}
                        rowKey="id"
                        pagination={false}
                        size="middle"
                        className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:text-slate-700 [&_.ant-table-tbody>tr:hover]:bg-blue-50/50"
                        scroll={{ x: 'max-content' }}
                      />
                    </div>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <Card>
              <div className="space-y-4">
                {dailyTravelData.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    일별 여비 내역이 없습니다.
                  </div>
                ) : (
                  dailyTravelData.map(({ instructorId, instructorName, month, records, totalTravelExpense, totalDistance }) => (
                    <Card key={`${instructorId}_${month}`} className="mb-4 border-l-4 border-l-blue-500">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-5 h-5 text-blue-500" />
                            <span className="font-bold text-lg">{instructorName}</span>
                            <span className="text-slate-500">({dayjs(month).format('YYYY년 MM월')})</span>
                          </div>
                          <div className="text-sm text-slate-600 ml-7">
                            총 {records.length}일, 총 거리: {totalDistance.toFixed(1)}km
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-500 mb-1">총 출장비</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {totalTravelExpense.toLocaleString()}원
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {records.map((record) => {
                          const dayRows = filteredData.filter(row => 
                            row.dailyTravelRecordId === record.id
                          )
                          const dayTotalAllowance = dayRows.reduce((sum, r) => sum + r.allowanceTotal, 0)
                          const dayTotalPay = (record.travelExpenseOverride ?? record.travelExpense) + dayTotalAllowance
                          
                          return (
                            <Card
                              key={record.id}
                              className="bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer"
                              onClick={() => {
                                setSelectedDailyRecord(record)
                                setDailyTravelModalOpen(true)
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Calendar className="w-4 h-4 text-slate-400" />
                                  <span className="font-semibold">
                                    {dayjs(record.date).format('YYYY년 MM월 DD일 (ddd)')}
                                  </span>
                                  <Badge count={`${record.institutions.length}곳`} style={{ backgroundColor: '#1890ff' }} />
                                  {record.routeMapImageUrl && (
                                    <Badge count="지도" style={{ backgroundColor: '#52c41a' }} />
                                  )}
                                </div>
                                <div className="flex items-center gap-6">
                                  <div className="text-right">
                                    <div className="text-xs text-slate-500">총 거리</div>
                                    <div className="font-semibold">
                                      {(record.distanceKmOverride ?? record.totalDistanceKm).toFixed(1)}km
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs text-slate-500">출장비</div>
                                    <div className="font-semibold text-blue-600">
                                      {(record.travelExpenseOverride ?? record.travelExpense).toLocaleString()}원
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs text-slate-500">수당 합계</div>
                                    <div className="font-semibold">
                                      {dayTotalAllowance.toLocaleString()}원
                                    </div>
                                  </div>
                                  <div className="text-right border-l pl-4">
                                    <div className="text-xs text-slate-500">총 지급액</div>
                                    <div className="font-bold text-lg text-blue-600">
                                      {dayTotalPay.toLocaleString()}원
                                    </div>
                                  </div>
                                  <Eye className="w-4 h-4 text-slate-400" />
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-slate-500 ml-7">
                                경로: 집 → {record.institutions.map(inst => inst.institutionName).join(' → ')} → 집
                              </div>
                            </Card>
                          )
                        })}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </Card>
          )}

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
                    <div className="text-sm text-slate-500">기관 카테고리</div>
                    <div className="font-medium">{selectedRow.institutionCategory}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">강사명</div>
                    <div className="font-medium">{selectedRow.instructorName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">역할</div>
                    <div className="font-medium">
                      {selectedRow.role === 'main' ? '주강사' : '보조강사'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">강사 주소</div>
                    <div className="font-medium">{selectedRow.instructorHomeAddress || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">기관 주소</div>
                    <div className="font-medium">{selectedRow.institutionAddress || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 flex items-center gap-1">
                      거리
                      <Tooltip title={TRAVEL_EXPENSE_TOOLTIP}>
                        <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
                      </Tooltip>
                    </div>
                    <div className="font-medium">
                      {selectedRow.distanceKm.toFixed(1)} km
                      <span className="text-xs text-slate-400 ml-2">
                        ({selectedRow.distanceSource})
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">차시 수</div>
                    <div className="font-medium">{selectedRow.totalSessions}회</div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">정산 내역</h3>
                  
                  {/* 학교 유형별 차시당 단가 표 */}
                  <AllowanceRateTable />
                  
                  {/* 계산 흐름 표시 */}
                  <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">계산 흐름</h4>
                    <div className="space-y-2.5 text-sm text-slate-600">
                      <div className="flex items-start gap-2">
                        <span className="text-slate-400 font-mono">1.</span>
                        <div className="flex-1">
                          <span className="font-medium text-slate-700">출장비</span>
                          {selectedRow.dailyTravelRecordId ? (
                            <>
                              <div className="text-xs text-slate-500 mt-0.5 ml-4">
                                같은 날({selectedRow.date}) 다른 교육과 함께 일별 경로로 계산
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5 ml-4">
                                집 → 기관1 → 기관2 → ... → 집 경로의 총 거리에 따른 정책 금액
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
                          <span className="font-medium text-slate-700">기본금</span>
                          <div className="text-xs text-slate-500 mt-0.5 ml-4">
                            차시 {selectedRow.totalSessions}회 × {selectedRow.institutionCategory === 'ELEMENTARY' ? '초등학교' : 
                              selectedRow.institutionCategory === 'MIDDLE' ? '중학교' :
                              selectedRow.institutionCategory === 'HIGH' ? '고등학교' :
                              selectedRow.institutionCategory === 'SPECIAL' ? '특수학교' :
                              selectedRow.institutionCategory === 'ISLAND' ? '도서벽지' : '일반'} 차시당 금액
                            {selectedRow.role === 'main' ? ' (주강사)' : ' (보조강사)'}
                          </div>
                          <div className="text-slate-700 mt-1 ml-4">
                            = {selectedRow.totalSessions} × {Math.round(selectedRow.allowanceBase / selectedRow.totalSessions).toLocaleString()} = <span className="font-semibold">{selectedRow.allowanceBase.toLocaleString()}원</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-slate-400 font-mono">3.</span>
                        <div className="flex-1">
                          <span className="font-medium text-slate-700">주말수당</span>
                          <div className="text-xs text-slate-500 mt-0.5 ml-4">
                            주말 차시(토/일) × 5천원
                            {selectedRow.allowanceWeekend ? ` (주말 ${Math.round((selectedRow.allowanceWeekend || 0) / 5000)}회)` : ' (주말 차시 없음)'}
                          </div>
                          <div className="text-slate-700 mt-1 ml-4">
                            = {selectedRow.allowanceWeekend ? `${Math.round((selectedRow.allowanceWeekend || 0) / 5000)} × 5,000` : '0'} = <span className="font-semibold">{(selectedRow.allowanceWeekend || 0).toLocaleString()}원</span>
                          </div>
                        </div>
                      </div>
                      {selectedRow.allowanceExtra && selectedRow.allowanceExtra > 0 && (
                        <div className="flex items-start gap-2">
                          <span className="text-slate-400 font-mono">4.</span>
                          <div className="flex-1">
                            <span className="font-medium text-slate-700">추가 수당</span>
                            <div className="text-xs text-slate-500 mt-0.5 ml-4">
                              학생 15명 이상 + 보조강사 없음 → 차시당 5천원
                            </div>
                            <div className="text-slate-700 mt-1 ml-4">
                              = {selectedRow.totalSessions} × 5,000 = <span className="font-semibold">{selectedRow.allowanceExtra.toLocaleString()}원</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <span className="text-slate-400 font-mono">{selectedRow.allowanceExtra && selectedRow.allowanceExtra > 0 ? '5.' : '4.'}</span>
                        <div className="flex-1">
                          <span className="font-medium text-slate-700">수당 합계</span>
                          <div className="text-slate-700 mt-1 ml-4">
                            = 기본금 + 주말수당{selectedRow.allowanceExtra && selectedRow.allowanceExtra > 0 ? ' + 추가수당' : ''} = {selectedRow.allowanceBase.toLocaleString()} + {(selectedRow.allowanceWeekend || 0).toLocaleString()}{selectedRow.allowanceExtra && selectedRow.allowanceExtra > 0 ? ` + ${selectedRow.allowanceExtra.toLocaleString()}` : ''} = <span className="font-semibold">{selectedRow.allowanceTotal.toLocaleString()}원</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 pt-2 border-t-2 border-slate-300">
                        <span className="text-blue-600 font-bold font-mono">총</span>
                        <div className="flex-1">
                          <span className="font-bold text-blue-600 text-base">총 지급액</span>
                          <div className="text-blue-600 font-bold mt-1 ml-4 text-base">
                            = 출장비 + 수당 합계 = {selectedRow.travelExpense.toLocaleString()} + {selectedRow.allowanceTotal.toLocaleString()} = <span className="text-lg">{selectedRow.totalPay.toLocaleString()}원</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        출장비
                        <Tooltip title={DISTANCE_RULE_TOOLTIP}>
                          <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
                        </Tooltip>
                      </div>
                      <div className="font-medium text-lg">
                        {selectedRow.travelExpense.toLocaleString()}원
                        {selectedRow.travelExpenseOverride !== undefined && (
                          <Badge count="수정됨" style={{ backgroundColor: '#52c41a', marginLeft: 8 }} />
                        )}
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
                        <Tooltip title={ALLOWANCE_TOOLTIP + '\n\n' + WEEKEND_ALLOWANCE_TOOLTIP}>
                          <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
                        </Tooltip>
                      </div>
                      <div className="font-medium text-lg">
                        {selectedRow.allowanceTotal.toLocaleString()}원
                        {selectedRow.allowanceOverride !== undefined && (
                          <Badge count="수정됨" style={{ backgroundColor: '#52c41a', marginLeft: 8 }} />
                        )}
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
                {selectedRow.overrideReason && (
                  <div className="border-t pt-4">
                    <div className="text-sm text-slate-500">수정 사유</div>
                    <div className="font-medium">{selectedRow.overrideReason}</div>
                    {selectedRow.overrideDate && (
                      <div className="text-xs text-slate-400 mt-1">
                        수정일: {dayjs(selectedRow.overrideDate).format('YYYY-MM-DD HH:mm')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </Modal>

          {/* Override Modal */}
          <Modal
            title="정산 정보 수정"
            open={overrideModalOpen}
            onCancel={() => {
              setOverrideModalOpen(false)
              setSelectedRow(null)
              form.resetFields()
            }}
            onOk={handleOverrideSubmit}
            okText="저장"
            cancelText="취소"
            width={600}
          >
            <Form form={form} layout="vertical">
              <Form.Item
                label="거리 (km)"
                name="distanceKmOverride"
                rules={[{ required: true, message: '거리를 입력해주세요.' }]}
              >
                <InputNumber
                  min={0}
                  step={0.1}
                  className="w-full"
                  formatter={(value) => value ? `${value} km` : ''}
                  parser={(value) => {
                    const num = value?.replace(' km', '') || '0'
                    const result = parseFloat(num) || 0
                    return result as any
                  }}
                />
              </Form.Item>
              <Form.Item
                label="출장비 (원)"
                name="travelExpenseOverride"
                rules={[{ required: true, message: '출장비를 입력해주세요.' }]}
              >
                <InputNumber
                  min={0}
                  step={1000}
                  className="w-full"
                  formatter={(value) => value ? `${value}원` : ''}
                  parser={(value) => {
                    const num = value?.replace('원', '') || '0'
                    const result = parseFloat(num) || 0
                    return result as any
                  }}
                />
              </Form.Item>
              <Form.Item
                label="수당 (원)"
                name="allowanceOverride"
                rules={[{ required: true, message: '수당을 입력해주세요.' }]}
              >
                <InputNumber
                  min={0}
                  step={1000}
                  className="w-full"
                  formatter={(value) => value ? `${value}원` : ''}
                  parser={(value) => {
                    const num = value?.replace('원', '') || '0'
                    const result = parseFloat(num) || 0
                    return result as any
                  }}
                />
              </Form.Item>
              <Form.Item
                label="수정 사유"
                name="overrideReason"
                rules={[{ required: true, message: '수정 사유를 입력해주세요.' }]}
              >
                <TextArea rows={3} placeholder="수정 사유를 입력해주세요." />
              </Form.Item>
            </Form>
            {selectedRow && (
              <div className="mt-4">
                <Button
                  type="link"
                  danger
                  icon={<RotateCcw className="w-4 h-4" />}
                  onClick={handleRemoveOverride}
                >
                  수정 사항 취소
                </Button>
              </div>
            )}
          </Modal>

          {/* Daily Travel Detail Modal */}
          <Modal
            title="일별 여비 상세 정보"
            open={dailyTravelModalOpen}
            onCancel={() => {
              setDailyTravelModalOpen(false)
              setSelectedDailyRecord(null)
            }}
            footer={[
              <Button key="close" onClick={() => {
                setDailyTravelModalOpen(false)
                setSelectedDailyRecord(null)
              }}>
                닫기
              </Button>,
            ]}
            width={900}
          >
            {selectedDailyRecord && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-500">강사명</div>
                    <div className="font-medium text-lg">{selectedDailyRecord.instructorName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">날짜</div>
                    <div className="font-medium">
                      {dayjs(selectedDailyRecord.date).format('YYYY년 MM월 DD일 (ddd)')}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">집 주소</div>
                    <div className="font-medium">{selectedDailyRecord.homeAddress || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">총 거리</div>
                    <div className="font-medium">
                      {(selectedDailyRecord.distanceKmOverride ?? selectedDailyRecord.totalDistanceKm).toFixed(1)}km
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">방문 기관 경로</h3>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>집</span>
                      <span className="text-slate-400">→</span>
                      {selectedDailyRecord.institutions.map((inst, idx) => (
                        <span key={idx} className="flex items-center gap-2">
                          <span>{inst.institutionName}</span>
                          {idx < selectedDailyRecord.institutions.length - 1 && (
                            <span className="text-slate-400">→</span>
                          )}
                        </span>
                      ))}
                      <span className="text-slate-400">→</span>
                      <span>집</span>
                    </div>
                    <div className="space-y-2">
                      {selectedDailyRecord.institutions.map((inst, idx) => (
                        <div key={idx} className="text-sm text-slate-600 pl-4">
                          <span className="font-medium">{idx + 1}.</span> {inst.educationName} ({inst.institutionName})
                          {inst.institutionAddress && (
                            <div className="text-xs text-slate-500 ml-6">{inst.institutionAddress}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {selectedDailyRecord.routeMapImageUrl ? (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">경로 지도</h3>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <img 
                        src={selectedDailyRecord.routeMapImageUrl} 
                        alt="경로 지도" 
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">경로 지도</h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                      <Info className="w-4 h-4 inline mr-2" />
                      지도 이미지가 아직 생성되지 않았습니다. Kakao Maps API 연동 후 자동으로 생성됩니다.
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">정산 내역</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-slate-500">출장비</div>
                      <div className="font-medium text-lg">
                        {(selectedDailyRecord.travelExpenseOverride ?? selectedDailyRecord.travelExpense).toLocaleString()}원
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">해당 교육 수</div>
                      <div className="font-medium">{selectedDailyRecord.institutions.length}건</div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="text-sm text-slate-500 mb-2">해당 일자 교육 내역:</div>
                    <div className="space-y-2">
                      {filteredData
                        .filter(row => row.dailyTravelRecordId === selectedDailyRecord.id)
                        .map((row) => (
                          <div key={row.id} className="bg-slate-50 rounded p-3 text-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium">{row.educationName}</span>
                                <span className="text-slate-500 ml-2">
                                  ({row.role === 'main' ? '주강사' : '보조강사'})
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-slate-500">수당</div>
                                <div className="font-semibold">{row.allowanceTotal.toLocaleString()}원</div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Modal>

          {/* Settings Modal */}
          <Modal
            title="정산 설정"
            open={settingsModalOpen}
            onCancel={() => setSettingsModalOpen(false)}
            footer={[
              <Button key="close" onClick={() => setSettingsModalOpen(false)}>
                닫기
              </Button>,
            ]}
            width={600}
          >
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-2 flex items-center gap-1">
                  정산 계산 모드
                  <Tooltip title={STATUS_POLICY_TOOLTIP}>
                    <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
                  </Tooltip>
                </div>
                <Select
                  value={paymentCountingMode}
                  onChange={handlePaymentCountingModeChange}
                  className="w-full"
                >
                  <Select.Option value="ONLY_CONFIRMED_ENDED">
                    확정/종료 상태만 계산 (권장)
                  </Select.Option>
                  <Select.Option value="COUNT_IF_ASSIGNED">
                    배정된 교육 모두 계산
                  </Select.Option>
                </Select>
                <div className="text-xs text-slate-500 mt-2">
                  {paymentCountingMode === 'ONLY_CONFIRMED_ENDED' 
                    ? '교육 상태가 "확정" 또는 "종료"인 경우에만 정산에 포함됩니다.'
                    : '강사가 배정된 모든 교육이 정산에 포함됩니다. 배정을 제거하면 정산에서 제외됩니다.'}
                </div>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </ProtectedRoute>
  )
}
