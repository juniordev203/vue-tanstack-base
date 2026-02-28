<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { cn } from '@/lib/utils'
import { Database, Globe, FlaskConical } from 'lucide-vue-next'

const route = useRoute()

const navItems = [
  {
    name: 'Query Manager',
    path: '/query-manager',
    icon: Database,
    description: 'Quản lý và kiểm tra query cache',
  },
  {
    name: 'API Explorer',
    path: '/api-explorer',
    icon: Globe,
    description: 'Thử nghiệm dynamic queries',
  },
  {
    name: 'Mutation Lab',
    path: '/mutation-lab',
    icon: FlaskConical,
    description: 'Thử nghiệm mutation behavior',
  },
]

const currentPath = computed(() => route.path)
</script>

<template>
  <nav class="flex h-full w-64 flex-col border-r bg-card">
    <!-- Logo / Title -->
    <div class="border-b p-4">
      <h1 class="text-lg font-bold text-foreground">VQ DevDashboard</h1>
      <p class="text-xs text-muted-foreground">Vue Query Dev Tools</p>
    </div>

    <!-- Navigation Items -->
    <div class="flex-1 space-y-1 p-2">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :class="
          cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
            currentPath === item.path
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )
        "
      >
        <component :is="item.icon" class="h-4 w-4" />
        <div>
          <div class="font-medium">{{ item.name }}</div>
          <div
            :class="
              cn(
                'text-xs',
                currentPath === item.path ? 'text-primary-foreground/70' : 'text-muted-foreground'
              )
            "
          >
            {{ item.description }}
          </div>
        </div>
      </RouterLink>
    </div>

    <!-- Footer -->
    <div class="border-t p-4">
      <p class="text-xs text-muted-foreground">Vue 3 + TanStack Query</p>
    </div>
  </nav>
</template>
