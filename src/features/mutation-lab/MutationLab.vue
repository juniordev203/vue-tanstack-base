<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '@/services/api/client'
import type { Todo, MutationEvent } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/toast'
import { Plus, Check, Undo2, Trash2 } from 'lucide-vue-next'

const queryClient = useQueryClient()
const { toast } = useToast()

// Timeline events
const events = ref<MutationEvent[]>([])

function addEvent(type: MutationEvent['type'], data?: unknown, error?: string) {
  events.value.unshift({
    id: crypto.randomUUID(),
    type,
    timestamp: Date.now(),
    data,
    error,
  })
}

// Fetch todos
const { data: todos, status: todosStatus } = useQuery({
  queryKey: ['mutation-lab-todos'],
  queryFn: () => api.get<Todo[]>('/todos'),
})

// Input cho new todo
const newTodoTitle = ref('')

// --- Mutation: Thêm Todo (với Optimistic Update) ---
const addTodoMutation = useMutation({
  mutationFn: (title: string) => api.post<Todo>('/todos', { title }),

  onMutate: async title => {
    addEvent('mutate', { title })

    // Cancel queries đang chạy
    await queryClient.cancelQueries({ queryKey: ['mutation-lab-todos'] })

    // Snapshot dữ liệu cũ
    const previousTodos = queryClient.getQueryData<Todo[]>(['mutation-lab-todos'])

    // Optimistic update
    const optimisticTodo: Todo = {
      id: Date.now(),
      title,
      completed: false,
    }

    queryClient.setQueryData<Todo[]>(['mutation-lab-todos'], old => {
      return [...(old || []), optimisticTodo]
    })

    addEvent('optimistic', optimisticTodo)

    return { previousTodos }
  },

  onSuccess: data => {
    addEvent('success', data)
    toast({
      title: 'Thành công',
      description: `Đã thêm todo: ${data.title}`,
    })
  },

  onError: (error, _title, context) => {
    addEvent('error', undefined, error.message)

    // Rollback
    if (context?.previousTodos) {
      queryClient.setQueryData(['mutation-lab-todos'], context.previousTodos)
      addEvent('rollback', context.previousTodos)
    }

    toast({
      title: 'Lỗi',
      description: error.message,
      variant: 'destructive',
    })
  },

  onSettled: () => {
    addEvent('settled')
    queryClient.invalidateQueries({ queryKey: ['mutation-lab-todos'] })
  },
})

// --- Mutation: Toggle Todo ---
const toggleTodoMutation = useMutation({
  mutationFn: (todo: Todo) => api.patch<Todo>(`/todos/${todo.id}`, { completed: !todo.completed }),

  onMutate: async todo => {
    addEvent('mutate', { id: todo.id, action: 'toggle' })

    await queryClient.cancelQueries({ queryKey: ['mutation-lab-todos'] })
    const previousTodos = queryClient.getQueryData<Todo[]>(['mutation-lab-todos'])

    // Optimistic update
    queryClient.setQueryData<Todo[]>(['mutation-lab-todos'], old =>
      (old || []).map(t => (t.id === todo.id ? { ...t, completed: !t.completed } : t))
    )

    addEvent('optimistic', { id: todo.id, completed: !todo.completed })

    return { previousTodos }
  },

  onError: (error, _todo, context) => {
    addEvent('error', undefined, error.message)
    if (context?.previousTodos) {
      queryClient.setQueryData(['mutation-lab-todos'], context.previousTodos)
      addEvent('rollback')
    }
  },

  onSettled: () => {
    addEvent('settled')
    queryClient.invalidateQueries({ queryKey: ['mutation-lab-todos'] })
  },
})

// --- Mutation: Xóa Todo ---
const deleteTodoMutation = useMutation({
  mutationFn: (id: number) => api.delete(`/todos/${id}`),

  onMutate: async id => {
    addEvent('mutate', { id, action: 'delete' })

    await queryClient.cancelQueries({ queryKey: ['mutation-lab-todos'] })
    const previousTodos = queryClient.getQueryData<Todo[]>(['mutation-lab-todos'])

    queryClient.setQueryData<Todo[]>(['mutation-lab-todos'], old =>
      (old || []).filter(t => t.id !== id)
    )

    addEvent('optimistic', { id, action: 'removed' })

    return { previousTodos }
  },

  onError: (error, _id, context) => {
    addEvent('error', undefined, error.message)
    if (context?.previousTodos) {
      queryClient.setQueryData(['mutation-lab-todos'], context.previousTodos)
      addEvent('rollback')
    }
  },

  onSettled: () => {
    addEvent('settled')
    queryClient.invalidateQueries({ queryKey: ['mutation-lab-todos'] })
  },
})

