<template>
    <div id="octree-demo-wrap">
    </div>
    <button style="position:absolute;bottom:10px;left:10px;" @click="animate">render</button>
    <div style="position: absolute;left: 10px;bottom: 10px;">
        {{ planePos }}
        <div>x:<input v-model="planePos[0]" /></div>
        <div>y:<input v-model="planePos[1]" /></div>
        <div>z:<input v-model="planePos[2]" /></div>
        <button @click="handleNormalChange">change plane position</button>
    </div>
    <div style="position: absolute;right: 10px;bottom: 10px;">
        <div>x:<input v-model="planeNormal[0]" /></div>
        <div>y:<input v-model="planeNormal[1]" /></div>
        <div>z:<input v-model="planeNormal[2]" /></div>
        <button @click="handleNormalChange">change normal</button>
    </div>
    <div style="position: absolute;right: 10px;top: 10px;">
        <div><button @click="handleRotateX">rotate on X</button></div>
        <div><button @click="handleRotateY">rotate on Y</button></div>
        <div><button @click="resetRotattion">reset</button></div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import Stats from '../libs/three/stats.module.js'
import { GLTFLoader } from '../libs/three/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
defineOptions({
    name: 'ProjectOnPlane'
})

interface Window {
    LOADERS: any
}

const container = $ref(null)
let stats
let camera, scene, renderer
let target = new THREE.Vector3()
let controls
let transformControl
let plane
let box
let pts = []
const planePos = ref([300, 0, 300])
const planeNormal = ref([1, 0, 1])
const rotattion = ref({ x: 0, y: 0, timer: null, quat: null })

