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
 * Master Code Create Request DTO (matches backend MasterCodeCreateDto)
 */
export interface MasterCodeCreateDto {
  code: string
  codeName: string
  parentId: number | null
}

/**
 * Master Code Update Request DTO (matches backend MasterCodeUpdateDto)
 */
export interface MasterCodeUpdateDto {
  code: string
  codeName: string
  parentId?: number | null
}

/**
 * List Master Codes Query Parameters
 */
export interface ListMasterCodesParams {
  q?: string
  page?: number
  size?: number
  sort?: string
  parentId?: number
  rootOnly?: boolean
}

/**
 * Master Code Tree DTO (matches backend MasterCodeTreeDto)
 */
export interface MasterCodeTreeDto {
  id: number
  code: string
  codeName: string
  parentId: number | null
  createdAt: string
  updatedAt: string
  children: MasterCodeTreeDto[]
}
