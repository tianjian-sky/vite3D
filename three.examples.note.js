getWorldDirection
Octree
collider: new THREE.Sphere(new THREE.Vector3(0, - 100, 0), SPHERE_RADIUS),
	import { Capsule } from 'three/addons/math/Capsule.js';


function updateSpheres(deltaTime) {

    spheres.forEach(sphere => {

        sphere.collider.center.addScaledVector(sphere.velocity, deltaTime);

        const result = worldOctree.sphereIntersect(sphere.collider);

        if (result) {

            sphere.velocity.addScaledVector(result.normal, - result.normal.dot(sphere.velocity) * 1.5);
            sphere.collider.center.add(result.normal.multiplyScalar(result.depth));

        } else {

            sphere.velocity.y -= GRAVITY * deltaTime;

        }

        const damping = Math.exp(- 1.5 * deltaTime) - 1;
        sphere.velocity.addScaledVector(sphere.velocity, damping);

        playerSphereCollision(sphere);

    });

    spheresCollisions();

    for (const sphere of spheres) {

        sphere.mesh.position.copy(sphere.collider.center);

    }

}

box.intersectsTriangle(triangle)
if (subTrees[i].box.intersectsTriangle(triangle)) {

    subTrees[i].triangles.push(triangle);
}

sphere.intersectsPlane(_plane)


misc_animation_groups.html
const quaternionKF = new THREE.QuaternionKeyframeTrack('.quaternion', [0, 1, 2], [qInitial.x, qInitial.y, qInitial.z, qInitial.w, qFinal.x, qFinal.y, qFinal.z, qFinal.w, qInitial.x, qInitial.y, qInitial.z, qInitial.w]);
const colorKF = new THREE.ColorKeyframeTrack('.material.color', [0, 1, 2], [1, 0, 0, 0, 1, 0, 0, 0, 1], THREE.InterpolateDiscrete);
const opacityKF = new THREE.NumberKeyframeTrack('.material.opacity', [0, 1, 2], [1, 0, 1]);



misc_boxselection.html
框选
import { SelectionBox } from 'three/addons/interactive/SelectionBox.js';
import {
    FramebufferTexture,
    Frustum, LOD, Material, MeshLambertMaterial, ShaderMaterial,
} from 'three';
const _frustum = new Frustum();
if (frustum.containsPoint(_center)) {
    this.collection.push(object);

}

misc_controls_arcball.html

misc_controls_pointerlock.html
fpv

function animate() {

    requestAnimationFrame(animate);

    const time = performance.now();

    if (controls.isLocked === true) {

        raycaster.ray.origin.copy(controls.getObject().position);
        raycaster.ray.origin.y -= 10;

        const intersections = raycaster.intersectObjects(objects, false);

        const onObject = intersections.length > 0;

        const delta = (time - prevTime) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize(); // this ensures consistent movements in all directions

        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

        if (onObject === true) {

            velocity.y = Math.max(0, velocity.y);
            canJump = true;

        }

        controls.moveRight(- velocity.x * delta);
        controls.moveForward(- velocity.z * delta);

        controls.getObject().position.y += (velocity.y * delta); // new behavior

        if (controls.getObject().position.y < 10) {

            velocity.y = 0;
            controls.getObject().position.y = 10;

            canJump = true;

        }

    }

    prevTime = time;

    renderer.render(scene, camera);

}

misc_controls_trackball.html
惯性可有

misc_controls_transform.html
位移工具

misc_lookat.html
lookat 用例

misc_uv_tests.html
uv用例

physics_ ***
    物理效果

svg_ ***
    SVGRenderer

webaudio
audioLoader
THREE.PositionalAudio(listener);

webgl_animation_ ***

const animations = gltf.animations;

mixer = new THREE.AnimationMixer(model);

idleAction = mixer.clipAction(animations[0]);
walkAction = mixer.clipAction(animations[3]);
runAction = mixer.clipAction(animations[1]);

actions = [idleAction, walkAction, runAction];

activateAllActions();

animate();

webgl_buffergeometry_compression.html
几何压缩

webgl_buffergeometry_custom_attributes_particles.html
webgl_buffergeometry_rawshader.html
自定义着色器

webgl_buffergeometry_glbufferattribute.html
// 操作gl buffer
const rgb = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, rgb);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
geometry.setAttribute('color', new THREE.GLBufferAttribute(rgb, gl.FLOAT, 3, 4, particles));

webgl_buffergeometry_indexed.html
indices

webgl_buffergeometry_instancing_billboards.html
// instance 的buffer geometry， 顶点一份，可以实例化多个，每个读取不同的translate attr
instanceBufferGeometry + InterleavedBufferAttribute

webgl_buffergeometry_instancing_interleaved.html
instanceBufferGeometry + InterleavedBufferAttribute

