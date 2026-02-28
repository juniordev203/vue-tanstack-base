import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'

import App from './App.vue'
import router from './router'
import { vueQueryPluginOptions } from './libs/query-client'

import './assets/styles/globals.css'

async function bootstrap() {
  const app = createApp(App)

  // Setup MSW cho development
  if (import.meta.env.DEV) {
    const { worker } = await import('./libs/msw/browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
    })
  }

  app.use(createPinia())
  app.use(router)
  app.use(VueQueryPlugin, vueQueryPluginOptions)

  app.mount('#app')
}

bootstrap()
