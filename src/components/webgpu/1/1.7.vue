<template>
    <div class="webgpu-example">
        <div class="title">{{ title }}</div>
        <canvas id="canvas_1_5" ref="canvas"></canvas>
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
    name: '1.7 instance'
})
const title = ref('1.7 instance')
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

const uniformBindGroups = {
    0: null,
    1: null
}
const sampler = ref(null)
const texture = ref(null)

const numInstances = 16
const matrixSize = 4 * 16; // 4x4 matrix
const offset = 256; // uniformBindGroup offset must be 256-byte aligned
const uniformBufferSize = numInstances * matrixSize;
const tmpMat4 = mat4.create()
const viewMatrix = mat4.translation(vec3.fromValues(0, 0, -12));
let projectionMatrix
const modelMatrices = new Array<Mat4>(numInstances)
const mvpMatricesData = new Float32Array(16 * numInstances)

const step = 4.0;
let m = 0;
for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 4; y++) {
        modelMatrices[m] = mat4.translation(
            vec3.fromValues(
                step * (x - 4 / 2 + 0.5),
                step * (y - 4 / 2 + 0.5),
                0
            )
        )
        m++;
    }
}

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
        modelViewProjectionMatrix : array<mat4x4<f32>, 16>,
    }

    @binding(0) @group(0) var<uniform> uniforms : Uniforms;

    struct VertexOutput {
        @builtin(position) Position : vec4<f32>,
        @location(0) fragUV : vec2<f32>,
        @location(1) fragPosition: vec4<f32>,
    }

    @vertex
    fn main(
        @builtin(instance_index) instanceIdx : u32,
        @location(0) position : vec4<f32>,
        @location(1) uv : vec2<f32>
    ) -> VertexOutput {
        var output : VertexOutput;
        output.Position = uniforms.modelViewProjectionMatrix[instanceIdx] * position;
        output.fragUV = uv;
        output.fragPosition = 0.5 * (position + vec4(1.0));
        return output;
    }

`

const shader2 = `
    @group(0) @binding(1) var mySampler: sampler;
    @group(0) @binding(2) var myTexture: texture_2d<f32>;

    @fragment
    fn main(
        @location(0) fragUV: vec2<f32>,
        @location(1) fragPosition: vec4<f32>
    ) -> @location(0) vec4<f32> {
        return textureSample(myTexture, mySampler, fragUV) * fragPosition;
    }


