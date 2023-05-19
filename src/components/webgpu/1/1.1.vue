<template>
    <div class="webgpu-example">
        <div class="title">{{ title }}</div>
        <canvas ref="canvas" :width="canvasStyle.width" :height="canvasStyle.height"></canvas>
    </div>
</template>

<script setup>
const title = ref('1-1 hello world')
const supportGpu = ref(true)
const adapter = ref(null)
const device = ref(null)
const canvas = ref(null)
const canvasStyle = ref({
    width: 0,
    height: 0
})
const ctx = ref(null)
async function initGpu() {
    if (!navigator.gpu) {
        throw Error("WebGPU not supported.")
        supportGpu.value = false
    }
    const _adapter = await navigator.gpu.requestAdapter()
    if (!adapter) {
        throw Error("Couldn't request WebGPU adapter.")
    } else {
        adapter.value = _adapter
    }
    const _device = await adapter.requestDevice()

    //...
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
    }

    canvas {
        flex: 1;
        width: 100%;
    }
}
</style>