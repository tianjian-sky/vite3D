<template>
    <div class="webgpu-example">
        <div class="title">{{ title }}</div>
        <canvas ref="canvas" :width="canvasStyle.width" :height="canvasStyle.height"></canvas>
    </div>
</template>

<script setup lang="ts">
defineOptions({
    name: 'ch1_1'
})
const title = ref('1-1 hello world')
const supportGpu = ref(true)
const gpu = navigator.gpu
const adapter = ref(null)
const device = ref(null)
const canvas = ref(null)
const canvasStyle = ref({
    width: 0,
    height: 0
})
const ctx = ref(null)
async function initGpu() {
    if (!gpu) {
        supportGpu.value = false
        throw Error("WebGPU not supported.")
    }
    adapter.value = await gpu.requestAdapter()
    if (!adapter.value) {
        throw Error("Couldn't request WebGPU adapter.")
    }
    device.value = await adapter.value.requestDevice()
    if (!device.value) {
        throw Error("Couldn't request WebGPU device.")
    }
    console.warn(gpu, adapter.value, device.value)
}
const initCanvas = () => {
    canvasStyle.width = canvas.value.clientWidth
    canvasStyle.height = canvas.value.clientHeight
}
onMounted(() => {
    initGpu()
    initCanvas()
})
</script>

<style lang="scss">
.webgpu-example {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;

    .title {
        flex: 0 0 auto;
        text-align: center;
    }

    canvas {
        flex: 1;
        width: 100%;
        background: gray;
    }
}
</style>