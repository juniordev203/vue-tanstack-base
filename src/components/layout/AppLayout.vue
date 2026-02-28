<script setup lang="ts">
import AppNav from './AppNav.vue'
import { Toaster } from '@/components/ui/toast'
</script>

<template>
  <div class="flex h-screen bg-background">
    <!-- Sidebar Navigation -->
    <AppNav />

    <!-- Main Content -->
    <main class="flex-1 overflow-auto">
      <div class="container py-6">
        <slot />
      </div>
    </main>

    <!-- Toast Notifications -->
    <Toaster />
  </div>
</template>
