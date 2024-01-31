<template>
    <div class="about">
        <canvas id="renderCanvas" ref="container"></canvas>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import * as BABYLON from 'babylonjs'
import type { Texture, AbstractMesh, Scene } from 'babylonjs'
import '../../node_modules/babylonjs-loaders/babylon.glTF2FileLoader'

defineOptions({
  name: 'BabylonGpuPick'
})

interface Window {
  LOADERS: any
}
const container = $ref(null)
let engine
class MorphTargetSync {
    morphMap = new Map()

    constructor() {}

    addMorphTarget(morphTarget) {
        this.morphMap.set(
            morphTarget,
            morphTarget.onInfluenceChanged.add(() => {
                this._syncInfluence(morphTarget)
            })
        )
    }

    removeMorphTarget(morphTarget) {
        let observers = this.morphMap.get(morphTarget)
        if (observers) {
            morphTarget.onInfluenceChanged.remove(observers)
            this.morphMap.delete(morphTarget)
        }
    }

    _syncInfluence(morphTarget) {
        this.morphMap.forEach((observer, target) => {
            if (target.influence !== morphTarget.influence) {
                target.influence = morphTarget.influence
            }
        })
    }
}



var createScene = function () {
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);
    var ground = BABYLON.MeshBuilder.CreatePlane("plane", { size: 1 }, scene);
    let groundMaterial = BABYLON.StandardMaterial.Parse({ "tags": null, "ambient": [0, 0, 0], "diffuse": [0.07450980392156863, 0.8588235294117647, 0.9647058823529412], "specular": [1, 1, 1], "emissive": [0.07450980392156863, 0.8588235294117647, 0.9647058823529412], "specularPower": 10, "useAlphaFromDiffuseTexture": false, "useEmissiveAsIllumination": false, "linkEmissiveWithDiffuse": false, "useSpecularOverAlpha": false, "useReflectionOverAlpha": false, "disableLighting": false, "useObjectSpaceNormalMap": false, "useParallax": false, "useParallaxOcclusion": false, "parallaxScaleBias": 0.05, "roughness": 0, "indexOfRefraction": 0.98, "invertRefractionY": true, "alphaCutOff": 0, "useLightmapAsShadowmap": false, "useReflectionFresnelFromSpecular": false, "useGlossinessFromSpecularMapAlpha": false, "maxSimultaneousLights": 4, "invertNormalMapX": false, "invertNormalMapY": false, "twoSidedLighting": true, "id": "彩虹色.jpg1", "name": "彩虹色.jpg1", "checkReadyOnEveryCall": false, "checkReadyOnlyOnce": false, "state": "", "alpha": 0.5, "backFaceCulling": true, "cullBackFaces": true, "sideOrientation": 1, "alphaMode": 6, "_needDepthPrePass": false, "disableDepthWrite": false, "disableColorWrite": false, "forceDepthWrite": false, "depthFunction": 0, "separateCullingPass": false, "fogEnabled": true, "pointSize": 1, "zOffset": 0, "zOffsetUnits": 0, "pointsCloud": false, "fillMode": 0, "transparencyMode": 3, "stencil": { "tags": null, "func": 519, "funcRef": 1, "funcMask": 255, "opStencilFail": 7680, "opDepthFail": 7680, "opStencilDepthPass": 7681, "mask": 255, "enabled": false }, "uniqueId": 272 })
    groundMaterial.backFaceCulling = false
    ground.material = groundMaterial
    ground.renderingGroupId = 1
    ground.disableDepthWrite = true
    ground.material.disableDepthWrite = true
    var camera = new BABYLON.ArcRotateCamera("Camera", 0, Math.PI / 2, 10, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(container, true);
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    var box = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);
    box.position.y = 1
    box.scaling.set(3, 3, 3)
    box.material = new BABYLON.StandardMaterial()

    BABYLON.SceneLoader.ImportMesh("", "https://oss2-0001.oss-cn-beijing.aliyuncs.com/viewer/oss/data/glb/64_%E5%BD%A2%E6%80%81%E9%94%AE%E6%B5%8B%E8%AF%9541.glb", "", scene, (meshs) => {
        scene.animationGroups[0].stop()
        let map = new Map()
        meshs.forEach(mesh => {
            if (mesh.parent && mesh.id.includes(`${mesh.parent.id}_primitive`) && mesh.morphTargetManager) {
                if (map.has(mesh.parent)) {
                    map.get(mesh.parent).push(mesh)
                } else {
                    map.set(mesh.parent, [mesh])
                }

            }
        })

        map.forEach((meshs, meshParent) => {
            meshs[0].morphTargetManager._targets.forEach((target, index) => {
                let morphTargetSync = new MorphTargetSync()
                meshs.forEach(m => {
                    morphTargetSync.addMorphTarget(m.morphTargetManager.getTarget(index))
                })
            })
        })
        meshs[0].position.z = 1
        meshs[1].morphTargetManager.getTarget(0).influence = 1
    })
    var frameId;
    // var no
    function onPointerMove1() {
        if (frameId === engine.frameId) {
            return
        }
        frameId = engine.frameId
        console.time('GPUPick')
        let pickInfo = GPUPick()
        console.timeEnd('GPUPick')
        if (!pickInfo) {
            ground.isVisible = false
            return null
        } else {
            ground.isVisible = true
        }

        const pickedNormal = pickInfo.normal;
        const pickedPoint = pickInfo.pickedPoint;
        if (!pickedNormal || !pickedPoint) {
            return null;
        }
        pickedNormal.normalize();
        const worldTarget = new BABYLON.Vector3();
        worldTarget.copyFrom(pickedNormal);
        worldTarget.scaleInPlace(0.01);
        worldTarget.addInPlace(pickedPoint);
        if (ground.parent) {
            BABYLON.TmpVectors.Matrix[0].copyFrom(ground.parent.getWorldMatrix()).invert();
            BABYLON.Vector3.TransformNormalToRef(worldTarget, BABYLON.TmpVectors.Matrix[0], worldTarget);
        }
        let result = {
            position: worldTarget,
            quaternion: BABYLON.Quaternion.RotationYawPitchRoll(-Math.atan2(pickedNormal.x, -pickedNormal.z), Math.atan2(pickedNormal.y, Math.sqrt(pickedNormal.z * pickedNormal.z + pickedNormal.x * pickedNormal.x)), 0),
        };
        if (!ground.rotationQuaternion) {
            ground.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(ground.rotation.y, ground.rotation.x, ground.rotation.z);
        }
        ground.position.copyFrom(result.position);
        ground.rotationQuaternion.copyFrom(result.quaternion)
    }
    container.addEventListener('pointermove', onPointerMove1);
    let renderer = scene.enableDepthRenderer(camera, false, true, undefined, true);
    let depthMap = renderer.getDepthMap()

    let offsetBase = 1
    let offsetBaseRange = offsetBase * 2 + 1

    let pixelsOffset = []
    for (var y = offsetBase; y >= -offsetBase; y--) {
        for (var x = -offsetBase; x <= offsetBase; x++) {
            pixelsOffset.push({ x, y })
            console.log(x, y)
        }
    }
    let iArray = []
    for (var i = 0; i < offsetBaseRange; i += offsetBase) {
        let iiArray = []
        for (var ii = 0; ii < offsetBaseRange; ii += offsetBase) {
            iiArray.push(i * offsetBaseRange + ii)
        }
        iArray.unshift(iiArray)
    }

    let normalCoord = [[0, 2], [0, 1], [0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [1, 2]]
    let normalCoords = []

    normalCoord.forEach((e, i) => {
        let nextIndex = i + 1
        let nextCoord = normalCoord[nextIndex] || normalCoord[0]
        let coord1 = iArray[e[0]][e[1]];
        let coord2 = iArray[nextCoord[0]][nextCoord[1]]

        normalCoords.push([coord1, coord2])
    })

    function GPUPick() {
        renderer.enabled = true
        if (engine.getRenderWidth() !== depthMap.getSize().width || engine.getRenderHeight() !== depthMap.getSize().height) {
            depthMap.resize({ width: engine.getRenderWidth(), height: engine.getRenderHeight() })
        }
        console.time('readPixels')
        console.log('--', scene.pointerX, scene.pointerY, offsetBase, offsetBaseRange)
        var pixels = readTexturePixels(engine._gl, depthMap, scene.pointerX - offsetBase, depthMap.getSize().height - scene.pointerY - offsetBase, offsetBaseRange, offsetBaseRange)
        console.timeEnd('readPixels')
        let index = Math.floor(pixels.length / 4 / 2)
        let centerDistance = pixels[index * 4]

        let position = BABYLON.Vector3.Unproject(
            new BABYLON.Vector3(scene.pointerX + pixelsOffset[index].x, scene.pointerY + pixelsOffset[index].y, 0),
            engine.getRenderWidth(),
            engine.getRenderHeight(),
            BABYLON.Matrix.Identity(), scene.getViewMatrix(),
            scene.getProjectionMatrix());


        let direction = camera.globalPosition.clone().subtract(position)
        let subVec = direction.scale(centerDistance)

        let centerPoint = camera.position.clone().subtract(subVec)

        // normal compute
        let flagCoord;
        let distanceDifference = Infinity
        normalCoords.forEach(coord => {
            let coord1 = coord[0]
            let coord2 = coord[1]
            let distance1 = pixels[coord1 * 4];
            let distance2 = pixels[coord2 * 4];
            if (distance1 === 100000000) return
            if (distance2 === 100000000) return
            let currentDD = Math.abs(centerDistance - distance1) + Math.abs(centerDistance - distance2) + Math.abs(distance1 - distance2)
            if (currentDD < distanceDifference) {
                distanceDifference = currentDD
                flagCoord = coord
            }
        })
        if (!flagCoord) return
        let coordPointers = []
        flagCoord.forEach(cd => {
            let distance = pixels[cd * 4];
            let position = BABYLON.Vector3.Unproject(
                new BABYLON.Vector3(scene.pointerX + pixelsOffset[cd].x, scene.pointerY + pixelsOffset[cd].y, 0),
                engine.getRenderWidth(),
                engine.getRenderHeight(),
                BABYLON.Matrix.Identity(), scene.getViewMatrix(),
                scene.getProjectionMatrix());


            let direction = camera.globalPosition.clone().subtract(position)
            let subVec = direction.scale(distance)

            let resultcd = camera.position.clone().subtract(subVec)
            coordPointers.push(resultcd)
        })


        let pointer1 = centerPoint.clone()
        let pointer2 = coordPointers[0].clone()
        let pointer3 = coordPointers[1].clone()



        const originPointer2 = pointer2.subtract(pointer1.clone()).normalize();
        const originPointer3 = pointer3.subtract(pointer1.clone()).normalize();


        let normal = BABYLON.Vector3.Cross(originPointer3, originPointer2);
        normal.normalize()

        return {
            pickedPoint: centerPoint,
            normal
        }
    }

    function readTexturePixels(gl, texture, x, y, w, h) {
        const frameBuffer = gl.createFramebuffer();
        const pixels = new Float32Array(w * h * 4);
        texture = texture._texture._hardwareTexture.underlyingResource
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        gl.readPixels(x, y, w, h, gl.RGBA, gl.FLOAT, pixels);
        gl.deleteFramebuffer(frameBuffer)
        return pixels;
    };
    return scene;

};

BABYLON.SceneLoader.RegisterPlugin(new window.LOADERS.GLTFFileLoader())
const init = function () {
    engine = new BABYLON.Engine(container, true) // Generate the BABYLON 3D engine
    const scene = createScene() //Call the createScene function
    scene.debugLayer.show()
    // Register a render loop to repeatedly render the scene
    engine.runRenderLoop(function () {
        scene.render()
    })
}
const resizeFn = function () {
    engine.resize()
}
onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeFn)
})
onMounted(() => {
  console.log(BABYLON, container)
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