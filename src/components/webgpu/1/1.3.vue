<template>
    <div class="webgpu-example">
        <div class="title">{{ title }}</div>
        <canvas id="canvas_1_3" ref="canvas"></canvas>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from 'vue'

defineOptions({
    name: '1.3 resize'
})
const title = ref('1-3 resize')
const clearColor = { r: 0.0, g: 0.5, b: 1.0, a: 1.0 }
const supportGpu = ref(true)
const gpu = navigator.gpu
const adapter = ref(null)
const device = ref(null)
const shader = ref(null)
const shaderModule = ref(null)
const canvas = ref(null)
const vertices = ref(null)
const vBuffer = ref(null)
const renderPipeline = ref(null)
const commandEncoder = ref(null)
const renderPassEncoder = ref(null)
const sampleCount = ref(4) // MSAA
const renderId = ref(null)
const renderTarget = ref(null)
const devicePixelRatio = window.devicePixelRatio || 1

let gpuContext
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
async function initShaders() {
    shader.value = `
        struct VertexOut {
            @builtin(position) position : vec4f,
            @location(0) color : vec4f
        }

        @vertex
        fn vertex_main(@location(0) position: vec4f, @location(1) color: vec4f) -> VertexOut {
            var output : VertexOut;
            output.position = position;
            output.color = color;
            return output;
        }

        @fragment
        fn fragment_main(fragData: VertexOut) -> @location(0) vec4f {
            return fragData.color;
        }
    `
    shaderModule.value = device.value.createShaderModule({
        code: shader.value
    })
    console.log('shader', shaderModule.value)
}
const initCanvas = () => {
    canvas.value.width = canvas.value.clientWidth * devicePixelRatio
    canvas.value.height = canvas.value.clientHeight * devicePixelRatio
    gpuContext = canvas.value.getContext("webgpu")
    gpuContext.configure({
        device: device.value,
        format: navigator.gpu.getPreferredCanvasFormat(),
        alphaMode: "premultiplied",
    })
    console.warn('context', gpuContext, navigator.gpu, navigator.gpu.getPreferredCanvasFormat())
}
const initBuffer = () => {
    vertices.value = new Float32Array([
        0.0, 0.6, 0, 1,
        1, 0, 0, 1,
        -0.5, -0.6, 0, 1,
        0, 1, 0, 1,
        0.5,-0.6, 0, 1,
        0, 0, 1, 1
    ])
    vBuffer.value = device.value.createBuffer({
        size: vertices.value.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    })
    console.log(GPUBufferUsage)
    // 指令队列：GPUQueue
    // 它保存 指令缓存，主要负责提交指令缓存到 GPU 上。
    device.value.queue.writeBuffer(vBuffer.value, 0, vertices.value, 0, vertices.value.length)
}
const initPipeline = () => {
    const vertexBuffers = [
        {
            attributes: [
                {
                    shaderLocation: 0, // 位置
                    offset: 0,
                    format: "float32x4",
                },
                {
                    shaderLocation: 1, // 颜色
                    offset: 16,
                    format: "float32x4",
                },
            ],
            arrayStride: 32,
            stepMode: "vertex",
        }
    ]
    const pipelineDescriptor = {
        vertex: {
            module: shaderModule.value,
            entryPoint: "vertex_main",
            buffers: vertexBuffers,
        },
        fragment: {
            module: shaderModule.value,
            entryPoint: "fragment_main",
            targets: [
                {
                    format: navigator.gpu.getPreferredCanvasFormat(),
                },
            ],
        },
        primitive: {
            topology: "triangle-list",
        },
        layout: "auto",
        multisample: {
            count: sampleCount.value
        }
    }
    // represents a pipeline that controls the vertex and fragment shader stages
    renderPipeline.value = device.value.createRenderPipeline(pipelineDescriptor)
}
const initCommanderEncoder = () => {
    //  represents a command encoder, used to encode commands to be issued to the GPU.
    commandEncoder.value = device.value.createCommandEncoder()
}
const initRenderPassEncoder = () => {
    // encodes commands related to controlling the vertex and fragment shader stages, as issued by a GPURenderPipeline. It forms part of the overall encoding activity of a GPUCommandEncoder
    if (renderTarget.value) {
        renderTarget.value.destroy()
    }
    renderTarget.value = device.value.createTexture({
        size: [canvas.value.width, canvas.value.height],
        sampleCount: sampleCount.value,
        format: navigator.gpu.getPreferredCanvasFormat(),
        usage: GPUTextureUsage.RENDER_ATTACHMENT
    });
    console.log(canvas.value.width, canvas.value.height)
    const renderPassDescriptor = {
        colorAttachments: [
            {
                clearValue: clearColor,
                loadOp: "clear",
                storeOp: "store",
                // view: gpuContext.getCurrentTexture().createView(),
                view: renderTarget.value.createView(),
                resolveTarget: gpuContext.getCurrentTexture().createView(),
            },
        ],
    }
    console.log('getCurrentTexture', gpuContext.getCurrentTexture())
    renderPassEncoder.value = commandEncoder.value.beginRenderPass(renderPassDescriptor)
    console.log('renderPassEncoder', renderPassEncoder.value)
}
const setRnderPassEncoder = () => {
    renderPassEncoder.value.setPipeline(renderPipeline.value) // 指定用于渲染管线的通道
    renderPassEncoder.value.setVertexBuffer(0, vBuffer.value) // 作为数据源传递给管线进行渲染。第一个参数是设置顶点缓冲区的插槽，这是对 vertexBuffers 数组中描述该缓冲区布局的元素索引的引。
    renderPassEncoder.value.draw(3) // 设置动态绘制。在我们的 vertexBuffer 中有三个顶点的数据，所以我们将顶点数值设置为 3 去绘制它们。
}
const submit = () => {
    renderPassEncoder.value.end() // 去给渲染指令列表发出结束的信号
    const finish = commandEncoder.value.finish() // 去完成对发出指令序列的记录，并将其封装到 GPUCommandBuffer (en-US) 对象中。
    console.log('commandEncoder.value.finish', finish)
    device.value.queue.submit([finish]) // 将 GPUCommandBuffer (en-US) 实例数组增加到队列中
}
const render = () => {
    /**
     * init renderPipeline = device.createRenderPipeline(pipelineDescriptor) 只初始化一次
     * init commandEncoder = device.createCommandEncoder()
     * init renderPassEncoder = commandEncoder.beginRenderPass(renderPassDesc)
     * renderPassEncoder.setPipeline(renderPipeline)
     * renderPassEncoder.setVertexBuffer(0, vBuffer.value)
     * renderPassEncoder.draw(3)
     * renderPassEncoder.end()
     * const finish = commandEncoder.finish()
     * device.queue.submit([finish]) 
     */
    canvas.value.width = canvas.value.clientWidth * devicePixelRatio
    canvas.value.height = canvas.value.clientHeight * devicePixelRatio
    initCommanderEncoder()
    initRenderPassEncoder()
    setRnderPassEncoder()
    submit()
}
const animate = fn => {
    renderId.value = requestAnimationFrame(() => {
        fn()
        animate(fn)
    })
}
onMounted(async () => {
    await initGpu()
    await initShaders()
    initCanvas()
    initBuffer()
    initPipeline()
    initCommanderEncoder()
    initRenderPassEncoder()
    setRnderPassEncoder()
    submit()
    animate(render)
})
onBeforeUnmount(() => {
    window.cancelAnimationFrame(renderId.value)
})
</script>

<style lang="scss" scoped>
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
        animation-duration: 3s;
        animation-iteration-count: infinite;
        animation-name: animated-size;
        animation-timing-function: ease;
    }

    @keyframes animated-size {
        0% {
            width: 10px;
        }

        50% {
            width: 100%;
        }

        100% {
            width: 10px;
        }
    }
}
</style>