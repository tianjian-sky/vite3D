/**
 * three.js 渲染一帧流程
 */


if (scene.matrixWorldAutoUpdate === true) scene.updateMatrixWorld();
if (camera.parent === null && camera.matrixWorldAutoUpdate === true) camera.updateMatrixWorld();
_projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
currentRenderState = renderStates.get(scene, renderStateStack.length);
currentRenderState.init();

_projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
_frustum.setFromProjectionMatrix(_projScreenMatrix); // 16

currentRenderList.init(); // renderlist 下标回0

/**
 *
 * 1. const geometry = objects.update(object）
 * 2. computeBoundingSphere 第一次计算1次
 * 3.   _vector3.applyMatrix4(object.matrixWorld).applyMatrix4(_projScreenMatrix);
 * 
 * */
projectObject(object, camera, groupOrder, sortObjects); // n

if (_this.sortObjects === true) {
    currentRenderList.sort(_opaqueSort, _transparentSort);
}
shadowMap.render(shadowsArray, scene, camera);
background.render(currentRenderList, scene);  // n

/**
 * 1. renderObjects( opaqueObjects, scene, camera )
 * 2. renderObjects( transmissiveObjects, scene, camera )
 * 3. renderObjects( transparentObjects, scene, camera )
 */
renderScene(currentRenderList, scene, camera);  // n

if (_currentRenderTarget !== null) {
    // resolve multisample renderbuffers to a single-sample texture if necessary
    textures.updateMultisampleRenderTarget(_currentRenderTarget);
    // Generate mipmap if we're using any kind of mipmap filtering
    textures.updateRenderTargetMipmap(_currentRenderTarget);
}

/**
 * 
 * renderObject( object, scene, camera, geometry, material, group ) // n * [矩阵乘法 + 法线矩阵 + setPrograme + setMaterial + bindingStates.setup + renderer.render | renderer.renderInstances]
 * 
 *  1.object.modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );
    2.object.normalMatrix.getNormalMatrix( object.modelViewMatrix );
    3._this.renderBufferDirect( camera, scene, geometry, material, object, group );
 * 
 */

/**
 *  function renderBufferDirect ( camera, scene, geometry, material, object, group )
 *  1. const program = setProgram( camera, scene, geometry, material, object );
 *  2. state.setMaterial( material, frontFaceCW );
 *  3. bindingStates.setup(object, material, program, geometry, index);
 *  4. renderer.renderInstances(drawStart, drawCount, instanceCount)
 *          gl.drawElements
 *      或者
 *      renderer.render(drawStart, drawCount);
 *           gl.drawArrays
 */

function renderScene(currentRenderList, scene, camera, viewport) {

    const opaqueObjects = currentRenderList.opaque;
    const transmissiveObjects = currentRenderList.transmissive;
    const transparentObjects = currentRenderList.transparent;

    currentRenderState.setupLightsView(camera);

    if (_clippingEnabled === true) clipping.setGlobalState(_this.clippingPlanes, camera);

    if (transmissiveObjects.length > 0) renderTransmissionPass(opaqueObjects, transmissiveObjects, scene, camera);

    if (viewport) state.viewport(_currentViewport.copy(viewport));

    if (opaqueObjects.length > 0) renderObjects(opaqueObjects, scene, camera);
    if (transmissiveObjects.length > 0) renderObjects(transmissiveObjects, scene, camera);
    if (transparentObjects.length > 0) renderObjects(transparentObjects, scene, camera);

    // Ensure depth buffer writing is enabled so it can be cleared on next render

    state.buffers.depth.setTest(true);
    state.buffers.depth.setMask(true);
    state.buffers.color.setMask(true);

    state.setPolygonOffset(false);

}
function renderObjects(renderList, scene, camera) {

    const overrideMaterial = scene.isScene === true ? scene.overrideMaterial : null;

    for (let i = 0, l = renderList.length; i < l; i++) {

        const renderItem = renderList[i];

        const object = renderItem.object;
        const geometry = renderItem.geometry;
        const material = overrideMaterial === null ? renderItem.material : overrideMaterial;
        const group = renderItem.group;

        if (object.layers.test(camera.layers)) {

            renderObject(object, scene, camera, geometry, material, group);

        }

    }
}

