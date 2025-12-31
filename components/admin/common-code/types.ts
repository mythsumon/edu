// Common Code Management Types

export interface Title {
  id: string
  name: string
  status: 'Active' | 'Inactive'
  groupCount: number
  createdAt?: string
  updatedAt?: string
}

export interface Group {
  id: string
  titleId: string
  name: string
  code: string
  status: 'Active' | 'Inactive'
  valueCount: number
  createdAt?: string
  updatedAt?: string
}

export interface GroupKey {
  id: string
  groupId: string
  label: string
  value: string
  sortOrder: number
  enabled: boolean
  createdAt?: string
  updatedAt?: string
}

export type CommonCodeFormMode = 'create' | 'edit'
export type CommonCodeFormType = 'title' | 'group' | 'key'