const init = function () {
    const params = {
        displayHelper: false,
        octreeEnable: false,
    };

    init();
    animate();

    function init() {

        // environment
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1050);
        camera.position.z = 180;
        camera.position.x = 180;
        camera.position.y = 80;

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x00ffee);

        const ambient = new THREE.HemisphereLight(0xffffff, 0x999999, 3);
        scene.add(ambient);
        // renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.domElement.id = 'renderCanvas'
        document.getElementById('octree-demo-wrap').appendChild(renderer.domElement)
        controls = new OrbitControls(camera, renderer.domElement);
        stats = new Stats();
        document.body.appendChild(stats.dom);
        // load the bunny
        const loader = new GLTFLoader();
        // loader.load( '/static/models/large/0932ab4b12e140c3ac7da3104cb2a637.skp.gltf', object => {
        loader.load('/static/models/school/main.gltf', object => {
            const axesHelper = new THREE.AxesHelper(50);
            scene.add(axesHelper);
            console.log('axesHelper', axesHelper)
            axesHelper.position.set(50, 0, 50)
            object.scene.rotateX(-.5 * Math.PI)
            scene.add(object.scene)
            box = new THREE.BoxHelper(object.scene, 0xffff00);
            scene.add(box)
            console.log('box', box)
            {
                handleNormalChange()
                scene.add(plane)
            }
            animate()
        })
    }
}
function handleNormalChange() {
    console.log('planeNormal', plane, planeNormal)
    if (plane) {
        plane.removeFromParent()
    }
    const geometry = new THREE.PlaneGeometry(1500, 1500);
    const material = new THREE.MeshBasicMaterial({ color: 0xcccccc, side: THREE.DoubleSide })
    plane = new THREE.Mesh(geometry, material);
    plane.lookAt(new THREE.Vector3(planeNormal.value[0] * 1, planeNormal.value[1] * 1, planeNormal.value[2] * 1).normalize())
    scene.add(plane)
    plane.position.set(planePos.value[0], planePos.value[1], planePos.value[2])
    console.error(new THREE.Vector3(planeNormal.value[0] * 1, planeNormal.value[1] * 1, planeNormal.value[2] * 1).normalize())
    projectPoints()
}
function projectPoints() {
    const planeCenter = new THREE.Vector3(planePos.value[0] * 1, planePos.value[1] * 1, planePos.value[2] * 1)
    if (pts.length) {
        pts.forEach(mesh => mesh.removeFromParent())
        pts = []
    }
    const mathPlane = new THREE.Plane()
    mathPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(planeNormal.value[0] * 1, planeNormal.value[1] * 1, planeNormal.value[2] * 1).normalize(), planeCenter.clone())
    const _boxProj = new THREE.Box3()
    const _boxPlane = new THREE.Box3()
    const planeHelper = new THREE.PlaneHelper(mathPlane, 1)
    planeHelper.updateMatrixWorld()
    const invertQuat = planeHelper.quaternion.clone().invert()
    /**
     * 包围盒端点的投影点
     */
    for (let i = 0; i < box.geometry.attributes.position.count; i++) {
        const boundaryPt = new THREE.Vector3(box.geometry.attributes.position.getX(i), box.geometry.attributes.position.getY(i), box.geometry.attributes.position.getZ(i))
        const pt = boundaryPt.projectOnPlane(new THREE.Vector3().fromArray(planeNormal.value))
        {
            const geometry = new THREE.SphereGeometry(5, 32, 16);
            const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const sphere = new THREE.Mesh(geometry, material)
            sphere.position.copy(pt)
            scene.add(sphere)
            pts.push(sphere)
        }
        const pt2 = mathPlane.projectPoint(boundaryPt, new THREE.Vector3()) //new THREE.Vector3(box.geometry.attributes.position.getX(i), box.geometry.attributes.position.getY(i), box.geometry.attributes.position.getZ(i)).projectOnPlane(new THREE.Vector3().fromArray(planeNormal.value))
        _boxProj.expandByPoint(pt2)
        const geometry2 = new THREE.SphereGeometry(5, 32, 16);
        const material2 = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const sphere2 = new THREE.Mesh(geometry2, material2)
        sphere2.position.copy(pt2)
        scene.add(sphere2)
        pts.push(sphere2)
    }
    /**
     * 投影到XOZ平面，以便计算宽高
     */
    const _center = _boxProj.getCenter(new THREE.Vector3())
    {
        for (let i = 0; i < box.geometry.attributes.position.count; i++) {
            const pt = new THREE.Vector3(box.geometry.attributes.position.getX(i), box.geometry.attributes.position.getY(i), box.geometry.attributes.position.getZ(i)).projectOnPlane(new THREE.Vector3().fromArray(planeNormal.value))
            const pt2 = mathPlane.projectPoint(pt, new THREE.Vector3())
            console.warn('_center', _center)
            const pXOZ = pt2.sub(_center).applyQuaternion(invertQuat)
            const geometry = new THREE.SphereGeometry(5, 32, 16);
            const material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
            const sphere = new THREE.Mesh(geometry, material)
            sphere.position.copy(pXOZ)
            _boxPlane.expandByPoint(pXOZ)
            scene.add(sphere)
            pts.push(sphere)
        }
    }
    /**
     * 包围盒投影点的包围盒 -> XOZ平面 -> 取四个角点 -> 投影回目标平面
     */
    {
        const planeSize = _boxPlane.getSize(new THREE.Vector3())
        const _vertices2 = [
            new THREE.Vector3(-planeSize.x / 2, planeSize.y / 2, 0).applyQuaternion(planeHelper.quaternion).add(_center),
            new THREE.Vector3(-planeSize.x / 2, -planeSize.y / 2, 0).applyQuaternion(planeHelper.quaternion).add(_center),
            new THREE.Vector3(planeSize.x / 2, -planeSize.y / 2, 0).applyQuaternion(planeHelper.quaternion).add(_center),
            new THREE.Vector3(planeSize.x / 2, planeSize.y / 2, 0).applyQuaternion(planeHelper.quaternion).add(_center)
        ]
        for (let i = 0; i < _vertices2.length; i++) {
            const geometry = new THREE.SphereGeometry(5, 32, 16);
            const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
            const sphere = new THREE.Mesh(geometry, material)
            sphere.position.copy(_vertices2[i])
            scene.add(sphere)
            pts.push(sphere)
        }
    }
}
function handleRotateX() {
    plane.quaternionBak = new THREE.Quaternion(plane.quaternion.x, plane.quaternion.y, plane.quaternion.z, plane.quaternion.w)
    const euler = new THREE.Euler().setFromQuaternion(plane.quaternionBak, 'XYZ')
    const prev = rotattion.value.x
    const accu = 1
    rotattion.value.x += accu
    const quat = new THREE.Quaternion()
    quat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), accu * Math.PI / 180)
    plane.applyQuaternion(quat)
    const normal2 = new THREE.Vector3(planeNormal.value[0] * 1, planeNormal.value[1] * 1, planeNormal.value[2] * 1).applyQuaternion(quat).normalize()
    planeNormal.value[0] = normal2.x
    planeNormal.value[1] = normal2.y
    planeNormal.value[2] = normal2.z
    projectPoints()
    rotattion.value.timer = requestAnimationFrame(handleRotateX)
}
function handleRotateY() {
    plane.quaternionBak = new THREE.Quaternion(plane.quaternion.x, plane.quaternion.y, plane.quaternion.z, plane.quaternion.w)
    const prev = rotattion.value.y
    const accu = 1
    rotattion.value.y += accu
    const quat = new THREE.Quaternion()
    quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), accu * Math.PI / 180)
    plane.applyQuaternion(quat)
    const normal2 = new THREE.Vector3(planeNormal.value[0] * 1, planeNormal.value[1] * 1, planeNormal.value[2] * 1).applyQuaternion(quat).normalize()
    planeNormal.value[0] = normal2.x
    planeNormal.value[1] = normal2.y
    planeNormal.value[2] = normal2.z
    projectPoints()
    rotattion.value.timer = requestAnimationFrame(handleRotateY)
}
function resetRotattion() {
    rotattion.value.x = 0
    rotattion.value.y = 0
    plane.quaternion.set(plane.quaternionBak.x, plane.quaternionBak.y, plane.quaternionBak.z, plane.quaternionBak.w)
    plane.updateMatrix()
    rotattion.value.quat = null
    cancelAnimationFrame(rotattion.value.timer)
    clearInterval(rotattion.value.timer)
    rotattion.value.timer = null
}
function animate() {
    requestAnimationFrame(animate);
    controls.update()
    render();
    stats.update();
}
function render() {
    renderer.render(scene, camera);
}
const resizeFn = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
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