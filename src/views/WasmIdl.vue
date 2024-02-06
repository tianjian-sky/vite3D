<template>
    <div id="octree-demo-wrap">
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
import { initWasm } from '../libs/three/wasm/webidl/install.js'


defineOptions({
  name: 'WasmIdl'
})
let pts = []
const currentType = ref(0)
const init = function () {
    initWasm().then(WASM => {
        window._WASM = WASM
        console.log('wasm', WASM)
        const foo1 = new WASM.Foo()
        const bar1 = new WASM.Bar(3)
        foo1.setVal(2)
        bar1.doSomething()
        console.log(foo1.getVal(), bar1)
    })
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