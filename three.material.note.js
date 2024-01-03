/** 
 * bindingState = {
        // for backward compatibility on non-VAO support browser
        geometry: null,
        program: null,
        wireframe: false,

        newAttributes: newAttributes,
        enabledAttributes: enabledAttributes,
        attributeDivisors: attributeDivisors,
        object: vao,
        attributes: {},
        index: null

    };
 * bindingStates[geometry.id] = state;
 * if (state === undefined) {
        state = createBindingState(createVertexArrayObject());
        stateMap[wireframe] = state;
    }
 * 
*/

/**
 * 
 * renderBufferDirect (camera, scene, geometry, material, object, group)
 *      program = setProgram(camera, scene, geometry, material, object); // new WebGLPrograme(), 计算 refreshMaterial
 *      state.setMaterial(material, frontFaceCW); // 根据material设置gl的一些状态
 *      bindingStates.setup(object, material, program, geometry, index); // 当前bindingState与geometry里attr进行对比如果有差异则重新bindBuffer,完成后更新bindingState bindingState[geometry.id] = {,,,}
 *      renderer.setMode
 *      renderer.renderInstances
 * 
 */


/**
 * setProgram
 */
/**
 * 
 * properties = new WebGLProperties(); // weakmap <material, properties>
 * const materialProperties = properties.get(material);
 * 计算needsProgramChange
 * if (!object.isInstancedMesh && materialProperties.instancing === true) {
        needsProgramChange = true;
    }
     if (needsProgramChange === true) {
        program = getProgram(material, scene, object);
    }
    const p_uniforms = program.getUniforms()
    const m_uniforms = materialProperties.uniforms;
 *  state.useProgram(program.program)
    设置p_uniforms
    p_uniforms.setValue(_gl, 'projectionMatrix', camera.projectionMatrix);
 *  materials.refreshMaterialUniforms(m_uniforms, material, _pixelRatio, _height, _transmissionRenderTarget);
    WebGLUniforms.upload(_gl, materialProperties.uniformsList, m_uniforms, textures);
    // UBOs
    const groups = material.uniformsGroups;
    uniformsGroups.update(group, program);
    uniformsGroups.bind(group, program);
 */



/**
 * getProgram(material, scene, object)
 * const materialProperties = properties.get(material);
 * const parameters = programCache.getParameters(material, lights.state, shadowsArray, scene, object); // {map,envMap, uniforms...}
   const programCacheKey = programCache.getProgramCacheKey(parameters); [k1,v1,k2,v2].join()
 * let programs = materialProperties.programs;
    if (programs === undefined) {  programs = new Map(); materialProperties.programs = programs;}
 *  let program = programs.get(programCacheKey);
    if (program !== undefined) { 
        updateCommonMaterialProperties(material, parameters); 
    } else {
        parameters.uniforms = programCache.getUniforms(material);
        program = programCache.acquireProgram(parameters, programCacheKey); // new WebGLProgram(), shaderstr, gl.createPrograme()
        programs.set(programCacheKey, program);
    }
    const uniforms = materialProperties.uniforms;
    updateCommonMaterialProperties(material, parameters); properties[material].x = parameters.x
    if (materialProperties.needsLights) {
        uniforms.*.value = *
    }
    const progUniforms = program.getUniforms();
    const uniformsList = WebGLUniforms.seqWithValue(progUniforms.seq, uniforms);
    materialProperties.currentProgram = program;
    materialProperties.uniformsList = uniformsList;
    return program
 */


/**
 * 
 * materialProperties: {
 *      envMap,
 *      uniforms,
 *      programes: {
 *          programCacheKey1: programe1,
 *          programCacheKey2: programe2,
 *      },
 *      ...
 * }
 */
/**
 *  materialProperties.programs
 *  programs = new Map();
    materialProperties.programs = programs;
    const p_uniforms = program.getUniforms(),
    m_uniforms = materialProperties.uniforms;
 */
/**
 * 
 * let program = materialProperties.currentProgram;
    if (needsProgramChange === true) {
        program = getProgram(material, scene, object);
    }
 */


// setProgram(camera, scene, geometry, material, object);
// state.setMaterial(material, frontFaceCW);
/**
 * if (material.wireframe === true) {
        index = geometries.getWireframeAttribute(geometry);
        if (index === undefined) return;
        rangeFactor = 2;
    }
 */
// bindingStates.setup(object, material, program, geometry, index); // bindingStates = new WebGLBindingStates( _gl, extensions, attributes, capabilities );

/**
 * 
 * if (object.isMesh) {
        if (material.wireframe === true) {
            state.setLineWidth(material.wireframeLinewidth * getTargetPixelRatio());
            renderer.setMode(_gl.LINES);
        } else {
            renderer.setMode(_gl.TRIANGLES);
        }
    }
 */
/**
 * 
 * if (object.isInstancedMesh) {
        renderer.renderInstances(drawStart, drawCount, object.count);
    } else if (geometry.isInstancedBufferGeometry) {
        const maxInstanceCount = geometry._maxInstanceCount !== undefined ? geometry._maxInstanceCount : Infinity;
        const instanceCount = Math.min(geometry.instanceCount, maxInstanceCount);
        renderer.renderInstances(drawStart, drawCount, instanceCount);
    } else {
        renderer.render(drawStart, drawCount);
    }
 */
this.renderBufferDirect = function (camera, scene, geometry, material, object, group) {
    if (scene === null) scene = _emptyScene; // renderBufferDirect second parameter used to be fog (could be null)
    const frontFaceCW = (object.isMesh && object.matrixWorld.determinant() < 0);
    const program = setProgram(camera, scene, geometry, material, object);
    state.setMaterial(material, frontFaceCW);
    let index = geometry.index;
    let rangeFactor = 1;
    if (material.wireframe === true) {
        index = geometries.getWireframeAttribute(geometry);
        if (index === undefined) return;
        rangeFactor = 2;
    }
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
    bindingStates.setup(object, material, program, geometry, index);
    let attribute;
    let renderer = bufferRenderer;
    if (index !== null) {
        attribute = attributes.get(index);
        renderer = indexedBufferRenderer;
        renderer.setIndex(attribute);
    }
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
    if (object.isInstancedMesh) {
        renderer.renderInstances(drawStart, drawCount, object.count);
    } else if (geometry.isInstancedBufferGeometry) {
        const maxInstanceCount = geometry._maxInstanceCount !== undefined ? geometry._maxInstanceCount : Infinity;
        const instanceCount = Math.min(geometry.instanceCount, maxInstanceCount);
        renderer.renderInstances(drawStart, drawCount, instanceCount);
    } else {
        renderer.render(drawStart, drawCount);
    }
};


function setProgram(camera, scene, geometry, material, object) {

    if (scene.isScene !== true) scene = _emptyScene; // scene could be a Mesh, Line, Points, ...

    textures.resetTextureUnits();

    const fog = scene.fog;
    const environment = material.isMeshStandardMaterial ? scene.environment : null;
    const colorSpace = (_currentRenderTarget === null) ? _this.outputColorSpace : (_currentRenderTarget.isXRRenderTarget === true ? _currentRenderTarget.texture.colorSpace : LinearSRGBColorSpace);
    const envMap = (material.isMeshStandardMaterial ? cubeuvmaps : cubemaps).get(material.envMap || environment);
    const vertexAlphas = material.vertexColors === true && !!geometry.attributes.color && geometry.attributes.color.itemSize === 4;
    const vertexTangents = !!geometry.attributes.tangent && (!!material.normalMap || material.anisotropy > 0);
    const morphTargets = !!geometry.morphAttributes.position;
    const morphNormals = !!geometry.morphAttributes.normal;
    const morphColors = !!geometry.morphAttributes.color;

    let toneMapping = NoToneMapping;

    if (material.toneMapped) {

        if (_currentRenderTarget === null || _currentRenderTarget.isXRRenderTarget === true) {

            toneMapping = _this.toneMapping;

        }

    }

    const morphAttribute = geometry.morphAttributes.position || geometry.morphAttributes.normal || geometry.morphAttributes.color;
    const morphTargetsCount = (morphAttribute !== undefined) ? morphAttribute.length : 0;

    const materialProperties = properties.get(material);
    const lights = currentRenderState.state.lights;

    if (_clippingEnabled === true) {

        if (_localClippingEnabled === true || camera !== _currentCamera) {

            const useCache =
                camera === _currentCamera &&
                material.id === _currentMaterialId;

            // we might want to call this function with some ClippingGroup
            // object instead of the material, once it becomes feasible
            // (#8465, #8379)
            clipping.setState(material, camera, useCache);

        }

    }

    //

    let needsProgramChange = false;

    if (material.version === materialProperties.__version) {

        if (materialProperties.needsLights && (materialProperties.lightsStateVersion !== lights.state.version)) {

            needsProgramChange = true;

        } else if (materialProperties.outputColorSpace !== colorSpace) {

            needsProgramChange = true;

        } else if (object.isInstancedMesh && materialProperties.instancing === false) {

            needsProgramChange = true;

        } else if (!object.isInstancedMesh && materialProperties.instancing === true) {

            needsProgramChange = true;

        } else if (object.isSkinnedMesh && materialProperties.skinning === false) {

            needsProgramChange = true;

        } else if (!object.isSkinnedMesh && materialProperties.skinning === true) {

            needsProgramChange = true;

        } else if (object.isInstancedMesh && materialProperties.instancingColor === true && object.instanceColor === null) {

            needsProgramChange = true;

        } else if (object.isInstancedMesh && materialProperties.instancingColor === false && object.instanceColor !== null) {

            needsProgramChange = true;

        } else if (materialProperties.envMap !== envMap) {

            needsProgramChange = true;

        } else if (material.fog === true && materialProperties.fog !== fog) {

            needsProgramChange = true;

        } else if (materialProperties.numClippingPlanes !== undefined &&
            (materialProperties.numClippingPlanes !== clipping.numPlanes ||
                materialProperties.numIntersection !== clipping.numIntersection)) {

            needsProgramChange = true;

        } else if (materialProperties.vertexAlphas !== vertexAlphas) {

            needsProgramChange = true;

        } else if (materialProperties.vertexTangents !== vertexTangents) {

            needsProgramChange = true;

        } else if (materialProperties.morphTargets !== morphTargets) {

            needsProgramChange = true;

        } else if (materialProperties.morphNormals !== morphNormals) {

            needsProgramChange = true;

        } else if (materialProperties.morphColors !== morphColors) {

            needsProgramChange = true;

        } else if (materialProperties.toneMapping !== toneMapping) {

            needsProgramChange = true;

        } else if (capabilities.isWebGL2 === true && materialProperties.morphTargetsCount !== morphTargetsCount) {

            needsProgramChange = true;

        }

    } else {

        needsProgramChange = true;
        materialProperties.__version = material.version;

    }

    //

    let program = materialProperties.currentProgram;

    if (needsProgramChange === true) {

        program = getProgram(material, scene, object);

    }

    let refreshProgram = false;
    let refreshMaterial = false;
    let refreshLights = false;

    const p_uniforms = program.getUniforms(),
        m_uniforms = materialProperties.uniforms;

    if (state.useProgram(program.program)) {

        refreshProgram = true;
        refreshMaterial = true;
        refreshLights = true;

    }

    if (material.id !== _currentMaterialId) {

        _currentMaterialId = material.id;

        refreshMaterial = true;

    }

    if (refreshProgram || _currentCamera !== camera) {

        // common camera uniforms

        p_uniforms.setValue(_gl, 'projectionMatrix', camera.projectionMatrix);
        p_uniforms.setValue(_gl, 'viewMatrix', camera.matrixWorldInverse);

        const uCamPos = p_uniforms.map.cameraPosition;

        if (uCamPos !== undefined) {

            uCamPos.setValue(_gl, _vector3.setFromMatrixPosition(camera.matrixWorld));

        }

        if (capabilities.logarithmicDepthBuffer) {

            p_uniforms.setValue(_gl, 'logDepthBufFC',
                2.0 / (Math.log(camera.far + 1.0) / Math.LN2));

        }

        // consider moving isOrthographic to UniformLib and WebGLMaterials, see https://github.com/mrdoob/three.js/pull/26467#issuecomment-1645185067

        if (material.isMeshPhongMaterial ||
            material.isMeshToonMaterial ||
            material.isMeshLambertMaterial ||
            material.isMeshBasicMaterial ||
            material.isMeshStandardMaterial ||
            material.isShaderMaterial) {

            p_uniforms.setValue(_gl, 'isOrthographic', camera.isOrthographicCamera === true);

        }

        if (_currentCamera !== camera) {

            _currentCamera = camera;

            // lighting uniforms depend on the camera so enforce an update
            // now, in case this material supports lights - or later, when
            // the next material that does gets activated:

            refreshMaterial = true;		// set to true on material change
            refreshLights = true;		// remains set until update done

        }

    }

    // skinning and morph target uniforms must be set even if material didn't change
    // auto-setting of texture unit for bone and morph texture must go before other textures
    // otherwise textures used for skinning and morphing can take over texture units reserved for other material textures

    if (object.isSkinnedMesh) {

        p_uniforms.setOptional(_gl, object, 'bindMatrix');
        p_uniforms.setOptional(_gl, object, 'bindMatrixInverse');

        const skeleton = object.skeleton;

        if (skeleton) {

            if (capabilities.floatVertexTextures) {

                if (skeleton.boneTexture === null) skeleton.computeBoneTexture();

                p_uniforms.setValue(_gl, 'boneTexture', skeleton.boneTexture, textures);
                p_uniforms.setValue(_gl, 'boneTextureSize', skeleton.boneTextureSize);

            } else {

                console.warn('THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required.');

            }

        }

    }

    const morphAttributes = geometry.morphAttributes;

    if (morphAttributes.position !== undefined || morphAttributes.normal !== undefined || (morphAttributes.color !== undefined && capabilities.isWebGL2 === true)) {

        morphtargets.update(object, geometry, program);

    }

    if (refreshMaterial || materialProperties.receiveShadow !== object.receiveShadow) {

        materialProperties.receiveShadow = object.receiveShadow;
        p_uniforms.setValue(_gl, 'receiveShadow', object.receiveShadow);

    }

    // https://github.com/mrdoob/three.js/pull/24467#issuecomment-1209031512

    if (material.isMeshGouraudMaterial && material.envMap !== null) {

        m_uniforms.envMap.value = envMap;

        m_uniforms.flipEnvMap.value = (envMap.isCubeTexture && envMap.isRenderTargetTexture === false) ? - 1 : 1;

    }

    if (refreshMaterial) {

        p_uniforms.setValue(_gl, 'toneMappingExposure', _this.toneMappingExposure);

        if (materialProperties.needsLights) {

            // the current material requires lighting info

            // note: all lighting uniforms are always set correctly
            // they simply reference the renderer's state for their
            // values
            //
            // use the current material's .needsUpdate flags to set
            // the GL state when required

            markUniformsLightsNeedsUpdate(m_uniforms, refreshLights);

        }

        // refresh uniforms common to several materials

        if (fog && material.fog === true) {

            materials.refreshFogUniforms(m_uniforms, fog);

        }

        materials.refreshMaterialUniforms(m_uniforms, material, _pixelRatio, _height, _transmissionRenderTarget);

        WebGLUniforms.upload(_gl, materialProperties.uniformsList, m_uniforms, textures);

    }

    if (material.isShaderMaterial && material.uniformsNeedUpdate === true) {

        WebGLUniforms.upload(_gl, materialProperties.uniformsList, m_uniforms, textures);
        material.uniformsNeedUpdate = false;

    }

    if (material.isSpriteMaterial) {

        p_uniforms.setValue(_gl, 'center', object.center);

    }

    // common matrices

    p_uniforms.setValue(_gl, 'modelViewMatrix', object.modelViewMatrix);
    p_uniforms.setValue(_gl, 'normalMatrix', object.normalMatrix);
    p_uniforms.setValue(_gl, 'modelMatrix', object.matrixWorld);

    // UBOs

    if (material.isShaderMaterial || material.isRawShaderMaterial) {

        const groups = material.uniformsGroups;

        for (let i = 0, l = groups.length; i < l; i++) {

            if (capabilities.isWebGL2) {

                const group = groups[i];

                uniformsGroups.update(group, program);
                uniformsGroups.bind(group, program);

            } else {

                console.warn('THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.');

            }

        }

    }

    return program;

}

