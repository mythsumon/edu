import { QueryClient } from '@tanstack/react-query'

/**
 * React Query client configuration
 * 
 * Default staleTime: 5 minutes (300,000 ms)
 * - Data is considered fresh for 5 minutes after fetching
 * - Queries won't refetch automatically during this time
 * - Individual queries can override this if needed
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes (300,000 milliseconds)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