webgl_buffergeometry_instancing.html
// const geometry = new THREE.InstancedBufferGeometry();
geometry.instanceCount = instances;

对比instancemesh
webgl_instancing_ *.html

webgl_buffergeometry_lines_indexed.html

webgl_buffergeometry_lines.html
geometry.morphAttributes
// geometry.morphAttributes.position = [ morphTarget ];

webgl_buffergeometry_points_interleaved.html
InterleavedBuffer InterleavedBufferAttribute


webgl_buffergeometry_selective_draw.
    // 设置attribute的visible，隐藏线段
    geometry.attributes.visible.array

webgl_buffergeometry_uint.html
设置法向量
geometry.setAttribute('position', positionAttribute);
geometry.setAttribute('normal', normalAttribute);
geometry.setAttribute('color', colorAttribute);

webgl_camera_array.html
THREE.ArrayCamera(cameras);

webgl_camera_cinematic.html

webgl_camera_logarithmicdepthbuffer.html
renderer logarithmicDepthBuffer z取对数

webgl_clipping_advanced.html
Material.clippingPlanes
Material.clipShadows
Material.clipIntersection 显示被切的与物体的交集

    **
    webgl_clipping_stencil.html
stencil操作

Material.stencilWrite : Boolean
Material.stencilWriteMask : Integer
Material.stencilFunc : Integer
Material.stencilRef : Integer
Material.stencilFuncMask : Integer
Material.stencilFail : Integer
Material.stencilZFail : Integer
Material.stencilZPass : Integer

webgl_custom_attributes_ *
    geometry.attributes

ShaderMaterial.uniforms

const material = new THREE.ShaderMaterial({

    uniforms: {
        color: { value: new THREE.Color(0xffffff) },
        pointTexture: { value: new THREE.TextureLoader().load('textures/sprites/spark1.png') }
    },
    vertexShader: document.getElementById('vertexshader').textContent,
    fragmentShader: document.getElementById('fragmentshader').textContent,

    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true

});

webgl_depth_texture.html
Framebuffer

webgl_framebuffer_texture.html
FramebufferTexture // This class can only be used in combination with WebGLRenderer.copyFramebufferToTexture().


// render scene into target
renderer.setRenderTarget(target);
renderer.render(scene, camera);

// render post FX
postMaterial.uniforms.tDiffuse.value = target.texture;
postMaterial.uniforms.tDepth.value = target.depthTexture;

renderer.setRenderTarget(null);
renderer.render(postScene, postCamera);

controls.update(); // required because damping is enabled

stats.update();


webgl_furnace_test.html
MeshPhysicalMaterial.envMap

const material = new THREE.MeshPhysicalMaterial({
    roughness: x / 10,
    metalness: y / 10,
    color: 0xffffff,
    envMap: radianceMap,
    envMapIntensity: 1,
    transmission: 0,
    ior: 1.5
});
function createEnvironment() {
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(COLOR);
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    radianceMap = pmremGenerator.fromScene(envScene).texture;
    pmremGenerator.dispose();
    scene.background = envScene.background;

}

webgl_geometries.html
各种THREE的geometries

webgl_geometries_parametric.html
ParametricGeometries
ParametricGeometry

webgl_geometry_colors_lookuptable.html
lut color


webgl_geometry_convex.html
ConvexGeometry

webgl_geometry_dynamic.html
水体
海面
起伏
webgl_gpgpu_water.html

webgl_geometry_shapes.html
webgl_geometry_extrude_shapes.html
挤出
const closedSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(- 60, - 100, 60),
    new THREE.Vector3(- 60, 20, 60),
    new THREE.Vector3(- 60, 120, 60),
    new THREE.Vector3(60, 20, - 60),
    new THREE.Vector3(60, - 100, - 60)
]);

const extrudeSettings1 = {
    steps: 100,
    bevelEnabled: false,
    extrudePath: closedSpline
};
const pts1 = [], count = 3;
for (let i = 0; i < count; i++) {
    const l = 20;
    const a = 2 * i / count * Math.PI;
    pts1.push(new THREE.Vector2(Math.cos(a) * l, Math.sin(a) * l));
}
const shape1 = new THREE.Shape(pts1);
const geometry1 = new THREE.ExtrudeGeometry(shape1, extrudeSettings1);
const material1 = new THREE.MeshLambertMaterial({ color: 0xb00000, wireframe: false });
const mesh1 = new THREE.Mesh(geometry1, material1);



THREE.MathUtils.randFloat

webgl_geometry_nurbs.html
NURBSCurve
NURBSSurface
ParametricGeometry

webgl_geometry_spline_editor.html
spline edit


webgl_geometry_teapot.html
texture
reflection
map
envMap


