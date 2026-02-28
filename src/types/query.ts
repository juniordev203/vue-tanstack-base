// ===== Query Cache Types =====

export type QueryStatus = 'pending' | 'error' | 'success'
export type FetchStatus = 'fetching' | 'paused' | 'idle'

export interface QueryCacheEntry {
  queryKey: readonly unknown[]
  queryKeyHash: string
  status: QueryStatus
  fetchStatus: FetchStatus
  isStale: boolean
  dataSize: number
  observerCount: number
  lastUpdated: number | null
  errorMessage: string | null
  data: unknown
}

export interface QueryCacheStats {
  totalQueries: number
  activeQueries: number
  staleQueries: number
  errorQueries: number
  fetchingQueries: number
}
