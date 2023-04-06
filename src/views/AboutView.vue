<template>
    <div class="about">
        <canvas id="renderCanvas" ref="container"></canvas>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import * as BABYLON from 'babylonjs'
import type { AbstractMesh } from 'babylonjs'
import '../../node_modules/babylonjs-loaders/babylon.glTF2FileLoader'
BABYLON.SceneLoader.RegisterPlugin(new window.LOADERS.GLTFFileLoader())
const container = $ref(null)

const init = function () {
  const engine = new BABYLON.Engine(container, true) // Generate the BABYLON 3D engine
  const createScene = function () {
    // Creates a basic Babylon Scene object
    const scene = new BABYLON.Scene(engine)
    // Creates and positions a free camera
    const camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), scene)
    // Targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero())
    // This attaches the camera to the container
    camera.attachControl(container, true)
    // Creates a light, aiming 0,1,0 - to the sky
    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene)
    // Dim the light a small amount - 0 to 1
    light.intensity = 0.7
    // Built-in 'sphere' shape.
    const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', { diameter: 2, segments: 32 }, scene)
    // Move the sphere upward 1/2 its height
    sphere.position.y = 1
    // Built-in 'ground' shape.
    const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 6, height: 6 }, scene)

    createSkybox(scene)
    createGround(scene)
    createCharacter(scene)
    return scene
  }
  const createSkybox = (scene) => {
    const skybox = BABYLON.MeshBuilder.CreateBox('skyBox', { size: 1000.0 }, scene)
    const skyboxMaterial = new BABYLON.StandardMaterial('skyBox', scene)
    skyboxMaterial.backFaceCulling = false
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
      '/static/textures/skybox/skybox1/skybox1',
      scene
    )
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0)
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0)
    skybox.material = skyboxMaterial
  }
  const createGround = (scene) => {
    const ground = BABYLON.MeshBuilder.CreateGround(
      'ground',
      { height: 50, width: 50, subdivisions: 4 },
      scene
    )
    const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', scene)
    groundMaterial.diffuseTexture = new BABYLON.Texture('/static/textures/wood.jpg', scene)
    groundMaterial.diffuseTexture.uScale = 30
    groundMaterial.diffuseTexture.vScale = 30
    groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1)
    ground.material = groundMaterial
  }
  const createCharacter = (scene) => {
    // Load hero character and play animation
    BABYLON.SceneLoader.ImportMesh(
      '',
      '/static/models/',
      'HVGirl.glb',
      scene,
      function (newMeshes: Array<AbstractMesh>, particleSystems, skeletons, animationGroups) {
        var dancingGirl = newMeshes[0]
        console.log('gltf loaded', newMeshes, particleSystems, skeletons, animationGroups)
        dancingGirl.scaling.scaleInPlace(0.1)
        //Scale the model down
        dancingGirl.rotate(new BABYLON.Vector3(0, 1, 0), Math.PI, BABYLON.Space.WORLD)
        dancingGirl.translate(new BABYLON.Vector3(0, 0, 1), -2, BABYLON.Space.WORLD)
        //Lock camera on the character
        const sambaAnim = scene.getAnimationGroupByName('Samba')
        //Play the Samba animation
        sambaAnim.start(true, 1.0, sambaAnim.from, sambaAnim.to, false)
        // const wakjubgAnim = scene.getAnimationGroupByName('Walking')
        // wakjubgAnim.start(true, 1.0, wakjubgAnim.from, wakjubgAnim.to, false)
      },
      (e) => {
        console.log(e)
      },
      (s, e) => {
        console.log(e)
      }
    )
  }
  const scene = createScene() //Call the createScene function
  scene.debugLayer.show()
  // Register a render loop to repeatedly render the scene
  engine.runRenderLoop(function () {
    scene.render()
  })
  const resizeFn = function () {
    engine.resize()
  }
  window.addEventListener('resize', resizeFn)

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeFn)
  })
}

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