/**
 * 
 * let programs = materialProperties.programs;
 * const parameters = programCache.getParameters(material, lights.state, shadowsArray, scene, object); // mat,geo, object
   const programCacheKey = programCache.getProgramCacheKey(parameters);
 * const program = programs.get(programCacheKey);
 * program = programCache.acquireProgram(parameters, programCacheKey); // WebGLPrograme()
   programs.set(programCacheKey, program);
   materialProperties.uniforms = parameters.uniforms;
   updateCommonMaterialProperties(material, parameters);
   materialProperties.needsLights = materialNeedsLights(material);
   materialProperties.lightsStateVersion = lightsStateVersion;
   if (materialProperties.needsLights) {
        uniforms.ambientLightColor.value = lights.state.ambient;
        ...
   }
    const progUniforms = program.getUniforms();
    const uniformsList = WebGLUniforms.seqWithValue(progUniforms.seq, uniforms);
    materialProperties.currentProgram = program;
    materialProperties.uniformsList = uniformsList;
    return program;
*/
/**
 * programCache
 * programCache = new WebGLPrograms( _this, cubemaps, cubeuvmaps, extensions, capabilities, bindingStates, clipping );
 */


/**
 * getProgram
 */
function getProgram(material, scene, object) {

    if (scene.isScene !== true) scene = _emptyScene; // scene could be a Mesh, Line, Points, ...

    const materialProperties = properties.get(material);

    const lights = currentRenderState.state.lights;
    const shadowsArray = currentRenderState.state.shadowsArray;

    const lightsStateVersion = lights.state.version;

    const parameters = programCache.getParameters(material, lights.state, shadowsArray, scene, object);
    const programCacheKey = programCache.getProgramCacheKey(parameters);

    let programs = materialProperties.programs;

    // always update environment and fog - changing these trigger an getProgram call, but it's possible that the program doesn't change

    materialProperties.environment = material.isMeshStandardMaterial ? scene.environment : null;
    materialProperties.fog = scene.fog;
    materialProperties.envMap = (material.isMeshStandardMaterial ? cubeuvmaps : cubemaps).get(material.envMap || materialProperties.environment);

    if (programs === undefined) {

        // new material

        material.addEventListener('dispose', onMaterialDispose);

        programs = new Map();
        materialProperties.programs = programs;

    }

    let program = programs.get(programCacheKey);

    if (program !== undefined) {

        // early out if program and light state is identical

        if (materialProperties.currentProgram === program && materialProperties.lightsStateVersion === lightsStateVersion) {

            updateCommonMaterialProperties(material, parameters);

            return program;

        }

    } else {

        parameters.uniforms = programCache.getUniforms(material);

        material.onBuild(object, parameters, _this);

        material.onBeforeCompile(parameters, _this);

        program = programCache.acquireProgram(parameters, programCacheKey);
        programs.set(programCacheKey, program);

        materialProperties.uniforms = parameters.uniforms;

    }

    const uniforms = materialProperties.uniforms;

    if ((!material.isShaderMaterial && !material.isRawShaderMaterial) || material.clipping === true) {

        uniforms.clippingPlanes = clipping.uniform;

    }

    updateCommonMaterialProperties(material, parameters);

    // store the light setup it was created for

    materialProperties.needsLights = materialNeedsLights(material);
    materialProperties.lightsStateVersion = lightsStateVersion;

    if (materialProperties.needsLights) {

        // wire up the material to this renderer's lighting state

        uniforms.ambientLightColor.value = lights.state.ambient;
        uniforms.lightProbe.value = lights.state.probe;
        uniforms.directionalLights.value = lights.state.directional;
        uniforms.directionalLightShadows.value = lights.state.directionalShadow;
        uniforms.spotLights.value = lights.state.spot;
        uniforms.spotLightShadows.value = lights.state.spotShadow;
        uniforms.rectAreaLights.value = lights.state.rectArea;
        uniforms.ltc_1.value = lights.state.rectAreaLTC1;
        uniforms.ltc_2.value = lights.state.rectAreaLTC2;
        uniforms.pointLights.value = lights.state.point;
        uniforms.pointLightShadows.value = lights.state.pointShadow;
        uniforms.hemisphereLights.value = lights.state.hemi;

        uniforms.directionalShadowMap.value = lights.state.directionalShadowMap;
        uniforms.directionalShadowMatrix.value = lights.state.directionalShadowMatrix;
        uniforms.spotShadowMap.value = lights.state.spotShadowMap;
        uniforms.spotLightMatrix.value = lights.state.spotLightMatrix;
        uniforms.spotLightMap.value = lights.state.spotLightMap;
        uniforms.pointShadowMap.value = lights.state.pointShadowMap;
        uniforms.pointShadowMatrix.value = lights.state.pointShadowMatrix;
        // TODO (abelnation): add area lights shadow info to uniforms

    }

    const progUniforms = program.getUniforms();
    const uniformsList = WebGLUniforms.seqWithValue(progUniforms.seq, uniforms);

    materialProperties.currentProgram = program;
    materialProperties.uniformsList = uniformsList;

    return program;

}

function updateCommonMaterialProperties(material, parameters) {

    const materialProperties = properties.get(material);

    materialProperties.outputColorSpace = parameters.outputColorSpace;
    materialProperties.instancing = parameters.instancing;
    materialProperties.instancingColor = parameters.instancingColor;
    materialProperties.skinning = parameters.skinning;
    materialProperties.morphTargets = parameters.morphTargets;
    materialProperties.morphNormals = parameters.morphNormals;
    materialProperties.morphColors = parameters.morphColors;
    materialProperties.morphTargetsCount = parameters.morphTargetsCount;
    materialProperties.numClippingPlanes = parameters.numClippingPlanes;
    materialProperties.numIntersection = parameters.numClipIntersection;
    materialProperties.vertexAlphas = parameters.vertexAlphas;
    materialProperties.vertexTangents = parameters.vertexTangents;
    materialProperties.toneMapping = parameters.toneMapping;

}

function WebGLProperties() {

    let properties = new WeakMap();

    function get(object) {

        let map = properties.get(object);

        if (map === undefined) {

            map = {};
            properties.set(object, map);

        }

        return map;

    }

    function remove(object) {

        properties.delete(object);

    }

    function update(object, key, value) {

        properties.get(object)[key] = value;

    }

    function dispose() {

        properties = new WeakMap();

    }
    return {
        get: get,
        remove: remove,
        update: update,
        dispose: dispose
    };
}

