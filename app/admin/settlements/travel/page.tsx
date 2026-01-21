'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Table, Card, Input, Button, Select, DatePicker, Modal, Form, InputNumber, Space, Badge, message, Switch } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Search, Filter, Download, Eye, Edit, RotateCcw, Settings } from 'lucide-react'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/ko'
import type { TravelSettlementRow, PaymentCountingMode } from '@/entities/settlement'
import { 
  getSettlementRows, 
  updateSettlementRow, 
  removeSettlementOverride,
  initializeSettlementStore 
} from '@/entities/settlement/settlement-store'
import { 
  getPaymentCountingMode, 
  setPaymentCountingMode 
} from '@/entities/settlement/payment-counting-mode'

dayjs.locale('ko')

const { RangePicker } = DatePicker
const { TextArea } = Input

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

  // Table columns
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
      title: '강사명',
      dataIndex: 'instructorName',
      key: 'instructorName',
      width: 100,
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
      title: '거리 (km)',
      dataIndex: 'distanceKm',
      key: 'distanceKm',
      width: 100,
      align: 'right',
      render: (distance: number, record) => (
        <span>
          {distance.toFixed(1)}
          {record.distanceKmOverride !== undefined && (
            <Badge count="수정" style={{ backgroundColor: '#52c41a', marginLeft: 4 }} />
          )}
        </span>
      ),
    },
    {
      title: '출장비',
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
      title: '수당',
      dataIndex: 'allowanceTotal',
      key: 'allowanceTotal',
      width: 120,
      align: 'right',
      render: (amount: number, record) => (
        <span>
          {amount.toLocaleString()}원
          {record.allowanceOverride !== undefined && (
            <Badge count="수정" style={{ backgroundColor: '#52c41a', marginLeft: 4 }} />
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
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">출장비 정산 관리</h1>
              <p className="text-sm text-slate-500 mt-1">
                강사의 출장비와 수당을 자동 계산하고 관리합니다.
              </p>
            </div>
            <Space>
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
              </div>
            </div>
          </Card>

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
                    {summary.totalRows}건 ({summary.eligibleRows}건 계산대상)
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Table */}
          <Card>
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
                    <div className="text-sm text-slate-500">거리</div>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-slate-500">출장비</div>
                      <div className="font-medium text-lg">
                        {selectedRow.travelExpense.toLocaleString()}원
                        {selectedRow.travelExpenseOverride !== undefined && (
                          <Badge count="수정됨" style={{ backgroundColor: '#52c41a', marginLeft: 8 }} />
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">수당 (기본)</div>
                      <div className="font-medium">{selectedRow.allowanceBase.toLocaleString()}원</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">수당 (보너스)</div>
                      <div className="font-medium">{selectedRow.allowanceBonus.toLocaleString()}원</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">수당 (합계)</div>
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
                  formatter={(value) => `${value} km`}
                  parser={(value) => value?.replace(' km', '') || ''}
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
                  formatter={(value) => `${value}원`}
                  parser={(value) => value?.replace('원', '') || ''}
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
                  formatter={(value) => `${value}원`}
                  parser={(value) => value?.replace('원', '') || ''}
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
                <div className="text-sm font-medium mb-2">정산 계산 모드</div>
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
