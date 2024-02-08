<template>
    <div id="octree-demo-wrap">
        <select id="module-select" v-model="currentType" @change="init()">
            <option v-for="item in modules" :value="item.id">{{item.desc}}</option>
        </select>
        <div><button @click="test">开始测试</button></div>
        <p id="result"></p>
    </div>
    
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast, MeshBVHVisualizer } from 'three-mesh-bvh'
import Stats from '../libs/three/stats.module.js'
import { GLTFLoader } from '../libs/three/loaders/GLTFLoader.js'
import { RoamingControls } from '../libs/three/RoamingControls.js'
import { Octree } from '../libs/three/math/Octree.js';
import { OctreeHelper } from '../libs/three/helpers/OctreeHelper.js';
import { GUI } from 'lil-gui'
import { initWasm as initWasm1 } from '../libs/three/wasm/static_linking/install'
import { initWasm as initWasm2 } from '../libs/three/wasm/dy_linking_full/install'
import { initWasm as initWasm3 } from '../libs/three/wasm/dy_linking/install'
import { initWasm as initWasm4 } from '../libs/three/wasm/dy_linking_runtim_dlopen_preload-file/install.js'
import { initWasm as initWasm5 } from '../libs/three/wasm/dy_linking_runtim_dlopen/install'


defineOptions({
  name: 'WasmLinking'
})

const modules = [
{
        id: 0,
        desc: '请选择',
        path: ''
    },
    {
        id: 1,
        desc: '静态链接',
        path: '',
        fn: initWasm1
    },
    {
        id: 2,
        desc: '动态链接(Load-time Dynamic Linking) 全部',
        path: '',
        fn: initWasm2
    },
    {
        id: 3,
        desc: '动态链接(Load-time Dynamic Linking) 按需',
        path: '',
        fn: initWasm3
    },
    {
        id: 5,
        desc: '动态链接(runtime Dynamic Linking) dlopen',
        path: '',
        fn: initWasm5
    },
    {
        id: 4,
        desc: '动态链接(runtime Dynamic Linking) preload_file ',
        path: '',
        fn: initWasm4
    }
]
const currentType = ref(0)
const init = function () {
    const item = modules.find(item => item.id == currentType.value)
    if (!item || !item.fn) return
    item.fn(item.id).then(WASM => {
        window._WASM = WASM
        console.log('wasm', item.id, WASM)
        WASM.asm.say && WASM.asm.say()
        // WASM.asm.sayHi && WASM.asm.sayHi()
        // WASM.asm.sayGoodBye && WASM.asm.sayGoodBye()
        // WASM.asm.boostFn && WASM.asm.boostFn()
    })
}

const test = () => {
    document.getElementById('result').innerHTML = ''
}

onMounted(() => {
})
</script>

<style lang="scss" scoped>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
    background: $injectedColor;
    #renderCanvas {
      position: relative;
      width: 100%;
    }
  }
}
</style>

<style lang="stylus" scoped>
@media (min-width: 1024px) {
    .about {
        color: $specialColor;

        #renderCanvas {
            position: relative;
            height: 100%;
        }
    }
}
</style>../libs/three/wasm/static_linking/install.js../libs/three/wasm/static_linking/install.js