function WebGLPrograms(renderer, cubemaps, cubeuvmaps, extensions, capabilities, bindingStates, clipping) {

    const _programLayers = new Layers();
    const _customShaders = new WebGLShaderCache();
    const programs = [];

    const IS_WEBGL2 = capabilities.isWebGL2;
    const logarithmicDepthBuffer = capabilities.logarithmicDepthBuffer;
    const SUPPORTS_VERTEX_TEXTURES = capabilities.vertexTextures;

    let precision = capabilities.precision;

    const shaderIDs = {
        MeshDepthMaterial: 'depth',
        MeshDistanceMaterial: 'distanceRGBA',
        MeshNormalMaterial: 'normal',
        MeshBasicMaterial: 'basic',
        MeshLambertMaterial: 'lambert',
        MeshPhongMaterial: 'phong',
        MeshToonMaterial: 'toon',
        MeshStandardMaterial: 'physical',
        MeshPhysicalMaterial: 'physical',
        MeshMatcapMaterial: 'matcap',
        LineBasicMaterial: 'basic',
        LineDashedMaterial: 'dashed',
        PointsMaterial: 'points',
        ShadowMaterial: 'shadow',
        SpriteMaterial: 'sprite'
    };

    function getChannel(value) {
        if (value === 0) return 'uv';
        return `uv${value}`;
    }

    function getParameters(material, lights, shadows, scene, object) {

        const fog = scene.fog;
        const geometry = object.geometry;
        const environment = material.isMeshStandardMaterial ? scene.environment : null;

        const envMap = (material.isMeshStandardMaterial ? cubeuvmaps : cubemaps).get(material.envMap || environment);
        const envMapCubeUVHeight = (!!envMap) && (envMap.mapping === CubeUVReflectionMapping) ? envMap.image.height : null;

        const shaderID = shaderIDs[material.type];

        // heuristics to create shader parameters according to lights in the scene
        // (not to blow over maxLights budget)

        if (material.precision !== null) {

            precision = capabilities.getMaxPrecision(material.precision);

            if (precision !== material.precision) {

                console.warn('THREE.WebGLProgram.getParameters:', material.precision, 'not supported, using', precision, 'instead.');

            }

        }

        //

        const morphAttribute = geometry.morphAttributes.position || geometry.morphAttributes.normal || geometry.morphAttributes.color;
        const morphTargetsCount = (morphAttribute !== undefined) ? morphAttribute.length : 0;

        let morphTextureStride = 0;

        if (geometry.morphAttributes.position !== undefined) morphTextureStride = 1;
        if (geometry.morphAttributes.normal !== undefined) morphTextureStride = 2;
        if (geometry.morphAttributes.color !== undefined) morphTextureStride = 3;

        //

        let vertexShader, fragmentShader;
        let customVertexShaderID, customFragmentShaderID;

        if (shaderID) {

            const shader = ShaderLib[shaderID];

            vertexShader = shader.vertexShader;
            fragmentShader = shader.fragmentShader;

        } else {

            vertexShader = material.vertexShader;
            fragmentShader = material.fragmentShader;

            _customShaders.update(material);

            customVertexShaderID = _customShaders.getVertexShaderID(material);
            customFragmentShaderID = _customShaders.getFragmentShaderID(material);

        }

        const currentRenderTarget = renderer.getRenderTarget();

        const IS_INSTANCEDMESH = object.isInstancedMesh === true;

        const HAS_MAP = !!material.map;
        const HAS_MATCAP = !!material.matcap;
        const HAS_ENVMAP = !!envMap;
        const HAS_AOMAP = !!material.aoMap;
        const HAS_LIGHTMAP = !!material.lightMap;
        const HAS_BUMPMAP = !!material.bumpMap;
        const HAS_NORMALMAP = !!material.normalMap;
        const HAS_DISPLACEMENTMAP = !!material.displacementMap;
        const HAS_EMISSIVEMAP = !!material.emissiveMap;

        const HAS_METALNESSMAP = !!material.metalnessMap;
        const HAS_ROUGHNESSMAP = !!material.roughnessMap;

        const HAS_ANISOTROPY = material.anisotropy > 0;
        const HAS_CLEARCOAT = material.clearcoat > 0;
        const HAS_IRIDESCENCE = material.iridescence > 0;
        const HAS_SHEEN = material.sheen > 0;
        const HAS_TRANSMISSION = material.transmission > 0;

        const HAS_ANISOTROPYMAP = HAS_ANISOTROPY && !!material.anisotropyMap;

        const HAS_CLEARCOATMAP = HAS_CLEARCOAT && !!material.clearcoatMap;
        const HAS_CLEARCOAT_NORMALMAP = HAS_CLEARCOAT && !!material.clearcoatNormalMap;
        const HAS_CLEARCOAT_ROUGHNESSMAP = HAS_CLEARCOAT && !!material.clearcoatRoughnessMap;

        const HAS_IRIDESCENCEMAP = HAS_IRIDESCENCE && !!material.iridescenceMap;
        const HAS_IRIDESCENCE_THICKNESSMAP = HAS_IRIDESCENCE && !!material.iridescenceThicknessMap;

        const HAS_SHEEN_COLORMAP = HAS_SHEEN && !!material.sheenColorMap;
        const HAS_SHEEN_ROUGHNESSMAP = HAS_SHEEN && !!material.sheenRoughnessMap;

        const HAS_SPECULARMAP = !!material.specularMap;
        const HAS_SPECULAR_COLORMAP = !!material.specularColorMap;
        const HAS_SPECULAR_INTENSITYMAP = !!material.specularIntensityMap;

        const HAS_TRANSMISSIONMAP = HAS_TRANSMISSION && !!material.transmissionMap;
        const HAS_THICKNESSMAP = HAS_TRANSMISSION && !!material.thicknessMap;

        const HAS_GRADIENTMAP = !!material.gradientMap;

        const HAS_ALPHAMAP = !!material.alphaMap;

        const HAS_ALPHATEST = material.alphaTest > 0;

        const HAS_ALPHAHASH = !!material.alphaHash;

        const HAS_EXTENSIONS = !!material.extensions;

        const HAS_ATTRIBUTE_UV1 = !!geometry.attributes.uv1;
        const HAS_ATTRIBUTE_UV2 = !!geometry.attributes.uv2;
        const HAS_ATTRIBUTE_UV3 = !!geometry.attributes.uv3;

        let toneMapping = NoToneMapping;

        if (material.toneMapped) {

            if (currentRenderTarget === null || currentRenderTarget.isXRRenderTarget === true) {

                toneMapping = renderer.toneMapping;

            }

        }

        const parameters = {

            isWebGL2: IS_WEBGL2,

            shaderID: shaderID,
            shaderType: material.type,
            shaderName: material.name,

            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            defines: material.defines,

            customVertexShaderID: customVertexShaderID,
            customFragmentShaderID: customFragmentShaderID,

            isRawShaderMaterial: material.isRawShaderMaterial === true,
            glslVersion: material.glslVersion,

            precision: precision,

            instancing: IS_INSTANCEDMESH,
            instancingColor: IS_INSTANCEDMESH && object.instanceColor !== null,

            supportsVertexTextures: SUPPORTS_VERTEX_TEXTURES,
            outputColorSpace: (currentRenderTarget === null) ? renderer.outputColorSpace : (currentRenderTarget.isXRRenderTarget === true ? currentRenderTarget.texture.colorSpace : LinearSRGBColorSpace),

            map: HAS_MAP,
            matcap: HAS_MATCAP,
            envMap: HAS_ENVMAP,
            envMapMode: HAS_ENVMAP && envMap.mapping,
            envMapCubeUVHeight: envMapCubeUVHeight,
            aoMap: HAS_AOMAP,
            lightMap: HAS_LIGHTMAP,
            bumpMap: HAS_BUMPMAP,
            normalMap: HAS_NORMALMAP,
            displacementMap: SUPPORTS_VERTEX_TEXTURES && HAS_DISPLACEMENTMAP,
            emissiveMap: HAS_EMISSIVEMAP,

            normalMapObjectSpace: HAS_NORMALMAP && material.normalMapType === ObjectSpaceNormalMap,
            normalMapTangentSpace: HAS_NORMALMAP && material.normalMapType === TangentSpaceNormalMap,

            metalnessMap: HAS_METALNESSMAP,
            roughnessMap: HAS_ROUGHNESSMAP,

            anisotropy: HAS_ANISOTROPY,
            anisotropyMap: HAS_ANISOTROPYMAP,

            clearcoat: HAS_CLEARCOAT,
            clearcoatMap: HAS_CLEARCOATMAP,
            clearcoatNormalMap: HAS_CLEARCOAT_NORMALMAP,
            clearcoatRoughnessMap: HAS_CLEARCOAT_ROUGHNESSMAP,

            iridescence: HAS_IRIDESCENCE,
            iridescenceMap: HAS_IRIDESCENCEMAP,
            iridescenceThicknessMap: HAS_IRIDESCENCE_THICKNESSMAP,

            sheen: HAS_SHEEN,
            sheenColorMap: HAS_SHEEN_COLORMAP,
            sheenRoughnessMap: HAS_SHEEN_ROUGHNESSMAP,

            specularMap: HAS_SPECULARMAP,
            specularColorMap: HAS_SPECULAR_COLORMAP,
            specularIntensityMap: HAS_SPECULAR_INTENSITYMAP,

            transmission: HAS_TRANSMISSION,
            transmissionMap: HAS_TRANSMISSIONMAP,
            thicknessMap: HAS_THICKNESSMAP,

            gradientMap: HAS_GRADIENTMAP,

            opaque: material.transparent === false && material.blending === NormalBlending,

            alphaMap: HAS_ALPHAMAP,
            alphaTest: HAS_ALPHATEST,
            alphaHash: HAS_ALPHAHASH,

            combine: material.combine,

            //

            mapUv: HAS_MAP && getChannel(material.map.channel),
            aoMapUv: HAS_AOMAP && getChannel(material.aoMap.channel),
            lightMapUv: HAS_LIGHTMAP && getChannel(material.lightMap.channel),
            bumpMapUv: HAS_BUMPMAP && getChannel(material.bumpMap.channel),
            normalMapUv: HAS_NORMALMAP && getChannel(material.normalMap.channel),
            displacementMapUv: HAS_DISPLACEMENTMAP && getChannel(material.displacementMap.channel),
            emissiveMapUv: HAS_EMISSIVEMAP && getChannel(material.emissiveMap.channel),

            metalnessMapUv: HAS_METALNESSMAP && getChannel(material.metalnessMap.channel),
            roughnessMapUv: HAS_ROUGHNESSMAP && getChannel(material.roughnessMap.channel),

            anisotropyMapUv: HAS_ANISOTROPYMAP && getChannel(material.anisotropyMap.channel),

            clearcoatMapUv: HAS_CLEARCOATMAP && getChannel(material.clearcoatMap.channel),
            clearcoatNormalMapUv: HAS_CLEARCOAT_NORMALMAP && getChannel(material.clearcoatNormalMap.channel),
            clearcoatRoughnessMapUv: HAS_CLEARCOAT_ROUGHNESSMAP && getChannel(material.clearcoatRoughnessMap.channel),

            iridescenceMapUv: HAS_IRIDESCENCEMAP && getChannel(material.iridescenceMap.channel),
            iridescenceThicknessMapUv: HAS_IRIDESCENCE_THICKNESSMAP && getChannel(material.iridescenceThicknessMap.channel),

            sheenColorMapUv: HAS_SHEEN_COLORMAP && getChannel(material.sheenColorMap.channel),
            sheenRoughnessMapUv: HAS_SHEEN_ROUGHNESSMAP && getChannel(material.sheenRoughnessMap.channel),

            specularMapUv: HAS_SPECULARMAP && getChannel(material.specularMap.channel),
            specularColorMapUv: HAS_SPECULAR_COLORMAP && getChannel(material.specularColorMap.channel),
            specularIntensityMapUv: HAS_SPECULAR_INTENSITYMAP && getChannel(material.specularIntensityMap.channel),

            transmissionMapUv: HAS_TRANSMISSIONMAP && getChannel(material.transmissionMap.channel),
            thicknessMapUv: HAS_THICKNESSMAP && getChannel(material.thicknessMap.channel),

            alphaMapUv: HAS_ALPHAMAP && getChannel(material.alphaMap.channel),

            //

            vertexTangents: !!geometry.attributes.tangent && (HAS_NORMALMAP || HAS_ANISOTROPY),
            vertexColors: material.vertexColors,
            vertexAlphas: material.vertexColors === true && !!geometry.attributes.color && geometry.attributes.color.itemSize === 4,
            vertexUv1s: HAS_ATTRIBUTE_UV1,
            vertexUv2s: HAS_ATTRIBUTE_UV2,
            vertexUv3s: HAS_ATTRIBUTE_UV3,

            pointsUvs: object.isPoints === true && !!geometry.attributes.uv && (HAS_MAP || HAS_ALPHAMAP),

            fog: !!fog,
            useFog: material.fog === true,
            fogExp2: (fog && fog.isFogExp2),

            flatShading: material.flatShading === true,

            sizeAttenuation: material.sizeAttenuation === true,
            logarithmicDepthBuffer: logarithmicDepthBuffer,

            skinning: object.isSkinnedMesh === true,

            morphTargets: geometry.morphAttributes.position !== undefined,
            morphNormals: geometry.morphAttributes.normal !== undefined,
            morphColors: geometry.morphAttributes.color !== undefined,
            morphTargetsCount: morphTargetsCount,
            morphTextureStride: morphTextureStride,

            numDirLights: lights.directional.length,
            numPointLights: lights.point.length,
            numSpotLights: lights.spot.length,
            numSpotLightMaps: lights.spotLightMap.length,
            numRectAreaLights: lights.rectArea.length,
            numHemiLights: lights.hemi.length,

            numDirLightShadows: lights.directionalShadowMap.length,
            numPointLightShadows: lights.pointShadowMap.length,
            numSpotLightShadows: lights.spotShadowMap.length,
            numSpotLightShadowsWithMaps: lights.numSpotLightShadowsWithMaps,

            numLightProbes: lights.numLightProbes,

            numClippingPlanes: clipping.numPlanes,
            numClipIntersection: clipping.numIntersection,

            dithering: material.dithering,

            shadowMapEnabled: renderer.shadowMap.enabled && shadows.length > 0,
            shadowMapType: renderer.shadowMap.type,

            toneMapping: toneMapping,
            useLegacyLights: renderer._useLegacyLights,

            decodeVideoTexture: HAS_MAP && (material.map.isVideoTexture === true) && (ColorManagement.getTransfer(material.map.colorSpace) === SRGBTransfer),

            premultipliedAlpha: material.premultipliedAlpha,

            doubleSided: material.side === DoubleSide,
            flipSided: material.side === BackSide,

            useDepthPacking: material.depthPacking >= 0,
            depthPacking: material.depthPacking || 0,

            index0AttributeName: material.index0AttributeName,

            extensionDerivatives: HAS_EXTENSIONS && material.extensions.derivatives === true,
            extensionFragDepth: HAS_EXTENSIONS && material.extensions.fragDepth === true,
            extensionDrawBuffers: HAS_EXTENSIONS && material.extensions.drawBuffers === true,
            extensionShaderTextureLOD: HAS_EXTENSIONS && material.extensions.shaderTextureLOD === true,

            rendererExtensionFragDepth: IS_WEBGL2 || extensions.has('EXT_frag_depth'),
            rendererExtensionDrawBuffers: IS_WEBGL2 || extensions.has('WEBGL_draw_buffers'),
            rendererExtensionShaderTextureLod: IS_WEBGL2 || extensions.has('EXT_shader_texture_lod'),

            customProgramCacheKey: material.customProgramCacheKey()
        };
        return parameters;
    }

    function getProgramCacheKey(parameters) {

        const array = [];

        if (parameters.shaderID) {

            array.push(parameters.shaderID);

        } else {

            array.push(parameters.customVertexShaderID);
            array.push(parameters.customFragmentShaderID);

        }

        if (parameters.defines !== undefined) {

            for (const name in parameters.defines) {

                array.push(name);
                array.push(parameters.defines[name]);

            }

        }

        if (parameters.isRawShaderMaterial === false) {

            getProgramCacheKeyParameters(array, parameters);
            getProgramCacheKeyBooleans(array, parameters);
            array.push(renderer.outputColorSpace);

        }

        array.push(parameters.customProgramCacheKey);

        return array.join();

    }

    function getProgramCacheKeyParameters(array, parameters) {

        array.push(parameters.precision);
        array.push(parameters.outputColorSpace);
        array.push(parameters.envMapMode);
        array.push(parameters.envMapCubeUVHeight);
        array.push(parameters.mapUv);
        array.push(parameters.alphaMapUv);
        array.push(parameters.lightMapUv);
        array.push(parameters.aoMapUv);
        array.push(parameters.bumpMapUv);
        array.push(parameters.normalMapUv);
        array.push(parameters.displacementMapUv);
        array.push(parameters.emissiveMapUv);
        array.push(parameters.metalnessMapUv);
        array.push(parameters.roughnessMapUv);
        array.push(parameters.anisotropyMapUv);
        array.push(parameters.clearcoatMapUv);
        array.push(parameters.clearcoatNormalMapUv);
        array.push(parameters.clearcoatRoughnessMapUv);
        array.push(parameters.iridescenceMapUv);
        array.push(parameters.iridescenceThicknessMapUv);
        array.push(parameters.sheenColorMapUv);
        array.push(parameters.sheenRoughnessMapUv);
        array.push(parameters.specularMapUv);
        array.push(parameters.specularColorMapUv);
        array.push(parameters.specularIntensityMapUv);
        array.push(parameters.transmissionMapUv);
        array.push(parameters.thicknessMapUv);
        array.push(parameters.combine);
        array.push(parameters.fogExp2);
        array.push(parameters.sizeAttenuation);
        array.push(parameters.morphTargetsCount);
        array.push(parameters.morphAttributeCount);
        array.push(parameters.numDirLights);
        array.push(parameters.numPointLights);
        array.push(parameters.numSpotLights);
        array.push(parameters.numSpotLightMaps);
        array.push(parameters.numHemiLights);
        array.push(parameters.numRectAreaLights);
        array.push(parameters.numDirLightShadows);
        array.push(parameters.numPointLightShadows);
        array.push(parameters.numSpotLightShadows);
        array.push(parameters.numSpotLightShadowsWithMaps);
        array.push(parameters.numLightProbes);
        array.push(parameters.shadowMapType);
        array.push(parameters.toneMapping);
        array.push(parameters.numClippingPlanes);
        array.push(parameters.numClipIntersection);
        array.push(parameters.depthPacking);

    }

    function getProgramCacheKeyBooleans(array, parameters) {
        _programLayers.disableAll();
        if (parameters.isWebGL2)
            _programLayers.enable(0);
        if (parameters.supportsVertexTextures)
            _programLayers.enable(1);
        if (parameters.instancing)
            _programLayers.enable(2);
        if (parameters.instancingColor)
            _programLayers.enable(3);
        if (parameters.matcap)
            _programLayers.enable(4);
        if (parameters.envMap)
            _programLayers.enable(5);
        if (parameters.normalMapObjectSpace)
            _programLayers.enable(6);
        if (parameters.normalMapTangentSpace)
            _programLayers.enable(7);
        if (parameters.clearcoat)
            _programLayers.enable(8);
        if (parameters.iridescence)
            _programLayers.enable(9);
        if (parameters.alphaTest)
            _programLayers.enable(10);
        if (parameters.vertexColors)
            _programLayers.enable(11);
        if (parameters.vertexAlphas)
            _programLayers.enable(12);
        if (parameters.vertexUv1s)
            _programLayers.enable(13);
        if (parameters.vertexUv2s)
            _programLayers.enable(14);
        if (parameters.vertexUv3s)
            _programLayers.enable(15);
        if (parameters.vertexTangents)
            _programLayers.enable(16);
        if (parameters.anisotropy)
            _programLayers.enable(17);

        array.push(_programLayers.mask);
        _programLayers.disableAll();

        if (parameters.fog)
            _programLayers.enable(0);
        if (parameters.useFog)
            _programLayers.enable(1);
        if (parameters.flatShading)
            _programLayers.enable(2);
        if (parameters.logarithmicDepthBuffer)
            _programLayers.enable(3);
        if (parameters.skinning)
            _programLayers.enable(4);
        if (parameters.morphTargets)
            _programLayers.enable(5);
        if (parameters.morphNormals)
            _programLayers.enable(6);
        if (parameters.morphColors)
            _programLayers.enable(7);
        if (parameters.premultipliedAlpha)
            _programLayers.enable(8);
        if (parameters.shadowMapEnabled)
            _programLayers.enable(9);
        if (parameters.useLegacyLights)
            _programLayers.enable(10);
        if (parameters.doubleSided)
            _programLayers.enable(11);
        if (parameters.flipSided)
            _programLayers.enable(12);
        if (parameters.useDepthPacking)
            _programLayers.enable(13);
        if (parameters.dithering)
            _programLayers.enable(14);
        if (parameters.transmission)
            _programLayers.enable(15);
        if (parameters.sheen)
            _programLayers.enable(16);
        if (parameters.opaque)
            _programLayers.enable(17);
        if (parameters.pointsUvs)
            _programLayers.enable(18);
        if (parameters.decodeVideoTexture)
            _programLayers.enable(19);
        array.push(_programLayers.mask);
    }

    function getUniforms(material) {
        const shaderID = shaderIDs[material.type];
        let uniforms;
        if (shaderID) {
            const shader = ShaderLib[shaderID];
            uniforms = UniformsUtils.clone(shader.uniforms);
        } else {
            uniforms = material.uniforms;
        }
        return uniforms;
    }
    function acquireProgram(parameters, cacheKey) {
        let program;
        // Check if code has been already compiled
        for (let p = 0, pl = programs.length; p < pl; p++) {
            const preexistingProgram = programs[p];
            if (preexistingProgram.cacheKey === cacheKey) {
                program = preexistingProgram;
                ++program.usedTimes;
                break;
            }
        }
        if (program === undefined) {
            program = new WebGLProgram(renderer, cacheKey, parameters, bindingStates);
            programs.push(program);
        }
        return program;
    }
    function releaseProgram(program) {

        if (--program.usedTimes === 0) {

            // Remove from unordered set
            const i = programs.indexOf(program);
            programs[i] = programs[programs.length - 1];
            programs.pop();

            // Free WebGL resources
            program.destroy();

        }

    }
    function releaseShaderCache(material) {

        _customShaders.remove(material);

    }
    function dispose() {

        _customShaders.dispose();

    }
    return {
        getParameters: getParameters,
        getProgramCacheKey: getProgramCacheKey,
        getUniforms: getUniforms,
        acquireProgram: acquireProgram,
        releaseProgram: releaseProgram,
        releaseShaderCache: releaseShaderCache,
        // Exposed for resource monitoring & error feedback via renderer.info:
        programs: programs,
        dispose: dispose
    };
}


class WebGLUniforms {

    constructor(gl, program) {

        this.seq = [];
        this.map = {};

        const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

        for (let i = 0; i < n; ++i) {

            const info = gl.getActiveUniform(program, i),
                addr = gl.getUniformLocation(program, info.name);

            parseUniform(info, addr, this);

        }

    }

    setValue(gl, name, value, textures) {

        const u = this.map[name];

        if (u !== undefined) u.setValue(gl, value, textures);

    }

    setOptional(gl, object, name) {

        const v = object[name];

        if (v !== undefined) this.setValue(gl, name, v);

    }

    static upload(gl, seq, values, textures) {

        for (let i = 0, n = seq.length; i !== n; ++i) {

            const u = seq[i],
                v = values[u.id];

            if (v.needsUpdate !== false) {

                // note: always updating when .needsUpdate is undefined
                u.setValue(gl, v.value, textures);

            }

        }

    }

    static seqWithValue(seq, values) {

        const r = [];

        for (let i = 0, n = seq.length; i !== n; ++i) {

            const u = seq[i];
            if (u.id in values) r.push(u);

        }

        return r;

    }

}

