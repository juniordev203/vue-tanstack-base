import { ref, onMounted, onUnmounted } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import type { QueryCacheEntry, QueryCacheStats } from '@/types/query'

/**
 * Composable để subscribe và theo dõi trạng thái query cache
 * Tự động cập nhật khi cache thay đổi
 */
export function useQueryCache() {
  const queryClient = useQueryClient()
  const entries = ref<QueryCacheEntry[]>([])
  const stats = ref<QueryCacheStats>({
    totalQueries: 0,
    activeQueries: 0,
    staleQueries: 0,
    errorQueries: 0,
    fetchingQueries: 0,
  })

  let unsubscribe: (() => void) | null = null

  function updateCache() {
    const cache = queryClient.getQueryCache()
    const queries = cache.getAll()

    entries.value = queries.map(query => {
      const state = query.state
      const dataStr = JSON.stringify(state.data)

      return {
        queryKey: query.queryKey,
        queryKeyHash: query.queryHash,
        status: state.status,
        fetchStatus: state.fetchStatus,
        isStale: query.isStale(),
        dataSize: dataStr ? new Blob([dataStr]).size : 0,
        observerCount: query.getObserversCount(),
        lastUpdated: state.dataUpdatedAt || null,
        errorMessage: state.error ? String(state.error) : null,
        data: state.data,
      }
    })

    stats.value = {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.getObserversCount() > 0).length,
      staleQueries: queries.filter(q => q.isStale()).length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      fetchingQueries: queries.filter(q => q.state.fetchStatus === 'fetching').length,
    }
  }

  function refetchQuery(queryKeyHash: string) {
    const cache = queryClient.getQueryCache()
    const query = cache.getAll().find(q => q.queryHash === queryKeyHash)
    if (query) {
      queryClient.refetchQueries({ queryKey: query.queryKey })
    }
  }

  function invalidateQuery(queryKeyHash: string) {
    const cache = queryClient.getQueryCache()
    const query = cache.getAll().find(q => q.queryHash === queryKeyHash)
    if (query) {
      queryClient.invalidateQueries({ queryKey: query.queryKey })
    }
  }

  function removeQuery(queryKeyHash: string) {
    const cache = queryClient.getQueryCache()
    const query = cache.getAll().find(q => q.queryHash === queryKeyHash)
    if (query) {
      queryClient.removeQueries({ queryKey: query.queryKey })
    }
  }

  onMounted(() => {
    updateCache()
    const cache = queryClient.getQueryCache()
    unsubscribe = cache.subscribe(() => {
      updateCache()
    })
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  return {
    entries,
    stats,
    refetchQuery,
    invalidateQuery,
    removeQuery,
    updateCache,
  }
}