webgl_geometry_terrain.html
webgl_geometry_terrain_raycast.html
地形
随机地形
非camera的lookat
function generateHeight(width, height) {
    const size = width * height, data = new Uint8Array(size),
        perlin = new ImprovedNoise(), z = Math.random() * 100;

    let quality = 1;
    for (let j = 0; j < 4; j++) {
        for (let i = 0; i < size; i++) {
            const x = i % width, y = ~ ~(i / width);
            data[i] += Math.abs(perlin.noise(x / quality, y / quality, z) * quality * 1.75);
        }
        quality *= 5;
    }
    return data;
}

webgl_geometry_terrain.html
随机色背景

webgl_geometry_text_ **.html
文字

webgl_gpgpu_birds.html
webgl_gpgpu_birds_gltf.html
鸟群


计算着色器
webgl_gpgpu_ *.html
GPUComputationRenderer


webgl_helpers.html
GridHelper
PolarGridHelper

webgl_instancing_ *
    instance mesh


webgl_instancing_performance.html
instance 与 merge 性能对比（fps，显存，内存，cpu）
geometry merge

BufferGeometryUtils.mergeGeometries

webgl_instancing_raycast.html
instance mesh 的射线检测

const intersection = raycaster.intersectObject(mesh);
if (intersection.length > 0) {
    const instanceId = intersection[0].instanceId;
    mesh.getColorAt(instanceId, color);
    if (color.equals(white)) {
        mesh.setColorAt(instanceId, color.setHex(Math.random() * 0xffffff));
        mesh.instanceColor.needsUpdate = true;
    }
}

webgl_layers.html
图层
const layer = (i % 3);
const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: colors[layer] }));
object.layers.set(layer);

webgl_lensflares.html
FlyControls
太阳光效果
粒子效果
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js';
const textureFlare0 = textureLoader.load('textures/lensflare/lensflare0.png');
const textureFlare3 = textureLoader.load('textures/lensflare/lensflare3.png');

addLight(0.55, 0.9, 0.5, 5000, 0, - 1000);
addLight(0.08, 0.8, 0.5, 0, 0, - 1000);
addLight(0.995, 0.5, 0.9, 5000, 5000, - 1000);

function addLight(h, s, l, x, y, z) {
    const light = new THREE.PointLight(0xffffff, 1.5, 2000, 0);
    light.color.setHSL(h, s, l);
    light.position.set(x, y, z);
    scene.add(light);

    const lensflare = new Lensflare();
    lensflare.addElement(new LensflareElement(textureFlare0, 700, 0, light.color));
    lensflare.addElement(new LensflareElement(textureFlare3, 60, 0.6));
    lensflare.addElement(new LensflareElement(textureFlare3, 70, 0.7));
    lensflare.addElement(new LensflareElement(textureFlare3, 120, 0.9));
    lensflare.addElement(new LensflareElement(textureFlare3, 70, 1));
    light.add(lensflare);

}

webgl_lightprobe.html
webgl_lightprobe_cubecamera.html
反射效果
CubeCamera
import { LightProbeHelper } from 'three/addons/helpers/LightProbeHelper.js';
import { LightProbeGenerator } from 'three/addons/lights/LightProbeGenerator.js';
import { text } from 'stream/consumers';

webgl_lights_hemisphere.html
HemisphereLight
shader天空盒
const skyGeo = new THREE.SphereGeometry(4000, 32, 15);
const skyMat = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.BackSide
});
gltf动画
AnimationMixer
loader.load('models/gltf/Flamingo.glb', function (gltf) {
    const mesh = gltf.scene.children[0];
    const s = 0.35;
    mesh.scale.set(s, s, s);
    mesh.position.y = 15;
    mesh.rotation.y = - 1;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    const mixer = new THREE.AnimationMixer(mesh);
    mixer.clipAction(gltf.animations[0]).setDuration(1).play();
    mixers.push(mixer);
});

webgl_lights_physical.html
灯光效果

webgl_lights_rectarealight.html
RectAreaLightHelper
RectAreaLightUniformsLib

webgl_lights_spotlight.html
点光源
点光源设置map

spotLight = new THREE.SpotLight(0xffffff, 100);
spotLight.position.set(2.5, 5, 2.5);
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 1;
spotLight.decay = 2;
spotLight.distance = 0;
spotLight.map = textures['disturb.jpg'];


webgl_lights_spotlights.html
TWEEN
SpotLightHelper spotlight的外轮廓
function tween(light) {
    new TWEEN.Tween(light).to({
        angle: (Math.random() * 0.7) + 0.1,
        penumbra: Math.random() + 1
    }, Math.random() * 3000 + 2000)
        .easing(TWEEN.Easing.Quadratic.Out).start();

    new TWEEN.Tween(light.position).to({
        x: (Math.random() * 3) - 1.5,
        y: (Math.random() * 1) + 1.5,
        z: (Math.random() * 3) - 1.5
    }, Math.random() * 3000 + 2000)
        .easing(TWEEN.Easing.Quadratic.Out).start();
}

webgl_lines_ **.html

