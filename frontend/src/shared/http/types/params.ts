/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number
  pageSize: number
}

/**
 * Sort parameters
 */
export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Filter parameters
 */
export interface FilterParams {
  [key: string]: unknown
}

/**
 * Combined query parameters for list endpoints
 */
export interface QueryParams extends PaginationParams, SortParams, FilterParams {}

