/**
 * API endpoint constants for instructor profile module
 */
export const INSTRUCTOR_PROFILE_ENDPOINTS = {
  /**
   * Master Code endpoints
   */
  masterCode: {
    /**
     * Get master code by ID
     * GET /api/v1/mastercode/{id}
     */
    byId: (id: number) => `/mastercode/${id}`,
    
    /**
     * Get master code by code
     * GET /api/v1/mastercode/code/{code}
     */
    byCode: (code: string) => `/mastercode/code/${code}`,
    
    /**
     * Get children of master code by code
     * GET /api/v1/mastercode/{code}/children
     */
    childrenByCode: (code: string) => `/mastercode/${code}/children`,
  },
  
  /**
   * Instructor endpoints
   */
  instructor: {
    /**
     * Update instructor (PUT - full update)
     * PUT /api/v1/instructor/{userId}
     */
    update: (userId: number) => `/instructor/${userId}`,
    
    /**
     * Patch instructor (PATCH - partial update)
     * PATCH /api/v1/instructor/{userId}
     */
    patch: (userId: number) => `/instructor/${userId}`,
  },
} as const
