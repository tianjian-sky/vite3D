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
import { AmmoJsControls } from '../../libs/three/AmmoJsControls.js'
import { GUI } from 'lil-gui'
// import * as Ammo from '../../libs/physics/ammo/ammo'
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
    return body
}
function createParalellepiped(sx, sy, sz, mass, pos, quat, material, margin = 0.05) {
    const threeObject = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1), material)
    const shape = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5))
    shape.setMargin(margin);
    createRigidBody(threeObject, shape, mass, pos, quat);
    return threeObject;
}
function collistionTest = (model1, model2) => {
    let num1 = 0
    let num2 = 0
    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration()
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration)
    const broadphase = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();
    const world = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
    world.setGravity(new Ammo.btVector3(0, -9.8, 0))
    const ctResults = []
    function createRigidMeshBody(mesh, mass) {
        const btMesh = new Ammo.btTriangleMesh()
        const __pts = []
        if (mesh.geometry.index) {
            for (let i = 0; i < mesh.geometry.index.count; i += 3) {
                const _i = mesh.geometry.index.getX(i)
                const p0 = new Ammo.btVector3(mesh.geometry.attributes.position.getX(_i), mesh.geometry.attributes.position.getY(_i), mesh.geometry.attributes.position.getZ(_i))
                const p1 = new Ammo.btVector3(mesh.geometry.attributes.position.getX(_i + 1), mesh.geometry.attributes.position.getY(_i + 1), mesh.geometry.attributes.position.getZ(_i + 1))
                const p2 = new Ammo.btVector3(mesh.geometry.attributes.position.getX(_i + 2), mesh.geometry.attributes.position.getY(_i + 2), mesh.geometry.attributes.position.getZ(_i + 2))
                __pts.push(p0, p1, p2)
                btMesh.addTriangle(p0, p1, p2, true)
            }
        } else {
            for (let i = 0; i < mesh.geometry.attributes.position.count; i += 3) {
                const p0 = new Ammo.btVector3(mesh.geometry.attributes.position.getX(i), mesh.geometry.attributes.position.getY(i), mesh.geometry.attributes.position.getZ(i))
                const p1 = new Ammo.btVector3(mesh.geometry.attributes.position.getX(i + 1), mesh.geometry.attributes.position.getY(i + 1), mesh.geometry.attributes.position.getZ(i + 1))
                const p2 = new Ammo.btVector3(mesh.geometry.attributes.position.getX(i + 2), mesh.geometry.attributes.position.getY(i + 2), mesh.geometry.attributes.position.getZ(i + 2))
                __pts.push(p0, p1, p2)
                btMesh.addTriangle(p0, p1, p2, true)
            }
        }
        const meshShape = new Ammo.btConvexTriangleMeshShape(btMesh, false)
        // const meshShape = new Ammo.btBvhTriangleMeshShape(btMesh)
        // const meshShape = new Ammo.btGImpactMeshShape(btMesh);
        // meshShape.setMargin(0.01);/
        // meshShape.setLocalScaling(new Ammo.btVector3(scale.x, scale.y, scale.z));
        // meshShape.updateBound();
        // meshShape.updateBound();
        const posW = mesh.getWorldPosition(new THREE.Vector3())
        const quatW = mesh.getWorldQuaternion(new THREE.Quaternion())
        const pos = mesh.position
        const quat = mesh.quaternion
        const transform = new Ammo.btTransform();
        const transformW = new Ammo.btTransform()
        transform.setIdentity();
        // transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        // transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
        transformW.setIdentity();
        transformW.setOrigin(new Ammo.btVector3(posW.x, posW.y, posW.z));
        transformW.setRotation(new Ammo.btQuaternion(quatW.x, quatW.y, quatW.z, quatW.w));
        __pts.push(btMesh, meshShape, transform, transformW)
        const motionState = new Ammo.btDefaultMotionState(transformW);
        const localInertia = new Ammo.btVector3(0, 0, 0);
        meshShape.calculateLocalInertia(0, localInertia);
        __pts.push(motionState, localInertia)
        const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, meshShape, localInertia);
        const body = new Ammo.btRigidBody(rbInfo)
        body.setWorldTransform(transformW)
        __pts.push(rbInfo, body)
        body.__pts = __pts
        return body
    }
    const ptrMeshDict2 = {}
    const testTable = new Map()
    model1.traverse(mesh => {
        if (!mesh.isMesh) return
        num1++
        mesh.geometry.computeBoundingBox()
        mesh.updateMatrixWorld(true)
        const box1 = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld)
        model2.traverse(mesh2 => {
            if (!mesh2.isMesh) return
            num2++
            mesh2.geometry.computeBoundingBox()
            mesh2.updateMatrixWorld(true)
            const box2 = mesh2.geometry.boundingBox.clone().applyMatrix4(mesh2.matrixWorld)
            if (box1.intersectsBox(box2)) {
                if (!testTable.get(mesh)) {
                    testTable.set(mesh, [])
                }
                if (testTable.get(mesh2) && testTable.get(mesh2).find(item => item === mesh) || testTable.get(mesh).find(item => item === mesh2)) return
                testTable.get(mesh).push(mesh2)
            }
        })
    })
    console.warn('testTable', testTable)
    {
        const resultCallback = new Ammo.ConcreteContactResultCallback()
        resultCallback.addSingleResult = function (cp, colObj0Wrap, partId0, index0, colObj1Wrap, partId1, index1) {
            let contactPoint = Ammo.wrapPointer(cp, Ammo.btManifoldPoint);
            const distance = contactPoint.getDistance();
            const pa = contactPoint.getPositionWorldOnA();
            const pb = contactPoint.getPositionWorldOnB();
            const p_lpa = contactPoint.m_localPointA
            const p_lpb = contactPoint.m_localPointB
            const p_mpwb = contactPoint.m_positionWorldOnB
            const p_mpwa = contactPoint.m_positionWorldOnA
            let colWrapper0 = Ammo.wrapPointer(colObj0Wrap, Ammo.btCollisionObjectWrapper);
            let rb0 = Ammo.castObject(colWrapper0.getCollisionObject(), Ammo.btRigidBody);
            let colWrapper1 = Ammo.wrapPointer(colObj1Wrap, Ammo.btCollisionObjectWrapper);
            let rb1 = Ammo.castObject(colWrapper1.getCollisionObject(), Ammo.btRigidBody);
            const mesh_a = ptrMeshDict2[rb0.ptr]
            const mesh_b = ptrMeshDict2[rb1.ptr]
            console.error('--result', rb0.ptr, rb1.ptr)
            ctResults.push([mesh_a, mesh_b, distance, pa, pb, p_lpa, p_lpb, p_mpwb, p_mpwa])
            // Ammo.destroy(contactPoint)
            // Ammo.destroy(colWrapper0)
            // Ammo.destroy(colWrapper1)
            // Ammo.destroy(rb0)
            // Ammo.destroy(rb1)
            // Ammo.destroy(colWrapper0)
            // Ammo.destroy(colWrapper1)
        }
        for (const mesh of testTable.keys()) {
            if (!mesh.isMesh) return
            if (!testTable.get(mesh).length) return
            const body = createRigidMeshBody(mesh, 0)
            world.addRigidBody(body)
            mesh.userData._rigidBody = body
            ptrMeshDict2[body.ptr] = mesh
            if (mesh.userData._rigidBody) {
                let q_num = 0
                testTable.get(mesh).forEach(mesh2 => {
                    q_num++
                    if (!mesh2.isMesh) return
                    const body2 = createRigidMeshBody(mesh2, 0)
                    ptrMeshDict2[body2.ptr] = mesh2
                    world.addRigidBody(body2)
                    mesh2.userData._rigidBody = body2
                    world.contactPairTest(mesh.userData._rigidBody, mesh2.userData._rigidBody, resultCallback)
                    world.removeCollisionObject(body2)
                    body2.__pts.forEach(ptr => Ammo.destroy(ptr))
                    delete body2.__pts
                })
            }
            world.removeCollisionObject(body)
            body.__pts.forEach(ptr => Ammo.destroy(ptr))
            delete body.__pts
            console.warn('performance.memory.usedJSHeapSize', performance.memory.usedJSHeapSize / 1024 / 1024)
        }
        console.warn('--ctResults', ctResults)
    }
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
            loader.load('/static/models/2 (1)/main.gltf', object => {
            Ammo().then(_Ammo => {
                Ammo = _Ammo
                object.scene.rotateX(-.5 * Math.PI)
                scene.add(object.scene)
                initPhysics(object.scene)
                controls = new AmmoJsControls(scene, camera, renderer.domElement, target, world, rigidBodies, {})
                controls.toggleCollisionDetect(true)
                animate()
            })
        })
        // set up gui
        const gui = new GUI();
        const helperFolder = gui.addFolder('CannonEs Helper');
    }
    function initPhysics(model) {
        console.warn('Ammo', Ammo)
        // Physics configuration
        const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration()
        const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration)
        const broadphase = new Ammo.btDbvtBroadphase();
        const solver = new Ammo.btSequentialImpulseConstraintSolver();
        world = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
        world.setGravity(new Ammo.btVector3(0, -9.8, 0))

        const pos = new THREE.Vector3();
        const quat = new THREE.Quaternion();
        // Ground
        pos.set(0, 0, 0)
        quat.set(0, 0, 0, 1)
        const ground = createParalellepiped(10000, 1, 10000, 0, pos, quat, new THREE.MeshPhongMaterial({ color: 0xcccccc }))
        ground.castShadow = true
        ground.receiveShadow = true

        // 1. 对每个mesh添加boxShape
        // model.traverse(mesh => {
        //     if (mesh.isMesh) {
        //         const bbox = mesh.geometry.boundingBox
        //         const boxSize = bbox.getSize(new THREE.Vector3())
        //         const pos = mesh.localToWorld(new THREE.Vector3())
        //         const quat = mesh.getWorldQuaternion().clone()
        //         const shape = new Ammo.btBoxShape(new Ammo.btVector3(boxSize.x * 0.5, boxSize.y * 0.5, boxSize.z * 0.5))
        //         createRigidBody(mesh, shape, 0, pos, quat, false)
        //     }
        // })
        // 2.对每个mesh添加btTriangleMesh
        model.traverse(mesh => {
            if (mesh.isMesh) {
                const btMesh = new Ammo.btTriangleMesh()
                if (mesh.geometry.index) {
                    for (let i = 0; i < mesh.geometry.index.count; i += 3) {
                        const _i = mesh.geometry.index.getX(i)
                        const p0 = new Ammo.btVector3(mesh.geometry.attributes.position.getX(_i), mesh.geometry.attributes.position.getY(_i), mesh.geometry.attributes.position.getZ(_i))
                        const p1 = new Ammo.btVector3(mesh.geometry.attributes.position.getX(_i + 1), mesh.geometry.attributes.position.getY(_i + 1), mesh.geometry.attributes.position.getZ(_i + 1))
                        const p2 = new Ammo.btVector3(mesh.geometry.attributes.position.getX(_i + 2), mesh.geometry.attributes.position.getY(_i + 2), mesh.geometry.attributes.position.getZ(_i + 2))
                        btMesh.addTriangle(p0, p1, p2, false)
                    }
                } else {
                    for (let i = 0; i < mesh.geometry.attributes.position.count; i += 3) {
                        const p0 = new Ammo.btVector3(mesh.geometry.attributes.position.getX(i), mesh.geometry.attributes.position.getY(i), mesh.geometry.attributes.position.getZ(i))
                        const p1 = new Ammo.btVector3(mesh.geometry.attributes.position.getX(i + 1), mesh.geometry.attributes.position.getY(i + 1), mesh.geometry.attributes.position.getZ(i + 1))
                        const p2 = new Ammo.btVector3(mesh.geometry.attributes.position.getX(i + 2), mesh.geometry.attributes.position.getY(i + 2), mesh.geometry.attributes.position.getZ(i + 2))
                        btMesh.addTriangle(p0, p1, p2, false)
                    }
                }
                const meshShape = new Ammo.btGImpactMeshShape(btMesh); // 使用btGImpactMeshShape
                // meshShape.setMargin(0.01);
                // meshShape.setLocalScaling(new Ammo.btVector3(scale.x, scale.y, scale.z));
                meshShape.updateBound();
                // transform.setIdentity();
                const pos = mesh.getWorldPosition(new THREE.Vector3())
                const quat = mesh.getWorldQuaternion()
                transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
                transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
                const motionState = new Ammo.btDefaultMotionState(transform);
                const localInertia = new Ammo.btVector3(0, 0, 0);
                meshShape.calculateLocalInertia(0, localInertia);
                const rbInfo = new Ammo.btRigidBodyConstructionInfo(0, motionState, meshShape, localInertia);
                const body = new Ammo.btRigidBody(rbInfo)
                mesh.userData.physicsBody = body
                world.addRigidBody(body)
            }
        })

        // 2. 对每个

        const geometry = new THREE.BufferGeometry();

        // create a simple square shape. We duplicate the top left and bottom right
        // vertices because each vertex needs to appear once per triangle.
        const vertices = new Float32Array([
            50.0, 0.0, -50.0, // v0
            50.0, 10.0, -50.0, // v1
            35.0, 10.0, -45.0 // v2
        ]);

        // itemSize = 3 because there are 3 values (components) per vertex
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh)
        const btMesh = new Ammo.btTriangleMesh()
        btMesh.addTriangle(new Ammo.btVector3(50.0, 0.0, -50.0), new Ammo.btVector3(50.0, 10.0, -50.0), new Ammo.btVector3(35.0, 10.0, -45.0), false)
        const meshShape = new Ammo.btConvexTriangleMeshShape(btMesh, false)

        const transform = new Ammo.btTransform();
        const pos = mesh.getWorldPosition(new THREE.Vector3())
        const quat = mesh.getWorldQuaternion(new THREE.Quaternion())
        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
        const motionState = new Ammo.btDefaultMotionState(transform);
        const localInertia = new Ammo.btVector3(0, 0, 0);
        meshShape.calculateLocalInertia(0, localInertia);
        const rbInfo = new Ammo.btRigidBodyConstructionInfo(0, motionState, meshShape, localInertia);
        const body = new Ammo.btRigidBody(rbInfo)
        mesh.userData.physicsBody = body
        world.addRigidBody(body)
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
    const shape = new Ammo.btSphereShape(1)
    shape.setMargin(0.05)
    const body = createRigidBody(threeObject, shape, 1, pos, quat);
    threeObject.position.set(pos.x, pos.y, pos.z)
    velocity.set(
        shootDirection.x * shootVelocity,
        shootDirection.y * shootVelocity,
        shootDirection.z * shootVelocity
    )
    threeObject.castShadow = true
    threeObject.receiveShadow = true
    body.setLinearVelocity(new Ammo.btVector3(velocity.x, velocity.y, velocity.z))
    world.addRigidBody(body)
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