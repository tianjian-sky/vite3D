<template>
    <div id="ammoJs-demo-wrap">
    </div>
    <button style="position:absolute;bottom:10px;left:10px;" @click="animate">render</button>
    <button style="position:absolute;bottom:10px;right:10px;" @click="fire">发射</button>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import Stats from '../../libs/three/stats.module.js'
import { GLTFLoader } from '../../libs/three/loaders/GLTFLoader.js'
import { CannonEsControls } from '../../libs/three/CannonEsControls.js'
import { GUI } from 'lil-gui'
import * as CANNON from 'cannon-es'
defineOptions({
    name: 'Cannon-ES'
})

interface Window {
    LOADERS: any
}

const container = $ref(null)
let stats
let camera, scene, renderer
let target = new THREE.Vector3()
let controls
let world
let moveObjs = []

const init = function () {

    // reusable variables
    const params = {
        displayHelper: false,
        octreeEnable: false,
    };

    init();

    function init() {

        // environment
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1050);
        camera.position.z = 30;
        camera.position.x = 30;
        camera.position.y = 10;

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xeeeeee);

        const ambient = new THREE.HemisphereLight(0xffffff, 0x999999, 3);
        scene.add(ambient);

        // renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.domElement.id = 'renderCanvas'
        document.getElementById('ammoJs-demo-wrap').appendChild(renderer.domElement)

        stats = new Stats();
        document.body.appendChild(stats.dom);

        // load the bunny
        const loader = new GLTFLoader();
        // loader.load( '/static/models/large/0932ab4b12e140c3ac7da3104cb2a637.skp.gltf', object => {
        loader.load('/static/models/school/main.gltf', object => {
            object.scene.rotateX(-.5 * Math.PI)
            scene.add(object.scene)
            initPhysics(object.scene)
            controls = new CannonEsControls(scene, camera, renderer.domElement, target, world, moveObjs, {})
            controls.toggleCollisionDetect(true)
            animate()
        })
        // set up gui
        const gui = new GUI();
        const helperFolder = gui.addFolder('CannonEs Helper');
    }
    function initPhysics(model) {
        console.warn('CANNON', CANNON)
        world = new CANNON.World()

        // Tweak contact properties.
        // Contact stiffness - use to make softer/harder contacts
        world.defaultContactMaterial.contactEquationStiffness = 1e9
        // Stabilization time in number of timesteps
        world.defaultContactMaterial.contactEquationRelaxation = 4

        const solver = new CANNON.GSSolver()
        solver.iterations = 7
        solver.tolerance = 0.1
        world.solver = new CANNON.SplitSolver(solver)
        // use this to test non-split solver
        // world.solver = solver

        world.gravity.set(0, -9.8, 0)

        // Create a slippery material (friction coefficient = 0.0)
        const physicsMaterial = new CANNON.Material('physics')
        const physics_physics = new CANNON.ContactMaterial(physicsMaterial, physicsMaterial, {
            friction: 0.0,
            restitution: 0.3,
        })

        // We must add the contact materials to the world
        world.addContactMaterial(physics_physics)

        // Create the ground plane
        const groundShape = new CANNON.Plane()
        const groundBody = new CANNON.Body({ mass: 0, material: physicsMaterial })
        groundBody.addShape(groundShape)
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
        world.addBody(groundBody)

        model.traverse(mesh => {
            if (mesh.isMesh) {
                const bbox = mesh.geometry.boundingBox
                const boxSize = bbox.getSize(new THREE.Vector3())
                const boxBody = new CANNON.Body({ mass: 0 }) // 不受外力影响的物体，重量设置为0
                const halfExtents = new CANNON.Vec3(boxSize.x / 2, boxSize.y / 2, boxSize.z / 2)
                const boxShape = new CANNON.Box(halfExtents)
                boxBody.addShape(boxShape)
                boxBody.position.copy(mesh.localToWorld(new THREE.Vector3()))
                boxBody.quaternion.copy(mesh.quaternion)
                world.addBody(boxBody)
            }
        })
    }
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
// Returns a vector pointing the the diretion the camera is at
function getShootDirection() {
    // 当前的相机坐标系下的(0, 0, 1) 变换到世界坐标系
    const vector = new THREE.Vector3(0, 0, 1)
    /**
     *  function unproject(camera) {
            return this.applyMatrix4(camera.projectionMatrixInverse).applyMatrix4(camera.matrixWorld);
        }
        * 
        */
    // v = v3 * p-1 * v-1
    // PosWorld * v * p = PosCam
    //PosCam * p-1 * v-1 = PosWorld
    vector.unproject(camera)
    // const ray = new THREE.Ray(camera.position, vector.sub(camera.position).normalize())
    return vector.sub(camera.position).normalize()
}
function fire() {
    // The shooting balls
    const shootVelocity = 50
    const ballShape = new CANNON.Sphere(0.5)

    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffcccc });
    const sphere = new THREE.Mesh(geometry, material)
    sphere.castShadow = true
    sphere.receiveShadow = true
    const ballBody = new CANNON.Body({ mass: 1 })
    ballBody.addShape(ballShape)
    ballBody._threeObj = sphere

    world.addBody(ballBody)
    scene.add(sphere)
    moveObjs.push(ballBody)

    const shootDirection = getShootDirection()
    ballBody.velocity.set(
        shootDirection.x * shootVelocity,
        shootDirection.y * shootVelocity,
        shootDirection.z * shootVelocity
    )

    const x = camera.position.x + shootDirection.x
    const y = camera.position.y + shootDirection.y
    const z = camera.position.z + shootDirection.z
    ballBody.position.set(x, y, z)
    sphere.position.copy(ballBody.position)
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