function handleAddTodo() {
  if (!newTodoTitle.value.trim()) return
  addTodoMutation.mutate(newTodoTitle.value)
  newTodoTitle.value = ''
}

function clearTimeline() {
  events.value = []
}

function formatTimestamp(ts: number): string {
  const date = new Date(ts)
  const time = date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const ms = String(date.getMilliseconds()).padStart(3, '0')
  return `${time}.${ms}`
}

const eventVariant = computed(() => {
  return (type: MutationEvent['type']) => {
    switch (type) {
      case 'mutate':
        return 'secondary' as const
      case 'success':
        return 'default' as const
      case 'error':
        return 'destructive' as const
      case 'optimistic':
        return 'outline' as const
      case 'rollback':
        return 'destructive' as const
      case 'settled':
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
      <h2 class="text-3xl font-bold tracking-tight">Mutation Lab</h2>
      <p class="text-muted-foreground">
        Thử nghiệm optimistic update, rollback và mutation lifecycle
      </p>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Todo List Panel -->
      <div class="space-y-4">
        <!-- Add Todo -->
        <Card>
          <CardHeader>
            <CardTitle>Thêm Todo</CardTitle>
            <CardDescription>Sử dụng optimistic update khi thêm</CardDescription>
          </CardHeader>
          <CardContent>
            <form class="flex gap-2" @submit.prevent="handleAddTodo">
              <Input v-model="newTodoTitle" placeholder="Nhập tiêu đề todo..." class="flex-1" />
              <Button type="submit" :disabled="addTodoMutation.isPending.value">
                <Plus class="mr-2 h-4 w-4" />
                Thêm
              </Button>
            </form>
          </CardContent>
        </Card>

        <!-- Todo List -->
        <Card>
          <CardHeader>
            <CardTitle>Danh sách Todos</CardTitle>
            <CardDescription>
              <Badge :variant="todosStatus === 'success' ? 'default' : 'secondary'">
                {{ todosStatus }}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="todo in todos" :key="todo.id">
                  <TableCell class="font-mono text-xs">{{ todo.id }}</TableCell>
                  <TableCell :class="{ 'line-through opacity-50': todo.completed }">
                    {{ todo.title }}
                  </TableCell>
                  <TableCell>
                    <Badge :variant="todo.completed ? 'default' : 'outline'">
                      {{ todo.completed ? 'Done' : 'Pending' }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div class="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Toggle"
                        @click="toggleTodoMutation.mutate(todo)"
                      >
                        <Check class="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        @click="deleteTodoMutation.mutate(todo.id)"
                      >
                        <Trash2 class="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow v-if="!todos?.length">
                  <TableCell :colspan="4" class="text-center text-muted-foreground">
                    Chưa có todo nào
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <!-- Mutation Timeline Panel -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Mutation Timeline</CardTitle>
            <CardDescription>Theo dõi lifecycle của mutations</CardDescription>
          </div>
          <Button variant="outline" size="sm" @click="clearTimeline">
            <Undo2 class="mr-2 h-4 w-4" />
            Clear
          </Button>
        </CardHeader>
        <CardContent>
          <div v-if="events.length === 0" class="py-8 text-center text-muted-foreground">
            Chưa có mutation events. Thử thêm, toggle hoặc xóa todo.
          </div>
          <div v-else class="max-h-[600px] space-y-2 overflow-auto">
            <div
              v-for="event in events"
              :key="event.id"
              class="flex items-start gap-3 rounded-md border p-3"
            >
              <Badge :variant="eventVariant(event.type)" class="mt-0.5 shrink-0">
                {{ event.type }}
              </Badge>
              <div class="min-w-0 flex-1">
                <div class="text-xs text-muted-foreground">
                  {{ formatTimestamp(event.timestamp) }}
                </div>
                <div v-if="event.data" class="mt-1">
                  <code class="block overflow-auto rounded bg-muted p-1 text-xs">
                    {{ JSON.stringify(event.data) }}
                  </code>
                </div>
                <div v-if="event.error" class="mt-1 text-sm text-destructive">
                  {{ event.error }}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