`
function updateTransformationMatrix() {
    const now = Date.now() / 1000;
    let m = 0, i = 0;
    for (let x = 0; x < 4; x++) {
        for (let y = 0; y < 4; y++) {
            mat4.rotate(modelMatrices[i],
            vec3.fromValues(
                Math.sin((x + 0.5) * now),
                Math.cos((y + 0.5) * now),
                0
            ), 1, tmpMat4)
            mat4.multiply(viewMatrix, tmpMat4, tmpMat4);
            mat4.multiply(projectionMatrix, tmpMat4, tmpMat4);
            mvpMatricesData.set(tmpMat4, m);
            i++
            m += 16
        }
    }
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
        mappedAtCreation: true // 映射显存，映射完后的某块显存，能被cpu访问。
    })
    console.log(GPUBufferUsage, vertices)
    // 指令队列：GPUQueue
    // 它保存 指令缓存，主要负责提交指令缓存到 GPU 上。
    // device.value.queue.writeBuffer(vBuffer.value, 0, vertices.value, 0, vertices.value.length)

    // 映射显存，映射完后的某块显存，能被cpu访问。
    // vBuffer.value.mapAsync(mode, offset, size) maps the specified range of the GPUBuffer. It returns a Promise that resolves when the GPUBuffer's content is ready to be accessed. While the GPUBuffer is mapped it cannot be used in any GPU commands.
    // vBuffer.value.getMappedRange() 映射后的显存通过getMappedRange()方法获取对应的arraybuffer
    // vBuffer.value.unmap()  cpu用完后接触映射
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
const initSampler = function () {
    sampler.value = device.value.createSampler({ // TODO:
        magFilter: 'linear',
        minFilter: 'linear',
    })
}
const initTexture = async function () {
    const response = await fetch('/static/textures/d2.jpg')
    /**
     * createImageBitmap()
     * The createImageBitmap() method creates a bitmap from a given source, optionally cropped to contain only a portion of that source.
     * The method exists on the global scope in both windows and workers. 
     */

     /**
     * ImageBitmap
     * The ImageBitmap interface represents a bitmap image which can be drawn to a <canvas> without undue latency. 
     * It can be created from a variety of source objects using the createImageBitmap() factory method.
     * ImageBitmap provides an asynchronous and resource efficient pathway to prepare textures for rendering in WebGL.
     */
    const imageBitmap = await createImageBitmap(await response.blob())

    texture.value = device.value.createTexture({ // TODO:
        size: [imageBitmap.width, imageBitmap.height, 1],
        format: 'rgba8unorm',
        usage:
            GPUTextureUsage.TEXTURE_BINDING |
            GPUTextureUsage.COPY_DST |
            GPUTextureUsage.RENDER_ATTACHMENT
    })
    device.value.queue.copyExternalImageToTexture( // TODO:
        { source: imageBitmap },
        { texture: texture.value },
        [imageBitmap.width, imageBitmap.height]
    )
}
const initUniformBuffer = () => {
    uniformBuffer.value = device.value.createBuffer({
        size: uniformBufferSize, // 4x4 matrix,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, // TODO:
    })
    uniformBindGroups[0] = device.value.createBindGroup({ // TODO:  s
        layout: renderPipeline.value.getBindGroupLayout(0),
        entries: [
            {
                binding: 0, // it matches the n index value of the corresponding @binding(n)
                resource: { // 1. GPUBufferBinding 2.GPUExternalTexture 3.GPUSampler 4.GPUTextureView
                    buffer: uniformBuffer.value,
                    offset: 0,
                    size: matrixSize * numInstances,
                },
            },
            {
                binding: 1,
                resource: sampler.value,
            },
            {
                binding: 2,
                resource: texture.value.createView()
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
    // console.log(canvas.value.width, canvas.value.height, sampleCount.value)
    
    const renderPassDescriptor = {
        colorAttachments: [
            {
                clearValue: clearColor,
                loadOp: "clear",
                storeOp: "store",
                view: undefined,
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
    if (MSAA.value) {
        const texture = device.value.createTexture({
            size: [canvas.value.width, canvas.value.height],
            sampleCount: sampleCount.value,
            format: navigator.gpu.getPreferredCanvasFormat(),
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        })
        renderPassDescriptor.colorAttachments[0].view = texture.createView()
        renderPassDescriptor.colorAttachments[0].resolveTarget = renderTarget.value.createView()
    } else {
        renderPassDescriptor.colorAttachments[0].view = gpuContext.getCurrentTexture().createView()
        // renderPassDescriptor.colorAttachments[0].resolveTarget = gpuContext.getCurrentTexture().createView()
    }
    console.log('getCurrentTexture', gpuContext.getCurrentTexture())
    renderPassEncoder.value = commandEncoder.value.beginRenderPass(renderPassDescriptor)
    console.log('renderPassEncoder', renderPassEncoder.value)
}
const setRnderPassEncoder = () => {
    renderPassEncoder.value.setPipeline(renderPipeline.value) // 指定用于渲染管线的通道
    renderPassEncoder.value.setVertexBuffer(0, vBuffer.value) // 作为数据源传递给管线进行渲染。第一个参数是设置顶点缓冲区的插槽，这是对 vertexBuffers 数组中描述该缓冲区布局的元素索引的引。
    // 同一个binding多次draw
    renderPassEncoder.value.setBindGroup(0, uniformBindGroups[0])
    renderPassEncoder.value.draw(cubeVertexCount, numInstances, 0, 0)
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
    //  initCanvas()
    canvas.value.width = canvas.value.clientWidth * devicePixelRatio
    canvas.value.height = canvas.value.clientHeight * devicePixelRatio
    setCamera()
    updateTransformationMatrix()
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
        mvpMatricesData.buffer,
        mvpMatricesData.byteOffset,
        mvpMatricesData.byteLength
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
    initSampler()
    await initTexture()
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