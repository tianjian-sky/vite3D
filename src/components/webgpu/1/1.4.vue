<template>
    <div class="webgpu-example">
        <div class="title">{{ title }}</div>
        <canvas id="canvas_1_4" ref="canvas"></canvas>
    </div>
</template>

<script setup lang="ts">
import { mat4, vec3 } from 'wgpu-matrix'
import {
  cubeVertexArray,
  cubeVertexSize,
  cubeUVOffset,
  cubePositionOffset,
  cubeVertexCount,
} from './cube'
import { onBeforeUnmount } from 'vue'

defineOptions({
    name: '1.4 rotatin cube'
})
const title = ref('1.4 rotatin cube')
const clearColor = { r: 0.5, g: 0.5, b: 0.5, a: 1.0 }
const supportGpu = ref(true)
const gpu = navigator.gpu
const adapter = ref(null)
const device = ref(null)
const shader = ref(null)
const shaderModule = ref(null)
const canvas = ref(null)
const vertices = ref(null)
const vBuffer = ref(null)
const uniformBuffer = ref(null)
const uniformBindGroup = ref(null)
const renderPipeline = ref(null)
const commandEncoder = ref(null)
const renderPassEncoder = ref(null)
const MSAA = ref(false)
const sampleCount = ref(MSAA.value ? 4 : 1) // MSAA
const renderId = ref(null)
const renderTarget = ref(null)
const devicePixelRatio = window.devicePixelRatio || 1
const depthTexture = ref(null)

const canvasStyle = ref({
    width: 0,
    height: 0
})

const cameraParams = ref({
    near: 1,
    far: 100,
    fov: (2 * Math.PI) / 5,
    aspect: 1
})

let projectionMatrix
let transformationMatrix
const modelViewProjectionMatrix = mat4.create()


const setCamera = function () {
    cameraParams.value.aspect = canvas.value.width / canvas.value.height
    projectionMatrix = mat4.perspective(cameraParams.value.fov, cameraParams.value.aspect, cameraParams.value.near, cameraParams.value.far)
}

let gpuContext

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
// uniform, attribute, varying


/**
 * @location(number)
 * 1.对于顶点着色器，输入是由顶点着色器入口函数的@location属性定义的。
 *  @vertex vs1(@location(0) foo: f32, @location(1) bar: vec4f) ...
 * 2.对于阶段变量，@location属性定义变量在着色器之间传递的位置。
 *  struct VSOut {
        @builtin(position) pos: vec4f,
        @location(0) color: vec4f,
        @location(1) texcoords: vec2f,
    };
    
    struct FSIn {
        @location(1) uv: vec2f,
        @location(0) diffuse: vec4f,
    };
    @vertex fn foo(...) -> VSOut { ... }
    @fragment fn bar(moo: FSIn) ... 
 * 
 * 3. 片元着色器输出fragment shader outputs
 * 在片元着色器中@location指定了使用哪个GPURenderPassDescriptor.colorAttachment存储结果。
 *  struct FSOut {
        @location(0) albedo: vec4f;
        @location(1) normal: vec4f;
    }
    @fragment fn bar(...) -> FSOut { ... }

 */

const shader1 = `
    struct Uniforms {
        modelViewProjectionMatrix : mat4x4<f32>,
    }
    @binding(0) @group(0) var<uniform> uniforms : Uniforms;
    struct VertexOutput {
        @builtin(position) Position : vec4<f32>,
        @location(0) fragUV : vec2<f32>,
        @location(1) fragPosition: vec4<f32>,
    }
    @vertex
    fn main(
        @location(0) position : vec4<f32>,
        @location(1) uv : vec2<f32>
    ) -> VertexOutput {
        var output : VertexOutput;
        output.Position = uniforms.modelViewProjectionMatrix * position;
        output.fragUV = uv;
        output.fragPosition = 0.5 * (position + vec4(1.0, 1.0, 1.0, 1.0));
        return output;
    }
`