function renderObject(object, scene, camera, geometry, material, group) {

    object.onBeforeRender(_this, scene, camera, geometry, material, group);

    object.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, object.matrixWorld);
    object.normalMatrix.getNormalMatrix(object.modelViewMatrix);

    material.onBeforeRender(_this, scene, camera, geometry, object, group);

    if (material.transparent === true && material.side === DoubleSide && material.forceSinglePass === false) {

        material.side = BackSide;
        material.needsUpdate = true;
        _this.renderBufferDirect(camera, scene, geometry, material, object, group);

        material.side = FrontSide;
        material.needsUpdate = true;
        _this.renderBufferDirect(camera, scene, geometry, material, object, group);

        material.side = DoubleSide;

    } else {

        _this.renderBufferDirect(camera, scene, geometry, material, object, group);

    }

    object.onAfterRender(_this, scene, camera, geometry, material, group);

}

this.renderBufferDirect = function (camera, scene, geometry, material, object, group) {

    if (scene === null) scene = _emptyScene; // renderBufferDirect second parameter used to be fog (could be null)

    const frontFaceCW = (object.isMesh && object.matrixWorld.determinant() < 0);

    const program = setProgram(camera, scene, geometry, material, object);

    state.setMaterial(material, frontFaceCW);

    //

    let index = geometry.index;
    let rangeFactor = 1;

    if (material.wireframe === true) {

        index = geometries.getWireframeAttribute(geometry);

        if (index === undefined) return;

        rangeFactor = 2;

    }

    //

    const drawRange = geometry.drawRange;
    const position = geometry.attributes.position;

    let drawStart = drawRange.start * rangeFactor;
    let drawEnd = (drawRange.start + drawRange.count) * rangeFactor;

    if (group !== null) {

        drawStart = Math.max(drawStart, group.start * rangeFactor);
        drawEnd = Math.min(drawEnd, (group.start + group.count) * rangeFactor);

    }

    if (index !== null) {

        drawStart = Math.max(drawStart, 0);
        drawEnd = Math.min(drawEnd, index.count);

    } else if (position !== undefined && position !== null) {

        drawStart = Math.max(drawStart, 0);
        drawEnd = Math.min(drawEnd, position.count);

    }

    const drawCount = drawEnd - drawStart;

    if (drawCount < 0 || drawCount === Infinity) return;

    //

    bindingStates.setup(object, material, program, geometry, index);

    let attribute;
    let renderer = bufferRenderer;

    if (index !== null) {

        attribute = attributes.get(index);

        renderer = indexedBufferRenderer;
        renderer.setIndex(attribute);

    }

    //

    if (object.isMesh) {

        if (material.wireframe === true) {

            state.setLineWidth(material.wireframeLinewidth * getTargetPixelRatio());
            renderer.setMode(_gl.LINES);

        } else {

            renderer.setMode(_gl.TRIANGLES);

        }

    } else if (object.isLine) {

        let lineWidth = material.linewidth;

        if (lineWidth === undefined) lineWidth = 1; // Not using Line*Material

        state.setLineWidth(lineWidth * getTargetPixelRatio());

        if (object.isLineSegments) {

            renderer.setMode(_gl.LINES);

        } else if (object.isLineLoop) {

            renderer.setMode(_gl.LINE_LOOP);

        } else {

            renderer.setMode(_gl.LINE_STRIP);

        }

    } else if (object.isPoints) {

        renderer.setMode(_gl.POINTS);

    } else if (object.isSprite) {

        renderer.setMode(_gl.TRIANGLES);

    }

    if (object.isBatchedMesh) {

        renderer.renderMultiDraw(object._multiDrawStarts, object._multiDrawCounts, object._multiDrawCount);

    } else if (object.isInstancedMesh) {

        renderer.renderInstances(drawStart, drawCount, object.count);

    } else if (geometry.isInstancedBufferGeometry) {

        const maxInstanceCount = geometry._maxInstanceCount !== undefined ? geometry._maxInstanceCount : Infinity;
        const instanceCount = Math.min(geometry.instanceCount, maxInstanceCount);

        renderer.renderInstances(drawStart, drawCount, instanceCount);

    } else {

        renderer.render(drawStart, drawCount);

    }

};