const UniformsLib = {

    common: {

        diffuse: { value: /*@__PURE__*/ new Color(0xffffff) },
        opacity: { value: 1.0 },

        map: { value: null },
        mapTransform: { value: /*@__PURE__*/ new Matrix3() },

        alphaMap: { value: null },
        alphaMapTransform: { value: /*@__PURE__*/ new Matrix3() },

        alphaTest: { value: 0 }

    },

    specularmap: {

        specularMap: { value: null },
        specularMapTransform: { value: /*@__PURE__*/ new Matrix3() }

    },

    envmap: {

        envMap: { value: null },
        flipEnvMap: { value: - 1 },
        reflectivity: { value: 1.0 }, // basic, lambert, phong
        ior: { value: 1.5 }, // physical
        refractionRatio: { value: 0.98 }, // basic, lambert, phong

    },

    aomap: {

        aoMap: { value: null },
        aoMapIntensity: { value: 1 },
        aoMapTransform: { value: /*@__PURE__*/ new Matrix3() }

    },

    lightmap: {

        lightMap: { value: null },
        lightMapIntensity: { value: 1 },
        lightMapTransform: { value: /*@__PURE__*/ new Matrix3() }

    },

    bumpmap: {

        bumpMap: { value: null },
        bumpMapTransform: { value: /*@__PURE__*/ new Matrix3() },
        bumpScale: { value: 1 }

    },

    normalmap: {

        normalMap: { value: null },
        normalMapTransform: { value: /*@__PURE__*/ new Matrix3() },
        normalScale: { value: /*@__PURE__*/ new Vector2(1, 1) }

    },

    displacementmap: {

        displacementMap: { value: null },
        displacementMapTransform: { value: /*@__PURE__*/ new Matrix3() },
        displacementScale: { value: 1 },
        displacementBias: { value: 0 }

    },

    emissivemap: {

        emissiveMap: { value: null },
        emissiveMapTransform: { value: /*@__PURE__*/ new Matrix3() }

    },

    metalnessmap: {

        metalnessMap: { value: null },
        metalnessMapTransform: { value: /*@__PURE__*/ new Matrix3() }

    },

    roughnessmap: {

        roughnessMap: { value: null },
        roughnessMapTransform: { value: /*@__PURE__*/ new Matrix3() }

    },

    gradientmap: {

        gradientMap: { value: null }

    },

    fog: {

        fogDensity: { value: 0.00025 },
        fogNear: { value: 1 },
        fogFar: { value: 2000 },
        fogColor: { value: /*@__PURE__*/ new Color(0xffffff) }

    },

    lights: {

        ambientLightColor: { value: [] },

        lightProbe: { value: [] },

        directionalLights: {
            value: [], properties: {
                direction: {},
                color: {}
            }
        },

        directionalLightShadows: {
            value: [], properties: {
                shadowBias: {},
                shadowNormalBias: {},
                shadowRadius: {},
                shadowMapSize: {}
            }
        },

        directionalShadowMap: { value: [] },
        directionalShadowMatrix: { value: [] },

        spotLights: {
            value: [], properties: {
                color: {},
                position: {},
                direction: {},
                distance: {},
                coneCos: {},
                penumbraCos: {},
                decay: {}
            }
        },

        spotLightShadows: {
            value: [], properties: {
                shadowBias: {},
                shadowNormalBias: {},
                shadowRadius: {},
                shadowMapSize: {}
            }
        },

        spotLightMap: { value: [] },
        spotShadowMap: { value: [] },
        spotLightMatrix: { value: [] },

        pointLights: {
            value: [], properties: {
                color: {},
                position: {},
                decay: {},
                distance: {}
            }
        },

        pointLightShadows: {
            value: [], properties: {
                shadowBias: {},
                shadowNormalBias: {},
                shadowRadius: {},
                shadowMapSize: {},
                shadowCameraNear: {},
                shadowCameraFar: {}
            }
        },

        pointShadowMap: { value: [] },
        pointShadowMatrix: { value: [] },

        hemisphereLights: {
            value: [], properties: {
                direction: {},
                skyColor: {},
                groundColor: {}
            }
        },

        // TODO (abelnation): RectAreaLight BRDF data needs to be moved from example to main src
        rectAreaLights: {
            value: [], properties: {
                color: {},
                position: {},
                width: {},
                height: {}
            }
        },

        ltc_1: { value: null },
        ltc_2: { value: null }

    },

    points: {

        diffuse: { value: /*@__PURE__*/ new Color(0xffffff) },
        opacity: { value: 1.0 },
        size: { value: 1.0 },
        scale: { value: 1.0 },
        map: { value: null },
        alphaMap: { value: null },
        alphaMapTransform: { value: /*@__PURE__*/ new Matrix3() },
        alphaTest: { value: 0 },
        uvTransform: { value: /*@__PURE__*/ new Matrix3() }

    },

    sprite: {

        diffuse: { value: /*@__PURE__*/ new Color(0xffffff) },
        opacity: { value: 1.0 },
        center: { value: /*@__PURE__*/ new Vector2(0.5, 0.5) },
        rotation: { value: 0.0 },
        map: { value: null },
        mapTransform: { value: /*@__PURE__*/ new Matrix3() },
        alphaMap: { value: null },
        alphaMapTransform: { value: /*@__PURE__*/ new Matrix3() },
        alphaTest: { value: 0 }

    }

};

const ShaderLib = {

    basic: {

        uniforms: /*@__PURE__*/ mergeUniforms([
            UniformsLib.common,
            UniformsLib.specularmap,
            UniformsLib.envmap,
            UniformsLib.aomap,
            UniformsLib.lightmap,
            UniformsLib.fog
        ]),

        vertexShader: ShaderChunk.meshbasic_vert,
        fragmentShader: ShaderChunk.meshbasic_frag

    },

    lambert: {

        uniforms: /*@__PURE__*/ mergeUniforms([
            UniformsLib.common,
            UniformsLib.specularmap,
            UniformsLib.envmap,
            UniformsLib.aomap,
            UniformsLib.lightmap,
            UniformsLib.emissivemap,
            UniformsLib.bumpmap,
            UniformsLib.normalmap,
            UniformsLib.displacementmap,
            UniformsLib.fog,
            UniformsLib.lights,
            {
                emissive: { value: /*@__PURE__*/ new Color(0x000000) }
            }
        ]),

        vertexShader: ShaderChunk.meshlambert_vert,
        fragmentShader: ShaderChunk.meshlambert_frag

    },

    phong: {

        uniforms: /*@__PURE__*/ mergeUniforms([
            UniformsLib.common,
            UniformsLib.specularmap,
            UniformsLib.envmap,
            UniformsLib.aomap,
            UniformsLib.lightmap,
            UniformsLib.emissivemap,
            UniformsLib.bumpmap,
            UniformsLib.normalmap,
            UniformsLib.displacementmap,
            UniformsLib.fog,
            UniformsLib.lights,
            {
                emissive: { value: /*@__PURE__*/ new Color(0x000000) },
                specular: { value: /*@__PURE__*/ new Color(0x111111) },
                shininess: { value: 30 }
            }
        ]),

        vertexShader: ShaderChunk.meshphong_vert,
        fragmentShader: ShaderChunk.meshphong_frag

    },

    standard: {

        uniforms: /*@__PURE__*/ mergeUniforms([
            UniformsLib.common,
            UniformsLib.envmap,
            UniformsLib.aomap,
            UniformsLib.lightmap,
            UniformsLib.emissivemap,
            UniformsLib.bumpmap,
            UniformsLib.normalmap,
            UniformsLib.displacementmap,
            UniformsLib.roughnessmap,
            UniformsLib.metalnessmap,
            UniformsLib.fog,
            UniformsLib.lights,
            {
                emissive: { value: /*@__PURE__*/ new Color(0x000000) },
                roughness: { value: 1.0 },
                metalness: { value: 0.0 },
                envMapIntensity: { value: 1 } // temporary
            }
        ]),

        vertexShader: ShaderChunk.meshphysical_vert,
        fragmentShader: ShaderChunk.meshphysical_frag

    },

    toon: {

        uniforms: /*@__PURE__*/ mergeUniforms([
            UniformsLib.common,
            UniformsLib.aomap,
            UniformsLib.lightmap,
            UniformsLib.emissivemap,
            UniformsLib.bumpmap,
            UniformsLib.normalmap,
            UniformsLib.displacementmap,
            UniformsLib.gradientmap,
            UniformsLib.fog,
            UniformsLib.lights,
            {
                emissive: { value: /*@__PURE__*/ new Color(0x000000) }
            }
        ]),

        vertexShader: ShaderChunk.meshtoon_vert,
        fragmentShader: ShaderChunk.meshtoon_frag

    },

    matcap: {

        uniforms: /*@__PURE__*/ mergeUniforms([
            UniformsLib.common,
            UniformsLib.bumpmap,
            UniformsLib.normalmap,
            UniformsLib.displacementmap,
            UniformsLib.fog,
            {
                matcap: { value: null }
            }
        ]),

        vertexShader: ShaderChunk.meshmatcap_vert,
        fragmentShader: ShaderChunk.meshmatcap_frag

    },

    points: {

        uniforms: /*@__PURE__*/ mergeUniforms([
            UniformsLib.points,
            UniformsLib.fog
        ]),

        vertexShader: ShaderChunk.points_vert,
        fragmentShader: ShaderChunk.points_frag

    },

    dashed: {

        uniforms: /*@__PURE__*/ mergeUniforms([
            UniformsLib.common,
            UniformsLib.fog,
            {
                scale: { value: 1 },
                dashSize: { value: 1 },
                totalSize: { value: 2 }
            }
        ]),

        vertexShader: ShaderChunk.linedashed_vert,
        fragmentShader: ShaderChunk.linedashed_frag

    },

    depth: {

        uniforms: /*@__PURE__*/ mergeUniforms([
            UniformsLib.common,
            UniformsLib.displacementmap
        ]),

        vertexShader: ShaderChunk.depth_vert,
        fragmentShader: ShaderChunk.depth_frag

    },

    normal: {

        uniforms: /*@__PURE__*/ mergeUniforms([
            UniformsLib.common,
            UniformsLib.bumpmap,
            UniformsLib.normalmap,
            UniformsLib.displacementmap,
            {
                opacity: { value: 1.0 }
            }
        ]),

        vertexShader: ShaderChunk.meshnormal_vert,
        fragmentShader: ShaderChunk.meshnormal_frag

    },

    sprite: {

        uniforms: /*@__PURE__*/ mergeUniforms([
            UniformsLib.sprite,
            UniformsLib.fog
        ]),

        vertexShader: ShaderChunk.sprite_vert,
        fragmentShader: ShaderChunk.sprite_frag

    },

    background: {

        uniforms: {
            uvTransform: { value: /*@__PURE__*/ new Matrix3() },
            t2D: { value: null },
            backgroundIntensity: { value: 1 }
        },

        vertexShader: ShaderChunk.background_vert,
        fragmentShader: ShaderChunk.background_frag

    },

    backgroundCube: {

        uniforms: {
            envMap: { value: null },
            flipEnvMap: { value: - 1 },
            backgroundBlurriness: { value: 0 },
            backgroundIntensity: { value: 1 }
        },

        vertexShader: ShaderChunk.backgroundCube_vert,
        fragmentShader: ShaderChunk.backgroundCube_frag

    },

    cube: {

        uniforms: {
            tCube: { value: null },
            tFlip: { value: - 1 },
            opacity: { value: 1.0 }
        },

        vertexShader: ShaderChunk.cube_vert,
        fragmentShader: ShaderChunk.cube_frag

    },

    equirect: {

        uniforms: {
            tEquirect: { value: null },
        },

        vertexShader: ShaderChunk.equirect_vert,
        fragmentShader: ShaderChunk.equirect_frag

    },

    distanceRGBA: {

        uniforms: /*@__PURE__*/ mergeUniforms([
            UniformsLib.common,
            UniformsLib.displacementmap,
            {
                referencePosition: { value: /*@__PURE__*/ new Vector3() },
                nearDistance: { value: 1 },
                farDistance: { value: 1000 }
            }
        ]),

        vertexShader: ShaderChunk.distanceRGBA_vert,
        fragmentShader: ShaderChunk.distanceRGBA_frag

    },

    shadow: {

        uniforms: /*@__PURE__*/ mergeUniforms([
            UniformsLib.lights,
            UniformsLib.fog,
            {
                color: { value: /*@__PURE__*/ new Color(0x00000) },
                opacity: { value: 1.0 }
            },
        ]),

        vertexShader: ShaderChunk.shadow_vert,
        fragmentShader: ShaderChunk.shadow_frag

    }

};


function setup(object, material, program, geometry, index) {
    let updateBuffers = false;
    if (vaoAvailable) {
        const state = getBindingState(geometry, program, material);
        if (currentState !== state) {
            currentState = state;
            bindVertexArrayObject(currentState.object);
        }
        updateBuffers = needsUpdate(object, geometry, program, index); // 拿programe里的atts 对比 geometry和cache（currentState）的attrs
        if (updateBuffers) saveCache(object, geometry, program, index);
    } else {
        const wireframe = (material.wireframe === true);
        if (currentState.geometry !== geometry.id ||
            currentState.program !== program.id ||
            currentState.wireframe !== wireframe) {
            currentState.geometry = geometry.id;
            currentState.program = program.id;
            currentState.wireframe = wireframe;
            updateBuffers = true;
        }
    }

    if (index !== null) {
        attributes.update(index, gl.ELEMENT_ARRAY_BUFFER);
    }
    if (updateBuffers || forceUpdate) {
        forceUpdate = false;
        setupVertexAttributes(object, material, program, geometry);
        if (index !== null) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, attributes.get(index).buffer);
        }
    }
}

function getBindingState(geometry, program, material) {

    const wireframe = (material.wireframe === true);

    let programMap = bindingStates[geometry.id];

    if (programMap === undefined) {

        programMap = {};
        bindingStates[geometry.id] = programMap;

    }

    let stateMap = programMap[program.id];

    if (stateMap === undefined) {

        stateMap = {};
        programMap[program.id] = stateMap;

    }

    let state = stateMap[wireframe];

    if (state === undefined) {

        state = createBindingState(createVertexArrayObject());
        stateMap[wireframe] = state;

    }

    return state;

}


