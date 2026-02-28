import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/query-manager',
    },
    {
      path: '/query-manager',
      name: 'QueryManager',
      component: () => import('@/features/query-manager/QueryManager.vue'),
      meta: { title: 'Query Manager' },
    },
    {
      path: '/api-explorer',
      name: 'ApiExplorer',
      component: () => import('@/features/api-explorer/ApiExplorer.vue'),
      meta: { title: 'API Explorer' },
    },
    {
      path: '/mutation-lab',
      name: 'MutationLab',
      component: () => import('@/features/mutation-lab/MutationLab.vue'),
      meta: { title: 'Mutation Lab' },
    },
  ],
})

// Cập nhật document title khi chuyển route
router.afterEach(to => {
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} | VQ DevDashboard` : 'VQ DevDashboard'
})

export default router
