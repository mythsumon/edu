'use client'

import React from 'react'
import { Card, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { DEFAULT_ALLOWANCE_POLICY } from '@/entities/settlement/allowance-calculator'

interface RateData {
  key: string
  category: string
  mainRate: number
  assistantRate: number
}

/**
 * 학교 유형별 차시당 단가 표를 표시하는 컴포넌트
 */
export const AllowanceRateTable: React.FC = () => {
  const dataSource: RateData[] = [
    {
      key: '1',
      category: '초등',
      mainRate: DEFAULT_ALLOWANCE_POLICY.baseRates.ELEMENTARY.main,
      assistantRate: DEFAULT_ALLOWANCE_POLICY.baseRates.ELEMENTARY.assistant,
    },
    {
      key: '2',
      category: '중등',
      mainRate: DEFAULT_ALLOWANCE_POLICY.baseRates.MIDDLE.main,
      assistantRate: DEFAULT_ALLOWANCE_POLICY.baseRates.MIDDLE.assistant,
    },
    {
      key: '3',
      category: '고등',
      mainRate: DEFAULT_ALLOWANCE_POLICY.baseRates.HIGH.main,
      assistantRate: DEFAULT_ALLOWANCE_POLICY.baseRates.HIGH.assistant,
    },
    {
      key: '4',
      category: '도서벽지',
      mainRate: DEFAULT_ALLOWANCE_POLICY.baseRates.ISLAND.main,
      assistantRate: DEFAULT_ALLOWANCE_POLICY.baseRates.ISLAND.assistant,
    },
    {
      key: '5',
      category: '특수',
      mainRate: DEFAULT_ALLOWANCE_POLICY.baseRates.SPECIAL.main,
      assistantRate: DEFAULT_ALLOWANCE_POLICY.baseRates.SPECIAL.assistant,
    },
  ]

  const columns: ColumnsType<RateData> = [
    {
      title: '학교 유형',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      className: 'font-medium',
    },
    {
      title: '주강사료(차시당)',
      dataIndex: 'mainRate',
      key: 'mainRate',
      width: 150,
      align: 'right',
      render: (value: number) => (
        <span className="font-semibold text-blue-600">{value.toLocaleString()}원</span>
      ),
    },
    {
      title: '보조강사료(차시당)',
      dataIndex: 'assistantRate',
      key: 'assistantRate',
      width: 150,
      align: 'right',
      render: (value: number) => (
        <span className="font-semibold text-green-600">{value.toLocaleString()}원</span>
      ),
    },
  ]

  return (
    <Card 
      title="기본 단가 + 가산 단가(중등/특수/도서벽지) 표" 
      className="mb-4"
      size="small"
    >
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        size="small"
        className="[&_.ant-table-thead>tr>th]:bg-slate-100 [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-tbody>tr>td]:bg-white"
      />
    </Card>
  )
}
