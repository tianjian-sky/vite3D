<template>
    <div id="octree-demo-wrap">
    </div>
    <button v-if="!auroRender" style="position:absolute;bottom:10px;left:10px;" @click="animate">render</button>
    <button style="position:absolute;bottom:90px;left:10px;" @click="(auroRender = !auroRender) && animate()">{{auroRender ? '关闭' : '开启'}}自动渲染</button>
    <!-- <button style="position:absolute;bottom:50px;left:10px;" @click="toggleWasm">{{useWasm ? '关闭' : '开启'}}wasm</button> -->
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
// import * as THREE from 'three'
import Stats from '../libs/three/stats.module.js'
// import { OrbitControls } from '../libs/three/OrbitControls.js'
// import { GLTFLoader } from '../libs/three/loaders/GLTFLoader.js'
import { initWasm } from '../libs/three/wasm/install.js'

defineOptions({
  name: 'WasmTest'
})

interface Window {
  LOADERS: any
}
const route = useRoute()
const container = $ref(null)
const useWasm = ref(false)
const auroRender = ref(false)
if (route.query.useWasm) {
    useWasm.value = 1
}
let THREE
let OrbitControls
let GLTFLoader
let stats
let camera, scene, renderer
let mesh
let sphereInstance, lineSegments
let controls

watch(useWasm, ()=> {
    window.__USE_WASM = useWasm.value
}, { immediate: true })