webgl_loader_fbx.html
fbx 动画
loader.load('models/fbx/Samba Dancing.fbx', function (object) {
    mixer = new THREE.AnimationMixer(object);
    const action = mixer.clipAction(object.animations[0]);
    action.play();
});
function animate() {
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    renderer.render(scene, camera);
}

webgl_loader_gltf_instancing.html
hdr loader
hdr天空盒
gltf instance
new RGBELoader()
    .setPath('textures/equirectangular/')
    .load('royal_esplanade_1k.hdr', function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture;
        scene.environment = texture;
        const loader = new GLTFLoader().setPath('models/gltf/DamagedHelmet/glTF-instancing/');
        loader.load('DamagedHelmetGpuInstancing.gltf', function (gltf) {
            scene.add(gltf.scene);
            render();
        });
    });

webgl_loader_gltf_iridescence.html
环境反射
scene.environment = texture;

webgl_loader_gltf_lights.html
环境反射
自发光

webgl_loader_gltf_sheen.html
renderer.toneMapping
renderer.toneMappingExposure
material.sheen
光泽

webgl_loader_gltf_transmission.html
renderer.setAnimationLoop

webgl_loader_gltf_variants.html
gltf variant 切换

webgl_loader_imagebitmap.html
ImageBitmapLoader

webgl_loader_ldraw.html
乐高
ldraw
building step
4dbim

webgl_loader_pcd.html
点云
PCDLoader
webgl_loader_pdb.html
    .pdb文件
Protein Data Bank

webgl_loader_stl.html
webgl_loader_ply.html
DirectionalLight.castShadow
DirectionalLight.shadow.camera
DirectionalLight.shadow.mapSize
射灯产生阴影选项
If set to true light will cast dynamic shadows.Warning: This is expensive and requires tweaking to get shadows looking right.



    webgl_loader_svg.html
svg loader


材质:
DDSLoader
webgl_loader_texture_dds.html


EXRLoader
webgl_loader_texture_exr.html
RGBELoader
webgl_loader_texture_hdr.html
材质曝光
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = params.exposure;

KTXLoader
webgl_loader_texture_ktx.html

KTX2Loader
webgl_loader_texture_ktx2.html
不同的材质压缩

LogLuvLoader
webgl_loader_texture_logluv.html


webgl_loader_texture_lottie.html
场景的环境贴图
scene.environment
Sets the environment map for all physical materials in the scene.However, it's not possible to overwrite an existing texture assigned to MeshStandardMaterial.envMap.
RoundedBoxGeometry
PMREMGenerator
预过滤的 Mipmapped 辐射环境贴图
Prefiltered, Mipmapped Radiance Environment Map(PMREM)
const environment = new RoomEnvironment(renderer);
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(environment).texture;
Lottie 是一个应用十分广泛动画库，适用于Android、iOS、Web、ReactNative、Windows的库，它解析了用Bodymovin导出为json的Adobe After Effects动画，并在移动和网络上进行了原生渲染。其和 GSAP 这类专注动画曲线、插值等js动画库不同，它本质上是一套跨平台的平面动画解决方案。其提供了一套完整得从AE到各个终端的工具流，通过AE的插件将设计师做的动画导出成一套定义好的json文件，之后再通过渲染器进行渲染，它提供了“SVG”、“Canvas”和“HTML”三种渲染模式，最常用的是第一种和第二种。


webgl_loader_texture_pvrtc.html
pvr
webgl_loader_texture_rgbm.html
rgbm
webgl_loader_texture_rgbm.html
tga
webgl_loader_texture_tiff.html
tiff

webgl_loader_ttf.html
text

webgl_loader_vox.html
VOXLoader, VOXMesh

webgl_lod.html
LOD

webgl_marchingcubes.html
ToonShader
ToonShader1, ToonShader2, ToonShaderHatching, ToonShaderDotted
各种 Material
material.envMap
material.metalness
material.roughness
material.shininess
MarchingCubes
水滴效果

webgl_materials_alphahash.html
composer
pass
TAARenderPass
IcosahedronGeometry
material.alphaHash
Enables alpha hashed transparency, an alternative to.transparent or.alphaTest.The material will not be rendered if opacity is lower than a random threshold.


    webgl_materials_blending_custom.html
material.blending
material.blendSrc
material.blendDst
material.blendEquation

webgl_materials_bumpmap.html
material.bumpMap


webgl_materials_car.html
RGBELoader
scene.environment
scene.environment = new RGBELoader().load('textures/equirectangular/venice_sunset_1k.hdr');
OrbitControls
controls.maxDistance


webgl_materials_channels.html
VelocityShader
material.aoMap,
    material.normalMap,
    material.displacementMap,
    displacementScale: SCALE,
        displacementBias: BIAS,
            MeshDepthMaterial


VelocityShader