function WebGLBindingStates(gl, extensions, attributes, capabilities) {

    const maxVertexAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);

    const extension = capabilities.isWebGL2 ? null : extensions.get('OES_vertex_array_object');
    const vaoAvailable = capabilities.isWebGL2 || extension !== null;

    const bindingStates = {};

    const defaultState = createBindingState(null);
    let currentState = defaultState;
    let forceUpdate = false;

    function setup(object, material, program, geometry, index) {

        let updateBuffers = false;

        if (vaoAvailable) {

            const state = getBindingState(geometry, program, material);

            if (currentState !== state) {

                currentState = state;
                bindVertexArrayObject(currentState.object);

            }

            updateBuffers = needsUpdate(object, geometry, program, index);

            if (updateBuffers) saveCache(object, geometry, program, index);

        } else {

            const wireframe = (material.wireframe === true);

            if (currentState.geometry !== geometry.id ||
                currentState.program !== program.id ||
                currentState.wireframe !== wireframe) {

                currentState.geometry = geometry.id;
                currentState.program = program.id;
                currentState.wireframe = wireframe;

                updateBuffers = true;

            }

        }

        if (index !== null) {

            attributes.update(index, gl.ELEMENT_ARRAY_BUFFER);

        }

        if (updateBuffers || forceUpdate) {

            forceUpdate = false;

            setupVertexAttributes(object, material, program, geometry);

            if (index !== null) {

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, attributes.get(index).buffer);

            }

        }

    }

    function createVertexArrayObject() {
        // 它代表一个指向顶点数组数据的顶点数组对象（vertex array object (VAO) ），并为不同的顶点数据集提供名称
        // calls to bindBuffer or vertexAttribPointer which will be "recorded" in the VAO
        if (capabilities.isWebGL2) return gl.createVertexArray();

        return extension.createVertexArrayOES();

    }

    function bindVertexArrayObject(vao) {

        if (capabilities.isWebGL2) return gl.bindVertexArray(vao); //  binds a passed WebGLVertexArrayObject object to the buffer.

        return extension.bindVertexArrayOES(vao);

    }

    function deleteVertexArrayObject(vao) {

        if (capabilities.isWebGL2) return gl.deleteVertexArray(vao);

        return extension.deleteVertexArrayOES(vao);

    }

    function getBindingState(geometry, program, material) {

        const wireframe = (material.wireframe === true);

        let programMap = bindingStates[geometry.id];

        if (programMap === undefined) {

            programMap = {};
            bindingStates[geometry.id] = programMap;

        }

        let stateMap = programMap[program.id];

        if (stateMap === undefined) {

            stateMap = {};
            programMap[program.id] = stateMap;

        }

        let state = stateMap[wireframe];

        if (state === undefined) {

            state = createBindingState(createVertexArrayObject());
            stateMap[wireframe] = state;

        }

        return state;

    }

    function createBindingState(vao) {

        const newAttributes = [];
        const enabledAttributes = [];
        const attributeDivisors = [];

        for (let i = 0; i < maxVertexAttributes; i++) {

            newAttributes[i] = 0;
            enabledAttributes[i] = 0;
            attributeDivisors[i] = 0;

        }

        return {

            // for backward compatibility on non-VAO support browser
            geometry: null,
            program: null,
            wireframe: false,

            newAttributes: newAttributes,
            enabledAttributes: enabledAttributes,
            attributeDivisors: attributeDivisors,
            object: vao,
            attributes: {},
            index: null

        };

    }

    function needsUpdate(object, geometry, program, index) {

        const cachedAttributes = currentState.attributes;
        const geometryAttributes = geometry.attributes;

        let attributesNum = 0;

        const programAttributes = program.getAttributes();

        for (const name in programAttributes) {

            const programAttribute = programAttributes[name];

            if (programAttribute.location >= 0) {

                const cachedAttribute = cachedAttributes[name];
                let geometryAttribute = geometryAttributes[name];

                if (geometryAttribute === undefined) {

                    if (name === 'instanceMatrix' && object.instanceMatrix) geometryAttribute = object.instanceMatrix;
                    if (name === 'instanceColor' && object.instanceColor) geometryAttribute = object.instanceColor;

                }

                if (cachedAttribute === undefined) return true;

                if (cachedAttribute.attribute !== geometryAttribute) return true;

                if (geometryAttribute && cachedAttribute.data !== geometryAttribute.data) return true;

                attributesNum++;

            }

        }

        if (currentState.attributesNum !== attributesNum) return true;

        if (currentState.index !== index) return true;

        return false;

    }

    function saveCache(object, geometry, program, index) {

        const cache = {};
        const attributes = geometry.attributes;
        let attributesNum = 0;

        const programAttributes = program.getAttributes();

        for (const name in programAttributes) {

            const programAttribute = programAttributes[name];

            if (programAttribute.location >= 0) {

                let attribute = attributes[name];

                if (attribute === undefined) {

                    if (name === 'instanceMatrix' && object.instanceMatrix) attribute = object.instanceMatrix;
                    if (name === 'instanceColor' && object.instanceColor) attribute = object.instanceColor;

                }

                const data = {};
                data.attribute = attribute;

                if (attribute && attribute.data) {

                    data.data = attribute.data;

                }

                cache[name] = data;

                attributesNum++;

            }

        }

        currentState.attributes = cache;
        currentState.attributesNum = attributesNum;

        currentState.index = index;

    }

    function initAttributes() {

        const newAttributes = currentState.newAttributes;

        for (let i = 0, il = newAttributes.length; i < il; i++) {

            newAttributes[i] = 0;

        }

    }

    function enableAttribute(attribute) {

        enableAttributeAndDivisor(attribute, 0);

    }

    function enableAttributeAndDivisor(attribute, meshPerAttribute) {

        const newAttributes = currentState.newAttributes;
        const enabledAttributes = currentState.enabledAttributes;
        const attributeDivisors = currentState.attributeDivisors;

        newAttributes[attribute] = 1;

        if (enabledAttributes[attribute] === 0) {

            gl.enableVertexAttribArray(attribute);
            enabledAttributes[attribute] = 1;

        }

        if (attributeDivisors[attribute] !== meshPerAttribute) {

            const extension = capabilities.isWebGL2 ? gl : extensions.get('ANGLE_instanced_arrays');

            extension[capabilities.isWebGL2 ? 'vertexAttribDivisor' : 'vertexAttribDivisorANGLE'](attribute, meshPerAttribute);
            attributeDivisors[attribute] = meshPerAttribute;

        }

    }

    function disableUnusedAttributes() {

        const newAttributes = currentState.newAttributes;
        const enabledAttributes = currentState.enabledAttributes;

        for (let i = 0, il = enabledAttributes.length; i < il; i++) {

            if (enabledAttributes[i] !== newAttributes[i]) {

                gl.disableVertexAttribArray(i);
                enabledAttributes[i] = 0;

            }

        }

    }

    function vertexAttribPointer(index, size, type, normalized, stride, offset, integer) {

        if (integer === true) {

            gl.vertexAttribIPointer(index, size, type, stride, offset);

        } else {

            gl.vertexAttribPointer(index, size, type, normalized, stride, offset);

        }

    }

    function setupVertexAttributes(object, material, program, geometry) {

        if (capabilities.isWebGL2 === false && (object.isInstancedMesh || geometry.isInstancedBufferGeometry)) {

            if (extensions.get('ANGLE_instanced_arrays') === null) return;

        }

        initAttributes();

        const geometryAttributes = geometry.attributes;

        const programAttributes = program.getAttributes();

        const materialDefaultAttributeValues = material.defaultAttributeValues;

        for (const name in programAttributes) {

            const programAttribute = programAttributes[name];

            if (programAttribute.location >= 0) {

                let geometryAttribute = geometryAttributes[name];

                if (geometryAttribute === undefined) {

                    if (name === 'instanceMatrix' && object.instanceMatrix) geometryAttribute = object.instanceMatrix;
                    if (name === 'instanceColor' && object.instanceColor) geometryAttribute = object.instanceColor;

                }

                if (geometryAttribute !== undefined) {

                    const normalized = geometryAttribute.normalized;
                    const size = geometryAttribute.itemSize;

                    const attribute = attributes.get(geometryAttribute);

                    // TODO Attribute may not be available on context restore

                    if (attribute === undefined) continue;

                    const buffer = attribute.buffer;
                    const type = attribute.type;
                    const bytesPerElement = attribute.bytesPerElement;

                    // check for integer attributes (WebGL 2 only)

                    const integer = (capabilities.isWebGL2 === true && (type === gl.INT || type === gl.UNSIGNED_INT || geometryAttribute.gpuType === IntType));

                    if (geometryAttribute.isInterleavedBufferAttribute) {

                        const data = geometryAttribute.data;
                        const stride = data.stride;
                        const offset = geometryAttribute.offset;

                        if (data.isInstancedInterleavedBuffer) {

                            for (let i = 0; i < programAttribute.locationSize; i++) {

                                enableAttributeAndDivisor(programAttribute.location + i, data.meshPerAttribute);

                            }

                            if (object.isInstancedMesh !== true && geometry._maxInstanceCount === undefined) {

                                geometry._maxInstanceCount = data.meshPerAttribute * data.count;

                            }

                        } else {

                            for (let i = 0; i < programAttribute.locationSize; i++) {

                                enableAttribute(programAttribute.location + i);

                            }

                        }

                        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

                        for (let i = 0; i < programAttribute.locationSize; i++) {

                            vertexAttribPointer(
                                programAttribute.location + i,
                                size / programAttribute.locationSize,
                                type,
                                normalized,
                                stride * bytesPerElement,
                                (offset + (size / programAttribute.locationSize) * i) * bytesPerElement,
                                integer
                            );

                        }

                    } else {

                        if (geometryAttribute.isInstancedBufferAttribute) {

                            for (let i = 0; i < programAttribute.locationSize; i++) {

                                enableAttributeAndDivisor(programAttribute.location + i, geometryAttribute.meshPerAttribute);

                            }

                            if (object.isInstancedMesh !== true && geometry._maxInstanceCount === undefined) {

                                geometry._maxInstanceCount = geometryAttribute.meshPerAttribute * geometryAttribute.count;

                            }

                        } else {

                            for (let i = 0; i < programAttribute.locationSize; i++) {

                                enableAttribute(programAttribute.location + i);

                            }

                        }

                        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

                        for (let i = 0; i < programAttribute.locationSize; i++) {

                            vertexAttribPointer(
                                programAttribute.location + i,
                                size / programAttribute.locationSize,
                                type,
                                normalized,
                                size * bytesPerElement,
                                (size / programAttribute.locationSize) * i * bytesPerElement,
                                integer
                            );

                        }

                    }

                } else if (materialDefaultAttributeValues !== undefined) {

                    const value = materialDefaultAttributeValues[name];

                    if (value !== undefined) {

                        switch (value.length) {

                            case 2:
                                gl.vertexAttrib2fv(programAttribute.location, value);
                                break;

                            case 3:
                                gl.vertexAttrib3fv(programAttribute.location, value);
                                break;

                            case 4:
                                gl.vertexAttrib4fv(programAttribute.location, value);
                                break;

                            default:
                                gl.vertexAttrib1fv(programAttribute.location, value);

                        }

                    }

                }

            }

        }

        disableUnusedAttributes();

    }

    function dispose() {

        reset();

        for (const geometryId in bindingStates) {

            const programMap = bindingStates[geometryId];

            for (const programId in programMap) {

                const stateMap = programMap[programId];

                for (const wireframe in stateMap) {

                    deleteVertexArrayObject(stateMap[wireframe].object);

                    delete stateMap[wireframe];

                }

                delete programMap[programId];

            }

            delete bindingStates[geometryId];

        }

    }

    function releaseStatesOfGeometry(geometry) {

        if (bindingStates[geometry.id] === undefined) return;

        const programMap = bindingStates[geometry.id];

        for (const programId in programMap) {

            const stateMap = programMap[programId];

            for (const wireframe in stateMap) {

                deleteVertexArrayObject(stateMap[wireframe].object);

                delete stateMap[wireframe];

            }

            delete programMap[programId];

        }

        delete bindingStates[geometry.id];

    }

    function releaseStatesOfProgram(program) {

        for (const geometryId in bindingStates) {

            const programMap = bindingStates[geometryId];

            if (programMap[program.id] === undefined) continue;

            const stateMap = programMap[program.id];

            for (const wireframe in stateMap) {

                deleteVertexArrayObject(stateMap[wireframe].object);

                delete stateMap[wireframe];

            }

            delete programMap[program.id];

        }

    }

    function reset() {

        resetDefaultState();
        forceUpdate = true;

        if (currentState === defaultState) return;

        currentState = defaultState;
        bindVertexArrayObject(currentState.object);

    }

    // for backward-compatibility

    function resetDefaultState() {

        defaultState.geometry = null;
        defaultState.program = null;
        defaultState.wireframe = false;

    }

    return {

        setup: setup,
        reset: reset,
        resetDefaultState: resetDefaultState,
        dispose: dispose,
        releaseStatesOfGeometry: releaseStatesOfGeometry,
        releaseStatesOfProgram: releaseStatesOfProgram,

        initAttributes: initAttributes,
        enableAttribute: enableAttribute,
        disableUnusedAttributes: disableUnusedAttributes

    };

}

function setMaterial(material, frontFaceCW) {

    material.side === DoubleSide
        ? disable(gl.CULL_FACE)
        : enable(gl.CULL_FACE);

    let flipSided = (material.side === BackSide);
    if (frontFaceCW) flipSided = !flipSided;

    setFlipSided(flipSided);

    (material.blending === NormalBlending && material.transparent === false)
        ? setBlending(NoBlending)
        : setBlending(material.blending, material.blendEquation, material.blendSrc, material.blendDst, material.blendEquationAlpha, material.blendSrcAlpha, material.blendDstAlpha, material.premultipliedAlpha);

    depthBuffer.setFunc(material.depthFunc);
    depthBuffer.setTest(material.depthTest);
    depthBuffer.setMask(material.depthWrite);
    colorBuffer.setMask(material.colorWrite);

    const stencilWrite = material.stencilWrite;
    stencilBuffer.setTest(stencilWrite);
    if (stencilWrite) {

        stencilBuffer.setMask(material.stencilWriteMask);
        stencilBuffer.setFunc(material.stencilFunc, material.stencilRef, material.stencilFuncMask);
        stencilBuffer.setOp(material.stencilFail, material.stencilZFail, material.stencilZPass);

    }

    setPolygonOffset(material.polygonOffset, material.polygonOffsetFactor, material.polygonOffsetUnits);

    material.alphaToCoverage === true
        ? enable(gl.SAMPLE_ALPHA_TO_COVERAGE)
        : disable(gl.SAMPLE_ALPHA_TO_COVERAGE);

}

function fetchAttributeLocations(gl, program) {

    const attributes = {};

    const n = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

    for (let i = 0; i < n; i++) {

        const info = gl.getActiveAttrib(program, i);
        const name = info.name;

        let locationSize = 1;
        if (info.type === gl.FLOAT_MAT2) locationSize = 2;
        if (info.type === gl.FLOAT_MAT3) locationSize = 3;
        if (info.type === gl.FLOAT_MAT4) locationSize = 4;

        // console.log( 'THREE.WebGLProgram: ACTIVE VERTEX ATTRIBUTE:', name, i );

        attributes[name] = {
            type: info.type,
            location: gl.getAttribLocation(program, name),
            locationSize: locationSize
        };

    }

    return attributes;

}

