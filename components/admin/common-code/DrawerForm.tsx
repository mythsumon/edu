'use client'

import React, { useEffect } from 'react'
import { Modal, Form, Input, InputNumber, Switch, Button, Select } from 'antd'
import { Save, X } from 'lucide-react'
import { CommonCodeFormType, CommonCodeFormMode, Title, Group, GroupKey } from './types'

interface ModalFormProps {
  open: boolean
  type: CommonCodeFormType
  mode: CommonCodeFormMode
  data?: Title | Group | GroupKey
  selectedTitleId?: string | null
  selectedGroupId?: string | null
  titles?: Title[]
  groups?: Group[]
  onClose: () => void
  onSubmit: (values: any) => void
}

export function ModalForm({ 
  open, 
  type, 
  mode, 
  data, 
  selectedTitleId,
  selectedGroupId,
  titles = [],
  groups = [],
  onClose, 
  onSubmit 
}: ModalFormProps) {
  const [form] = Form.useForm()

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onSubmit(values)
      form.resetFields()
      onClose()
    })
  }

  const handleClose = () => {
    form.resetFields()
    onClose()
  }

  // Set form values when editing
  useEffect(() => {
    if (open && data && mode === 'edit') {
      if (type === 'title') {
        form.setFieldsValue({
          name: (data as Title).name,
          status: (data as Title).status,
        })
      } else if (type === 'group') {
        form.setFieldsValue({
          name: (data as Group).name,
          code: (data as Group).code,
          status: (data as Group).status,
        })
      } else if (type === 'key') {
        form.setFieldsValue({
          label: (data as GroupKey).label,
          value: (data as GroupKey).value,
          sortOrder: (data as GroupKey).sortOrder,
          enabled: (data as GroupKey).enabled,
        })
      }
    } else if (open && mode === 'create') {
      form.resetFields()
    }
  }, [open, data, mode, type, form])

  const getTitle = () => {
    const typeNames = { title: 'Title', group: 'Group', key: 'Group Key' }
    const modeNames = { create: '추가', edit: '수정' }
    return `${typeNames[type]} ${modeNames[mode]}`
  }

  // Get related title/group info for display
  const getRelatedInfo = () => {
    if (type === 'group') {
      // In edit mode, get titleId from data; in create mode, use selectedTitleId
      const titleId = mode === 'edit' && data ? (data as Group).titleId : selectedTitleId
      if (titleId) {
        const title = titles.find(t => t.id === titleId)
        return title ? { label: 'Title', value: title.name } : null
      }
    }
    if (type === 'key') {
      // In edit mode, get groupId from data; in create mode, use selectedGroupId
      const groupId = mode === 'edit' && data ? (data as GroupKey).groupId : selectedGroupId
      if (groupId) {
        const group = groups.find(g => g.id === groupId)
        return group ? { label: 'Group', value: group.name } : null
      }
    }
    return null
  }

  const relatedInfo = getRelatedInfo()

  return (
    <Modal
      title={
        <h3 className="text-lg font-semibold text-slate-900">{getTitle()}</h3>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={600}
      className="[&_.ant-modal-content]:rounded-2xl [&_.ant-modal-header]:border-b [&_.ant-modal-header]:border-slate-200 [&_.ant-modal-body]:p-6"
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-4 mt-4">
        {/* Display related Title/Group info */}
        {relatedInfo && (
          <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">{relatedInfo.label}:</span>
              <span className="text-sm font-semibold text-slate-900">{relatedInfo.value}</span>
            </div>
          </div>
        )}

        {type === 'title' && (
          <>
            <Form.Item
              label="Title Name"
              name="name"
              rules={[{ required: true, message: 'Title name을 입력해주세요' }]}
            >
              <Input placeholder="Title name을 입력하세요" className="h-11 rounded-xl" />
            </Form.Item>
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: 'Status를 선택해주세요' }]}
            >
              <Select
                placeholder="Status를 선택하세요"
                options={[
                  { value: 'Active', label: '활성' },
                  { value: 'Inactive', label: '비활성' },
                ]}
                className="h-11 rounded-xl"
              />
            </Form.Item>
          </>
        )}

        {type === 'group' && (
          <>
            <Form.Item
              label="Group Name"
              name="name"
              rules={[{ required: true, message: 'Group name을 입력해주세요' }]}
            >
              <Input placeholder="Group name을 입력하세요" className="h-11 rounded-xl" />
            </Form.Item>
            <Form.Item
              label="Group Code"
              name="code"
              rules={[{ required: true, message: 'Group code를 입력해주세요' }]}
            >
              <Input placeholder="Group code를 입력하세요" className="h-11 rounded-xl" />
            </Form.Item>
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: 'Status를 선택해주세요' }]}
            >
              <Select
                placeholder="Status를 선택하세요"
                options={[
                  { value: 'Active', label: '활성' },
                  { value: 'Inactive', label: '비활성' },
                ]}
                className="h-11 rounded-xl"
              />
            </Form.Item>
          </>
        )}

        {type === 'key' && (
          <>
            <Form.Item
              label="Label"
              name="label"
              rules={[{ required: true, message: 'Label을 입력해주세요' }]}
            >
              <Input placeholder="Label을 입력하세요" className="h-11 rounded-xl" />
            </Form.Item>
            <Form.Item
              label="Value"
              name="value"
              rules={[{ required: true, message: 'Value를 입력해주세요' }]}
            >
              <Input placeholder="Value를 입력하세요" className="h-11 rounded-xl" />
            </Form.Item>
            <Form.Item
              label="Sort Order"
              name="sortOrder"
              rules={[{ required: true, message: 'Sort order를 입력해주세요' }]}
            >
              <InputNumber
                placeholder="Sort order를 입력하세요"
                className="w-full h-11 rounded-xl"
                min={0}
              />
            </Form.Item>
            <Form.Item label="Enabled" name="enabled" valuePropName="checked">
              <Switch className="[&_.ant-switch-checked]:bg-blue-600" />
            </Form.Item>
          </>
        )}
      </Form>
      
      <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 mt-6">
        <Button
          icon={<X className="w-4 h-4" />}
          onClick={handleClose}
          className="h-11 px-6 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white font-medium transition-all text-slate-700"
        >
          취소
        </Button>
        <Button
          type="primary"
          icon={<Save className="w-4 h-4" />}
          onClick={handleSubmit}
          className="h-11 px-6 rounded-xl border-0 font-medium transition-all shadow-sm hover:shadow-md text-white hover:text-white active:text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          저장
        </Button>
      </div>
    </Modal>
  )
}