webgl_materials_cubemap_dynamic.html
material.envMap
material.roughness
material.metalness
texture.mapping = THREE.EquirectangularReflectionMapping;
scene.background = texture;
scene.environment = texture; // Sets the environment map for all physical materials in the scene.


webgl_materials_cubemap_mipmaps.html
CubeTextureLoader
customizedCubeTexture.mipmaps = mipmaps; // Array of user-specified mipmaps (optional).
for (let level = 0; level <= maxLevel; ++level) {
    const urls = [];
    for (let face = 0; face < 6; ++face) {
        urls.push(path + 'cube_m0' + level + '_c0' + face + format);
    }
    const mipmapLevel = level;
    pendings.push(loadCubeTexture(urls).then(function (cubeTexture) {
        mipmaps[mipmapLevel] = cubeTexture;
    }));
}

// mipmap 与纹理过滤
// https://blog.csdn.net/qq_42428486/article/details/118856697

1.最近过滤，选最近的像素
2.线性过滤 计算一个插值
// mipmap  多级渐远纹理
越远的物体纹理分辨率越低，过滤更准确

webgl_materials_cubemap_refraction.html
geometry.computeVertexNormals();
// Computes vertex normals for the given vertex data.For indexed geometries, the method sets each vertex normal to be the average of the face normals of the faces that share that vertex.
// For non - indexed geometries, vertices are not shared, and the method sets each vertex normal to be the same as the face normal.
texture.mapping // How the image is applied to the object. 
textureCube.mapping = THREE.CubeRefractionMapping;
// CubeReflectionMapping and CubeRefractionMapping are for use with a CubeTexture, which is made up of six textures, one for each face of the cube
// CubeReflectionMapping is the default for a CubeTexture.
// Mapping Modes
// THREE.UVMapping
// THREE.CubeReflectionMapping 
// THREE.CubeRefractionMapping
// THREE.EquirectangularReflectionMapping
// THREE.EquirectangularRefractionMapping 
// THREE.CubeUVReflectionMapping


webgl_materials_cubemap_render_to_mipmaps.html
WebGLCubeRenderTarget
着色器里配置mipmap
// 生成mipmap
const mesh = new THREE.Mesh(geometry, material);
const cubeCamera = new THREE.CubeCamera(1, 10, cubeMapRenderTarget);
const mipmapCount = Math.floor(Math.log2(Math.max(cubeMapRenderTarget.width, cubeMapRenderTarget.height)));
for (let mipmap = 0; mipmap < mipmapCount; mipmap++) {
    material.uniforms.mipIndex.value = mipmap;
    material.needsUpdate = true;
    cubeMapRenderTarget.viewport.set(0, 0, cubeMapRenderTarget.width >> mipmap, cubeMapRenderTarget.height >> mipmap);
    cubeCamera.activeMipmapLevel = mipmap;
    cubeCamera.update(renderer, mesh);
}
fragmentShader: /* glsl */ `
    uniform samplerCube cubeTexture;
    varying vec3 vWorldDirection;
    uniform float mipIndex;
    #include <common>
    void main() {
        vec3 cubeCoordinates = normalize(vWorldDirection);
        // Colorize mip levels
        vec4 color = vec4(1.0, 0.0, 0.0, 1.0);
        if (mipIndex == 0.0) color.rgb = vec3(1.0, 1.0, 1.0);
        else if (mipIndex == 1.0) color.rgb = vec3(0.0, 0.0, 1.0);
        else if (mipIndex == 2.0) color.rgb = vec3(0.0, 1.0, 1.0);
        else if (mipIndex == 3.0) color.rgb = vec3(0.0, 1.0, 0.0);
        else if (mipIndex == 4.0) color.rgb = vec3(1.0, 1.0, 0.0);
        gl_FragColor = textureCube(cubeTexture, cubeCoordinates, 0.0) * color;
    }
`
const material = new THREE.ShaderMaterial({
    name: 'FilterCubemap',
    uniforms: THREE.UniformsUtils.clone(CubemapFilterShader.uniforms),
    vertexShader: CubemapFilterShader.vertexShader,
    fragmentShader: CubemapFilterShader.fragmentShader,
    side: THREE.BackSide,
    blending: THREE.NoBlending,
});

material.uniforms.cubeTexture.value = sourceCubeTexture;

// 根据mipmap和当前的环境进行渲染
const mesh = new THREE.Mesh(geometry, material);
const cubeCamera = new THREE.CubeCamera(1, 10, cubeMapRenderTarget);
const mipmapCount = Math.floor(Math.log2(Math.max(cubeMapRenderTarget.width, cubeMapRenderTarget.height)));

for (let mipmap = 0; mipmap < mipmapCount; mipmap++) {
    material.uniforms.mipIndex.value = mipmap;
    material.needsUpdate = true;
    cubeMapRenderTarget.viewport.set(0, 0, cubeMapRenderTarget.width >> mipmap, cubeMapRenderTarget.height >> mipmap);
    cubeCamera.activeMipmapLevel = mipmap;
    cubeCamera.update(renderer, mesh);
}