function WebGLProgram(renderer, cacheKey, parameters, bindingStates) {

    // TODO Send this event to Three.js DevTools
    // console.log( 'WebGLProgram', cacheKey );

    const gl = renderer.getContext();

    const defines = parameters.defines;

    let vertexShader = parameters.vertexShader;
    let fragmentShader = parameters.fragmentShader;

    const shadowMapTypeDefine = generateShadowMapTypeDefine(parameters);
    const envMapTypeDefine = generateEnvMapTypeDefine(parameters);
    const envMapModeDefine = generateEnvMapModeDefine(parameters);
    const envMapBlendingDefine = generateEnvMapBlendingDefine(parameters);
    const envMapCubeUVSize = generateCubeUVSize(parameters);

    const customExtensions = parameters.isWebGL2 ? '' : generateExtensions(parameters);

    const customDefines = generateDefines(defines);

    const program = gl.createProgram();

    let prefixVertex, prefixFragment;
    let versionString = parameters.glslVersion ? '#version ' + parameters.glslVersion + '\n' : '';

    if (parameters.isRawShaderMaterial) {

        prefixVertex = [

            '#define SHADER_TYPE ' + parameters.shaderType,
            '#define SHADER_NAME ' + parameters.shaderName,

            customDefines

        ].filter(filterEmptyLine).join('\n');

        if (prefixVertex.length > 0) {

            prefixVertex += '\n';

        }

        prefixFragment = [

            customExtensions,

            '#define SHADER_TYPE ' + parameters.shaderType,
            '#define SHADER_NAME ' + parameters.shaderName,

            customDefines

        ].filter(filterEmptyLine).join('\n');

        if (prefixFragment.length > 0) {

            prefixFragment += '\n';

        }

    } else {

        prefixVertex = [

            generatePrecision(parameters),

            '#define SHADER_TYPE ' + parameters.shaderType,
            '#define SHADER_NAME ' + parameters.shaderName,

            customDefines,

            parameters.instancing ? '#define USE_INSTANCING' : '',
            parameters.instancingColor ? '#define USE_INSTANCING_COLOR' : '',

            parameters.useFog && parameters.fog ? '#define USE_FOG' : '',
            parameters.useFog && parameters.fogExp2 ? '#define FOG_EXP2' : '',

            parameters.map ? '#define USE_MAP' : '',
            parameters.envMap ? '#define USE_ENVMAP' : '',
            parameters.envMap ? '#define ' + envMapModeDefine : '',
            parameters.lightMap ? '#define USE_LIGHTMAP' : '',
            parameters.aoMap ? '#define USE_AOMAP' : '',
            parameters.bumpMap ? '#define USE_BUMPMAP' : '',
            parameters.normalMap ? '#define USE_NORMALMAP' : '',
            parameters.normalMapObjectSpace ? '#define USE_NORMALMAP_OBJECTSPACE' : '',
            parameters.normalMapTangentSpace ? '#define USE_NORMALMAP_TANGENTSPACE' : '',
            parameters.displacementMap ? '#define USE_DISPLACEMENTMAP' : '',
            parameters.emissiveMap ? '#define USE_EMISSIVEMAP' : '',

            parameters.anisotropy ? '#define USE_ANISOTROPY' : '',
            parameters.anisotropyMap ? '#define USE_ANISOTROPYMAP' : '',

            parameters.clearcoatMap ? '#define USE_CLEARCOATMAP' : '',
            parameters.clearcoatRoughnessMap ? '#define USE_CLEARCOAT_ROUGHNESSMAP' : '',
            parameters.clearcoatNormalMap ? '#define USE_CLEARCOAT_NORMALMAP' : '',

            parameters.iridescenceMap ? '#define USE_IRIDESCENCEMAP' : '',
            parameters.iridescenceThicknessMap ? '#define USE_IRIDESCENCE_THICKNESSMAP' : '',

            parameters.specularMap ? '#define USE_SPECULARMAP' : '',
            parameters.specularColorMap ? '#define USE_SPECULAR_COLORMAP' : '',
            parameters.specularIntensityMap ? '#define USE_SPECULAR_INTENSITYMAP' : '',

            parameters.roughnessMap ? '#define USE_ROUGHNESSMAP' : '',
            parameters.metalnessMap ? '#define USE_METALNESSMAP' : '',
            parameters.alphaMap ? '#define USE_ALPHAMAP' : '',
            parameters.alphaHash ? '#define USE_ALPHAHASH' : '',

            parameters.transmission ? '#define USE_TRANSMISSION' : '',
            parameters.transmissionMap ? '#define USE_TRANSMISSIONMAP' : '',
            parameters.thicknessMap ? '#define USE_THICKNESSMAP' : '',

            parameters.sheenColorMap ? '#define USE_SHEEN_COLORMAP' : '',
            parameters.sheenRoughnessMap ? '#define USE_SHEEN_ROUGHNESSMAP' : '',

            //

            parameters.mapUv ? '#define MAP_UV ' + parameters.mapUv : '',
            parameters.alphaMapUv ? '#define ALPHAMAP_UV ' + parameters.alphaMapUv : '',
            parameters.lightMapUv ? '#define LIGHTMAP_UV ' + parameters.lightMapUv : '',
            parameters.aoMapUv ? '#define AOMAP_UV ' + parameters.aoMapUv : '',
            parameters.emissiveMapUv ? '#define EMISSIVEMAP_UV ' + parameters.emissiveMapUv : '',
            parameters.bumpMapUv ? '#define BUMPMAP_UV ' + parameters.bumpMapUv : '',
            parameters.normalMapUv ? '#define NORMALMAP_UV ' + parameters.normalMapUv : '',
            parameters.displacementMapUv ? '#define DISPLACEMENTMAP_UV ' + parameters.displacementMapUv : '',

            parameters.metalnessMapUv ? '#define METALNESSMAP_UV ' + parameters.metalnessMapUv : '',
            parameters.roughnessMapUv ? '#define ROUGHNESSMAP_UV ' + parameters.roughnessMapUv : '',

            parameters.anisotropyMapUv ? '#define ANISOTROPYMAP_UV ' + parameters.anisotropyMapUv : '',

            parameters.clearcoatMapUv ? '#define CLEARCOATMAP_UV ' + parameters.clearcoatMapUv : '',
            parameters.clearcoatNormalMapUv ? '#define CLEARCOAT_NORMALMAP_UV ' + parameters.clearcoatNormalMapUv : '',
            parameters.clearcoatRoughnessMapUv ? '#define CLEARCOAT_ROUGHNESSMAP_UV ' + parameters.clearcoatRoughnessMapUv : '',

            parameters.iridescenceMapUv ? '#define IRIDESCENCEMAP_UV ' + parameters.iridescenceMapUv : '',
            parameters.iridescenceThicknessMapUv ? '#define IRIDESCENCE_THICKNESSMAP_UV ' + parameters.iridescenceThicknessMapUv : '',

            parameters.sheenColorMapUv ? '#define SHEEN_COLORMAP_UV ' + parameters.sheenColorMapUv : '',
            parameters.sheenRoughnessMapUv ? '#define SHEEN_ROUGHNESSMAP_UV ' + parameters.sheenRoughnessMapUv : '',

            parameters.specularMapUv ? '#define SPECULARMAP_UV ' + parameters.specularMapUv : '',
            parameters.specularColorMapUv ? '#define SPECULAR_COLORMAP_UV ' + parameters.specularColorMapUv : '',
            parameters.specularIntensityMapUv ? '#define SPECULAR_INTENSITYMAP_UV ' + parameters.specularIntensityMapUv : '',

            parameters.transmissionMapUv ? '#define TRANSMISSIONMAP_UV ' + parameters.transmissionMapUv : '',
            parameters.thicknessMapUv ? '#define THICKNESSMAP_UV ' + parameters.thicknessMapUv : '',

            //

            parameters.vertexTangents && parameters.flatShading === false ? '#define USE_TANGENT' : '',
            parameters.vertexColors ? '#define USE_COLOR' : '',
            parameters.vertexAlphas ? '#define USE_COLOR_ALPHA' : '',
            parameters.vertexUv1s ? '#define USE_UV1' : '',
            parameters.vertexUv2s ? '#define USE_UV2' : '',
            parameters.vertexUv3s ? '#define USE_UV3' : '',

            parameters.pointsUvs ? '#define USE_POINTS_UV' : '',

            parameters.flatShading ? '#define FLAT_SHADED' : '',

            parameters.skinning ? '#define USE_SKINNING' : '',

            parameters.morphTargets ? '#define USE_MORPHTARGETS' : '',
            parameters.morphNormals && parameters.flatShading === false ? '#define USE_MORPHNORMALS' : '',
            (parameters.morphColors && parameters.isWebGL2) ? '#define USE_MORPHCOLORS' : '',
            (parameters.morphTargetsCount > 0 && parameters.isWebGL2) ? '#define MORPHTARGETS_TEXTURE' : '',
            (parameters.morphTargetsCount > 0 && parameters.isWebGL2) ? '#define MORPHTARGETS_TEXTURE_STRIDE ' + parameters.morphTextureStride : '',
            (parameters.morphTargetsCount > 0 && parameters.isWebGL2) ? '#define MORPHTARGETS_COUNT ' + parameters.morphTargetsCount : '',
            parameters.doubleSided ? '#define DOUBLE_SIDED' : '',
            parameters.flipSided ? '#define FLIP_SIDED' : '',

            parameters.shadowMapEnabled ? '#define USE_SHADOWMAP' : '',
            parameters.shadowMapEnabled ? '#define ' + shadowMapTypeDefine : '',

            parameters.sizeAttenuation ? '#define USE_SIZEATTENUATION' : '',

            parameters.numLightProbes > 0 ? '#define USE_LIGHT_PROBES' : '',

            parameters.useLegacyLights ? '#define LEGACY_LIGHTS' : '',

            parameters.logarithmicDepthBuffer ? '#define USE_LOGDEPTHBUF' : '',
            (parameters.logarithmicDepthBuffer && parameters.rendererExtensionFragDepth) ? '#define USE_LOGDEPTHBUF_EXT' : '',

            'uniform mat4 modelMatrix;',
            'uniform mat4 modelViewMatrix;',
            'uniform mat4 projectionMatrix;',
            'uniform mat4 viewMatrix;',
            'uniform mat3 normalMatrix;',
            'uniform vec3 cameraPosition;',
            'uniform bool isOrthographic;',

            '#ifdef USE_INSTANCING',

            '	attribute mat4 instanceMatrix;',

            '#endif',

            '#ifdef USE_INSTANCING_COLOR',

            '	attribute vec3 instanceColor;',

            '#endif',

            'attribute vec3 position;',
            'attribute vec3 normal;',
            'attribute vec2 uv;',

            '#ifdef USE_UV1',

            '	attribute vec2 uv1;',

            '#endif',

            '#ifdef USE_UV2',

            '	attribute vec2 uv2;',

            '#endif',

            '#ifdef USE_UV3',

            '	attribute vec2 uv3;',

            '#endif',

            '#ifdef USE_TANGENT',

            '	attribute vec4 tangent;',

            '#endif',

            '#if defined( USE_COLOR_ALPHA )',

            '	attribute vec4 color;',

            '#elif defined( USE_COLOR )',

            '	attribute vec3 color;',

            '#endif',

            '#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )',

            '	attribute vec3 morphTarget0;',
            '	attribute vec3 morphTarget1;',
            '	attribute vec3 morphTarget2;',
            '	attribute vec3 morphTarget3;',

            '	#ifdef USE_MORPHNORMALS',

            '		attribute vec3 morphNormal0;',
            '		attribute vec3 morphNormal1;',
            '		attribute vec3 morphNormal2;',
            '		attribute vec3 morphNormal3;',

            '	#else',

            '		attribute vec3 morphTarget4;',
            '		attribute vec3 morphTarget5;',
            '		attribute vec3 morphTarget6;',
            '		attribute vec3 morphTarget7;',

            '	#endif',

            '#endif',

            '#ifdef USE_SKINNING',

            '	attribute vec4 skinIndex;',
            '	attribute vec4 skinWeight;',

            '#endif',

            '\n'

        ].filter(filterEmptyLine).join('\n');

        prefixFragment = [

            customExtensions,

            generatePrecision(parameters),

            '#define SHADER_TYPE ' + parameters.shaderType,
            '#define SHADER_NAME ' + parameters.shaderName,

            customDefines,

            parameters.useFog && parameters.fog ? '#define USE_FOG' : '',
            parameters.useFog && parameters.fogExp2 ? '#define FOG_EXP2' : '',

            parameters.map ? '#define USE_MAP' : '',
            parameters.matcap ? '#define USE_MATCAP' : '',
            parameters.envMap ? '#define USE_ENVMAP' : '',
            parameters.envMap ? '#define ' + envMapTypeDefine : '',
            parameters.envMap ? '#define ' + envMapModeDefine : '',
            parameters.envMap ? '#define ' + envMapBlendingDefine : '',
            envMapCubeUVSize ? '#define CUBEUV_TEXEL_WIDTH ' + envMapCubeUVSize.texelWidth : '',
            envMapCubeUVSize ? '#define CUBEUV_TEXEL_HEIGHT ' + envMapCubeUVSize.texelHeight : '',
            envMapCubeUVSize ? '#define CUBEUV_MAX_MIP ' + envMapCubeUVSize.maxMip + '.0' : '',
            parameters.lightMap ? '#define USE_LIGHTMAP' : '',
            parameters.aoMap ? '#define USE_AOMAP' : '',
            parameters.bumpMap ? '#define USE_BUMPMAP' : '',
            parameters.normalMap ? '#define USE_NORMALMAP' : '',
            parameters.normalMapObjectSpace ? '#define USE_NORMALMAP_OBJECTSPACE' : '',
            parameters.normalMapTangentSpace ? '#define USE_NORMALMAP_TANGENTSPACE' : '',
            parameters.emissiveMap ? '#define USE_EMISSIVEMAP' : '',

            parameters.anisotropy ? '#define USE_ANISOTROPY' : '',
            parameters.anisotropyMap ? '#define USE_ANISOTROPYMAP' : '',

            parameters.clearcoat ? '#define USE_CLEARCOAT' : '',
            parameters.clearcoatMap ? '#define USE_CLEARCOATMAP' : '',
            parameters.clearcoatRoughnessMap ? '#define USE_CLEARCOAT_ROUGHNESSMAP' : '',
            parameters.clearcoatNormalMap ? '#define USE_CLEARCOAT_NORMALMAP' : '',

            parameters.iridescence ? '#define USE_IRIDESCENCE' : '',
            parameters.iridescenceMap ? '#define USE_IRIDESCENCEMAP' : '',
            parameters.iridescenceThicknessMap ? '#define USE_IRIDESCENCE_THICKNESSMAP' : '',

            parameters.specularMap ? '#define USE_SPECULARMAP' : '',
            parameters.specularColorMap ? '#define USE_SPECULAR_COLORMAP' : '',
            parameters.specularIntensityMap ? '#define USE_SPECULAR_INTENSITYMAP' : '',

            parameters.roughnessMap ? '#define USE_ROUGHNESSMAP' : '',
            parameters.metalnessMap ? '#define USE_METALNESSMAP' : '',

            parameters.alphaMap ? '#define USE_ALPHAMAP' : '',
            parameters.alphaTest ? '#define USE_ALPHATEST' : '',
            parameters.alphaHash ? '#define USE_ALPHAHASH' : '',

            parameters.sheen ? '#define USE_SHEEN' : '',
            parameters.sheenColorMap ? '#define USE_SHEEN_COLORMAP' : '',
            parameters.sheenRoughnessMap ? '#define USE_SHEEN_ROUGHNESSMAP' : '',

            parameters.transmission ? '#define USE_TRANSMISSION' : '',
            parameters.transmissionMap ? '#define USE_TRANSMISSIONMAP' : '',
            parameters.thicknessMap ? '#define USE_THICKNESSMAP' : '',

            parameters.vertexTangents && parameters.flatShading === false ? '#define USE_TANGENT' : '',
            parameters.vertexColors || parameters.instancingColor ? '#define USE_COLOR' : '',
            parameters.vertexAlphas ? '#define USE_COLOR_ALPHA' : '',
            parameters.vertexUv1s ? '#define USE_UV1' : '',
            parameters.vertexUv2s ? '#define USE_UV2' : '',
            parameters.vertexUv3s ? '#define USE_UV3' : '',

            parameters.pointsUvs ? '#define USE_POINTS_UV' : '',

            parameters.gradientMap ? '#define USE_GRADIENTMAP' : '',

            parameters.flatShading ? '#define FLAT_SHADED' : '',

            parameters.doubleSided ? '#define DOUBLE_SIDED' : '',
            parameters.flipSided ? '#define FLIP_SIDED' : '',

            parameters.shadowMapEnabled ? '#define USE_SHADOWMAP' : '',
            parameters.shadowMapEnabled ? '#define ' + shadowMapTypeDefine : '',

            parameters.premultipliedAlpha ? '#define PREMULTIPLIED_ALPHA' : '',

            parameters.numLightProbes > 0 ? '#define USE_LIGHT_PROBES' : '',

            parameters.useLegacyLights ? '#define LEGACY_LIGHTS' : '',

            parameters.decodeVideoTexture ? '#define DECODE_VIDEO_TEXTURE' : '',

            parameters.logarithmicDepthBuffer ? '#define USE_LOGDEPTHBUF' : '',
            (parameters.logarithmicDepthBuffer && parameters.rendererExtensionFragDepth) ? '#define USE_LOGDEPTHBUF_EXT' : '',

            'uniform mat4 viewMatrix;',
            'uniform vec3 cameraPosition;',
            'uniform bool isOrthographic;',

            (parameters.toneMapping !== NoToneMapping) ? '#define TONE_MAPPING' : '',
            (parameters.toneMapping !== NoToneMapping) ? ShaderChunk['tonemapping_pars_fragment'] : '', // this code is required here because it is used by the toneMapping() function defined below
            (parameters.toneMapping !== NoToneMapping) ? getToneMappingFunction('toneMapping', parameters.toneMapping) : '',

            parameters.dithering ? '#define DITHERING' : '',
            parameters.opaque ? '#define OPAQUE' : '',

            ShaderChunk['colorspace_pars_fragment'], // this code is required here because it is used by the various encoding/decoding function defined below
            getTexelEncodingFunction('linearToOutputTexel', parameters.outputColorSpace),

            parameters.useDepthPacking ? '#define DEPTH_PACKING ' + parameters.depthPacking : '',

            '\n'

        ].filter(filterEmptyLine).join('\n');

    }

    vertexShader = resolveIncludes(vertexShader);
    vertexShader = replaceLightNums(vertexShader, parameters);
    vertexShader = replaceClippingPlaneNums(vertexShader, parameters);

    fragmentShader = resolveIncludes(fragmentShader);
    fragmentShader = replaceLightNums(fragmentShader, parameters);
    fragmentShader = replaceClippingPlaneNums(fragmentShader, parameters);

    vertexShader = unrollLoops(vertexShader);
    fragmentShader = unrollLoops(fragmentShader);

    if (parameters.isWebGL2 && parameters.isRawShaderMaterial !== true) {

        // GLSL 3.0 conversion for built-in materials and ShaderMaterial

        versionString = '#version 300 es\n';

        prefixVertex = [
            'precision mediump sampler2DArray;',
            '#define attribute in',
            '#define varying out',
            '#define texture2D texture'
        ].join('\n') + '\n' + prefixVertex;

        prefixFragment = [
            '#define varying in',
            (parameters.glslVersion === GLSL3) ? '' : 'layout(location = 0) out highp vec4 pc_fragColor;',
            (parameters.glslVersion === GLSL3) ? '' : '#define gl_FragColor pc_fragColor',
            '#define gl_FragDepthEXT gl_FragDepth',
            '#define texture2D texture',
            '#define textureCube texture',
            '#define texture2DProj textureProj',
            '#define texture2DLodEXT textureLod',
            '#define texture2DProjLodEXT textureProjLod',
            '#define textureCubeLodEXT textureLod',
            '#define texture2DGradEXT textureGrad',
            '#define texture2DProjGradEXT textureProjGrad',
            '#define textureCubeGradEXT textureGrad'
        ].join('\n') + '\n' + prefixFragment;

    }

    const vertexGlsl = versionString + prefixVertex + vertexShader;
    const fragmentGlsl = versionString + prefixFragment + fragmentShader;

    // console.log( '*VERTEX*', vertexGlsl );
    // console.log( '*FRAGMENT*', fragmentGlsl );

    const glVertexShader = WebGLShader(gl, gl.VERTEX_SHADER, vertexGlsl);
    const glFragmentShader = WebGLShader(gl, gl.FRAGMENT_SHADER, fragmentGlsl);

    gl.attachShader(program, glVertexShader);
    gl.attachShader(program, glFragmentShader);

    // Force a particular attribute to index 0.

    if (parameters.index0AttributeName !== undefined) {

        gl.bindAttribLocation(program, 0, parameters.index0AttributeName);

    } else if (parameters.morphTargets === true) {

        // programs with morphTargets displace position out of attribute 0
        gl.bindAttribLocation(program, 0, 'position');

    }

    gl.linkProgram(program);

    // check for link errors
    if (renderer.debug.checkShaderErrors) {

        const programLog = gl.getProgramInfoLog(program).trim();
        const vertexLog = gl.getShaderInfoLog(glVertexShader).trim();
        const fragmentLog = gl.getShaderInfoLog(glFragmentShader).trim();

        let runnable = true;
        let haveDiagnostics = true;

        if (gl.getProgramParameter(program, gl.LINK_STATUS) === false) {

            runnable = false;

            if (typeof renderer.debug.onShaderError === 'function') {

                renderer.debug.onShaderError(gl, program, glVertexShader, glFragmentShader);

            } else {

                // default error reporting

                const vertexErrors = getShaderErrors(gl, glVertexShader, 'vertex');
                const fragmentErrors = getShaderErrors(gl, glFragmentShader, 'fragment');

                console.error(
                    'THREE.WebGLProgram: Shader Error ' + gl.getError() + ' - ' +
                    'VALIDATE_STATUS ' + gl.getProgramParameter(program, gl.VALIDATE_STATUS) + '\n\n' +
                    'Program Info Log: ' + programLog + '\n' +
                    vertexErrors + '\n' +
                    fragmentErrors
                );

            }

        } else if (programLog !== '') {

            console.warn('THREE.WebGLProgram: Program Info Log:', programLog);

        } else if (vertexLog === '' || fragmentLog === '') {

            haveDiagnostics = false;

        }

        if (haveDiagnostics) {

            this.diagnostics = {

                runnable: runnable,

                programLog: programLog,

                vertexShader: {

                    log: vertexLog,
                    prefix: prefixVertex

                },

                fragmentShader: {

                    log: fragmentLog,
                    prefix: prefixFragment

                }

            };

        }

    }

    // Clean up

    // Crashes in iOS9 and iOS10. #18402
    // gl.detachShader( program, glVertexShader );
    // gl.detachShader( program, glFragmentShader );

    gl.deleteShader(glVertexShader);
    gl.deleteShader(glFragmentShader);

    // set up caching for uniform locations

    let cachedUniforms;

    this.getUniforms = function () {

        if (cachedUniforms === undefined) {

            cachedUniforms = new WebGLUniforms(gl, program);

        }

        return cachedUniforms;

    };

    // set up caching for attribute locations

    let cachedAttributes;

    this.getAttributes = function () {

        if (cachedAttributes === undefined) {

            cachedAttributes = fetchAttributeLocations(gl, program);

        }

        return cachedAttributes;

    };

    // free resource

    this.destroy = function () {

        bindingStates.releaseStatesOfProgram(this);

        gl.deleteProgram(program);
        this.program = undefined;

    };

    //

    this.type = parameters.shaderType;
    this.name = parameters.shaderName;
    this.id = programIdCount++;
    this.cacheKey = cacheKey;
    this.usedTimes = 1;
    this.program = program;
    this.vertexShader = glVertexShader;
    this.fragmentShader = glFragmentShader;

    return this;

}


