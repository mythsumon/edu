import { useQuery } from '@tanstack/react-query'
import { 
  masterCodeByIdQueryOptions, 
  masterCodeByCodeQueryOptions,
  masterCodeChildrenByCodeQueryOptions,
} from './instructor-profile.query-options'
import type { MasterCodeChildrenParams } from '../model/instructor-profile.types'

/**
 * Query hook for fetching master code by ID
 * Endpoint: GET /api/v1/mastercode/{id}
 */
export const useMasterCodeByIdQuery = (
  id: number | null | undefined,
  enabled: boolean = true
) => {
  return useQuery({
    ...masterCodeByIdQueryOptions(id!),
    enabled: enabled && id !== null && id !== undefined,
  })
}

/**
 * Query hook for fetching master code by code
 * Endpoint: GET /api/v1/mastercode/code/{code}
 */
export const useMasterCodeByCodeQuery = (
  code: string | null | undefined,
  enabled: boolean = true
) => {
  return useQuery({
    ...masterCodeByCodeQueryOptions(code!),
    enabled: enabled && code !== null && code !== undefined && code.trim() !== '',
  })
}

/**
 * Query hook for fetching master code children by code
 * Endpoint: GET /api/v1/mastercode/{code}/children
 */
export const useMasterCodeChildrenByCodeQuery = (
  code: string | null | undefined,
  params?: MasterCodeChildrenParams,
  enabled: boolean = true
) => {
  return useQuery({
    ...masterCodeChildrenByCodeQueryOptions(code!, params),
    enabled: enabled && code !== null && code !== undefined && code.trim() !== '',
  })
}
