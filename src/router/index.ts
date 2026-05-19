import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../views/Test1.vue'),
    },
    {
      path: '/test2',
      component: () => import('../views/Test2.vue'),
    },
    {
      path: '/readme',
      component: () => import('../views/ReadmeDemo.vue'),
    },
  ],
})

export default router
