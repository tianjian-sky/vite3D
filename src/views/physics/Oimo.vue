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
import { OimoControls } from '../../libs/three/OimoControls.js'
import { GUI } from 'lil-gui'
import * as OIMO from 'oimo'
defineOptions({
    name: 'Ammo-ES'
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


function createRigidBody(threeObject, physicsShape, mass, pos, quat, addToScene = true) {
    if (addToScene) {
        threeObject.position.copy(pos);
        threeObject.quaternion.copy(quat);
    }
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    const motionState = new Ammo.btDefaultMotionState(transform);
    const localInertia = new Ammo.btVector3(0, 0, 0);
    physicsShape.calculateLocalInertia(mass, localInertia);
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
    const body = new Ammo.btRigidBody(rbInfo)
    threeObject.userData.physicsBody = body
    if (addToScene) {
        scene.add(threeObject)
    }
    if (mass > 0) {
        rigidBodies.push(threeObject);
        // Disable deactivation
        body.setActivationState(4);
    }
    world.addRigidBody(body)
    return body
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
        // loader.load( '/static/models/large/0932ab4b12e140c3ac7da3104cb2a637.skp.gltf', object => {
        loader.load('/static/models/school/main.gltf', object => {
            object.scene.rotateX(-.5 * Math.PI)
            scene.add(object.scene)
            initPhysics(object.scene)
            controls = new OimoControls(scene, camera, renderer.domElement, target, world, rigidBodies, {})
            controls.toggleCollisionDetect(true)
            animate()
        })
        // set up gui
        const gui = new GUI();
        const helperFolder = gui.addFolder('oimo Helper');
    }
    function initPhysics(model) {
        console.warn('OIMO', OIMO)
        // Physics configuration
        world = new OIMO.World({
            timestep: 1 / 60,
            iterations: 8,
            broadphase: 2, // 1 brute force, 2 sweep and prune, 3 volume tree
            worldscale: 1, // scale full world 
            random: true,  // randomize sample
            info: false,   // calculate statistic or not
            gravity: [0, -9.8, 0]
        })

        const ground = new THREE.Mesh(new THREE.BoxGeometry(10000, 2, 10000), new THREE.MeshPhongMaterial({ color: 0xcccccc }))
        ground.castShadow = true
        ground.receiveShadow = true
        scene.add(ground)
        world.add({
            type: 'box', // type of shape : sphere, box, cylinder 
            size: [10000, 2, 10000], // size of shape
            pos: [0, -1, 0], // start position in degree
            rot: [-90, 0, 0], // start rotation in degree
            move: false, // dynamic or statique
            density: 1,
            friction: 0.2,
            restitution: 0.2,
            belongsTo: 1, // The bits of the collision groups to which the shape belongs.
            collidesWith: 0xffffffff // The bits of the collision groups with which the shape collides.
        });

        // 1. 对每个mesh添加boxShape
        model.traverse(mesh => {
            if (mesh.isMesh) {
                const bbox = mesh.geometry.boundingBox
                const boxSize = bbox.getSize(new THREE.Vector3())
                const pos = mesh.localToWorld(new THREE.Vector3())
                const quat = mesh.quaternion.clone()
                const euler = new THREE.Euler().setFromQuaternion(quat, 'XYZ')
                world.add({
                    type: 'box', // type of shape : sphere, box, cylinder 
                    size: boxSize.toArray(), // size of shape
                    pos: pos.toArray(), // start position in degree
                    rot: [euler.x * 180 / Math.PI, euler.y * 180 / Math.PI, euler.z * 180 / Math.PI], // start rotation in degree
                    move: false, // dynamic or statique
                    density: 1,
                    friction: 0.2,
                    restitution: 0.2,
                    belongsTo: 1, // The bits of the collision groups to which the shape belongs.
                    collidesWith: 0xffffffff // The bits of the collision groups with which the shape collides.
                })
            }
        })
        {
            const geometry = new THREE.BufferGeometry();
            const vertices = new Float32Array([
                50.0, 0.0, -50.0, // v0
                50.0, 10.0, -50.0, // v1
                35.0, 10.0, -45.0 // v2
            ]);

            // itemSize = 3 because there are 3 values (components) per vertex
            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            const material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true
            mesh.receiveShadow = true
            scene.add(mesh)
            mesh.geometry.computeBoundingBox()
            const bbox = mesh.geometry.boundingBox
            const boxSize = bbox.getSize(new THREE.Vector3())
            const pos = mesh.localToWorld(new THREE.Vector3())
            const quat = mesh.quaternion.clone()
            const euler = new THREE.Euler().setFromQuaternion(quat, 'XYZ')
            world.add({
                type: 'box', // type of shape : sphere, box, cylinder 
                size: boxSize.toArray(), // size of shape
                pos: pos.toArray(), // start position in degree
                rot: [euler.x * 180 / Math.PI, euler.y * 180 / Math.PI, euler.z * 180 / Math.PI], // start rotation in degree
                move: false, // dynamic or statique
                density: 1,
                friction: 0.2,
                restitution: 0.2,
                belongsTo: 1, // The bits of the collision groups to which the shape belongs.
                collidesWith: 0xffffffff // The bits of the collision groups with which the shape collides.
            })
        }
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
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffcccc });
    const threeObject = new THREE.Mesh(geometry, material)
    threeObject.position.set(pos.x, pos.y, pos.z)
    threeObject.castShadow = true
    threeObject.receiveShadow = true
    threeObject.geometry.computeBoundingBox()
    const bbox = threeObject.geometry.boundingBox
    const boxSize = bbox.getSize(new THREE.Vector3())
    const euler = new THREE.Euler().setFromQuaternion(quat, 'XYZ')
    const body = world.add({
        type: 'sphere', // type of shape : sphere, box, cylinder 
        size: boxSize.toArray(), // size of shape
        pos: pos.toArray(), // start position in degree
        rot: [euler.x * 180 / Math.PI, euler.y * 180 / Math.PI, euler.z * 180 / Math.PI], // start rotation in degree
        move: true, // dynamic or statique
        density: 1,
        friction: 0.2,
        restitution: 0.2,
        belongsTo: 1, // The bits of the collision groups to which the shape belongs.
        collidesWith: 0xffffffff // The bits of the collision groups with which the shape collides.
    })
    threeObject.userData.physicsBody = body
    scene.add(threeObject)
    rigidBodies.push(threeObject);

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