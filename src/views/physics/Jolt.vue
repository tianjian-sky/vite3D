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
import { JoltControls } from '../../libs/three/JoltControls'
import { GUI } from 'lil-gui'
import initJolt from '/static/physics/jolt/jolt-physics.wasm.js'
// import initJolt from '../../libs/physics/jolt/jolt-physics.wasm.js'
console.log('import.meta.url', import.meta.url)

defineOptions({
    name: 'Jolt'
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
let rigidBodies = []
let Jolt
let bodyInterface

// Object layers
const LAYER_NON_MOVING = 0;
const LAYER_MOVING = 1;
const NUM_OBJECT_LAYERS = 2;

const setupCollisionFiltering = function (settings) {
    // Layer that objects can be in, determines which other objects it can collide with
    // Typically you at least want to have 1 layer for moving bodies and 1 layer for static bodies, but you can have more
    // layers if you want. E.g. you could have a layer for high detail collision (which is not used by the physics simulation
    // but only if you do collision testing).
    const objectFilter = new Jolt.ObjectLayerPairFilterTable(NUM_OBJECT_LAYERS)
    objectFilter.EnableCollision(LAYER_NON_MOVING, LAYER_MOVING);
    objectFilter.EnableCollision(LAYER_MOVING, LAYER_MOVING);

    // Each broadphase layer results in a separate bounding volume tree in the broad phase. You at least want to have
    // a layer for non-moving and moving objects to avoid having to update a tree full of static objects every frame.
    // You can have a 1-on-1 mapping between object layers and broadphase layers (like in this case) but if you have
    // many object layers you'll be creating many broad phase trees, which is not efficient.
    const BP_LAYER_NON_MOVING = new Jolt.BroadPhaseLayer(0);
    const BP_LAYER_MOVING = new Jolt.BroadPhaseLayer(1);
    const NUM_BROAD_PHASE_LAYERS = 2;
    const bpInterface = new Jolt.BroadPhaseLayerInterfaceTable(NUM_OBJECT_LAYERS, NUM_BROAD_PHASE_LAYERS);
    bpInterface.MapObjectToBroadPhaseLayer(LAYER_NON_MOVING, BP_LAYER_NON_MOVING);
    bpInterface.MapObjectToBroadPhaseLayer(LAYER_MOVING, BP_LAYER_MOVING);

    settings.mObjectLayerPairFilter = objectFilter;
    settings.mBroadPhaseLayerInterface = bpInterface;
    settings.mObjectVsBroadPhaseLayerFilter = new Jolt.ObjectVsBroadPhaseLayerFilterTable(settings.mBroadPhaseLayerInterface, NUM_BROAD_PHASE_LAYERS, settings.mObjectLayerPairFilter, NUM_OBJECT_LAYERS);
};

function createBox(position, rotation, halfExtent, motionType, layer, color = 0xffffff) {
    let shape = new Jolt.BoxShape(halfExtent, 0.05, null);
    let creationSettings = new Jolt.BodyCreationSettings(shape, position, rotation, motionType, layer);
    let body = bodyInterface.CreateBody(creationSettings);
    bodyInterface.AddBody(body.GetID(), Jolt.EActivation_Activate);
    Jolt.destroy(creationSettings);
    return body;
}

function createSphere(position, radius, motionType, layer, color = 0xffffff) {
    let shape = new Jolt.SphereShape(radius, null);
    let creationSettings = new Jolt.BodyCreationSettings(shape, position, Jolt.Quat.prototype.sIdentity(), motionType, layer);
    let body = bodyInterface.CreateBody(creationSettings);
    bodyInterface.AddBody(body.GetID(), Jolt.EActivation_Activate);
    Jolt.destroy(creationSettings);
    return body;
}

function createMeshForShape(mesh, motionType, layer) {
    const _pos = mesh.localToWorld(new THREE.Vector3())
    const position = new Jolt.Vec3(_pos.x, _pos.y, _pos.z)
    const _quat = mesh.getWorldQuaternion(new THREE.Quaternion())
    const quat = new Jolt.Quat(_quat.x, _quat.y, _quat.z, _quat.w)
    const geometry = mesh.geometry
    const num = mesh.geometry.index ? mesh.geometry.index.count / 3 : geometry.attributes.position.count / 3
    const triangles = new Jolt.TriangleList()
    triangles.resize(num)
    console.warn('mesh', mesh, num)
    if (geometry.index) {
        for (let i = 0; i < geometry.index.count - 3000; i += 3) {
            console.error(i / 3)
            let t = triangles.at(i / 3)
            let v1 = t.get_mV(0), v2 = t.get_mV(1), v3 = t.get_mV(2);
            console.log(v1, v2, v3)
            // geometry.attributes.position.getX(i)
            // geometry.attributes.position.getY(i)
            // geometry.attributes.position.getZ(i)
            // geometry.attributes.position.getX(i + 1)
            // geometry.attributes.position.getY(i + 1)
            // geometry.attributes.position.getZ(i + 1)
            // geometry.attributes.position.getX(i + 2)
            // geometry.attributes.position.getY(i + 2)
            // geometry.attributes.position.getZ(i + 2)
            v1.x = geometry.attributes.position.getX(i)
            v1.y = geometry.attributes.position.getY(i)
            v1.z = geometry.attributes.position.getZ(i)
            v2.x = geometry.attributes.position.getX(i + 1)
            v2.y = geometry.attributes.position.getY(i + 1)
            v2.z = geometry.attributes.position.getZ(i + 1)
            v3.x = geometry.attributes.position.getX(i + 2)
            v3.y = geometry.attributes.position.getY(i + 2)
            v3.z = geometry.attributes.position.getZ(i + 2)
            console.log(i)
        }
    } else {
        for (let i = 0; i < geometry.attributes.position.count - 3; i += 3) {
            let t = triangles.at(i / 3)
            let v1 = t.get_mV(0), v2 = t.get_mV(1), v3 = t.get_mV(2);
            // geometry.attributes.position.getX(i)
            // geometry.attributes.position.getY(i)
            // geometry.attributes.position.getZ(i)
            // geometry.attributes.position.getX(i + 1)
            // geometry.attributes.position.getY(i + 1)
            // geometry.attributes.position.getZ(i + 1)
            // geometry.attributes.position.getX(i + 2)
            // geometry.attributes.position.getY(i + 2)
            // geometry.attributes.position.getZ(i + 2)
            // v1.x = geometry.attributes.position.getX(i)
            // v1.y = geometry.attributes.position.getY(i)
            // v1.z = geometry.attributes.position.getZ(i)
            // v2.x = geometry.attributes.position.getX(i + 1)
            // v2.y = geometry.attributes.position.getY(i + 1)
            // v2.z = geometry.attributes.position.getZ(i + 1)
            // v3.x = geometry.attributes.position.getX(i + 2)
            // v3.y = geometry.attributes.position.getY(i + 2)
            // v3.z = geometry.attributes.position.getZ(i + 2)
            console.log(i)
        }
    }
    console.warn('before init')
    // const inMaterials = new Jolt.PhysicsMaterialList()
    const inSettings = new Jolt.MeshShapeSettings(triangles)
    // const shape = inSettings.Create().Get()
    // const creationSettings = new Jolt.BodyCreationSettings(shape, position, quat, motionType, layer)
    // const body = bodyInterface.CreateBody(creationSettings)
    // bodyInterface.AddBody(body.GetID(), Jolt.EActivation_Activate);
    console.warn('after init')
    Jolt.destroy(inSettings)
    // return body;
}
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
        loader.load('/static/models/DamagedHelmet/DamagedHelmet.gltf', object => {
            object.scene.rotateX(-.5 * Math.PI)
            scene.add(object.scene)
            // let initJolt = Jolt
            initJolt().then(function (_Jolt) {
                console.warn('Jolt', _Jolt)
                Jolt = _Jolt
                initPhysics(object.scene)
                controls = new JoltControls(scene, camera, renderer.domElement, target, world, rigidBodies, {})
                controls.toggleCollisionDetect(true)
                animate()
            })
        })
        // set up gui
        const gui = new GUI();
        const helperFolder = gui.addFolder('CannonEs Helper');
    }
    function initPhysics(model) {

        // Initialize Jolt
        const settings = new Jolt.JoltSettings();
        setupCollisionFiltering(settings);
        world = new Jolt.JoltInterface(settings);
        Jolt.destroy(settings);
        const physicsSystem = world.GetPhysicsSystem();
        bodyInterface = physicsSystem.GetBodyInterface();
        Jolt.Vec3.prototype.ToString = function () { return `(${this.GetX()}, ${this.GetY()}, ${this.GetZ()})` };
        Jolt.Vec3.prototype.Clone = function () { return new Jolt.Vec3(this.GetX(), this.GetY(), this.GetZ()); };
        Jolt.RVec3.prototype.ToString = function () { return `(${this.GetX()}, ${this.GetY()}, ${this.GetZ()})` };
        Jolt.RVec3.prototype.Clone = function () { return new Jolt.RVec3(this.GetX(), this.GetY(), this.GetZ()); };
        Jolt.Quat.prototype.ToString = function () { return `(${this.GetX()}, ${this.GetY()}, ${this.GetZ()}, ${this.GetW()})` };
        Jolt.Quat.prototype.Clone = function () { return new Jolt.Quat(this.GetX(), this.GetY(), this.GetZ(), this.GetW()); };
        Jolt.AABox.prototype.ToString = function () { return `[${this.mMax.ToString()}, ${this.mMin.ToString()}]`; };

        const pos = new THREE.Vector3();
        const quat = new THREE.Quaternion();
        // // Ground
        pos.set(0, -1, 0)
        quat.set(0, 0, 0, 1)
        const ground = new THREE.Mesh(new THREE.BoxGeometry(10000, 1, 10000), new THREE.MeshPhongMaterial({ color: 0xcccccc }))
        ground.castShadow = true
        ground.receiveShadow = true
        scene.add(ground)
        ground.position.set(0, -1, 0)
        createBox(new Jolt.Vec3(0, -1, 0), new Jolt.Quat(0, 0, 0, 1), new Jolt.Vec3(5000, .5, 5000), Jolt.EMotionType_Static, LAYER_NON_MOVING)

        // 1. 对每个mesh添加boxShape
        // model.traverse(mesh => {
        //     if (mesh.isMesh) {
        //         const bbox = mesh.geometry.boundingBox
        //         const boxSize = bbox.getSize(new THREE.Vector3())
        //         const pos = mesh.localToWorld(new THREE.Vector3())
        //         const quat = mesh.quaternion.clone()
        //         createBox(new Jolt.Vec3(pos.x, pos.y, pos.z), new Jolt.Quat(quat.x, quat.y, quat.z, quat.w), new Jolt.Vec3(boxSize.x, boxSize.y, boxSize.z), Jolt.EMotionType_Static, LAYER_NON_MOVING)
        //     }
        // })
        // 2.对每个mesh添加btTriangleMesh
        model.traverse(mesh => {
            if (mesh.isMesh) {
                createMeshForShape(mesh, Jolt.EMotionType_Static, LAYER_NON_MOVING)
            }
        })

        // 2. 对每个
        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([
            50.0, 0.0, -50.0, // v0
            50.0, 10.0, -50.0, // v1
            35.0, 10.0, -45.0 // v2
        ]);
        // // // itemSize = 3 because there are 3 values (components) per vertex
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh)
        // createBox(new Jolt.Vec3(pos.x, pos.y, pos.z), new Jolt.Quat(quat.x, quat.y, quat.z, quat.w), new Jolt.Vec3(boxSize.x, boxSize.y, boxSize.z), Jolt.EMotionType_Static, LAYER_NON_MOVING)
        createMeshForShape(mesh, Jolt.EMotionType_Static, LAYER_NON_MOVING)
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
    const pos = new THREE.Vector3()
    const velocity = new THREE.Vector3()
    const shootDirection = getShootDirection()
    pos.x = camera.position.x + shootDirection.x
    pos.y = camera.position.y + shootDirection.y
    pos.z = camera.position.z + shootDirection.z
    const quat = new THREE.Quaternion()
    console.log(pos, quat)
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffcccc });
    const threeObject = new THREE.Mesh(geometry, material)
    threeObject.position.set(pos.x, pos.y, pos.z)
    velocity.set(
        shootDirection.x * shootVelocity,
        shootDirection.y * shootVelocity,
        shootDirection.z * shootVelocity
    )
    threeObject.castShadow = true
    threeObject.receiveShadow = true
    const body = createSphere(new Jolt.Vec3(pos.x, pos.y, pos.z), 0.5, Jolt.EMotionType_Dynamic, LAYER_MOVING)
    body.SetLinearVelocity(new Jolt.Vec3(velocity.x, velocity.y, velocity.z))
    threeObject.userData.physicsBody = body
    rigidBodies.push(threeObject)
    scene.add(threeObject)
    // bodyInterface.ActivateBody(body.GetID());
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