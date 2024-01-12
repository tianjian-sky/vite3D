<template>
    <div id="octree-demo-wrap">
        <div>
            循环次数<input type="number" v-model="loops" />
        </div>
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
import { initWasm } from '../libs/three/wasm/install.js'

defineOptions({
  name: 'WasmBenchMark'
})

const loops = ref(1000)

const durations = []
const wasmDurations = []


let mat1 = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 2, 3), Math.PI / 4)
let mat2 = new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 2, 5), Math.PI / 3))
/*
*
 * js call c
 */
let pt1_1
let pt2_1

const prepareMat = (index, useWasm) => {
    const t = performance.now()
    mat1 = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(Math.random(), Math.random(), Math.random()), Math.PI * Math.random())
    mat2 = new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(Math.random(), Math.random(), Math.random()), Math.PI * Math.random() / 2))
    if (useWasm) {
        window._WASM.asm.free(pt1_1)
        window._WASM.asm.free(pt2_1)
        pt1_1 = window._WASM.asm.malloc(16 * Float32Array.BYTES_PER_ELEMENT)
        pt2_1 = window._WASM.asm.malloc(16 * Float32Array.BYTES_PER_ELEMENT)
        for (let i = 0; i < mat1.elements.length; i++) {
            window._WASM.setValue(pt1_1 + Float32Array.BYTES_PER_ELEMENT * i, mat1.elements[i], 'float')
            window._WASM.setValue(pt2_1 + Float32Array.BYTES_PER_ELEMENT * i, mat2.elements[i], 'float')
        }
        wasmDurations[index] = wasmDurations[index] - (performance.now() - t)
    } else {
        durations[index] = durations[index]- (performance.now() - t)
    }
}

const case3 = (wasm = false) => {
    let result
    if (wasm) {
        window._WASM['_mat4MultiplyMat4'].apply(null, [pt1_1, pt2_1])
        // window._WASM.asm.free(pt1_1)
        // window._WASM.asm.free(pt2_1)
    } else {
        mat1.clone().multiply(mat2)
    }
    return result
}

/**
 *  c call js
 */
const case4 = (wasm) => { //  using em_bind()
    if (wasm) {
        if (!window._WASM.__jsRegisters.__registerMat4Multiply) window._WASM.__jsRegisters.__registerMat4Multiply = new THREE.Matrix4()
        window._WASM.__jsRegisters.__registerMat4Multiply1 = mat1
        window._WASM.__jsRegisters.__registerMat4Multiply2 = mat2
        window._WASM['_mat4MultiplyMat4CallJs'].apply(null, [])
    } else {
        mat1.clone().multiply(mat2)
    }
}

const case7 = (wasm) => { // using em_bind() with value_array, value_object (array and object auto-convert)
    if (wasm) {
        window._WASM.mat4MultiplyMat4_2.call(null, mat1.elements.concat(mat2.elements))
    } else {
        mat1.clone().multiply(mat2)
    }
}

const case8 = (wasm) => { // using em_bind() with value_array, value_object (array and object auto-convert)
    if (wasm) {
        const pt1 = window._WASM.asm.malloc(mat1.elements.length * Float32Array.BYTES_PER_ELEMENT)
        const pt2 = window._WASM.asm.malloc(mat2.elements.length * Float32Array.BYTES_PER_ELEMENT)
        for (let i = 0; i < mat1.elements.length; i++) {
            window._WASM.setValue(pt1 + Float32Array.BYTES_PER_ELEMENT * i, mat1.elements[i], 'float')
            window._WASM.setValue(pt2 + Float32Array.BYTES_PER_ELEMENT * i, mat2.elements[i], 'float')
        }
        const res = new THREE.Matrix4()
        res.elements = window._WASM.mat4MultiplyMat4_3.call(null, [pt1, pt2])
        window._WASM.asm.free(pt1)
        window._WASM.asm.free(pt2)
        return res
    } else {
        return mat1.clone().multiply(mat2)
    }
}

const testCases = [
    {
        id: 1,
        fn: case3,
        desc: '矩阵乘法,入参：指针，出参：指针'
    },
    {
        id: 2,
        fn: case4,
        desc: '矩阵乘法,EM_ASM,c中执行js'
    },
    {
        id: 3,
        fn: case7,
        desc: '矩阵乘法,em_bind入参大数组'
    }
]

const init = function () {
    initWasm().then(WASM => {
        window._WASM = WASM
    })
}

const test = () => {
    document.getElementById('result').innerHTML = ''
    testCases.forEach((item, index) => {
        durations.push(0)
        wasmDurations.push(0)
        let t = performance.now()
        for (let i = 0; i < loops.value; i++) {
            prepareMat(index, false)
            item.fn()
        }
        durations[index] += performance.now() - t
        t = performance.now()
        for (let i = 0; i < loops.value; i++) {
            prepareMat(index, true)
            item.fn(true)
        }
        wasmDurations[index] += performance.now() - t
        document.getElementById('result').innerHTML = document.getElementById('result').innerHTML + `<p>${item.id}:</p><p>${item.id}:${item.desc}</p><p>循环次数：${loops.value}</p><p>js用时：${durations[index]}ms</p><p>wasm用时：${wasmDurations[index]}ms</p>`
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
</style>