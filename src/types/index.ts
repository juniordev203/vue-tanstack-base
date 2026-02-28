// ===== API Response Types =====

export interface ApiResponse<T> {
  data: T
  message?: string
  timestamp?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// ===== Domain Types =====

export interface Todo {
  id: number
  title: string
  completed: boolean
}

export interface User {
  id: number
  name: string
  email: string
  role: string
}

export interface Post {
  id: number
  title: string
  userId: number
  body: string
}

// ===== API Explorer Types =====

export interface ApiExplorerConfig {
  endpoint: string
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  queryParams: Record<string, string>
  headers: Record<string, string>
  staleTime: number
  retryCount: number
  enabled: boolean
}

// ===== Mutation Lab Types =====

export interface MutationEvent {
  id: string
  type: 'mutate' | 'success' | 'error' | 'settled' | 'optimistic' | 'rollback'
  timestamp: number
  data?: unknown
  error?: string
}
