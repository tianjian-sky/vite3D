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
            path: '/babylonGpuPick',
            name: 'babylonGpuPick',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/BabylonGpuPick.vue')
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
        },
        {
            path: '/sheetJs',
            name: 'sheetJs',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/SheetJs.vue')
        },
        {
            path: '/luckySheet',
            name: 'luckySheet',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/LuckySheet.vue')
        },
        {
            path: '/bvh',
            name: 'bvh',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/Bvh.vue')
        },
        {
            path: '/octree',
            name: 'octree',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/Octree.vue')
        },
        {
            path: '/wasmBenchmark',
            name: 'WasmBenchMark',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/WasmBenchmark.vue')
        },
        {
            path: '/wasmTest',
            name: 'WasmTest',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/WasmTest.vue')
        },
        {
            path: '/wasmCompare',
            name: 'WasmCompare',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/WasmCompare.vue')
        },
        {
            path: '/wasmLinking',
            name: 'wasmLinking',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/WasmLinking.vue')
        },
        {
            path: '/bimFace',
            name: 'BimFace',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/BimFace.vue')
        },
        {
            path: '/gltfLoader',
            name: 'gltfLoader',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/GltfLoader.vue')
        }
    ]
})

export default router
