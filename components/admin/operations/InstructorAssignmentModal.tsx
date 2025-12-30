'use client'

import { useState, useMemo } from 'react'
import { Modal, Table, Checkbox, Button, Input } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { X, Search } from 'lucide-react'

export interface InstructorItem {
  key: string
  instructorId: string
  name: string
  affiliation: string
  region: string
  type: string
  status: string
}

interface InstructorAssignmentModalProps {
  open: boolean
  mode: 'partial' | 'full'
  onClose: () => void
  onConfirm: (selectedInstructorIds: string[]) => void
  educationIds: string[]
}

// Dummy instructor data
const dummyInstructors: InstructorItem[] = [
  {
    key: '1',
    instructorId: 'INS-2025-001',
    name: '김강사',
    affiliation: '경기미래채움',
    region: '1권역',
    type: '주강사',
    status: '활성',
  },
  {
    key: '2',
    instructorId: 'INS-2025-002',
    name: '이강사',
    affiliation: '수원교육청',
    region: '2권역',
    type: '주강사',
    status: '활성',
  },
  {
    key: '3',
    instructorId: 'INS-2025-003',
    name: '박강사',
    affiliation: '성남교육청',
    region: '3권역',
    type: '주강사',
    status: '활성',
  },
  {
    key: '4',
    instructorId: 'INS-2025-004',
    name: '최강사',
    affiliation: '안양교육청',
    region: '4권역',
    type: '주강사',
    status: '활성',
  },
  {
    key: '5',
    instructorId: 'INS-2025-005',
    name: '정강사',
    affiliation: '고양교육청',
    region: '5권역',
    type: '주강사',
    status: '활성',
  },
]

export function InstructorAssignmentModal({
  open,
  mode,
  onClose,
  onConfirm,
  educationIds,
}: InstructorAssignmentModalProps) {
  const [selectedInstructorIds, setSelectedInstructorIds] = useState<string[]>([])
  const [searchText, setSearchText] = useState<string>('')

  const filteredInstructors = useMemo(() => {
    if (!searchText) return dummyInstructors
    const searchLower = searchText.toLowerCase()
    return dummyInstructors.filter(
      (instructor) =>
        instructor.name.toLowerCase().includes(searchLower) ||
        instructor.instructorId.toLowerCase().includes(searchLower) ||
        instructor.affiliation.toLowerCase().includes(searchLower)
    )
  }, [searchText])

  const handleToggleAll = (selected: boolean) => {
    if (selected) {
      setSelectedInstructorIds(filteredInstructors.map((inst) => inst.key))
    } else {
      setSelectedInstructorIds([])
    }
  }

  const handleToggleRow = (id: string) => {
    setSelectedInstructorIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((selectedId) => selectedId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleConfirm = () => {
    onConfirm(selectedInstructorIds)
    setSelectedInstructorIds([])
    setSearchText('')
    onClose()
  }

  const handleCancel = () => {
    setSelectedInstructorIds([])
    setSearchText('')
    onClose()
  }

  const allSelected = filteredInstructors.length > 0 && selectedInstructorIds.length === filteredInstructors.length
  const someSelected = selectedInstructorIds.length > 0 && selectedInstructorIds.length < filteredInstructors.length

  const columns: ColumnsType<InstructorItem> = [
    {
      title: (
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          onChange={(e) => handleToggleAll(e.target.checked)}
        />
      ),
      key: 'selection',
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedInstructorIds.includes(record.key)}
          onChange={() => handleToggleRow(record.key)}
        />
      ),
    },
    {
      title: '강사ID',
      dataIndex: 'instructorId',
      key: 'instructorId',
      width: 150,
      render: (text: string) => <span className="text-sm font-medium text-gray-900">{text}</span>,
    },
    {
      title: '강사명',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (text: string) => <span className="text-sm font-medium text-gray-900">{text}</span>,
    },
    {
      title: '소속',
      dataIndex: 'affiliation',
      key: 'affiliation',
      width: 150,
      render: (text: string) => <span className="text-sm font-medium text-gray-900">{text}</span>,
    },
    {
      title: '권역',
      dataIndex: 'region',
      key: 'region',
      width: 100,
      render: (text: string) => <span className="text-sm font-medium text-gray-900">{text}</span>,
    },
    {
      title: '유형',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (text: string) => <span className="text-sm font-medium text-gray-900">{text}</span>,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          {status}
        </span>
      ),
    },
  ]

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={800}
      closable={false}
      className="[&_.ant-modal-content]:!p-0 [&_.ant-modal-body]:!p-0"
    >
      <div className="bg-white rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'partial' ? '부분 주강사 배정' : '전체 주강사 배정'}
          </h3>
          <button
            onClick={handleCancel}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 z-10" />
              <Input
                placeholder="강사명, 강사ID, 소속으로 검색..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition hover:border-slate-300 focus:border-slate-300 focus:ring-2 focus:ring-slate-300 [&_.ant-input]:!h-11 [&_.ant-input]:!px-0 [&_.ant-input]:!py-0 [&_.ant-input]:!bg-transparent [&_.ant-input]:!border-0 [&_.ant-input]:!outline-none [&_.ant-input]:!shadow-none [&_.ant-input]:!text-sm [&_.ant-input-wrapper]:!border-0 [&_.ant-input-wrapper]:!shadow-none [&_.ant-input-wrapper]:!bg-transparent [&_.ant-input-clear-icon]:!text-slate-400"
              />
            </div>
          </div>

          {/* Info */}
          <div className="mb-4 text-sm text-gray-600">
            선택된 교육: {educationIds.length}개
          </div>

          {/* Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <Table
              columns={columns}
              dataSource={filteredInstructors}
              rowKey="key"
              pagination={false}
              scroll={{ y: 400 }}
              className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-tbody>tr]:border-b [&_.ant-table-tbody>tr]:border-gray-100"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {selectedInstructorIds.length}명의 강사 선택됨
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleCancel}
              className="h-10 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all text-gray-700"
            >
              취소
            </Button>
            <Button
              type="primary"
              onClick={handleConfirm}
              disabled={selectedInstructorIds.length === 0}
              className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 border-0 font-medium transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              배정하기
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}




