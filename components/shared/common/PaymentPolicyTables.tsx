/**
 * Payment Policy Tables Component
 * Displays instructor fee tables and travel allowance tables
 */

import { Card, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'

/**
 * Main Instructor Fee Table
 */
export function MainInstructorFeeTable() {
  const columns: ColumnsType<any> = [
    {
      title: '구분',
      dataIndex: 'category',
      key: 'category',
      width: 150,
    },
    {
      title: '기본료',
      dataIndex: 'baseFee',
      key: 'baseFee',
      align: 'right',
      render: (value: number) => value.toLocaleString() + '원',
    },
    {
      title: '도서벽지',
      dataIndex: 'remoteArea',
      key: 'remoteArea',
      align: 'right',
      render: (value: number) => value.toLocaleString() + '원',
    },
    {
      title: '특수',
      dataIndex: 'special',
      key: 'special',
      align: 'right',
      render: (value: number) => value.toLocaleString() + '원',
    },
  ]

  const data = [
    {
      key: 'elementary',
      category: '초등',
      baseFee: 40000,
      remoteArea: 45000,
      special: 50000,
    },
    {
      key: 'middle',
      category: '중등',
      baseFee: 45000,
      remoteArea: 50000,
      special: 55000,
    },
    {
      key: 'high',
      category: '고등',
      baseFee: 50000,
      remoteArea: 55000,
      special: 60000,
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={data}
      pagination={false}
      bordered
      size="small"
      title={() => (
        <div className="font-semibold text-lg">주강사료(차시당) 중복지급</div>
      )}
    />
  )
}

/**
 * Assistant Instructor Fee Table
 */
export function AssistantInstructorFeeTable() {
  const columns: ColumnsType<any> = [
    {
      title: '구분',
      dataIndex: 'category',
      key: 'category',
      width: 150,
    },
    {
      title: '기본료',
      dataIndex: 'baseFee',
      key: 'baseFee',
      align: 'right',
      render: (value: number) => value.toLocaleString() + '원',
    },
    {
      title: '도서벽지',
      dataIndex: 'remoteArea',
      key: 'remoteArea',
      align: 'right',
      render: (value: number) => value.toLocaleString() + '원',
    },
    {
      title: '특수',
      dataIndex: 'special',
      key: 'special',
      align: 'right',
      render: (value: number) => value.toLocaleString() + '원',
    },
  ]

  const data = [
    {
      key: 'elementary',
      category: '초등',
      baseFee: 30000,
      remoteArea: 35000,
      special: 40000,
    },
    {
      key: 'middle',
      category: '중등',
      baseFee: 35000,
      remoteArea: 40000,
      special: 45000,
    },
    {
      key: 'high',
      category: '고등',
      baseFee: 40000,
      remoteArea: 45000,
      special: 50000,
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={data}
      pagination={false}
      bordered
      size="small"
      title={() => (
        <div className="font-semibold text-lg">보조강사료(차시당) 중복지급</div>
      )}
    />
  )
}

/**
 * Travel Allowance Table
 */
export function TravelAllowanceTable() {
  const columns: ColumnsType<any> = [
    {
      title: '구분',
      dataIndex: 'category',
      key: 'category',
      width: 200,
    },
    {
      title: '50km 이상 ~ 70km 미만',
      dataIndex: 'range1',
      key: 'range1',
      align: 'right',
      render: (value: number) => value.toLocaleString() + '원',
    },
    {
      title: '70km 이상 ~ 90km 미만',
      dataIndex: 'range2',
      key: 'range2',
      align: 'right',
      render: (value: number) => value.toLocaleString() + '원',
    },
    {
      title: '90km 이상 ~ 110km 미만',
      dataIndex: 'range3',
      key: 'range3',
      align: 'right',
      render: (value: number) => value.toLocaleString() + '원',
    },
    {
      title: '110km 이상 ~ 130km 미만',
      dataIndex: 'range4',
      key: 'range4',
      align: 'right',
      render: (value: number) => value.toLocaleString() + '원',
    },
    {
      title: '130km 이상',
      dataIndex: 'range5',
      key: 'range5',
      align: 'right',
      render: (value: number) => value.toLocaleString() + '원',
    },
  ]

  const data = [
    {
      key: 'payment',
      category: '지급액',
      range1: 20000,
      range2: 30000,
      range3: 40000,
      range4: 50000,
      range5: 60000,
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={data}
      pagination={false}
      bordered
      size="small"
      title={() => (
        <div className="font-semibold text-lg">위탁강사 거주지 기준 고정 출장수당 지급표</div>
      )}
    />
  )
}

/**
 * Payment Policy Tables Component
 */
export default function PaymentPolicyTables() {
  return (
    <div className="space-y-6">
      <Card title="강사비(Base fee+특수or도서벽지) 정리표">
        <div className="space-y-6">
          <MainInstructorFeeTable />
          <AssistantInstructorFeeTable />
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="font-semibold text-blue-900 mb-2">중복지급 적용 예)</div>
            <div className="text-sm text-blue-800">
              도서벽지 지역에 있는 특수학급의 경우: 도서벽지 추가금(+5,000원)과 특수 추가금(+10,000원) 반영됨
            </div>
          </div>
        </div>
      </Card>

      <Card title="위탁강사 거주지 기준 고정 출장수당 지급표">
        <div className="space-y-4">
          <div className="text-red-600 font-semibold mb-2">왕복기준 →</div>
          <TravelAllowanceTable />
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
            <div className="text-sm text-gray-700">
              <div className="font-semibold mb-1">※ 참고사항</div>
              <div>
                1일 2회 이상 교육시 경유지 포함한 도착지까지 각 시·군청 거리의 총합(시군청 간의 거리는 하버사인 공식을 활용)으로 계산하고, 각 시군청의 거리는 별도 안내
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
