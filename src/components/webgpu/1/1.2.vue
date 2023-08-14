<template>
    <div class="webgpu-example">
        <div class="title">{{ title }}</div>
        <canvas ref="canvas"></canvas>
    </div>
</template>

<script setup lang="ts">

/**
GPUTexture 的创建
调用 device.createTexture() 即可创建一个纹理对象，你可以通过传参指定它的用途、格式、维度等属性。它扮演的更多时候是一个数据容器，也就是纹素的容器。

// 普通贴图
const texture = device.createTexture({
  size: [512, 512, 1],
  format: 'rgba8unorm',
  usage: GPUTextureUsage.TEXTURE_BINDING 
        | GPUTextureUsage.COPY_DST
        | GPUTextureUsage.RENDER_ATTACHMENT,
})

// 深度纹理
const depthTexture = device.createTexture({
  size: [800, 600],
  format: 'depth24plus',
  usage: GPUTextureUsage.RENDER_ATTACHMENT,
})

// 从 canvas 中获取纹理
const gpuContext = canvas.getContext('webgpu')
const canvasTexture = gpuContext.getCurrentTexture()

创建纹理视图

const view = texture.createView()

// 在渲染通道的颜色附件中
const renderPassDescriptor = {
  colorAttachments: [
    {
      view: canvasTexture.createView(),
      // ...
    }
  ]
}
*/

/**
 * renderPassDescriptor
 * 
 * const clearColor = { r: 0.0, g: 0.5, b: 1.0, a: 1.0 };

    const renderPassDescriptor = {
        colorAttachments: [
            {
            clearValue: clearColor,
            loadOp: "clear",
            storeOp: "store",
            view: context.getCurrentTexture().createView(),
            },
        ],
    };

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
 * 
 * 调用 GPUCommandEncoder.beginRenderPass() (en-US) 创建 GPURenderPassEncoder (en-US) 实例来开始运行渲染通道。
 * 该方法采用一个描述符对象作为参数，唯一的必须属性是 colorAttachments 数组。在该实例中，我们指定了：

    要渲染到的纹理视图；我们通过 context.getCurrentTexture().createView() (en-US) 从 <canvas> 创建一个新视图。
    纹理视图一旦加载并且在任何绘制发生之前，将“清除”视图到一个指定的颜色。这就是导致三角形后面出现蓝色背景的原因。
    我们还要在当前的渲染通道中存储这个颜色附件的值。
 *
 */

/**
 * descriptor
    An object containing the following properties:
    const renderPassDescriptor = {
        colorAttachments: [], // An array of objects defining the color attachments that will be output to when executing this render pass.
        depthStencilAttachment: {}, // An object defining the depth/stencil attachment that will be output to and tested against when executing this render pass.
        maxDrawCount: 1, // A number indicating the maximum number of draw calls that will be done in the render pass. This is used by some implementations to size work injected before the render pass. You should keep the default value — 50000000 — unless you know that more draw calls will be done.
        occlusionQuerySet: {}, // The GPUQuerySet that will store the occlusion query (遮挡查询) results for this pass.
        timestampWrites: [] // An array of objects defining where and when timestamp query values will be written for this pass. These objects have the following properties:
    };
 */

/**
 * descriptor.colorAttachments:
 *  {
 *        clearValue: [], // A color value to clear the view texture to, prior to executing the render pass. This value is ignored if loadOp is not set to "clear". 
 *        loadOp: 'load|clear', // An enumerated value indicating the load operation to perform on view prior to executing the render pass.
 *        storeOp: 'store|discard', // An enumerated value indicating the store operation to perform on view after executing the render pass.
 *        resolveTarget: {}, // A GPUTextureView object representing the texture subresource that will receive the resolved output for this color attachment if view is multisampled.
 *        view: {}, // A GPUTextureView object representing the texture subresource that will be output to for this color attachment.
 * }
 */

defineOptions({
    name: '1.2'
})
const title = ref('1-2 MSAA')
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
    canvas.value.width = canvas.value.clientWidth
    canvas.value.height = canvas.value.clientHeight
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
        0.0, 0.6, 0, 1, 1, 0, 0, 1, -0.5, -0.6, 0, 1, 0, 1, 0, 1, 0.5, -0.6, 0, 1, 0,
        0, 1, 1,
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
    const clearColor = { r: 0.0, g: 0.5, b: 1.0, a: 1.0 }
    const textrue = device.value.createTexture({
        size: [canvas.value.width, canvas.value.height],
        sampleCount: sampleCount.value,
        format: navigator.gpu.getPreferredCanvasFormat(),
        usage: GPUTextureUsage.RENDER_ATTACHMENT
    });
    const renderPassDescriptor = {
        colorAttachments: [
            {
                clearValue: clearColor,
                loadOp: "clear",
                storeOp: "store",
                // view: gpuContext.getCurrentTexture().createView(),
                view: textrue.createView(),
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