const shader2 = `
    @fragment
    fn main(
        @location(0) fragUV: vec2<f32>,
        @location(1) fragPosition: vec4<f32>
    ) -> @location(0) vec4<f32> {
        return fragPosition;
    }
`
function getTransformationMatrix() {
    const viewMatrix = mat4.identity()
    mat4.translate(viewMatrix, vec3.fromValues(0, 0, -4), viewMatrix)
    const now = Date.now() / 1000;
    mat4.rotate(
      viewMatrix,
      vec3.fromValues(Math.sin(now), Math.cos(now), 0),
      1,
      viewMatrix
    )
    mat4.multiply(projectionMatrix, viewMatrix, modelViewProjectionMatrix)
    console.error('v', JSON.stringify(projectionMatrix))
    return modelViewProjectionMatrix
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
    vertices.value = cubeVertexArray
    vBuffer.value = device.value.createBuffer({
        size: vertices.value.byteLength, // buffer的字长
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true // TODO:
    })
    console.log(GPUBufferUsage, vertices)
    // 指令队列：GPUQueue
    // 它保存 指令缓存，主要负责提交指令缓存到 GPU 上。
    // device.value.queue.writeBuffer(vBuffer.value, 0, vertices.value, 0, vertices.value.length)

    // vBuffer.value.getMappedRange() TODO:
    // vBuffer.value.unmap() TODO:
    new Float32Array(vBuffer.value.getMappedRange()).set(vertices.value)
    vBuffer.value.unmap()
}
const initPipeline = () => {
    const pipelineDescriptor = {
        vertex: {
            module: device.value.createShaderModule({
                code: shader1
            }),
            entryPoint: "main",
            buffers: [
                {
                    arrayStride: cubeVertexSize,
                    attributes: [
                        {
                            // position
                            shaderLocation: 0,
                            offset: 0,
                            format: 'float32x4',
                        },
                        {
                            // uv
                            shaderLocation: 1,
                            offset: 4 * 8,
                            format: 'float32x2',
                        },
                    ]
                }
            ],
        },
        fragment: {
            module: device.value.createShaderModule({
                code: shader2
            }),
            entryPoint: "main",
            targets: [
                {
                    format: navigator.gpu.getPreferredCanvasFormat(),
                },
            ],
        },
        primitive: {
            topology: 'triangle-list',
            cullMode: 'back' // TODO:
        },
        layout: 'auto', // TODO:
        depthStencil: { // TODO:
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth24plus',
        }
    }
    if (MSAA.value) {
        pipelineDescriptor.multisample = {
            count: sampleCount.value
        }
    }
    // represents a pipeline that controls the vertex and fragment shader stages
    renderPipeline.value = device.value.createRenderPipeline(pipelineDescriptor)
}
const initUniformBuffer = () => {
    uniformBuffer.value = device.value.createBuffer({
        size: 4 * 16, // 4x4 matrix,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    uniformBindGroup.value = device.value.createBindGroup({ // TODO:
        layout: renderPipeline.value.getBindGroupLayout(0),
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: uniformBuffer.value,
                },
            }
        ]
    })
}
const initCommanderEncoder = () => {
    //  represents a command encoder, used to encode commands to be issued to the GPU.
    commandEncoder.value = device.value.createCommandEncoder()
}
const initRenderPassEncoder = () => {
    // encodes commands related to controlling the vertex and fragment shader stages, as issued by a GPURenderPipeline. It forms part of the overall encoding activity of a GPUCommandEncoder
    // if (renderTarget.value) {
    //     renderTarget.value.destroy()
    // }
    // renderTarget.value = device.value.createTexture({
    //     size: [canvas.value.width, canvas.value.height],
    //     sampleCount: sampleCount.value,
    //     format: navigator.gpu.getPreferredCanvasFormat(),
    //     usage: GPUTextureUsage.RENDER_ATTACHMENT
    // });
    console.log(canvas.value.width, canvas.value.height)
    
    const renderPassDescriptor = {
        colorAttachments: [
            {
                clearValue: clearColor,
                loadOp: "clear",
                storeOp: "store",
                view: undefined,
                // view: gpuContext.getCurrentTexture().createView(),
                // view: renderTarget.value.createView(),
                // resolveTarget: gpuContext.getCurrentTexture().createView(),
            },
        ],
        depthStencilAttachment: { // TODO:
            view: depthTexture.value.createView(),
            depthClearValue: 1.0,
            depthLoadOp: 'clear',
            depthStoreOp: 'store',
        }
    }

    /**
     * renderPassDescriptor.colorAttachments: defining the color attachments that will be output to when executing this render pass.
     * renderPassDescriptor.colorAttachments.resolveTarget: A GPUTextureView object representing the texture subresource that will receive the resolved output for this color attachment if view is multisampled.
     * renderPassDescriptor.colorAttachments.view: A GPUTextureView object representing the texture subresource that will be output to for this color attachment.
     */

    /**
     * gpuContext.getCurrentTexture()
     * Returns the next GPUTexture to be composited to the document by the canvas context.
     */

    /**
     * GPUTexture
     * The GPUTexture interface of the WebGPU API represents a container used to store 1D, 2D, or 3D arrays of data, such as images, to use in GPU rendering operations.
     */

    /**
     * GPUTexture.createView()
     * Creates a GPUTextureView representing a specific view of the GPUTexture.
     */
    renderPassDescriptor.colorAttachments[0].view = gpuContext.getCurrentTexture().createView()
    console.log('getCurrentTexture', gpuContext.getCurrentTexture())
    renderPassEncoder.value = commandEncoder.value.beginRenderPass(renderPassDescriptor)
    console.log('renderPassEncoder', renderPassEncoder.value)
}
const setRnderPassEncoder = () => {
    renderPassEncoder.value.setPipeline(renderPipeline.value) // 指定用于渲染管线的通道
    renderPassEncoder.value.setBindGroup(0, uniformBindGroup.value)
    renderPassEncoder.value.setVertexBuffer(0, vBuffer.value) // 作为数据源传递给管线进行渲染。第一个参数是设置顶点缓冲区的插槽，这是对 vertexBuffers 数组中描述该缓冲区布局的元素索引的引。
    renderPassEncoder.value.draw(cubeVertexCount) // 设置动态绘制。在我们的 vertexBuffer 中有三个顶点的数据，所以我们将顶点数值设置为 3 去绘制它们。
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
    setCamera()
    transformationMatrix = getTransformationMatrix()
    /**
     * GPUQueue
     * GPUQueue interface of the WebGPU API controls execution of encoded commands on the GPU.
     */

    /**
     * GPUQueue.writeBuffer
     * writeBuffer(buffer, bufferOffset, data, dataOffset, size)
     */
    device.value.queue.writeBuffer( // TODO:
        uniformBuffer.value,
        0,
        transformationMatrix.buffer,
        transformationMatrix.byteOffset,
        transformationMatrix.byteLength
    )
    depthTexture.value = device.value.createTexture({ // TODO:
        size: [canvas.value.width, canvas.value.height],
        format: 'depth24plus',
        usage: GPUTextureUsage.RENDER_ATTACHMENT // TODO:
    })
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
    initCanvas()
    initBuffer()
    initPipeline()
    initUniformBuffer()
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
        // animation-name: animated-size;
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