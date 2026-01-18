/**
 * Master Code Response DTO (local copy to avoid cross-module imports)
 */
export interface MasterCodeResponseDto {
  id: number
  code: string
  codeName: string
  parentId?: number | null
  createdAt?: string
  updatedAt?: string
}

/**
 * Master Code Children Query Parameters
 */
export interface MasterCodeChildrenParams {
  page?: number
  size?: number
  sort?: string
  q?: string
}

/**
 * Program Response DTO (matches backend ProgramResponseDto)
 */
export interface ProgramResponseDto {
  id: number
  programId?: string | null
  sessionPart?: MasterCodeResponseDto | null
  name: string
  status?: MasterCodeResponseDto | null
  programType?: MasterCodeResponseDto | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

/**
 * List Programs Query Parameters
 */
export interface ListProgramsParams {
  q?: string
  page?: number
  size?: number
  sort?: string
  sessionPartId?: number | null
  statusId?: number | null
  sessionPartIds?: number[]
  statusIds?: number[]
}

/**
 * Program type for table display
 */
export interface Program {
  id: number
  programId: string
  programName: string
  sessionPart: string
  status: string
  programType: string
  notes: string
  createdAt: string
  updatedAt: string
}

/**
 * Program Create DTO (matches backend ProgramCreateDto)
 */
export interface ProgramCreateDto {
  sessionPartId: number
  name: string
  statusId: number
  programTypeId?: number | null
  notes?: string | null
}

/**
 * Program Update DTO (matches backend ProgramUpdateDto)
 */
export interface ProgramUpdateDto {
  sessionPartId: number
  name: string
  statusId: number
  programTypeId?: number | null
  notes?: string | null
}

/**
 * Program Filter Data (for filter dialog)
 */
export interface ProgramFilterData {
  status?: string[]
}

/**
 * Program Export Parameters
 */
export interface ExportProgramsParams {
  q?: string
  statusIds?: number[]
}
