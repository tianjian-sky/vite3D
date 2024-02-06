<template>
    <div id="octree-demo-wrap">
        <div><button @click="test">增加1500000个int</button></div>
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
import { initWasm } from '../libs/three/wasm/memory/install.js'


defineOptions({
  name: 'WasmMemory'
})
let pts = []
const currentType = ref(0)
const init = function () {
    initWasm().then(WASM => {
        window._WASM = WASM
        console.log('wasm', WASM)
    })
}

const test = () => {
    const len = 1500000
    console.log('增加：' + 4 * 1500000 / 1024 / 1024 + 'mb的数据')
    const pt = window._WASM.cwrap('addData', 'number', [])
    console.log('数据检查:', window._WASM.getValue(pt, 'float'), window._WASM.getValue(pt + Float32Array.BYTES_PER_ELEMENT * len, 'float'))
}

onMounted(() => {
    init()
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