<template>
    <p id="tag" v-if="useWasm">use web assembly</p>
    <p id="notice"></p>
    <div id="octree-demo-wrap">
    </div>
    <button v-if="!auroRender" style="position:absolute;bottom:10px;left:10px;" @click="animate">render</button>
    <button style="position:absolute;bottom:90px;left:10px;" @click="(auroRender = !auroRender) && animate()">{{ auroRender
        ?
        '关闭' : '开启' }}自动渲染</button>
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

watch(useWasm, () => {
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

                // const vec1 = new THREE.Vector3(1, 2, 3)
                // const mat = new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(2, 1, 4), Math.PI / 2))
                // vec1.applyMatrix4(mat)
                // testEdgeGeom()
            })
    })
    function testEdgeGeom() {
        const positionArr = []
        const indexArr = []
        const _positionArr =  {
            0 : 0.4129999876022339, 1 : -0.125, 2 : 0, 3 : -0.4880000054836273, 4 : -0.125, 5 : 0, 6 : -0.5879999995231628, 7 : -0.125, 8 : 0, 9 : -0.5879999995231628, 10 : 0.125, 11 : 0, 12 : 0.4129999876022339, 13 : 0.125, 14 : 0, 15 : -0.5879999995231628, 16 : -0.125, 17 : 4.5, 18 : -0.4880000054836273, 19 : -0.125, 20 : 4.5, 21 : 0.4129999876022339, 22 : -0.125, 23 : 4.5, 24 : 0.4129999876022339, 25 : 0.125, 26 : 4.5, 27 : -0.5879999995231628, 28 : 0.125, 29 : 4.5, 30 : -0.5879999995231628, 31 : -0.125, 32 : 0, 33 : -0.5879999995231628, 34 : -0.125, 35 : 4.5, 36 : -0.5879999995231628, 37 : 0.125, 38 : 4.5, 39 : -0.5879999995231628, 40 : 0.125, 41 : 0, 42 : 0.4129999876022339, 43 : -0.125, 44 : 0, 45 : 0.4129999876022339, 46 : 0.125, 47 : 0, 48 : 0.4129999876022339, 49 : 0.125, 50 : 4.5, 51 : 0.4129999876022339, 52 : -0.125, 53 : 4.5
        }
        for (let i = 0; i < 54; i++) positionArr.push(_positionArr[i])
        const _indexArr = {
            0 : 1,
            1 : 3,
            2 : 4,
            3 : 3,
            4 : 1,
            5 : 2,
            6 : 1,
            7 : 4,
            8 : 0,
            9 : 6,
            10 : 8,
            11 : 9,
            12 : 8,
            13 : 6,
            14 : 7,
            15 : 6,
            16 : 9,
            17 : 5,
            18 : 12,
            19 : 13,
            20 : 10,
            21 : 10,
            22 : 11,
            23 : 12,
            24 : 14,
            25 : 15,
            26 : 16,
            27 : 16,
            28 : 17,
            29 : 14
        }
        for (let i = 0; i < 30; i++) indexArr.push(_indexArr[i])
        console.log(positionArr, indexArr)
        const pt1_1 = window._WASM._malloc(54 * Float32Array.BYTES_PER_ELEMENT)
        const pt2_1 = window._WASM._malloc(30 * Float32Array.BYTES_PER_ELEMENT)
        for (let i = 0; i < 54; i++) window._WASM.setValue(pt1_1 + Float32Array.BYTES_PER_ELEMENT * i, positionArr[i], 'float')
        for (let i = 0; i < 30; i++) window._WASM.setValue(pt2_1 + Float32Array.BYTES_PER_ELEMENT * i, indexArr[i], 'float')
        const func = window._WASM.cwrap('getEdgeGeomVertices', 'number', ['number', 'number', 'number', 'number']);
        const ouput = func(pt1_1, pt2_1, 54, 30)
        const ptLen = window._WASM.getValue(ouput + Float32Array.BYTES_PER_ELEMENT * 0, 'float')
        console.warn(ouput, ptLen)
        for (let i = 1; i <= ptLen; i++) {
            console.warn(window._WASM.getValue(ouput + Float32Array.BYTES_PER_ELEMENT * i, 'float'))
        }
        
        // debugger
        // for (let i = 1; i < ptLen + 1; i++) {
        //     console.warn(window._WASM.getValue(ouput + Float32Array.BYTES_PER_ELEMENT * i, 'float'))
        // }
    }
    function init() {
        // environment
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1050);
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xeeeeee);
        const ambient = new THREE.HemisphereLight(0xffffff, 0x999999, 3);
        scene.add(ambient);
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.domElement.id = 'renderCanvas'
        document.getElementById('octree-demo-wrap').appendChild(renderer.domElement)
        stats = new Stats();
        document.body.appendChild(stats.dom);
        const loader = new GLTFLoader();
        // loader.load( '/static/models/big/main.gltf', object => {
        loader.load('/static/models/school/main.gltf', object => {
            object.scene.rotateX(-.5 * Math.PI)
            scene.add(object.scene)
            const bbox = new THREE.Box3()
            bbox.expandByObject(scene)
            const size = bbox.getSize(new THREE.Vector3())
            console.warn('bbox', bbox)
            camera.position.z = size.z / 2;
            camera.position.x = 0;
            camera.position.y = size.y / 4;

            animate()
        })
        controls = new OrbitControls(camera, renderer.domElement);
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
    window.__setValueM4count = 0
    window.__setValueM4Duration = 0
    window.__setValueVs3count = 0
    window.__setValueV3Duration = 0
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
    let str = ''
    str += `mat4compose操作：次数${window.__mat4ComposeCount}，耗时：${window._mat4ComposeDuration}<br/>`
    str += `Mat4矩阵相乘->次数：${window.matMultiplyCalls}  耗时：${window.__time1}<br/>`
    str += `Vec3乘Mat4->次数：${window.vec3MultiplyMat4Calls}  耗时：${window.__time2}<br/>`
    str += `mat4compose操作：次数${window.__mat4ComposeCount}，耗时：${window._mat4ComposeDuration}<br/>`
    str += `mat4determinant操作：次数${window.__mat4DeterminantCount}，耗时：${window._mat4DeterminantDuration}<br/>`

    console.log(`mat4compose操作：次数${window.__mat4ComposeCount}，耗时：${window._mat4ComposeDuration}`)
    console.log(`vec3CreateTime:${window.vec3CreateTime}`)
    console.log(`mat4CreateTime:${window.mat4CreateTime}`)
    console.log(`mat4setTime:${window.mat4setTime}`)
    console.log(`mat4getTime:${window.mat4getTime}`)
    console.log(`mat4visitTime:${window.mat4visitTime}`)
    console.log(`Mat4矩阵相乘->次数：${window.matMultiplyCalls}  耗时：${window.__time1}wasm模式：${useWasm.value}`)
    console.log(`Vec3乘Mat4->次数：${window.vec3MultiplyMat4Calls}  耗时：${window.__time2}wasm模式：${useWasm.value}`)
    console.log(`updateMatrix操作次数：${window.__updateMatrixWorldCount}  耗时：${window.__updateMatrixWorldTime}wasm模式：${useWasm.value}`)
    console.log(`v3uniform操作次数：${window.__setValueVs3count}  耗时：${window.__setValueV3Duration}wasm模式：${useWasm.value}`)
    console.log(`mat4uniform操作次数：${window.__setValueM4count}  耗时：${window.__setValueM4Duration}wasm模式：${useWasm.value}`)
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
    document.getElementById('notice').innerHTML = str
}
function animate() {
    if (auroRender.value) {
        requestAnimationFrame(animate);
    }
    controls.update()
    resetTestFlg()
    renderer.render(scene, camera);
    printTestFlg()
    stats.update();

}
const resizeFn = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
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

#tag {
    position: absolute;
    right: 10px;
    bottom: 10px;
    color: red;
    z-index: 1;
}

#notice {
    position: absolute;
    background: rgba(255, 255, 255, 0.6);
    right: 10px;
    top: 10px;
    color: red;
    // width: 550px;
    z-index: 1;
    text-align: right;
    // background-color: transparent;
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