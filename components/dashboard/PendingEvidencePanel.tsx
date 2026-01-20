'use client'

import { Card, Table, Tag, Button } from 'antd'
import { Eye, ArrowRight, FileCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getEvidenceDocs } from '@/app/instructor/evidence/storage'
import { useState, useEffect } from 'react'
import type { EvidenceDoc } from '@/app/instructor/evidence/types'

interface PendingEvidence {
  key: string
  educationName: string
  institutionName: string
  instructorName: string
  submittedAt: string
  itemCount: number
}

export function PendingEvidencePanel() {
  const router = useRouter()
  const [data, setData] = useState<PendingEvidence[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = () => {
      const evidenceDocs = getEvidenceDocs()
      const pending = evidenceDocs
        .filter(doc => doc.status === 'SUBMITTED')
        .slice(0, 5)
        .map(doc => ({
          key: doc.id,
          educationName: doc.educationName,
          institutionName: doc.institutionName,
          instructorName: doc.instructorName,
          submittedAt: doc.submittedAt || doc.createdAt,
          itemCount: doc.items.length,
        }))
      
      setTimeout(() => {
        setData(pending)
        setLoading(false)
      }, 300)
    }

    loadData()

    // Listen for evidence updates
    const handleUpdate = () => {
      loadData()
    }
    window.addEventListener('evidenceUpdated', handleUpdate)

    return () => {
      window.removeEventListener('evidenceUpdated', handleUpdate)
    }
  }, [])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    } catch {
      return dateString
    }
  }

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
      title: '기관명',
      dataIndex: 'institutionName',
      key: 'institutionName',
      width: 140,
      ellipsis: true,
      render: (text: string) => (
        <span className="text-slate-700">{text}</span>
      ),
    },
    {
      title: '강사명',
      dataIndex: 'instructorName',
      key: 'instructorName',
      width: 100,
      render: (text: string) => (
        <span className="text-slate-700">{text}</span>
      ),
    },
    {
      title: '파일 수',
      dataIndex: 'itemCount',
      key: 'itemCount',
      width: 80,
      render: (count: number) => (
        <Tag color="blue" className="font-medium">
          {count}개
        </Tag>
      ),
    },
    {
      title: '제출일',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 100,
      render: (text: string) => (
        <span className="text-slate-600">{formatDate(text)}</span>
      ),
    },
    {
      title: '작업',
      key: 'action',
      width: 100,
      render: (_: any, record: PendingEvidence) => (
        <Button
          type="link"
          icon={<Eye className="w-4 h-4" />}
          onClick={() => router.push(`/admin/evidence/${record.key}`)}
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
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <FileCheck className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 m-0">증빙 검토 대기열</h3>
          </div>
          <Button
            type="link"
            icon={<ArrowRight className="w-4 h-4" />}
            onClick={() => router.push('/admin/submissions')}
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
        locale={{ emptyText: '검토 대기 중인 증빙 자료가 없습니다.' }}
      />
    </Card>
  )
}
