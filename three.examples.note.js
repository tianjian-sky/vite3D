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
    Frustum, Material, ShaderMaterial,
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