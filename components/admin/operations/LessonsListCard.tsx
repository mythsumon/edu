'use client'

import { Table } from 'antd'
import { DetailSectionCard } from './DetailSectionCard'
import type { ColumnsType } from 'antd/es/table'

interface LessonInfo {
  session: number
  date: string
  startTime: string
  endTime: string
  mainInstructorApplied: number
  mainInstructorRequired: number
  mainInstructorName: string
  assistantInstructorApplied: number
  assistantInstructorRequired: number
  assistantInstructorName?: string
}

interface LessonsListCardProps {
  lessons: LessonInfo[]
  columns: ColumnsType<LessonInfo>
}

export function LessonsListCard({ lessons, columns }: LessonsListCardProps) {
  return (
    <DetailSectionCard title="수업 정보">
      <div className="pt-4">
        <Table
          columns={columns}
          dataSource={lessons.map((lesson, idx) => ({
            ...lesson,
            key: `lesson-${idx}`,
          }))}
          pagination={{
            pageSize: 10,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} results`,
            position: ['bottomRight'],
          }}
          scroll={{ x: 'max-content' }}
          className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-slate-600 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table]:text-sm [&_.ant-table-tbody>tr]:border-b [&_.ant-table-tbody>tr]:border-gray-100 [&_.ant-pagination]:!mt-4 [&_.ant-pagination]:!mb-0 [&_.ant-pagination-item]:!rounded-lg [&_.ant-pagination-item]:!border-[#E6E6EF] [&_.ant-pagination-item]:!h-9 [&_.ant-pagination-item]:!min-w-[36px] [&_.ant-pagination-item-active]:!border-[#3b82f6] [&_.ant-pagination-item-active]:!bg-[#3b82f6] [&_.ant-pagination-item-active>a]:!text-white [&_.ant-pagination-prev]:!rounded-lg [&_.ant-pagination-prev]:!border-[#E6E6EF] [&_.ant-pagination-next]:!rounded-lg [&_.ant-pagination-next]:!border-[#E6E6EF] [&_.ant-pagination-options]:!ml-4 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#E6E6EF] [&_.ant-pagination-total-text]:!text-slate-900 [&_.ant-pagination-total-text]:!mr-4"
        />
      </div>
    </DetailSectionCard>
  )
}


