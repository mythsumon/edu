'use client'

import { useState } from 'react'
import {
  TitleTablePanel,
  GroupTablePanel,
  GroupKeyTablePanel,
  ModalForm,
  ConfirmModal,
  dummyTitles,
  dummyGroups,
  dummyGroupKeys,
  type Title,
  type Group,
  type GroupKey,
  type CommonCodeFormType,
  type CommonCodeFormMode,
} from './index'

export function CommonCodePage() {
  const [selectedTitleId, setSelectedTitleId] = useState<string | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)

  // Form state
  const [modalOpen, setModalOpen] = useState(false)
  const [formType, setFormType] = useState<CommonCodeFormType>('title')
  const [formMode, setFormMode] = useState<CommonCodeFormMode>('create')
  const [formData, setFormData] = useState<Title | Group | GroupKey | undefined>()

  // Delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<CommonCodeFormType>('title')
  const [deleteId, setDeleteId] = useState<string>('')
  const [deleteName, setDeleteName] = useState<string>('')

  // Data state (in real app, these would come from API)
  const [titles, setTitles] = useState<Title[]>(dummyTitles)
  const [groups, setGroups] = useState<Group[]>(dummyGroups)
  const [groupKeys, setGroupKeys] = useState<GroupKey[]>(dummyGroupKeys)

  // Title handlers
  const handleSelectTitle = (titleId: string | null) => {
    setSelectedTitleId(titleId)
    setSelectedGroupId(null) // Reset group selection when title changes
  }

  const handleAddTitle = () => {
    setFormType('title')
    setFormMode('create')
    setFormData(undefined)
    setModalOpen(true)
  }

  const handleEditTitle = (title: Title) => {
    setFormType('title')
    setFormMode('edit')
    setFormData(title)
    setModalOpen(true)
  }

  const handleDeleteTitle = (titleId: string) => {
    const title = titles.find((t) => t.id === titleId)
    setDeleteType('title')
    setDeleteId(titleId)
    setDeleteName(title?.name || '')
    setDeleteModalOpen(true)
  }

  // Group handlers
  const handleSelectGroup = (groupId: string | null) => {
    setSelectedGroupId(groupId)
  }

  const handleAddGroup = () => {
    if (!selectedTitleId) return
    setFormType('group')
    setFormMode('create')
    setFormData(undefined)
    setModalOpen(true)
  }

  const handleEditGroup = (group: Group) => {
    setFormType('group')
    setFormMode('edit')
    setFormData(group)
    setModalOpen(true)
  }

  const handleDeleteGroup = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId)
    setDeleteType('group')
    setDeleteId(groupId)
    setDeleteName(group?.name || '')
    setDeleteModalOpen(true)
  }

  // GroupKey handlers
  const handleAddKey = () => {
    if (!selectedGroupId) return
    setFormType('key')
    setFormMode('create')
    setFormData(undefined)
    setModalOpen(true)
  }

  const handleEditKey = (key: GroupKey) => {
    setFormType('key')
    setFormMode('edit')
    setFormData(key)
    setModalOpen(true)
  }

  const handleDeleteKey = (keyId: string) => {
    const key = groupKeys.find((k) => k.id === keyId)
    setDeleteType('key')
    setDeleteId(keyId)
    setDeleteName(key?.label || '')
    setDeleteModalOpen(true)
  }

  const handleToggleEnabled = (keyId: string, enabled: boolean) => {
    setGroupKeys((prev) =>
      prev.map((key) => (key.id === keyId ? { ...key, enabled } : key))
    )
  }

  // Form submit handler
  const handleFormSubmit = (values: any) => {
    if (formType === 'title') {
      if (formMode === 'create') {
        const newTitle: Title = {
          id: Date.now().toString(),
          name: values.name,
          status: values.status,
          groupCount: 0,
        }
        setTitles([...titles, newTitle])
      } else {
        setTitles((prev) =>
          prev.map((title) =>
            title.id === formData?.id ? { ...title, ...values } : title
          )
        )
      }
    } else if (formType === 'group') {
      if (formMode === 'create') {
        const newGroup: Group = {
          id: Date.now().toString(),
          titleId: selectedTitleId!,
          name: values.name,
          code: values.code,
          status: values.status,
          valueCount: 0,
        }
        setGroups([...groups, newGroup])
        // Update title count
        setTitles((prev) =>
          prev.map((title) =>
            title.id === selectedTitleId
              ? { ...title, groupCount: title.groupCount + 1 }
              : title
          )
        )
      } else {
        setGroups((prev) =>
          prev.map((group) =>
            group.id === formData?.id ? { ...group, ...values } : group
          )
        )
      }
    } else if (formType === 'key') {
      if (formMode === 'create') {
        const newKey: GroupKey = {
          id: Date.now().toString(),
          groupId: selectedGroupId!,
          label: values.label,
          value: values.value,
          sortOrder: values.sortOrder,
          enabled: values.enabled ?? true,
        }
        setGroupKeys([...groupKeys, newKey])
        // Update group count
        setGroups((prev) =>
          prev.map((group) =>
            group.id === selectedGroupId
              ? { ...group, valueCount: group.valueCount + 1 }
              : group
          )
        )
      } else {
        setGroupKeys((prev) =>
          prev.map((key) =>
            key.id === formData?.id ? { ...key, ...values } : key
          )
        )
      }
    }
  }

  // Delete confirm handler
  const handleDeleteConfirm = () => {
    if (deleteType === 'title') {
      setTitles((prev) => prev.filter((title) => title.id !== deleteId))
      setGroups((prev) => prev.filter((group) => group.titleId !== deleteId))
      // Also delete related keys
      const relatedGroupIds = groups
        .filter((g) => g.titleId === deleteId)
        .map((g) => g.id)
      setGroupKeys((prev) =>
        prev.filter((key) => !relatedGroupIds.includes(key.groupId))
      )
      if (selectedTitleId === deleteId) {
        setSelectedTitleId(null)
        setSelectedGroupId(null)
      }
    } else if (deleteType === 'group') {
      setGroups((prev) => prev.filter((group) => group.id !== deleteId))
      setGroupKeys((prev) => prev.filter((key) => key.groupId !== deleteId))
      // Update title count
      const deletedGroup = groups.find((g) => g.id === deleteId)
      if (deletedGroup) {
        setTitles((prev) =>
          prev.map((title) =>
            title.id === deletedGroup.titleId
              ? { ...title, groupCount: Math.max(0, title.groupCount - 1) }
              : title
          )
        )
      }
      if (selectedGroupId === deleteId) {
        setSelectedGroupId(null)
      }
    } else if (deleteType === 'key') {
      setGroupKeys((prev) => prev.filter((key) => key.id !== deleteId))
      // Update group count
      const deletedKey = groupKeys.find((k) => k.id === deleteId)
      if (deletedKey) {
        setGroups((prev) =>
          prev.map((group) =>
            group.id === deletedKey.groupId
              ? { ...group, valueCount: Math.max(0, group.valueCount - 1) }
              : group
          )
        )
      }
    }
    setDeleteModalOpen(false)
  }

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-200px)] p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
        {/* Left Column: Title Table */}
        <div className="h-full">
          <TitleTablePanel
            titles={titles}
            selectedTitleId={selectedTitleId}
            onSelectTitle={handleSelectTitle}
            onAdd={handleAddTitle}
            onEdit={handleEditTitle}
            onDelete={handleDeleteTitle}
          />
        </div>

        {/* Middle Column: Group Table */}
        <div className="h-full">
          <GroupTablePanel
            groups={groups}
            selectedTitleId={selectedTitleId}
            selectedGroupId={selectedGroupId}
            onSelectGroup={handleSelectGroup}
            onAdd={handleAddGroup}
            onEdit={handleEditGroup}
            onDelete={handleDeleteGroup}
          />
        </div>

        {/* Right Column: Group Key Table */}
        <div className="h-full">
          <GroupKeyTablePanel
            groupKeys={groupKeys}
            selectedGroupId={selectedGroupId}
            onAdd={handleAddKey}
            onEdit={handleEditKey}
            onDelete={handleDeleteKey}
            onToggleEnabled={handleToggleEnabled}
          />
        </div>
      </div>

      {/* Modal Form */}
      <ModalForm
        open={modalOpen}
        type={formType}
        mode={formMode}
        data={formData}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        title="삭제 확인"
        message={`Are you sure you want to delete "${deleteName}"? This cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModalOpen(false)}
        confirmText="삭제"
        cancelText="취소"
        danger={true}
      />
    </div>
  )
}