function WebGLState(gl, extensions, capabilities) {

    const isWebGL2 = capabilities.isWebGL2;

    function ColorBuffer() {

        let locked = false;

        const color = new Vector4();
        let currentColorMask = null;
        const currentColorClear = new Vector4(0, 0, 0, 0);

        return {

            setMask: function (colorMask) {

                if (currentColorMask !== colorMask && !locked) {

                    gl.colorMask(colorMask, colorMask, colorMask, colorMask);
                    currentColorMask = colorMask;

                }

            },

            setLocked: function (lock) {

                locked = lock;

            },

            setClear: function (r, g, b, a, premultipliedAlpha) {

                if (premultipliedAlpha === true) {

                    r *= a; g *= a; b *= a;

                }

                color.set(r, g, b, a);

                if (currentColorClear.equals(color) === false) {

                    gl.clearColor(r, g, b, a);
                    currentColorClear.copy(color);

                }

            },

            reset: function () {

                locked = false;

                currentColorMask = null;
                currentColorClear.set(- 1, 0, 0, 0); // set to invalid state

            }

        };

    }

    function DepthBuffer() {

        let locked = false;

        let currentDepthMask = null;
        let currentDepthFunc = null;
        let currentDepthClear = null;

        return {

            setTest: function (depthTest) {

                if (depthTest) {

                    enable(gl.DEPTH_TEST);

                } else {

                    disable(gl.DEPTH_TEST);

                }

            },

            setMask: function (depthMask) {

                if (currentDepthMask !== depthMask && !locked) {

                    gl.depthMask(depthMask);
                    currentDepthMask = depthMask;

                }

            },

            setFunc: function (depthFunc) {

                if (currentDepthFunc !== depthFunc) {

                    switch (depthFunc) {

                        case NeverDepth:

                            gl.depthFunc(gl.NEVER);
                            break;

                        case AlwaysDepth:

                            gl.depthFunc(gl.ALWAYS);
                            break;

                        case LessDepth:

                            gl.depthFunc(gl.LESS);
                            break;

                        case LessEqualDepth:

                            gl.depthFunc(gl.LEQUAL);
                            break;

                        case EqualDepth:

                            gl.depthFunc(gl.EQUAL);
                            break;

                        case GreaterEqualDepth:

                            gl.depthFunc(gl.GEQUAL);
                            break;

                        case GreaterDepth:

                            gl.depthFunc(gl.GREATER);
                            break;

                        case NotEqualDepth:

                            gl.depthFunc(gl.NOTEQUAL);
                            break;

                        default:

                            gl.depthFunc(gl.LEQUAL);

                    }

                    currentDepthFunc = depthFunc;

                }

            },

            setLocked: function (lock) {

                locked = lock;

            },

            setClear: function (depth) {

                if (currentDepthClear !== depth) {

                    gl.clearDepth(depth);
                    currentDepthClear = depth;

                }

            },

            reset: function () {

                locked = false;

                currentDepthMask = null;
                currentDepthFunc = null;
                currentDepthClear = null;

            }

        };

    }

    function StencilBuffer() {

        let locked = false;

        let currentStencilMask = null;
        let currentStencilFunc = null;
        let currentStencilRef = null;
        let currentStencilFuncMask = null;
        let currentStencilFail = null;
        let currentStencilZFail = null;
        let currentStencilZPass = null;
        let currentStencilClear = null;

        return {

            setTest: function (stencilTest) {

                if (!locked) {

                    if (stencilTest) {

                        enable(gl.STENCIL_TEST);

                    } else {

                        disable(gl.STENCIL_TEST);

                    }

                }

            },

            setMask: function (stencilMask) {

                if (currentStencilMask !== stencilMask && !locked) {

                    gl.stencilMask(stencilMask);
                    currentStencilMask = stencilMask;

                }

            },

            setFunc: function (stencilFunc, stencilRef, stencilMask) {

                if (currentStencilFunc !== stencilFunc ||
                    currentStencilRef !== stencilRef ||
                    currentStencilFuncMask !== stencilMask) {

                    gl.stencilFunc(stencilFunc, stencilRef, stencilMask);

                    currentStencilFunc = stencilFunc;
                    currentStencilRef = stencilRef;
                    currentStencilFuncMask = stencilMask;

                }

            },

            setOp: function (stencilFail, stencilZFail, stencilZPass) {

                if (currentStencilFail !== stencilFail ||
                    currentStencilZFail !== stencilZFail ||
                    currentStencilZPass !== stencilZPass) {

                    gl.stencilOp(stencilFail, stencilZFail, stencilZPass);

                    currentStencilFail = stencilFail;
                    currentStencilZFail = stencilZFail;
                    currentStencilZPass = stencilZPass;

                }

            },

            setLocked: function (lock) {

                locked = lock;

            },

            setClear: function (stencil) {

                if (currentStencilClear !== stencil) {

                    gl.clearStencil(stencil);
                    currentStencilClear = stencil;

                }

            },

            reset: function () {

                locked = false;

                currentStencilMask = null;
                currentStencilFunc = null;
                currentStencilRef = null;
                currentStencilFuncMask = null;
                currentStencilFail = null;
                currentStencilZFail = null;
                currentStencilZPass = null;
                currentStencilClear = null;

            }

        };

    }

    //

    const colorBuffer = new ColorBuffer();
    const depthBuffer = new DepthBuffer();
    const stencilBuffer = new StencilBuffer();

    const uboBindings = new WeakMap();
    const uboProgramMap = new WeakMap();

    let enabledCapabilities = {};

    let currentBoundFramebuffers = {};
    let currentDrawbuffers = new WeakMap();
    let defaultDrawbuffers = [];

    let currentProgram = null;

    let currentBlendingEnabled = false;
    let currentBlending = null;
    let currentBlendEquation = null;
    let currentBlendSrc = null;
    let currentBlendDst = null;
    let currentBlendEquationAlpha = null;
    let currentBlendSrcAlpha = null;
    let currentBlendDstAlpha = null;
    let currentPremultipledAlpha = false;

    let currentFlipSided = null;
    let currentCullFace = null;

    let currentLineWidth = null;

    let currentPolygonOffsetFactor = null;
    let currentPolygonOffsetUnits = null;

    const maxTextures = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);

    let lineWidthAvailable = false;
    let version = 0;
    const glVersion = gl.getParameter(gl.VERSION);

    if (glVersion.indexOf('WebGL') !== - 1) {

        version = parseFloat(/^WebGL (\d)/.exec(glVersion)[1]);
        lineWidthAvailable = (version >= 1.0);

    } else if (glVersion.indexOf('OpenGL ES') !== - 1) {

        version = parseFloat(/^OpenGL ES (\d)/.exec(glVersion)[1]);
        lineWidthAvailable = (version >= 2.0);

    }

    let currentTextureSlot = null;
    let currentBoundTextures = {};

    const scissorParam = gl.getParameter(gl.SCISSOR_BOX);
    const viewportParam = gl.getParameter(gl.VIEWPORT);

    const currentScissor = new Vector4().fromArray(scissorParam);
    const currentViewport = new Vector4().fromArray(viewportParam);

    function createTexture(type, target, count, dimensions) {

        const data = new Uint8Array(4); // 4 is required to match default unpack alignment of 4.
        const texture = gl.createTexture();

        gl.bindTexture(type, texture);
        gl.texParameteri(type, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(type, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        for (let i = 0; i < count; i++) {

            if (isWebGL2 && (type === gl.TEXTURE_3D || type === gl.TEXTURE_2D_ARRAY)) {

                gl.texImage3D(target, 0, gl.RGBA, 1, 1, dimensions, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);

            } else {

                gl.texImage2D(target + i, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);

            }

        }

        return texture;

    }

    const emptyTextures = {};
    emptyTextures[gl.TEXTURE_2D] = createTexture(gl.TEXTURE_2D, gl.TEXTURE_2D, 1);
    emptyTextures[gl.TEXTURE_CUBE_MAP] = createTexture(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_CUBE_MAP_POSITIVE_X, 6);

    if (isWebGL2) {

        emptyTextures[gl.TEXTURE_2D_ARRAY] = createTexture(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_2D_ARRAY, 1, 1);
        emptyTextures[gl.TEXTURE_3D] = createTexture(gl.TEXTURE_3D, gl.TEXTURE_3D, 1, 1);

    }

    // init

    colorBuffer.setClear(0, 0, 0, 1);
    depthBuffer.setClear(1);
    stencilBuffer.setClear(0);

    enable(gl.DEPTH_TEST);
    depthBuffer.setFunc(LessEqualDepth);

    setFlipSided(false);
    setCullFace(CullFaceBack);
    enable(gl.CULL_FACE);

    setBlending(NoBlending);

    //

    function enable(id) {

        if (enabledCapabilities[id] !== true) {

            gl.enable(id);
            enabledCapabilities[id] = true;

        }

    }

    function disable(id) {

        if (enabledCapabilities[id] !== false) {

            gl.disable(id);
            enabledCapabilities[id] = false;

        }

    }

    function bindFramebuffer(target, framebuffer) {

        if (currentBoundFramebuffers[target] !== framebuffer) {

            gl.bindFramebuffer(target, framebuffer);

            currentBoundFramebuffers[target] = framebuffer;

            if (isWebGL2) {

                // gl.DRAW_FRAMEBUFFER is equivalent to gl.FRAMEBUFFER

                if (target === gl.DRAW_FRAMEBUFFER) {

                    currentBoundFramebuffers[gl.FRAMEBUFFER] = framebuffer;

                }

                if (target === gl.FRAMEBUFFER) {

                    currentBoundFramebuffers[gl.DRAW_FRAMEBUFFER] = framebuffer;

                }

            }

            return true;

        }

        return false;

    }

    function drawBuffers(renderTarget, framebuffer) {

        let drawBuffers = defaultDrawbuffers;

        let needsUpdate = false;

        if (renderTarget) {

            drawBuffers = currentDrawbuffers.get(framebuffer);

            if (drawBuffers === undefined) {

                drawBuffers = [];
                currentDrawbuffers.set(framebuffer, drawBuffers);

            }

            if (renderTarget.isWebGLMultipleRenderTargets) {

                const textures = renderTarget.texture;

                if (drawBuffers.length !== textures.length || drawBuffers[0] !== gl.COLOR_ATTACHMENT0) {

                    for (let i = 0, il = textures.length; i < il; i++) {

                        drawBuffers[i] = gl.COLOR_ATTACHMENT0 + i;

                    }

                    drawBuffers.length = textures.length;

                    needsUpdate = true;

                }

            } else {

                if (drawBuffers[0] !== gl.COLOR_ATTACHMENT0) {

                    drawBuffers[0] = gl.COLOR_ATTACHMENT0;

                    needsUpdate = true;

                }

            }

        } else {

            if (drawBuffers[0] !== gl.BACK) {

                drawBuffers[0] = gl.BACK;

                needsUpdate = true;

            }

        }

        if (needsUpdate) {

            if (capabilities.isWebGL2) {

                gl.drawBuffers(drawBuffers);

            } else {

                extensions.get('WEBGL_draw_buffers').drawBuffersWEBGL(drawBuffers);

            }

        }


    }

    function useProgram(program) {

        if (currentProgram !== program) {

            gl.useProgram(program);

            currentProgram = program;

            return true;

        }

        return false;

    }

    const equationToGL = {
        [AddEquation]: gl.FUNC_ADD,
        [SubtractEquation]: gl.FUNC_SUBTRACT,
        [ReverseSubtractEquation]: gl.FUNC_REVERSE_SUBTRACT
    };

    if (isWebGL2) {

        equationToGL[MinEquation] = gl.MIN;
        equationToGL[MaxEquation] = gl.MAX;

    } else {

        const extension = extensions.get('EXT_blend_minmax');

        if (extension !== null) {

            equationToGL[MinEquation] = extension.MIN_EXT;
            equationToGL[MaxEquation] = extension.MAX_EXT;

        }

    }

    const factorToGL = {
        [ZeroFactor]: gl.ZERO,
        [OneFactor]: gl.ONE,
        [SrcColorFactor]: gl.SRC_COLOR,
        [SrcAlphaFactor]: gl.SRC_ALPHA,
        [SrcAlphaSaturateFactor]: gl.SRC_ALPHA_SATURATE,
        [DstColorFactor]: gl.DST_COLOR,
        [DstAlphaFactor]: gl.DST_ALPHA,
        [OneMinusSrcColorFactor]: gl.ONE_MINUS_SRC_COLOR,
        [OneMinusSrcAlphaFactor]: gl.ONE_MINUS_SRC_ALPHA,
        [OneMinusDstColorFactor]: gl.ONE_MINUS_DST_COLOR,
        [OneMinusDstAlphaFactor]: gl.ONE_MINUS_DST_ALPHA
    };

    function setBlending(blending, blendEquation, blendSrc, blendDst, blendEquationAlpha, blendSrcAlpha, blendDstAlpha, premultipliedAlpha) {

        if (blending === NoBlending) {

            if (currentBlendingEnabled === true) {

                disable(gl.BLEND);
                currentBlendingEnabled = false;

            }

            return;

        }

        if (currentBlendingEnabled === false) {

            enable(gl.BLEND);
            currentBlendingEnabled = true;

        }

        if (blending !== CustomBlending) {

            if (blending !== currentBlending || premultipliedAlpha !== currentPremultipledAlpha) {

                if (currentBlendEquation !== AddEquation || currentBlendEquationAlpha !== AddEquation) {

                    gl.blendEquation(gl.FUNC_ADD);

                    currentBlendEquation = AddEquation;
                    currentBlendEquationAlpha = AddEquation;

                }

                if (premultipliedAlpha) {

                    switch (blending) {

                        case NormalBlending:
                            gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                            break;

                        case AdditiveBlending:
                            gl.blendFunc(gl.ONE, gl.ONE);
                            break;

                        case SubtractiveBlending:
                            gl.blendFuncSeparate(gl.ZERO, gl.ONE_MINUS_SRC_COLOR, gl.ZERO, gl.ONE);
                            break;

                        case MultiplyBlending:
                            gl.blendFuncSeparate(gl.ZERO, gl.SRC_COLOR, gl.ZERO, gl.SRC_ALPHA);
                            break;

                        default:
                            console.error('THREE.WebGLState: Invalid blending: ', blending);
                            break;

                    }

                } else {

                    switch (blending) {

                        case NormalBlending:
                            gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                            break;

                        case AdditiveBlending:
                            gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                            break;

                        case SubtractiveBlending:
                            gl.blendFuncSeparate(gl.ZERO, gl.ONE_MINUS_SRC_COLOR, gl.ZERO, gl.ONE);
                            break;

                        case MultiplyBlending:
                            gl.blendFunc(gl.ZERO, gl.SRC_COLOR);
                            break;

                        default:
                            console.error('THREE.WebGLState: Invalid blending: ', blending);
                            break;

                    }

                }

                currentBlendSrc = null;
                currentBlendDst = null;
                currentBlendSrcAlpha = null;
                currentBlendDstAlpha = null;

                currentBlending = blending;
                currentPremultipledAlpha = premultipliedAlpha;

            }

            return;

        }

        // custom blending

        blendEquationAlpha = blendEquationAlpha || blendEquation;
        blendSrcAlpha = blendSrcAlpha || blendSrc;
        blendDstAlpha = blendDstAlpha || blendDst;

        if (blendEquation !== currentBlendEquation || blendEquationAlpha !== currentBlendEquationAlpha) {

            gl.blendEquationSeparate(equationToGL[blendEquation], equationToGL[blendEquationAlpha]);

            currentBlendEquation = blendEquation;
            currentBlendEquationAlpha = blendEquationAlpha;

        }

        if (blendSrc !== currentBlendSrc || blendDst !== currentBlendDst || blendSrcAlpha !== currentBlendSrcAlpha || blendDstAlpha !== currentBlendDstAlpha) {

            gl.blendFuncSeparate(factorToGL[blendSrc], factorToGL[blendDst], factorToGL[blendSrcAlpha], factorToGL[blendDstAlpha]);

            currentBlendSrc = blendSrc;
            currentBlendDst = blendDst;
            currentBlendSrcAlpha = blendSrcAlpha;
            currentBlendDstAlpha = blendDstAlpha;

        }

        currentBlending = blending;
        currentPremultipledAlpha = false;

    }

    function setMaterial(material, frontFaceCW) {

        material.side === DoubleSide
            ? disable(gl.CULL_FACE)
            : enable(gl.CULL_FACE);

        let flipSided = (material.side === BackSide);
        if (frontFaceCW) flipSided = !flipSided;

        setFlipSided(flipSided);

        (material.blending === NormalBlending && material.transparent === false)
            ? setBlending(NoBlending)
            : setBlending(material.blending, material.blendEquation, material.blendSrc, material.blendDst, material.blendEquationAlpha, material.blendSrcAlpha, material.blendDstAlpha, material.premultipliedAlpha);

        depthBuffer.setFunc(material.depthFunc);
        depthBuffer.setTest(material.depthTest);
        depthBuffer.setMask(material.depthWrite);
        colorBuffer.setMask(material.colorWrite);

        const stencilWrite = material.stencilWrite;
        stencilBuffer.setTest(stencilWrite);
        if (stencilWrite) {

            stencilBuffer.setMask(material.stencilWriteMask);
            stencilBuffer.setFunc(material.stencilFunc, material.stencilRef, material.stencilFuncMask);
            stencilBuffer.setOp(material.stencilFail, material.stencilZFail, material.stencilZPass);

        }

        setPolygonOffset(material.polygonOffset, material.polygonOffsetFactor, material.polygonOffsetUnits);

        material.alphaToCoverage === true
            ? enable(gl.SAMPLE_ALPHA_TO_COVERAGE)
            : disable(gl.SAMPLE_ALPHA_TO_COVERAGE);

    }

    //

    function setFlipSided(flipSided) {

        if (currentFlipSided !== flipSided) {

            if (flipSided) {

                gl.frontFace(gl.CW);

            } else {

                gl.frontFace(gl.CCW);

            }

            currentFlipSided = flipSided;

        }

    }

    function setCullFace(cullFace) {

        if (cullFace !== CullFaceNone) {

            enable(gl.CULL_FACE);

            if (cullFace !== currentCullFace) {

                if (cullFace === CullFaceBack) {

                    gl.cullFace(gl.BACK);

                } else if (cullFace === CullFaceFront) {

                    gl.cullFace(gl.FRONT);

                } else {

                    gl.cullFace(gl.FRONT_AND_BACK);

                }

            }

        } else {

            disable(gl.CULL_FACE);

        }

        currentCullFace = cullFace;

    }

    function setLineWidth(width) {

        if (width !== currentLineWidth) {

            if (lineWidthAvailable) gl.lineWidth(width);

            currentLineWidth = width;

        }

    }

    function setPolygonOffset(polygonOffset, factor, units) {

        if (polygonOffset) {

            enable(gl.POLYGON_OFFSET_FILL);

            if (currentPolygonOffsetFactor !== factor || currentPolygonOffsetUnits !== units) {

                gl.polygonOffset(factor, units);

                currentPolygonOffsetFactor = factor;
                currentPolygonOffsetUnits = units;

            }

        } else {

            disable(gl.POLYGON_OFFSET_FILL);

        }

    }

    function setScissorTest(scissorTest) {

        if (scissorTest) {

            enable(gl.SCISSOR_TEST);

        } else {

            disable(gl.SCISSOR_TEST);

        }

    }

    // texture

    function activeTexture(webglSlot) {

        if (webglSlot === undefined) webglSlot = gl.TEXTURE0 + maxTextures - 1;

        if (currentTextureSlot !== webglSlot) {

            gl.activeTexture(webglSlot);
            currentTextureSlot = webglSlot;

        }

    }

    function bindTexture(webglType, webglTexture, webglSlot) {

        if (webglSlot === undefined) {

            if (currentTextureSlot === null) {

                webglSlot = gl.TEXTURE0 + maxTextures - 1;

            } else {

                webglSlot = currentTextureSlot;

            }

        }

        let boundTexture = currentBoundTextures[webglSlot];

        if (boundTexture === undefined) {

            boundTexture = { type: undefined, texture: undefined };
            currentBoundTextures[webglSlot] = boundTexture;

        }

        if (boundTexture.type !== webglType || boundTexture.texture !== webglTexture) {

            if (currentTextureSlot !== webglSlot) {

                gl.activeTexture(webglSlot);
                currentTextureSlot = webglSlot;

            }

            gl.bindTexture(webglType, webglTexture || emptyTextures[webglType]);

            boundTexture.type = webglType;
            boundTexture.texture = webglTexture;

        }

    }

    function unbindTexture() {

        const boundTexture = currentBoundTextures[currentTextureSlot];

        if (boundTexture !== undefined && boundTexture.type !== undefined) {

            gl.bindTexture(boundTexture.type, null);

            boundTexture.type = undefined;
            boundTexture.texture = undefined;

        }

    }

    function compressedTexImage2D() {

        try {

            gl.compressedTexImage2D.apply(gl, arguments);

        } catch (error) {

            console.error('THREE.WebGLState:', error);

        }

    }

    function compressedTexImage3D() {

        try {

            gl.compressedTexImage3D.apply(gl, arguments);

        } catch (error) {

            console.error('THREE.WebGLState:', error);

        }

    }

    function texSubImage2D() {

        try {

            gl.texSubImage2D.apply(gl, arguments);

        } catch (error) {

            console.error('THREE.WebGLState:', error);

        }

    }

    function texSubImage3D() {

        try {

            gl.texSubImage3D.apply(gl, arguments);

        } catch (error) {

            console.error('THREE.WebGLState:', error);

        }

    }

    function compressedTexSubImage2D() {

        try {

            gl.compressedTexSubImage2D.apply(gl, arguments);

        } catch (error) {

            console.error('THREE.WebGLState:', error);

        }

    }

    function compressedTexSubImage3D() {

        try {

            gl.compressedTexSubImage3D.apply(gl, arguments);

        } catch (error) {

            console.error('THREE.WebGLState:', error);

        }

    }

    function texStorage2D() {

        try {

            gl.texStorage2D.apply(gl, arguments);

        } catch (error) {

            console.error('THREE.WebGLState:', error);

        }

    }

    function texStorage3D() {

        try {

            gl.texStorage3D.apply(gl, arguments);

        } catch (error) {

            console.error('THREE.WebGLState:', error);

        }

    }

    function texImage2D() {

        try {

            gl.texImage2D.apply(gl, arguments);

        } catch (error) {

            console.error('THREE.WebGLState:', error);

        }

    }

    function texImage3D() {

        try {

            gl.texImage3D.apply(gl, arguments);

        } catch (error) {

            console.error('THREE.WebGLState:', error);

        }

    }

    //

    function scissor(scissor) {

        if (currentScissor.equals(scissor) === false) {

            gl.scissor(scissor.x, scissor.y, scissor.z, scissor.w);
            currentScissor.copy(scissor);

        }

    }

    function viewport(viewport) {

        if (currentViewport.equals(viewport) === false) {

            gl.viewport(viewport.x, viewport.y, viewport.z, viewport.w);
            currentViewport.copy(viewport);

        }

    }

    function updateUBOMapping(uniformsGroup, program) {

        let mapping = uboProgramMap.get(program);

        if (mapping === undefined) {

            mapping = new WeakMap();

            uboProgramMap.set(program, mapping);

        }

        let blockIndex = mapping.get(uniformsGroup);

        if (blockIndex === undefined) {

            blockIndex = gl.getUniformBlockIndex(program, uniformsGroup.name);

            mapping.set(uniformsGroup, blockIndex);

        }

    }

    function uniformBlockBinding(uniformsGroup, program) {

        const mapping = uboProgramMap.get(program);
        const blockIndex = mapping.get(uniformsGroup);

        if (uboBindings.get(program) !== blockIndex) {

            // bind shader specific block index to global block point
            gl.uniformBlockBinding(program, blockIndex, uniformsGroup.__bindingPointIndex);

            uboBindings.set(program, blockIndex);

        }

    }

    //

    function reset() {

        // reset state

        gl.disable(gl.BLEND);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.POLYGON_OFFSET_FILL);
        gl.disable(gl.SCISSOR_TEST);
        gl.disable(gl.STENCIL_TEST);
        gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE);

        gl.blendEquation(gl.FUNC_ADD);
        gl.blendFunc(gl.ONE, gl.ZERO);
        gl.blendFuncSeparate(gl.ONE, gl.ZERO, gl.ONE, gl.ZERO);

        gl.colorMask(true, true, true, true);
        gl.clearColor(0, 0, 0, 0);

        gl.depthMask(true);
        gl.depthFunc(gl.LESS);
        gl.clearDepth(1);

        gl.stencilMask(0xffffffff);
        gl.stencilFunc(gl.ALWAYS, 0, 0xffffffff);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
        gl.clearStencil(0);

        gl.cullFace(gl.BACK);
        gl.frontFace(gl.CCW);

        gl.polygonOffset(0, 0);

        gl.activeTexture(gl.TEXTURE0);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        if (isWebGL2 === true) {

            gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
            gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);

        }

        gl.useProgram(null);

        gl.lineWidth(1);

        gl.scissor(0, 0, gl.canvas.width, gl.canvas.height);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // reset internals

        enabledCapabilities = {};

        currentTextureSlot = null;
        currentBoundTextures = {};

        currentBoundFramebuffers = {};
        currentDrawbuffers = new WeakMap();
        defaultDrawbuffers = [];

        currentProgram = null;

        currentBlendingEnabled = false;
        currentBlending = null;
        currentBlendEquation = null;
        currentBlendSrc = null;
        currentBlendDst = null;
        currentBlendEquationAlpha = null;
        currentBlendSrcAlpha = null;
        currentBlendDstAlpha = null;
        currentPremultipledAlpha = false;

        currentFlipSided = null;
        currentCullFace = null;

        currentLineWidth = null;

        currentPolygonOffsetFactor = null;
        currentPolygonOffsetUnits = null;

        currentScissor.set(0, 0, gl.canvas.width, gl.canvas.height);
        currentViewport.set(0, 0, gl.canvas.width, gl.canvas.height);

        colorBuffer.reset();
        depthBuffer.reset();
        stencilBuffer.reset();

    }

    return {

        buffers: {
            color: colorBuffer,
            depth: depthBuffer,
            stencil: stencilBuffer
        },

        enable: enable,
        disable: disable,

        bindFramebuffer: bindFramebuffer,
        drawBuffers: drawBuffers,

        useProgram: useProgram,

        setBlending: setBlending,
        setMaterial: setMaterial,

        setFlipSided: setFlipSided,
        setCullFace: setCullFace,

        setLineWidth: setLineWidth,
        setPolygonOffset: setPolygonOffset,

        setScissorTest: setScissorTest,

        activeTexture: activeTexture,
        bindTexture: bindTexture,
        unbindTexture: unbindTexture,
        compressedTexImage2D: compressedTexImage2D,
        compressedTexImage3D: compressedTexImage3D,
        texImage2D: texImage2D,
        texImage3D: texImage3D,

        updateUBOMapping: updateUBOMapping,
        uniformBlockBinding: uniformBlockBinding,

        texStorage2D: texStorage2D,
        texStorage3D: texStorage3D,
        texSubImage2D: texSubImage2D,
        texSubImage3D: texSubImage3D,
        compressedTexSubImage2D: compressedTexSubImage2D,
        compressedTexSubImage3D: compressedTexSubImage3D,

        scissor: scissor,
        viewport: viewport,

        reset: reset

    };

}