const init = function () {
    // reusable variables
    window.mat4CreateTime = 0
    window.vec3CreateTime = 0
    initWasm().then((WASM) => {
        window._WASM = WASM
        Promise.all([import('../libs/three/src/build/three.module.js'), import('../libs/three/loaders/GLTFLoader_2.js'), import('../libs/three/OrbitControls_2.js')])
        .then(res => {
            window.THREE = THREE = res[0] 
            GLTFLoader = res[1].install()
            OrbitControls = res[2].install()
            init()
            animate()
        })
    })
    function init() {
        // environment
        camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1050 );
        camera.position.z = 30;
        camera.position.x = 30;
        camera.position.y = 10;
        scene = new THREE.Scene();
        scene.background = new THREE.Color( 0xeeeeee );
        const ambient = new THREE.HemisphereLight( 0xffffff, 0x999999, 3 );
        scene.add( ambient );
        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.domElement.id = 'renderCanvas'
        document.getElementById('octree-demo-wrap').appendChild( renderer.domElement )
        stats = new Stats();
        document.body.appendChild( stats.dom );
        const loader = new GLTFLoader();
        loader.load( '/static/models/school/main.gltf', object => {
            object.scene.rotateX(-.5 * Math.PI)
            scene.add( object.scene )
            animate()
        })
        controls = new OrbitControls(  camera, renderer.domElement );
    }
}
const resetTestFlg = function () {
    window.__renderBufferDuration = 0
    window.__projectObjectDuration = 0
    window.__sorttObjectsDuration = 0
    window.__bgDuration = 0
    window.__setupPrograme = 0
    window.__setupState = 0
    window.__v3Create = 0
    window.matMultiplyCalls = 0
    window.vec3MultiplyMat4Calls = 0
    window.preRenderDuration = 0
    window.postRenderDuration = 0
    window.__updateMatrixWorldCount = 0
    window.__updateMatrixWorldTime = 0
    window.__updateMatrixWorldTime2 = 0
    window.__updateMatrixWorldTime3 = 0
    window.__updateMatrixWorldTime4 = 0
    window.__updateMatrixWorldTime5 = 0
    window.__mat4ComposeCount = 0
    window._mat4ComposeDuration = 0
    window.__mat4DeterminantCount = 0
    window._mat4DeterminantDuration = 0
    window.__mat4DeterminantCount = 0
    window._mat4DeterminantDuration = 0
    window.__time1 = 0
    window.__time2 = 0
    window.mat4setTime = 0
    window.mat4getTime = 0
    window.mat4visitTime = 0
    window.__getWireframeAttribute = 0
    window.__setGlMode = 0
    window.__glRender = 0
    window.__glSetIndex = 0
    window.__calcDeterninant = 0
    window.__setUniform = 0
    window.frameRenderDuration = performance.now()
}
const printTestFlg = function () {
    window.frameRenderDuration = performance.now() - window.frameRenderDuration
    console.log(`mat4compose操作：次数${window.__mat4ComposeCount}，耗时：${window._mat4ComposeDuration}`)
    console.log(`vec3CreateTime:${window.vec3CreateTime}`)
    console.log(`mat4CreateTime:${window.mat4CreateTime}`)
    console.log(`mat4setTime:${window.mat4setTime}`)
    console.log(`mat4getTime:${window.mat4getTime}`)
    console.log(`mat4visitTime:${window.mat4visitTime}`)
    console.log(`Mat4矩阵相乘->次数：${window.matMultiplyCalls}  耗时：${window.__time1}wasm模式：${useWasm.value}`)
    console.log(`Vec3乘Mat4->次数：${window.vec3MultiplyMat4Calls}  耗时：${window.__time2}wasm模式：${useWasm.value}`)
    console.log(`updateMatrix操作次数：${window.__updateMatrixWorldCount}  耗时：${window.__updateMatrixWorldTime}wasm模式：${useWasm.value}`)
    // console.log(`updateMatrix操作次数2：${window.__updateMatrixWorldCount}  耗时：${window.__updateMatrixWorldTime2}wasm模式：${useWasm.value}`)
    // console.log(`updateMatrix操作次数3：${window.__updateMatrixWorldCount}  耗时：${window.__updateMatrixWorldTime3}wasm模式：${useWasm.value}`)
    // console.log(`updateMatrix操作次数4：${window.__updateMatrixWorldCount}  耗时：${window.__updateMatrixWorldTime4}wasm模式：${useWasm.value}`)
    // console.log(`updateMatrix操作次数5：${window.__updateMatrixWorldCount}  耗时：${window.__updateMatrixWorldTime5}wasm模式：${useWasm.value}`)
    console.log(`vec3访问耗时：${window.__v3Create}`)
    console.log(`mat4compose操作：次数${window.__mat4ComposeCount}，耗时：${window._mat4ComposeDuration}`)
    console.log(`mat4determinant操作：次数${window.__mat4DeterminantCount}，耗时：${window._mat4DeterminantDuration}`)
    console.log(`渲染耗时：${window.frameRenderDuration}`)
    console.log(`   --pre render耗时：${window.preRenderDuration}`)
    console.log(`   --post render耗时：${window.postRenderDuration}`)
    console.log(`   --projectObject耗时：${window.__projectObjectDuration}`)
    console.log(`   --sorttObjectsDuration耗时：${window.__sorttObjectsDuration}`)
    console.log(`   --renderBackground耗时：${window.__bgDuration}`)
    console.log(`   --renderbuffer耗时：${window.__renderBufferDuration}`)
    console.log(`       --setupPrograme耗时：${window.__setupPrograme}`)
    console.log(`           __setUniform耗时：${window.__setUniform}`)
    console.log(`       --getWireframeAttribute耗时:${window.__getWireframeAttribute}`)
    console.log(`       --setupState耗时：${window.__setupState}`)
    console.log(`       --setGlMode耗时：${window.__setGlMode}`)
    console.log(`       --glRender耗时：${window.__glRender}`)
    console.log(`       --glsetIndex耗时：${window.__glSetIndex}`)
}
function animate() {
    if (auroRender.value) {
        requestAnimationFrame( animate );
    }
    controls.update()
    resetTestFlg()
    renderer.render( scene, camera );
    printTestFlg()
    stats.update();
    
}
const resizeFn = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
const toggleWasm = function () {
    useWasm.value = !useWasm.value
}
window.addEventListener('resize', resizeFn)

onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeFn)
})

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