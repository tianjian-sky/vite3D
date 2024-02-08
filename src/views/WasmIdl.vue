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
        const mat1 = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(Math.random(), Math.random(), Math.random()), Math.PI * Math.random())
        const mat2 = new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(Math.random(), Math.random(), Math.random()), Math.PI * Math.random() / 2))
        console.warn(mat1.elements[0], mat1.elements[1])
        console.warn(mat2.elements[0], mat2.elements[1])
        const mat3 = mat1.clone().multiply(mat2)
        const wMat1 = new WASM.Matrix4(
            mat1.elements[0],
            mat1.elements[1],
            mat1.elements[2],
            mat1.elements[3],
            mat1.elements[4],
            mat1.elements[5],
            mat1.elements[6],
            mat1.elements[7],
            mat1.elements[8],
            mat1.elements[9],
            mat1.elements[10],
            mat1.elements[11],
            mat1.elements[12],
            mat1.elements[13],
            mat1.elements[14],
            mat1.elements[15]
        )
        const wMat2 = new WASM.Matrix4(
            mat2.elements[0],
            mat2.elements[1],
            mat2.elements[2],
            mat2.elements[3],
            mat2.elements[4],
            mat2.elements[5],
            mat2.elements[6],
            mat2.elements[7],
            mat2.elements[8],
            mat2.elements[9],
            mat2.elements[10],
            mat2.elements[11],
            mat2.elements[12],
            mat2.elements[13],
            mat2.elements[14],
            mat2.elements[15]
        )
        wMat1.multiply(wMat1, wMat2)
        const res = []
        for (let i = 0; i < 16; i++) {
            res.push(wMat1.getElement(i))
        }
        console.warn('准确性检查：', mat3.elements.join(','), res.join(','))
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