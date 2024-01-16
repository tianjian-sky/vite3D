<template>
    <div id="wasm-compare">
        <iframe :src="src"></iframe>
        <iframe :src="srcWasm"></iframe>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
// import * as THREE from 'three'
import Stats from '../libs/three/stats.module.js'
// import { OrbitControls } from '../libs/three/OrbitControls.js'
// import { GLTFLoader } from '../libs/three/loaders/GLTFLoader.js'

defineOptions({
  name: 'WasmCompare'
})

interface Window {
  LOADERS: any
}
const route = useRoute()
const container = $ref(null)
const auroRender = ref(false)
const src = location.origin + '/wasmTest'
const srcWasm = src + '?useWasm=1'


const init = function () {
    // reusable variables
}
onMounted(() => {
})
</script>

<style lang="scss" scoped>
@media (min-width: 1024px) {
  #wasm-compare {
    display: flex;
     height:100vh;
     iframe {
        flex: 0 0 50%;
        height: 100%;
     }
  }
}
</style>

