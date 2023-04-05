<template>
    <div class="about">
        <canvas id="renderCanvas" ref="container"></canvas>
    </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import * as BABYLON from 'babylonjs'

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
    return scene
  }
  const scene = createScene() //Call the createScene function
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