/**
 * =================
 */
info = new WebGLInfo(_gl);
objects = new WebGLObjects(_gl, geometries, attributes, info);
renderState = new WebGLRenderState(extensions, capabilities)
currentRenderList = new WebGLRenderList();
bufferRenderer = new WebGLBufferRenderer(_gl, extensions, info, capabilities);
indexedBufferRenderer = new WebGLIndexedBufferRenderer(_gl, extensions, info, capabilities);


function WebGLObjects(gl, geometries, attributes, info) {

    let updateMap = new WeakMap();

    function update(object) {

        const frame = info.render.frame;

        const geometry = object.geometry;
        const buffergeometry = geometries.get(object, geometry);

        // Update once per frame

        if (updateMap.get(buffergeometry) !== frame) {

            geometries.update(buffergeometry);

            updateMap.set(buffergeometry, frame);

        }

        if (object.isInstancedMesh) {

            if (object.hasEventListener('dispose', onInstancedMeshDispose) === false) {

                object.addEventListener('dispose', onInstancedMeshDispose);

            }

            if (updateMap.get(object) !== frame) {

                attributes.update(object.instanceMatrix, gl.ARRAY_BUFFER);

                if (object.instanceColor !== null) {

                    attributes.update(object.instanceColor, gl.ARRAY_BUFFER);

                }

                updateMap.set(object, frame);

            }

        }

        if (object.isSkinnedMesh) {

            const skeleton = object.skeleton;

            if (updateMap.get(skeleton) !== frame) {

                skeleton.update();

                updateMap.set(skeleton, frame);

            }

        }

        return buffergeometry;

    }

    function dispose() {

        updateMap = new WeakMap();

    }

    function onInstancedMeshDispose(event) {

        const instancedMesh = event.target;

        instancedMesh.removeEventListener('dispose', onInstancedMeshDispose);

        attributes.remove(instancedMesh.instanceMatrix);

        if (instancedMesh.instanceColor !== null) attributes.remove(instancedMesh.instanceColor);

    }

    return {

        update: update,
        dispose: dispose

    };

}


function WebGLRenderState(extensions, capabilities) {

    const lights = new WebGLLights(extensions, capabilities);

    const lightsArray = [];
    const shadowsArray = [];

    function init() {

        lightsArray.length = 0;
        shadowsArray.length = 0;

    }

    function pushLight(light) {

        lightsArray.push(light);

    }

    function pushShadow(shadowLight) {

        shadowsArray.push(shadowLight);

    }

    function setupLights(useLegacyLights) {

        lights.setup(lightsArray, useLegacyLights);

    }

    function setupLightsView(camera) {

        lights.setupView(lightsArray, camera);

    }

    const state = {
        lightsArray: lightsArray,
        shadowsArray: shadowsArray,

        lights: lights
    };

    return {
        init: init,
        state: state,
        setupLights: setupLights,
        setupLightsView: setupLightsView,

        pushLight: pushLight,
        pushShadow: pushShadow
    };

}

