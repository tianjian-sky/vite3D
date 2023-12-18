<template>
    <div id="octree-demo-wrap">
    </div>
    <button style="position:absolute;bottom:10px;left:10px;" @click="animate">render</button>
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
defineOptions({
  name: 'Octree'
})

interface Window {
  LOADERS: any
}

const container = $ref(null)
let stats
let camera, scene, renderer
let mesh, helper, bvh
let sphereInstance, lineSegments
let target = new THREE.Vector3()
let controls
let octree = new Octree(null, {
    boxSize: 1000
})
let octreeHelper = null

const init = function () {
    
    // Add the extension functions
    // THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
    // THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
    // THREE.Mesh.prototype.raycast = acceleratedRaycast;

    

    // reusable variables
    const _raycaster = new THREE.Raycaster();
    const _position = new THREE.Vector3();
    const _quaternion = new THREE.Quaternion();
    const _scale = new THREE.Vector3( 1, 1, 1 );
    const _matrix = new THREE.Matrix4();
    const _axis = new THREE.Vector3();
    const MAX_RAYS = 3000;
    const RAY_COLOR = 0x444444;

    const params = {
        displayHelper: false,
        octreeEnable: false,
    };

    init();
    animate();

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

        // renderer
        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.domElement.id = 'renderCanvas'
        document.getElementById('octree-demo-wrap').appendChild( renderer.domElement )

        stats = new Stats();
        document.body.appendChild( stats.dom );

        // load the bunny
        const loader = new GLTFLoader();
        // loader.load( '/static/models/large/0932ab4b12e140c3ac7da3104cb2a637.skp.gltf', object => {
        loader.load( '/static/models/school/main.gltf', object => {
            object.scene.rotateX(-.5 * Math.PI)
            scene.add( object.scene )
            animate()
        } )
        controls = new RoamingControls( scene, camera, renderer.domElement, target );
        controls.toggleCollisionDetect(true)
        // set up gui
        const gui = new GUI();
        const helperFolder = gui.addFolder( 'Octree Helper' );
        helperFolder.add( params, 'displayHelper' ).onChange(v => {
                if ( v ) {
                    octreeHelper = new OctreeHelper(octree)
                    octreeHelper.visible = true
                    scene.add(octreeHelper)
                } else {
                    if (octreeHelper) {
                        scene.remove(octreeHelper)
                        octreeHelper = null
                    }
                }

        });
        helperFolder.add(params, 'octreeEnable').name('开启八叉树').onChange(v => {
            if (v) {
                console.time('生成八叉树')
                octree.fromGraphNode(scene)
                controls.octree = octree
                console.timeEnd('生成八叉树')
            } else {
                octree.triangles = []
                octree.subTrees = []
            }
        })
    }
}
function animate() {
    requestAnimationFrame( animate );
    controls.update()
    octreeHelper?.update()
    render();
    stats.update();
}
function render() {
    // if ( mesh ) {
    // 	mesh.rotation.y += 0.002;
    // 	mesh.updateMatrixWorld();
    // }
    // updateRays();
    renderer.render( scene, camera );
}
const resizeFn = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
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