webgl_materials_cubemap.html
CubeTextureLoader
CubeRefractionMapping
MeshLambertMaterial.combine // How to combine the result of the surface's color with the environment map, if any.
MeshLambertMaterial.reflectivity

webgl_materials_curvature.html
curvature  曲率
concave 凹
convex 凸
根据曲率 凹面着色 凸面着色 等高线 heatmap

geometry.attributes.normal //法向量

//filter the curvature array to only show concave values
function filterConcave(curvature) {

    for (let i = 0; i < curvature.length; i++) {

        curvature[i] = Math.abs(clamp(curvature[i], - 1, 0));

    }

}
//filter the curvature array to only show convex values
function filterConvex(curvature) {

    for (let i = 0; i < curvature.length; i++) {

        curvature[i] = clamp(curvature[i], 0, 1);

    }

}
<script id="vertexShaderRaw" type="x-shader/x-vertex">

attribute float curvature;

varying float vCurvature;

void main() {

    vec3 p = position;
    vec4 modelViewPosition = modelViewMatrix * vec4( p , 1.0 );
    gl_Position = projectionMatrix * modelViewPosition;
    vCurvature = curvature;

}

</script>

<script id="fragmentShaderRaw" type="x-shader/x-fragment">

varying vec3 vViewPosition;
varying float vCurvature;

void main() {
        gl_FragColor = vec4( vCurvature * 2.0, 0.0, 0.0, 1.0 );
}

</script>

webgl_materials_displacementmap.html
材质参数
material.displacementMap
// (置换贴图,也叫移位贴图)可以改变模型对象的几何形状,因此在提供最真实的效果的同时也会大幅增加渲染性能的开销。
// The displacement map affects the position of the mesh's vertices. 
// Unlike other maps which only affect the light and shade of the material the displaced vertices can cast shadows, block other objects, and otherwise act as real geometry. The displacement texture is an image where the value of each pixel (white being the highest) is mapped against, and repositions, the vertices of the mesh.


webgl_materials_envmaps_exr.html
EXRLoader
EXR视差贴图模型
PMREMGenerator
EquirectangularReflectionMapping
texture.mapping = THREE.EquirectangularReflectionMapping;
new EXRLoader().load('textures/piz_compressed.exr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
    exrBackground = texture;
});

new THREE.TextureLoader().load('textures/equirectangular.png', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    pngCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
    pngBackground = texture;
});
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();
// This class generates a Prefiltered, Mipmapped Radiance Environment Map (PMREM) from a cubeMap environment texture. 
// This allows different levels of blur to be quickly accessed based on material roughness. 
// Unlike a traditional mipmap chain, it only goes down to the LOD_MIN level (above), and then creates extra even more filtered 'mips' at the same LOD_MIN resolution, associated with higher roughness levels. In this way we maintain resolution

webgl_materials_envmaps_groundprojected.html
GroundProjectedSkybox
天空盒和地形混合体

webgl_materials_envmaps_hdr.html
HDRCubeTextureLoader
HDR envmap
LDR envmap
RGBM envmap
HDR high dynamic Range
RGBMLoader
PMREMGenerator
DebugEnvironment

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileCubemapShader();

const hdrUrls = ['px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr'];
hdrCubeMap = new HDRCubeTextureLoader()
    .setPath('./textures/cube/pisaHDR/')
    .load(hdrUrls, function () {
        hdrCubeRenderTarget = pmremGenerator.fromCubemap(hdrCubeMap);
        hdrCubeMap.magFilter = THREE.LinearFilter;
        hdrCubeMap.needsUpdate = true;
    });

const ldrUrls = ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'];
ldrCubeMap = new THREE.CubeTextureLoader()
    .setPath('./textures/cube/pisa/')
    .load(ldrUrls, function () {
        ldrCubeRenderTarget = pmremGenerator.fromCubemap(ldrCubeMap);
    });


const rgbmUrls = ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'];
rgbmCubeMap = new RGBMLoader().setMaxRange(16)
    .setPath('./textures/cube/pisaRGBM16/')
    .loadCubemap(rgbmUrls, function () {
        rgbmCubeRenderTarget = pmremGenerator.fromCubemap(rgbmCubeMap);
    });

const envScene = new DebugEnvironment();
generatedCubeRenderTarget = pmremGenerator.fromScene(envScene);

switch (params.envMap) {
    case 'Generated':
        renderTarget = generatedCubeRenderTarget; // debug env
        cubeMap = generatedCubeRenderTarget.texture;
        break;
    case 'LDR':
        renderTarget = ldrCubeRenderTarget;
        cubeMap = ldrCubeMap;
        break;
    case 'HDR':
        renderTarget = hdrCubeRenderTarget;
        cubeMap = hdrCubeMap;
        break;
    case 'RGBM16':
        renderTarget = rgbmCubeRenderTarget;
        cubeMap = rgbmCubeMap;
        break;
}

