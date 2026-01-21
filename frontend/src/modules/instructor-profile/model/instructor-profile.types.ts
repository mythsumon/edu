/**
 * Master Code Response DTO (matches backend MasterCodeResponseDto)
 */
export interface MasterCodeResponseDto {
  id: number
  code: string
  codeName: string
  parentId: number | null
  createdAt: string
  updatedAt: string | null
}

/**
 * Instructor Response DTO (matches backend InstructorResponseDto)
 */
export interface InstructorResponseDto {
  userId: number
  instructorId?: string
  username: string
  name: string
  email?: string
  phone?: string
  gender?: string
  dob?: string
  regionId?: number
  cityId?: number
  street?: string
  detailAddress?: string
  statusId?: number
  classificationId?: number
  signature?: string
  profilePhoto?: string
  enabled?: boolean
  affiliation?: string
}

/**
 * Instructor Update Request DTO (PUT - full update)
 */
export interface InstructorUpdateRequestDto {
  name: string
  email: string
  phone?: string
  gender?: string
  dob?: string
  regionId?: number
  cityId?: number
  street?: string
  detailAddress?: string
  statusId?: number
  classificationId?: number
  affiliation?: string
}

/**
 * Instructor Patch Request DTO (PATCH - partial update, all fields optional)
 */
export interface InstructorPatchRequestDto {
  name?: string
  email?: string
  phone?: string
  gender?: string
  dob?: string
  regionId?: number
  cityId?: number
  street?: string
  detailAddress?: string
  statusId?: number
  classificationId?: number
  affiliation?: string
  signature?: string | null
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
