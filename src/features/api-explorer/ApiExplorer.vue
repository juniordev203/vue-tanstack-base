<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { apiFetch } from '@/services/api/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Play, Trash2, RotateCcw } from 'lucide-vue-next'

const queryClient = useQueryClient()

// Form state
const endpoint = ref('/echo')
const queryParams = ref('')
const customHeaders = ref('')
const staleTime = ref(60000)
const retryCount = ref(1)
const enabled = ref(false)

// Parse query params từ string "key=value&key2=value2"
const parsedParams = computed(() => {
  if (!queryParams.value.trim()) return {}
  const params: Record<string, string> = {}
  queryParams.value.split('&').forEach(pair => {
    const [key, value] = pair.split('=')
    if (key) params[key.trim()] = value?.trim() || ''
  })
  return params
})

// Parse headers từ string "key:value\nkey2:value2"
const parsedHeaders = computed(() => {
  if (!customHeaders.value.trim()) return {}
  const headers: Record<string, string> = {}
  customHeaders.value.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':')
    if (key) headers[key.trim()] = valueParts.join(':').trim()
  })
  return headers
})

// Dynamic query key dựa trên form input
const queryKey = computed(() => ['api-explorer', endpoint.value, parsedParams.value])

// Sử dụng Vue Query với dynamic options
const { data, error, status, fetchStatus, dataUpdatedAt, errorUpdatedAt, isStale, refetch } =
  useQuery({
    queryKey: queryKey,
    queryFn: () =>
      apiFetch(endpoint.value, {
        params: parsedParams.value,
        headers: parsedHeaders.value,
      }),
    enabled: enabled,
    staleTime: computed(() => staleTime.value),
    retry: computed(() => retryCount.value),
  })

function executeQuery() {
  enabled.value = true
  // Nếu đã enabled trước đó, cần refetch
  if (enabled.value) {
    refetch()
  }
}

function clearResult() {
  enabled.value = false
  queryClient.removeQueries({ queryKey: queryKey.value })
}

function formatTime(timestamp: number): string {
  if (!timestamp) return '—'
  return new Date(timestamp).toLocaleTimeString('vi-VN')
}

// Preset endpoints
const presets = [
  { label: 'Echo', endpoint: '/echo', params: 'msg=hello&lang=vi' },
  { label: 'Todos', endpoint: '/todos', params: '' },
  { label: 'Users', endpoint: '/users', params: '' },
  { label: 'Posts', endpoint: '/posts', params: '' },
  { label: 'Slow (3s)', endpoint: '/slow', params: '' },
  { label: 'Error 500', endpoint: '/error', params: '' },
]

function applyPreset(preset: (typeof presets)[0]) {
  endpoint.value = preset.endpoint
  queryParams.value = preset.params
  enabled.value = false
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h2 class="text-3xl font-bold tracking-tight">API Explorer</h2>
      <p class="text-muted-foreground">Thử nghiệm dynamic queries với các endpoint khác nhau</p>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Form Panel -->
      <Card>
        <CardHeader>
          <CardTitle>Request Config</CardTitle>
          <CardDescription>Cấu hình endpoint và query parameters</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- Presets -->
          <div>
            <label class="mb-2 block text-sm font-medium">Preset Endpoints</label>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="preset in presets"
                :key="preset.endpoint"
                variant="outline"
                size="sm"
                @click="applyPreset(preset)"
              >
                {{ preset.label }}
              </Button>
            </div>
          </div>

          <!-- Endpoint -->
          <div>
            <label class="mb-2 block text-sm font-medium">Endpoint</label>
            <Input v-model="endpoint" placeholder="/api/endpoint" />
          </div>

          <!-- Query Params -->
          <div>
            <label class="mb-2 block text-sm font-medium"
              >Query Params (key=value&key2=value2)</label
            >
            <Input v-model="queryParams" placeholder="key=value&key2=value2" />
          </div>

          <!-- Headers -->
          <div>
            <label class="mb-2 block text-sm font-medium"
              >Headers (key:value, mỗi dòng 1 header)</label
            >
            <textarea
              v-model="customHeaders"
              class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Authorization: Bearer token&#10;X-Custom: value"
            />
          </div>

          <!-- Options -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-2 block text-sm font-medium">Stale Time (ms)</label>
              <Input v-model.number="staleTime" type="number" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium">Retry Count</label>
              <Input v-model.number="retryCount" type="number" min="0" max="10" />
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <Button class="flex-1" @click="executeQuery">
              <Play class="mr-2 h-4 w-4" />
              Fetch
            </Button>
            <Button variant="outline" @click="refetch()">
              <RotateCcw class="mr-2 h-4 w-4" />
              Refetch
            </Button>
            <Button variant="destructive" @click="clearResult">
              <Trash2 class="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Response Panel -->
      <Card>
        <CardHeader>
          <CardTitle>Response</CardTitle>
          <CardDescription>Kết quả và trạng thái query</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- Status Badges -->
          <div class="flex flex-wrap gap-2">
            <Badge
              :variant="
                status === 'success' ? 'default' : status === 'error' ? 'destructive' : 'secondary'
              "
            >
              Status: {{ status }}
            </Badge>
            <Badge :variant="fetchStatus === 'fetching' ? 'default' : 'outline'">
              Fetch: {{ fetchStatus }}
            </Badge>
            <Badge :variant="isStale ? 'secondary' : 'outline'">
              {{ isStale ? 'Stale' : 'Fresh' }}
            </Badge>
          </div>

          <!-- Query Key -->
          <div>
            <label class="mb-1 block text-sm font-medium">Query Key</label>
            <code class="block rounded bg-muted p-2 text-xs">
              {{ JSON.stringify(queryKey) }}
            </code>
          </div>

          <!-- Timestamps -->
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-muted-foreground">Data Updated:</span>
              <span class="ml-1">{{ formatTime(dataUpdatedAt) }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">Error Updated:</span>
              <span class="ml-1">{{ formatTime(errorUpdatedAt) }}</span>
            </div>
          </div>

          <!-- Error -->
          <div v-if="error" class="rounded-md border border-destructive bg-destructive/10 p-3">
            <p class="text-sm font-medium text-destructive">Lỗi:</p>
            <p class="text-sm text-destructive">{{ error.message }}</p>
          </div>

          <!-- Data -->
          <div>
            <label class="mb-1 block text-sm font-medium">Data</label>
            <pre class="max-h-[400px] overflow-auto rounded-md bg-muted p-3 text-xs">{{
              data ? JSON.stringify(data, null, 2) : 'Chưa có dữ liệu'
            }}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
