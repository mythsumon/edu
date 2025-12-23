'use client'

import { Search, Eye } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Table, Card, Button } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ProgramListItem } from '@/types/program'

const mockPrograms: ProgramListItem[] = [
  {
    id: 1,
    name: '창의융합교육 프로그램',
    institution: '서울초등학교',
    mainInstructor: '김교사',
    subInstructor: '이교사',
    createdDate: '2025-01-15',
    lastUpdated: '2025-03-20',
  },
  {
    id: 2,
    name: '디지털 리터러시 교육',
    institution: '인천중학교',
    mainInstructor: '박교사',
    subInstructor: '최교사',
    createdDate: '2025-02-01',
    lastUpdated: '2025-03-18',
  },
  {
    id: 3,
    name: '과학탐구 프로젝트',
    institution: '경기고등학교',
    mainInstructor: '정교사',
    subInstructor: '강교사',
    createdDate: '2025-01-20',
    lastUpdated: '2025-03-19',
  },
  {
    id: 4,
    name: '예술융합 프로그램',
    institution: '수원초등학교',
    mainInstructor: '윤교사',
    subInstructor: '임교사',
    createdDate: '2025-02-10',
    lastUpdated: '2025-03-17',
  },
  {
    id: 5,
    name: '환경교육 캠페인',
    institution: '성남중학교',
    mainInstructor: '조교사',
    subInstructor: '신교사',
    createdDate: '2025-01-25',
    lastUpdated: '2025-03-16',
  },
]

export function ProgramList({ selectedRegion }: { selectedRegion?: number }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filteredPrograms = mockPrograms.filter((program) => {
    const matchesSearch =
      program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.mainInstructor.toLowerCase().includes(searchQuery.toLowerCase())
    
    // In a real app, filter by selectedRegion here
    return matchesSearch
  })

  const handleDetailClick = (type: 'attendance' | 'activity' | 'equipment', programId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (type === 'attendance') {
      router.push(`/admin/attendance/${programId}`)
    } else if (type === 'activity') {
      router.push(`/admin/activity/${programId}`)
    } else if (type === 'equipment') {
      router.push(`/admin/equipment/${programId}`)
    } else {
      // In a real app, navigate to the appropriate detail page
      console.log(`Opening ${type} detail for program ${programId}`)
    }
  }

  const columns: ColumnsType<ProgramListItem> = [
    {
      title: '프로그램명',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string) => (
        <span className="text-sm font-medium text-gray-900">{text}</span>
      ),
    },
    {
      title: '교육기관',
      dataIndex: 'institution',
      key: 'institution',
      width: 150,
      render: (text: string) => (
        <span className="text-sm text-gray-700">{text}</span>
      ),
    },
    {
      title: '주강사',
      dataIndex: 'mainInstructor',
      key: 'mainInstructor',
      width: 120,
      render: (text: string) => (
        <span className="text-sm text-gray-700">{text}</span>
      ),
    },
    {
      title: '보조강사',
      dataIndex: 'subInstructor',
      key: 'subInstructor',
      width: 120,
      render: (text: string) => (
        <span className="text-sm text-gray-700">{text}</span>
      ),
    },
    {
      title: '프로그램 생성날짜',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 150,
      render: (text: string) => (
        <span className="text-sm text-gray-700">{text}</span>
      ),
    },
    {
      title: '교육 출석부',
      key: 'attendance',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Button
          size="small"
          icon={<Eye className="w-3 h-3" />}
          onClick={(e) => handleDetailClick('attendance', record.id, e)}
          className="h-8 px-3 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          상세
        </Button>
      ),
    },
    {
      title: '교육 활동 일지',
      key: 'activity',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Button
          size="small"
          icon={<Eye className="w-3 h-3" />}
          onClick={(e) => handleDetailClick('activity', record.id, e)}
          className="h-8 px-3 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          상세
        </Button>
      ),
    },
    {
      title: '교구 확인서',
      key: 'equipment',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Button
          size="small"
          icon={<Eye className="w-3 h-3" />}
          onClick={(e) => handleDetailClick('equipment', record.id, e)}
          className="h-8 px-3 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          상세
        </Button>
      ),
    },
    {
      title: '마지막 수정일',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      width: 150,
      align: 'right',
      render: (text: string) => (
        <span className="text-xs text-gray-500">{text}</span>
      ),
    },
  ]

  return (
    <Card className="rounded-xl shadow-sm border border-gray-200">
      {/* Section Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">전체 프로그램 리스트</h2>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="프로그램명, 교육기관, 강사명으로 검색"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredPrograms.map((p) => ({ ...p, key: p.id }))}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: filteredPrograms.length,
          showSizeChanger: true,
          showTotal: (total) => `총 ${total}건`,
          onChange: (page, size) => {
            setCurrentPage(page)
            setPageSize(size)
          },
        }}
        rowKey="id"
        scroll={{ x: 'max-content' }}
        className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:sticky [&_.ant-table-thead>tr>th]:top-0 [&_.ant-table-thead>tr>th]:z-10 [&_.ant-table-tbody>tr]:border-b [&_.ant-table-tbody>tr]:border-gray-100 [&_.ant-pagination]:!mt-4 [&_.ant-pagination]:!mb-0 [&_.ant-pagination-item]:!rounded-lg [&_.ant-pagination-item]:!border-[#E6E6EF] [&_.ant-pagination-item]:!h-9 [&_.ant-pagination-item]:!min-w-[36px] [&_.ant-pagination-item-active]:!border-[#ff8a65] [&_.ant-pagination-item-active]:!bg-[#ff8a65] [&_.ant-pagination-item-active>a]:!text-white [&_.ant-pagination-prev]:!rounded-lg [&_.ant-pagination-prev]:!border-[#E6E6EF] [&_.ant-pagination-next]:!rounded-lg [&_.ant-pagination-next]:!border-[#E6E6EF] [&_.ant-pagination-options]:!ml-4 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#E6E6EF] [&_.ant-pagination-total-text]:!text-[#151827] [&_.ant-pagination-total-text]:!mr-4"
        onRow={(record) => ({
          onClick: () => router.push(`/program`),
          className: 'cursor-pointer hover:bg-gray-50',
        })}
        locale={{
          emptyText: (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">검색 결과가 없습니다</h3>
              <p className="text-sm text-gray-500">검색어 또는 필터를 다시 확인해 주세요.</p>
            </div>
          ),
        }}
      />
    </Card>
  )
}