function WebGLRenderList() {

    const renderItems = [];
    let renderItemsIndex = 0;

    const opaque = [];
    const transmissive = [];
    const transparent = [];

    function init() {

        renderItemsIndex = 0;

        opaque.length = 0;
        transmissive.length = 0;
        transparent.length = 0;

    }

    function getNextRenderItem(object, geometry, material, groupOrder, z, group) {

        let renderItem = renderItems[renderItemsIndex];

        if (renderItem === undefined) {

            renderItem = {
                id: object.id,
                object: object,
                geometry: geometry,
                material: material,
                groupOrder: groupOrder,
                renderOrder: object.renderOrder,
                z: z,
                group: group
            };

            renderItems[renderItemsIndex] = renderItem;

        } else {

            renderItem.id = object.id;
            renderItem.object = object;
            renderItem.geometry = geometry;
            renderItem.material = material;
            renderItem.groupOrder = groupOrder;
            renderItem.renderOrder = object.renderOrder;
            renderItem.z = z;
            renderItem.group = group;

        }

        renderItemsIndex++;

        return renderItem;

    }

    function push(object, geometry, material, groupOrder, z, group) {

        const renderItem = getNextRenderItem(object, geometry, material, groupOrder, z, group);

        if (material.transmission > 0.0) {

            transmissive.push(renderItem);

        } else if (material.transparent === true) {

            transparent.push(renderItem);

        } else {

            opaque.push(renderItem);

        }

    }

    function unshift(object, geometry, material, groupOrder, z, group) {

        const renderItem = getNextRenderItem(object, geometry, material, groupOrder, z, group);

        if (material.transmission > 0.0) {

            transmissive.unshift(renderItem);

        } else if (material.transparent === true) {

            transparent.unshift(renderItem);

        } else {

            opaque.unshift(renderItem);

        }

    }

    function sort(customOpaqueSort, customTransparentSort) {

        if (opaque.length > 1) opaque.sort(customOpaqueSort || painterSortStable);
        if (transmissive.length > 1) transmissive.sort(customTransparentSort || reversePainterSortStable);
        if (transparent.length > 1) transparent.sort(customTransparentSort || reversePainterSortStable);

    }

    function finish() {

        // Clear references from inactive renderItems in the list

        for (let i = renderItemsIndex, il = renderItems.length; i < il; i++) {

            const renderItem = renderItems[i];

            if (renderItem.id === null) break;

            renderItem.id = null;
            renderItem.object = null;
            renderItem.geometry = null;
            renderItem.material = null;
            renderItem.group = null;

        }

    }

    return {

        opaque: opaque,
        transmissive: transmissive,
        transparent: transparent,

        init: init,
        push: push,
        unshift: unshift,
        finish: finish,

        sort: sort
    };

}


function projectObject(object, camera, groupOrder, sortObjects) {

    if (object.visible === false) return;

    const visible = object.layers.test(camera.layers);

    if (visible) {

        if (object.isGroup) {

            groupOrder = object.renderOrder;

        } else if (object.isLOD) {

            if (object.autoUpdate === true) object.update(camera);

        } else if (object.isLight) {

            currentRenderState.pushLight(object);

            if (object.castShadow) {

                currentRenderState.pushShadow(object);

            }

        } else if (object.isSprite) {

            if (!object.frustumCulled || _frustum.intersectsSprite(object)) {

                if (sortObjects) {

                    _vector3.setFromMatrixPosition(object.matrixWorld)
                        .applyMatrix4(_projScreenMatrix);

                }

                const geometry = objects.update(object);
                const material = object.material;

                if (material.visible) {

                    currentRenderList.push(object, geometry, material, groupOrder, _vector3.z, null);

                }

            }

        } else if (object.isMesh || object.isLine || object.isPoints) {

            if (!object.frustumCulled || _frustum.intersectsObject(object)) {

                const geometry = objects.update(object);
                const material = object.material;

                if (sortObjects) {

                    if (object.boundingSphere !== undefined) {

                        if (object.boundingSphere === null) object.computeBoundingSphere();
                        _vector3.copy(object.boundingSphere.center);

                    } else {

                        if (geometry.boundingSphere === null) geometry.computeBoundingSphere();
                        _vector3.copy(geometry.boundingSphere.center);

                    }

                    _vector3
                        .applyMatrix4(object.matrixWorld)
                        .applyMatrix4(_projScreenMatrix);

                }

                if (Array.isArray(material)) {

                    const groups = geometry.groups;

                    for (let i = 0, l = groups.length; i < l; i++) {

                        const group = groups[i];
                        const groupMaterial = material[group.materialIndex];

                        if (groupMaterial && groupMaterial.visible) {

                            currentRenderList.push(object, geometry, groupMaterial, groupOrder, _vector3.z, group);

                        }

                    }

                } else if (material.visible) {

                    currentRenderList.push(object, geometry, material, groupOrder, _vector3.z, null);

                }

            }

        }

    }

    const children = object.children;

    for (let i = 0, l = children.length; i < l; i++) {

        projectObject(children[i], camera, groupOrder, sortObjects);

    }

}