const newEnvMap = renderTarget ? renderTarget.texture : null;
if (newEnvMap && newEnvMap !== torusMesh.material.envMap) {
    torusMesh.material.envMap = newEnvMap;
    torusMesh.material.needsUpdate = true;
    planeMesh.material.map = newEnvMap;
    planeMesh.material.needsUpdate = true;
}
torusMesh.rotation.y += 0.005;
planeMesh.visible = params.debug;
scene.background = cubeMap;
renderer.toneMappingExposure = params.exposure;
renderer.render(scene, camera);
planeMesh.material.map = newEnvMap; // 打印envMap

webgl_materials_envmaps.html
THREE.EquirectangularRefractionMapping;
THREE.EquirectangularReflectionMapping;
THREE.CubeRefractionMapping;
THREE.CubeReflectionMapping;
if (value) {
    textureEquirec.mapping = THREE.EquirectangularRefractionMapping;
    textureCube.mapping = THREE.CubeRefractionMapping;
} else {
    textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
    textureCube.mapping = THREE.CubeReflectionMapping;
}

webgl_materials_lightmap.html

package: three / nodes
import { MeshBasicNodeMaterial, vec4, color, positionLocal, mix } from 'three/nodes';
MeshBasicNodeMaterial
其中天空盒顶部颜色是灯光的颜色

// LIGHTS
const light = new THREE.DirectionalLight(0xd5deff);
light.position.x = 300;
light.position.y = 250;
light.position.z = - 500;
scene.add(light);
// SKYDOME
const topColor = new THREE.Color().copy(light.color); // 其中天空盒顶部颜色是灯光的颜色
const bottomColor = new THREE.Color(0xffffff);
const offset = 400;
const exponent = 0.6;
const h = positionLocal.add(offset).normalize().y;
const skyMat = new MeshBasicNodeMaterial();
skyMat.colorNode = vec4(mix(color(bottomColor), color(topColor), h.max(0.0).pow(exponent)), 1.0);
skyMat.side = THREE.BackSide;
const sky = new THREE.Mesh(new THREE.SphereGeometry(4000, 32, 15), skyMat);
scene.add(sky);

webgl_materials_matcap.html
MeshMatcapMaterial
MeshMatcapMaterial.matcap
MeshMatcapMaterial.normalmap

MatCap是Material Capture的缩写，意为“材质捕获”； 
Matcap Shader是一种在某些层面能替代甚至超越PBR的次时代渲染方案；
它的效率极高、计算成本极低，显示效果极佳，却能完美运行于不同的移动平台，并兼容AR、VR设备，所以极具研究与实用价值；
用一张MatCap贴图作为渲染好的漫反射贴图
用物体表面的法线对该贴图进行采样

webgl_materials_modified.html
动态改变shader vNormal 法向量？
vNormal


webgl_materials_normalmap_object_space.html
material.normalMapType
THREE.ObjectSpaceNormalMap;
// Defines the type of the normal map.
// For TangentSpaceNormalMap, the information is relative to the underlying surface.
// For ObjectSpaceNormalMap, the information is relative to the object orientation.Default is TangentSpaceNormalMap.

法线纹理与凹凸映射
纹理另一种常见的应用就是凹凸映射（bump mapping）。凹凸映射的目的是使用一张纹理来修改模型表面的法线，以便为模型提供更多的细节。这种方法不会真的改变模型的顶点位置，只是让模型看起来好像是“凹凸不平”的，但可以从模型的轮廓处看出“破绽”。
有两种主要的方法可以用来进行凹凸映射：一种方法是使用一张高度纹理（height map）来模拟表面位移（displacement），然后得到一个修改后的法线值，这种方法也被称为高度映射（height mapping）；另一种方法则是使用一张法线纹理（normal map）来直接存储表面法线，这种方法又被称为法线映射（normal mapping）。尽管我们常常将凹凸映射和法线映射当成是相同的技术，但读者需要知道它们之间的不同。


什么是切线空间？
Tangent Space，其实是一个坐标系，也就是原点 + 三个坐标轴决定的一个相对空间，我们只要搞清楚原点和三个坐标轴是什么就可以了。在Tangent Space中，坐标原点就是顶点的位置，其中z轴是该顶点本身的法线方向（N）。另外两个坐标轴就是和该点相切的两条切线。这样的切线本来有无数条，但模型一般会给定该顶点的一个tangent，这个tangent方向一般是使用和纹理坐标方向相同的那条tangent（T）。而另一个坐标轴的方向（B）就可以通过normal和tangent的叉乘得到。

