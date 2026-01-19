import type { TeacherResponseDto } from '@/modules/teacher/model/teacher.types'

/**
 * Institution Create DTO (matches backend InstitutionCreateDto)
 */
export interface InstitutionCreateDto {
  name: string
  phoneNumber: string
  districtId?: number | null
  zoneId?: number | null
  regionId?: number | null
  street: string
  address: string
  majorCategoryId?: number | null
  categoryOneId?: number | null
  categoryTwoId?: number | null
  classificationId?: number | null
  notes?: string | null
  teacherId?: number | null
  signature?: string | null
}

/**
 * Institution Update DTO (matches backend InstitutionUpdateDto)
 */
export interface InstitutionUpdateDto {
  name: string
  phoneNumber: string
  districtId?: number | null
  zoneId?: number | null
  regionId?: number | null
  street: string
  address: string
  majorCategoryId?: number | null
  categoryOneId?: number | null
  categoryTwoId?: number | null
  classificationId?: number | null
  notes?: string | null
  teacherId?: number | null
  signature?: string | null
}

/**
 * Institution Response DTO (matches backend InstitutionResponseDto)
 */
export interface InstitutionResponseDto {
  id: number
  institutionId: string
  name: string
  phoneNumber: string
  district?: MasterCodeResponseDto | null
  zone?: MasterCodeResponseDto | null
  region?: MasterCodeResponseDto | null
  street: string
  address: string
  majorCategory?: MasterCodeResponseDto | null
  categoryOne?: MasterCodeResponseDto | null
  categoryTwo?: MasterCodeResponseDto | null
  classification?: MasterCodeResponseDto | null
  notes?: string | null
  teacher?: TeacherResponseDto | null
  signature?: string | null
  createdAt: string
  updatedAt: string
}

/**
 * List Institutions Query Parameters
 */
export interface ListInstitutionsParams {
  q?: string
  page?: number
  size?: number
  sort?: string
  majorCategoryIds?: number[]
  categoryOneIds?: number[]
  categoryTwoIds?: number[]
  classificationIds?: number[]
  districtId?: number | null
  zoneIds?: number[]
  regionIds?: number[]
  teacherId?: number | null
}

// Legacy Institution type - to be deprecated
export interface Institution {
  id: number
  institutionId: string
  institutionName: string
  address: string
  detailAddress: string
  phoneNumber: string
  manager: string
  email: string
  website: string
  status: string
  region: string
  city: string
  postalCode: string
  faxNumber: string
  contactPerson: string
  createdAt: string
  updatedAt: string
}

/**
 * Master Code Response DTO (matches backend MasterCodeResponseDto)
 */
export interface MasterCodeResponseDto {
  id: number
  code: string
  codeName: string
  parentId: number | null
  createdAt: string
  updatedAt: string
}

/**
 * Master Code Children Query Parameters
 */
export interface MasterCodeChildrenParams {
  q?: string
  page?: number
  size?: number
  sort?: string
}
