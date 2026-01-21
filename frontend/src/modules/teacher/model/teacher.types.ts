/**
 * Teacher Response DTO (matches backend TeacherResponseDto)
 */
export interface TeacherResponseDto {
  userId: number
  username: string
  name: string
  email: string | null
  phone: string | null
  statusId: number | null
  profilePhoto: string | null
  enabled: boolean
}

/**
 * Teacher List Query Parameters
 */
export interface ListTeachersParams {
  q?: string
  page?: number
  size?: number
  sort?: string
}