为什么要有切线空间
Tangent - Space还有如下一些优点：
自由度很高。Tangent - Space Normal Map记录的是相对法线信息，这意味着，即便把该纹理应用到一个完全不同的网格上，也可以得到一个合理的结果。
可进行UV动画。比如，我们可以移动一个纹理的UV坐标来实现一个凹凸移动的效果，这种UV动画在水或者火山熔岩这种类型的物体会会用到。
可以重用Normal Map。比如，一个砖块，我们可以仅使用一张Normal Map就可以用到所有的六个面上。
可压缩。由于Tangent - Space Normal Map中法线的Z方向总是正方向的，因此我们可以仅存储XY方向，而推导得到Z方向。

为什么法线贴图大部分区域都是蓝色的？
因为法线在切线空间就是切线空间的z轴，保存到贴图的纹素中就是(0, 0, 1)，这个值对应的就是蓝色。
因为在导出的时候我们可能需要将模型几个顶点的法线合并到一个纹素中，这个合并是通过插值运算出来的，所以大部分都是蓝色（几个顶点的法线相同，比如一个平面内就是相同的），少部分会有颜色变化。

5.总体来说，使用模型空间存储法线的优点如下：
（1）实现简单，更加直观。我们甚至不需要模型原始的法线和切线等信息，也就是说，计算更少。生成它也非常简单，而如果要生成切线空间下的法线纹理，由于模型的切线一般和UV方向相同，因此想要得到比较好的法线映射就要求纹理映射也是连续的。
（2）在纹理坐标的缝合处和尖锐的边角部分，可见的突变（缝隙）较少，即可以提供平滑的边界。这是因为模型空间下的法线纹理存储的是同一坐标系下的法线信息，因此在边界处通过插值得到的法线可以平滑变换。而切线空间下的法线纹理中的法线信息是依靠纹理坐标的方向得到的结果，可能会在边缘处或尖锐的部分造成更多可见的缝合迹象。

但使用切线空间有更多优点：
（1）自由度很高。模型空间下的法线纹理记录的是绝对法线信息，即可用于创建它时的那个模型，而应用到其它模型上的效果就完全错误了。而切线空间下的法线纹理记录的是相对法线信息，这意味着，即便把该纹理应用到一个完全不同的网格上，也可以得到一个合理的结果。
（2）可进行UV动画。比如，我们可以移动一个纹理的UV坐标来实现一个凹凸移动的效果，但使用模型空间下的法线纹理会得到完全错误的结果。原因同上。这种UV动画在水或火山熔岩这种类型的物体上会经常用到。
（3）可以重用法线纹理。比如一个砖块，我们仅使用一张法线纹理就可以用到所有的六个面上，原因同上。
（4）可压缩，由于切线空间下的法线纹理中的法线z方向总是正方向，因此我们可以仅存储XY方向，从而推导得到Z方向。而模型空间下的法线纹理由于每个方向都是可能的，因此必须存储3个方向的值，不可压缩。参考Shader小常识之——法线纹理在切线空间下的存储，假设法线向量为(x, y, z)，它可以由(x, y, 0)和(0, 0, z)两条边组成，既然法线向量是一条单位向量，这两条边构成的三角形又是直角三角形，那么其实只要知道一条边长，就可以用勾股定理计算出另一条边长。实际上法线纹理只存储了xy信息，对应shader代码：

webgl_materials_normalmap.html
MeshNormalMaterial
FXAA
RenderPass

const renderModel = new RenderPass(scene, camera);
const effectBleach = new ShaderPass(BleachBypassShader);
const effectColor = new ShaderPass(ColorCorrectionShader);
const outputPass = new OutputPass();
effectFXAA = new ShaderPass(FXAAShader)

material.map // diffuseMap 漫反射贴图 用作模型的漫反射颜色，
material.specularMap // 高光贴图 specular map 用来表现物体对光照反应的材质。当光照到塑料，布料，金属上时，所展现出来的高光部分和高光表现是不一样的。通过高光贴图上的颜色值来表现高光的强度，值越大表示高光反射越强。
material.normalMap // 法线贴图 保存模型各个顶点切线空间下的法线
material.normalScale // How much the normal map affects the material. Typical ranges are 0-1. Default is a Vector2 set to (1,1).

webgl_materials_physical_clearcoat.html
ClearCoat透明涂层

MeshPhysicalMaterial
MeshPhysicalMaterial.clearcoat
MeshPhysicalMaterial.clearcoatRoughness
MeshPhysicalMaterial.metalness
MeshPhysicalMaterial.roughness
MeshPhysicalMaterial.normalMap
MeshPhysicalMaterial.normalScale


THREE.MathUtils
BufferGeometryUtils
ImprovedNoise
BufferGeometryUtils.mergeGeometries
RoundedBoxGeometry
PMREMGenerator
// 射线检测：如何获取交点
intersectTriangle(a, b, c, backfaceCulling, target)



    ??
    webgl_geometry_csg.html