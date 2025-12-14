// API Endpoints
export const API_ENDPOINTS = {
  // User endpoints
  USERS: '/api/users',
  USER: (id: string) => `/api/users/${id}`,
  
  // Program endpoints
  PROGRAMS: '/api/programs',
  PROGRAM: (id: string) => `/api/programs/${id}`,
  
  // Institution endpoints
  INSTITUTIONS: '/api/institutions',
  INSTITUTION: (id: string) => `/api/institutions/${id}`,
  
  // Region endpoints
  REGIONS: '/api/regions',
  REGION: (id: string) => `/api/regions/${id}`,
  
  // Special items endpoints
  SPECIAL_ITEMS: '/api/special-items',
};