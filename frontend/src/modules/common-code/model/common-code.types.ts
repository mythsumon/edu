/**
 * Common Code Response DTO (uses mastercode endpoint - matches backend MasterCodeResponseDto)
 */
export interface CommonCodeResponseDto {
  id: number
  code: string
  codeName: string
  parentId: number | null
  createdAt: string
  updatedAt: string
}

/**
 * Common Code Create Request DTO (uses mastercode endpoint - matches backend MasterCodeCreateDto)
 */
export interface CommonCodeCreateDto {
  code: string
  codeName: string
  parentId: number | null
}

/**
 * Common Code Update Request DTO (uses mastercode endpoint - matches backend MasterCodeUpdateDto)
 */
export interface CommonCodeUpdateDto {
  code: string
  codeName: string
  parentId?: number | null
}

/**
 * List Common Codes Query Parameters
 */
export interface ListCommonCodesParams {
  q?: string
  page?: number
  size?: number
  sort?: string
  parentId?: number
  rootOnly?: boolean
}

/**
 * Common Code Tree DTO (uses mastercode endpoint - matches backend MasterCodeTreeDto)
 */
export interface CommonCodeTreeDto {
  id: number
  code: string
  codeName: string
  parentId: number | null
  createdAt: string
  updatedAt: string
  children: CommonCodeTreeDto[]
}
