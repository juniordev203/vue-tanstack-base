<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useQueryCache } from './composables/useQueryCache'
import { api } from '@/services/api/client'
import type { Todo, User, Post } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RefreshCw, Trash2, XCircle } from 'lucide-vue-next'

// Tạo một vài queries demo để có dữ liệu trong cache
useQuery({
  queryKey: ['todos'],
  queryFn: () => api.get<Todo[]>('/todos'),
})

useQuery({
  queryKey: ['users'],
  queryFn: () => api.get<User[]>('/users'),
})

useQuery({
  queryKey: ['posts'],
  queryFn: () => api.get<Post[]>('/posts'),
})

const { entries, stats, refetchQuery, invalidateQuery, removeQuery } = useQueryCache()

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatTime(timestamp: number | null): string {
  if (!timestamp) return '—'
  return new Date(timestamp).toLocaleTimeString('vi-VN')
}

function formatQueryKey(key: readonly unknown[]): string {
  return JSON.stringify(key)
}

const statusVariant = computed(() => {
  return (status: string) => {
    switch (status) {
      case 'success':
        return 'default' as const
      case 'error':
        return 'destructive' as const
      case 'pending':
        return 'secondary' as const
      default:
        return 'outline' as const
    }
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h2 class="text-3xl font-bold tracking-tight">Query Manager</h2>
      <p class="text-muted-foreground">Hiển thị và quản lý toàn bộ query trong cache</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 gap-4 md:grid-cols-5">
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Tổng Queries</CardDescription>
          <CardTitle class="text-2xl">{{ stats.totalQueries }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Active</CardDescription>
          <CardTitle class="text-2xl text-green-600">{{ stats.activeQueries }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Stale</CardDescription>
          <CardTitle class="text-2xl text-yellow-600">{{ stats.staleQueries }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Error</CardDescription>
          <CardTitle class="text-2xl text-red-600">{{ stats.errorQueries }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Fetching</CardDescription>
          <CardTitle class="text-2xl text-blue-600">{{ stats.fetchingQueries }}</CardTitle>
        </CardHeader>
      </Card>
    </div>

    <!-- Query Table -->
    <Card>
      <CardHeader>
        <CardTitle>Query Cache</CardTitle>
        <CardDescription>Danh sách tất cả queries hiện có trong cache</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Query Key</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fetch</TableHead>
              <TableHead>Observers</TableHead>
              <TableHead>Stale</TableHead>
              <TableHead>Data Size</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="entry in entries" :key="entry.queryKeyHash">
              <TableCell class="font-mono text-xs">
                {{ formatQueryKey(entry.queryKey) }}
              </TableCell>
              <TableCell>
                <Badge :variant="statusVariant(entry.status)">
                  {{ entry.status }}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge :variant="entry.fetchStatus === 'fetching' ? 'default' : 'outline'">
                  {{ entry.fetchStatus }}
                </Badge>
              </TableCell>
              <TableCell>{{ entry.observerCount }}</TableCell>
              <TableCell>
                <Badge :variant="entry.isStale ? 'secondary' : 'outline'">
                  {{ entry.isStale ? 'Stale' : 'Fresh' }}
                </Badge>
              </TableCell>
              <TableCell>{{ formatBytes(entry.dataSize) }}</TableCell>
              <TableCell>{{ formatTime(entry.lastUpdated) }}</TableCell>
              <TableCell>
                <div class="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Refetch"
                    @click="refetchQuery(entry.queryKeyHash)"
                  >
                    <RefreshCw class="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Invalidate"
                    @click="invalidateQuery(entry.queryKeyHash)"
                  >
                    <XCircle class="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Remove"
                    @click="removeQuery(entry.queryKeyHash)"
                  >
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow v-if="entries.length === 0">
              <TableCell :colspan="8" class="text-center text-muted-foreground">
                Chưa có query nào trong cache
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
