import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
// 配置路由信息
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@renderer/layout/RootView.vue'),
    children: [
      {
        name: 'main',
        path: 'main',
        component: () => import('@renderer/views/main/MainPage.vue'),
      },
      {
        name: 'about',
        path: 'about',
        component: () => import('@renderer/views/about/AboutPage.vue'),
      },
    ],
  },
]

const router = createRouter({
  routes,
  history: createWebHashHistory(),
})

export default router
