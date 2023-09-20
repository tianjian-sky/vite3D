import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
console.log('BASE_URL', import.meta.env.BASE_URL)
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/babylon',
            name: 'babylon',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/Babylon.vue')
        },
        {
            path: '/webgpu',
            name: 'webgpu',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/WebGPU.vue')
        },
        {
            path: '/mobaController',
            name: 'vant',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/MobaController.vue')
        },
        {
            path: '/excelDemo',
            name: 'excel',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/Excel.vue')
        }
    ]
})

export default router
