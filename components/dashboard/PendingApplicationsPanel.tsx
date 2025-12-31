'use client'

import { Card, Table, Tag, Button } from 'antd'
import { Eye, ArrowRight, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { dataStore } from '@/lib/dataStore'
import { useState, useEffect } from 'react'

interface PendingApplication {
  key: string
  educationName: string
  instructorName: string
  applicationDate: string
  role: string
}

export function PendingApplicationsPanel() {
  const router = useRouter()
  const [data, setData] = useState<PendingApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const applications = dataStore.getInstructorApplications()
    const pending = applications
      .filter(app => app.status === '대기')
      .slice(0, 5)
      .map(app => ({
        key: app.key,
        educationName: app.educationName,
        instructorName: app.instructorName,
        applicationDate: app.applicationDate,
        role: app.role,
      }))
    
    setTimeout(() => {
      setData(pending)
      setLoading(false)
    }, 300)
  }, [])

  const columns = [
    {
      title: '교육명',
      dataIndex: 'educationName',
      key: 'educationName',
      ellipsis: true,
      render: (text: string) => (
        <span className="font-medium text-slate-900">{text}</span>
      ),
    },
    {
      title: '강사명',
      dataIndex: 'instructorName',
      key: 'instructorName',
      width: 120,
      render: (text: string) => (
        <span className="text-slate-700">{text}</span>
      ),
    },
    {
      title: '역할',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: string) => (
        <Tag 
          color={role === '주강사' ? 'blue' : 'green'}
          className="font-medium"
        >
          {role}
        </Tag>
      ),
    },
    {
      title: '신청일',
      dataIndex: 'applicationDate',
      key: 'applicationDate',
      width: 120,
      render: (text: string) => (
        <span className="text-slate-600">{text}</span>
      ),
    },
    {
      title: '작업',
      key: 'action',
      width: 100,
      render: (_: any, record: PendingApplication) => (
        <Button
          type="link"
          icon={<Eye className="w-4 h-4" />}
          onClick={() => router.push(`/admin/instructor-assignment/applications?key=${record.key}`)}
          className="text-blue-600 hover:text-blue-700 hover:!text-blue-700 font-medium [&_.anticon]:text-blue-600 [&_.anticon]:hover:text-blue-700 [&:hover_.anticon]:!text-blue-700"
        >
          보기
        </Button>
      ),
    },
  ]

  return (
    <Card
      className="rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300"
      bodyStyle={{ padding: '28px' }}
      styles={{
        header: {
          padding: '20px 28px',
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(to right, #f8fafc, #ffffff)',
        }
      }}
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 m-0">대기 중인 강사 신청</h3>
          </div>
          <Button
            type="link"
            icon={<ArrowRight className="w-4 h-4" />}
            onClick={() => router.push('/admin/instructor-assignment/applications')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            전체 보기
          </Button>
        </div>
      }
    >
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={false}
        size="small"
        className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-slate-700 [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-tbody>tr]:hover:bg-slate-50 [&_.ant-table-tbody>tr]:transition-colors"
        locale={{ emptyText: '대기 중인 신청이 없습니다.' }}
      />
    </Card>
  )
}

