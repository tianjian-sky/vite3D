/**
 * gltf 格式

[glTF2.0 API 参考指南](https://zhuanlan.zhihu.com/p/654304512)

![顶层元素之间的概念关系](https://pic2.zhimg.com/80/v2-0b9eeabd441ab3c78a1c17e13e65ea6d_720w.webp)

*/

const gloader = {}
const loader = new FileLoader(this.manager);
loader.setPath(this.path);
loader.setResponseType('arraybuffer');
loader.setRequestHeader(this.requestHeader);
loader.setWithCredentials(this.withCredentials);
loader.load(url, function (data) {
    try {
        loader.parse(data, resourcePath, function (gltf) {
            onLoad(gltf);
            scope.manager.itemEnd(url);
        }, _onError);
    } catch (e) {
        _onError(e);
    }
}, onProgress, _onError);

gloader.parse = function (data, path, onLoad, onError) {

    let json;
    const extensions = {};
    const plugins = {};
    const textDecoder = new TextDecoder();
    console.warn('gltf parse', data)
    if (typeof data === 'string') {

        json = JSON.parse(data);

    } else if (data instanceof ArrayBuffer) {

        const magic = textDecoder.decode(new Uint8Array(data, 0, 4));

        if (magic === BINARY_EXTENSION_HEADER_MAGIC) {

            try {

                extensions[EXTENSIONS.KHR_BINARY_GLTF] = new GLTFBinaryExtension(data);

            } catch (error) {

                if (onError) onError(error);
                return;

            }

            json = JSON.parse(extensions[EXTENSIONS.KHR_BINARY_GLTF].content);

        } else {

            json = JSON.parse(textDecoder.decode(data));

        }

    } else {

        json = data;

    }

    if (json.asset === undefined || json.asset.version[0] < 2) {

        if (onError) onError(new Error('THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported.'));
        return;

    }

    const parser = new GLTFParser(json, {

        path: path || this.resourcePath || '',
        crossOrigin: this.crossOrigin,
        requestHeader: this.requestHeader,
        manager: this.manager,
        ktx2Loader: this.ktx2Loader,
        meshoptDecoder: this.meshoptDecoder

    });

    parser.fileLoader.setRequestHeader(this.requestHeader);

    for (let i = 0; i < this.pluginCallbacks.length; i++) {

        const plugin = this.pluginCallbacks[i](parser);
        plugins[plugin.name] = plugin;

        // Workaround to avoid determining as unknown extension
        // in addUnknownExtensionsToUserData().
        // Remove this workaround if we move all the existing
        // extension handlers to plugin system
        extensions[plugin.name] = true;

    }

    if (json.extensionsUsed) {

        for (let i = 0; i < json.extensionsUsed.length; ++i) {

            const extensionName = json.extensionsUsed[i];
            const extensionsRequired = json.extensionsRequired || [];

            switch (extensionName) {

                case EXTENSIONS.KHR_MATERIALS_UNLIT:
                    extensions[extensionName] = new GLTFMaterialsUnlitExtension();
                    break;

                case EXTENSIONS.KHR_DRACO_MESH_COMPRESSION:
                    extensions[extensionName] = new GLTFDracoMeshCompressionExtension(json, this.dracoLoader);
                    break;

                case EXTENSIONS.KHR_TEXTURE_TRANSFORM:
                    extensions[extensionName] = new GLTFTextureTransformExtension();
                    break;

                case EXTENSIONS.KHR_MESH_QUANTIZATION:
                    extensions[extensionName] = new GLTFMeshQuantizationExtension();
                    break;

                default:

                    if (extensionsRequired.indexOf(extensionName) >= 0 && plugins[extensionName] === undefined) {

                        console.warn('THREE.GLTFLoader: Unknown extension "' + extensionName + '".');

                    }

            }

        }

    }
    console.warn(extensions, plugins)
    parser.setExtensions(extensions);
    parser.setPlugins(plugins);
    parser.parse(onLoad, onError);

}

const GLTFParser = {}

GLTFParser.parse = function (onLoad, onError) {

    const parser = this;
    const json = this.json;
    const extensions = this.extensions;

    // Clear the loader cache
    this.cache.removeAll();
    this.nodeCache = {};

    // Mark the special nodes/meshes in json for efficient parse
    this._invokeAll(function (ext) {

        return ext._markDefs && ext._markDefs();

    });

    Promise.all(this._invokeAll(function (ext) {

        return ext.beforeRoot && ext.beforeRoot();

    })).then(function () {
        console.time('get deps')
        return Promise.all([

            parser.getDependencies('scene'),
            parser.getDependencies('animation'),
            parser.getDependencies('camera'),

        ]);

    }).then(function (dependencies) {

        const result = {
            scene: dependencies[0][json.scene || 0],
            scenes: dependencies[0],
            animations: dependencies[1],
            cameras: dependencies[2],
            asset: json.asset,
            parser: parser,
            userData: {}
        };
        console.timeEnd('get deps')
        addUnknownExtensionsToUserData(extensions, result, json);

        assignExtrasToUserData(result, json);

        return Promise.all(parser._invokeAll(function (ext) {

            return ext.afterRoot && ext.afterRoot(result);

        })).then(function () {

            onLoad(result);

        });

    }).catch(onError);

}

getDependency(type, index) {

    const cacheKey = type + ':' + index;
    let dependency = this.cache.get(cacheKey);

    if (!dependency) {

        switch (type) {

            case 'scene':
                dependency = this.loadScene(index);
                break;

            case 'node':
                dependency = this._invokeOne(function (ext) {

                    return ext.loadNode && ext.loadNode(index);

                });
                break;

            case 'mesh':
                dependency = this._invokeOne(function (ext) {

                    return ext.loadMesh && ext.loadMesh(index);

                });
                break;

            case 'accessor':
                dependency = this.loadAccessor(index);
                break;

            case 'bufferView':
                dependency = this._invokeOne(function (ext) {

                    return ext.loadBufferView && ext.loadBufferView(index);

                });
                break;

            case 'buffer':
                dependency = this.loadBuffer(index);
                break;

            case 'material':
                dependency = this._invokeOne(function (ext) {

                    return ext.loadMaterial && ext.loadMaterial(index);

                });
                break;

            case 'texture':
                dependency = this._invokeOne(function (ext) {

                    return ext.loadTexture && ext.loadTexture(index);

                });
                break;

            case 'skin':
                dependency = this.loadSkin(index);
                break;

            case 'animation':
                dependency = this._invokeOne(function (ext) {

                    return ext.loadAnimation && ext.loadAnimation(index);

                });
                break;

            case 'camera':
                dependency = this.loadCamera(index);
                break;

            default:
                dependency = this._invokeOne(function (ext) {

                    return ext != this && ext.getDependency && ext.getDependency(type, index);

                });

                if (!dependency) {

                    throw new Error('Unknown type: ' + type);

                }

                break;

        }

        this.cache.add(cacheKey, dependency);

    }

    return dependency;

}

/**
         * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#nodes-and-hierarchy
         * @param {number} nodeIndex
         * @return {Promise<Object3D>}
         */
function loadNode(nodeIndex) {

    const json = this.json;
    const parser = this;

    const nodeDef = json.nodes[nodeIndex];

    const nodePending = parser._loadNodeShallow(nodeIndex);

    const childPending = [];
    const childrenDef = nodeDef.children || [];

    for (let i = 0, il = childrenDef.length; i < il; i++) {

        childPending.push(parser.getDependency('node', childrenDef[i]));

    }

    const skeletonPending = nodeDef.skin === undefined
        ? Promise.resolve(null)
        : parser.getDependency('skin', nodeDef.skin);

    return Promise.all([
        nodePending,
        Promise.all(childPending),
        skeletonPending
    ]).then(function (results) {

        const node = results[0];
        const children = results[1];
        const skeleton = results[2];

        if (skeleton !== null) {

            // This full traverse should be fine because
            // child glTF nodes have not been added to this node yet.
            node.traverse(function (mesh) {

                if (!mesh.isSkinnedMesh) return;

                mesh.bind(skeleton, _identityMatrix);

            });

        }

        for (let i = 0, il = children.length; i < il; i++) {

            node.add(children[i]);

        }

        return node;

    });

}

function _loadNodeShallow(nodeIndex) {

    const json = this.json;
    const extensions = this.extensions;
    const parser = this;

    // This method is called from .loadNode() and .loadSkin().
    // Cache a node to avoid duplication.

    if (this.nodeCache[nodeIndex] !== undefined) {

        return this.nodeCache[nodeIndex];

    }

    const nodeDef = json.nodes[nodeIndex];

    // reserve node's name before its dependencies, so the root has the intended name.
    const nodeName = nodeDef.name ? parser.createUniqueName(nodeDef.name) : '';

    const pending = [];

    const meshPromise = parser._invokeOne(function (ext) {

        return ext.createNodeMesh && ext.createNodeMesh(nodeIndex);

    });

    if (meshPromise) {

        pending.push(meshPromise);

    }

    if (nodeDef.camera !== undefined) {

        pending.push(parser.getDependency('camera', nodeDef.camera).then(function (camera) {

            return parser._getNodeRef(parser.cameraCache, nodeDef.camera, camera);

        }));

    }

    parser._invokeAll(function (ext) {

        return ext.createNodeAttachment && ext.createNodeAttachment(nodeIndex);

    }).forEach(function (promise) {

        pending.push(promise);

    });

    this.nodeCache[nodeIndex] = Promise.all(pending).then(function (objects) {

        let node;

        // .isBone isn't in glTF spec. See ._markDefs
        if (nodeDef.isBone === true) {

            node = new Bone();

        } else if (objects.length > 1) {

            node = new Group();

        } else if (objects.length === 1) {

            node = objects[0];

        } else {

            node = new Object3D();

        }

        if (node !== objects[0]) {

            for (let i = 0, il = objects.length; i < il; i++) {

                node.add(objects[i]);

            }

        }

        if (nodeDef.name) {

            node.userData.name = nodeDef.name;
            node.name = nodeName;

        }

        assignExtrasToUserData(node, nodeDef);

        if (nodeDef.extensions) addUnknownExtensionsToUserData(extensions, node, nodeDef);

        if (nodeDef.matrix !== undefined) {

            const matrix = new Matrix4();
            matrix.fromArray(nodeDef.matrix);
            node.applyMatrix4(matrix);

        } else {

            if (nodeDef.translation !== undefined) {

                node.position.fromArray(nodeDef.translation);

            }

            if (nodeDef.rotation !== undefined) {

                node.quaternion.fromArray(nodeDef.rotation);

            }

            if (nodeDef.scale !== undefined) {

                node.scale.fromArray(nodeDef.scale);

            }

        }

        if (!parser.associations.has(node)) {

            parser.associations.set(node, {});

        }

        parser.associations.get(node).nodes = nodeIndex;

        return node;

    });

    return this.nodeCache[nodeIndex];

}

/**
 * 
 * scene    loadScene   ...loadNode
 * node     _loadNodeShallow ...loadNode(child)
 *  _loadNodeShallow
 *      createUniqueName
 *      createNodeMesh() 1.GLTFPARSER.createNodeMesh()  2.GLTFMeshGpuInstancing.createNodeMesh()
 *          -   loadMesh
 *              -   (...meshDef.primitives) => primitives[i].material === undefined ? createDefaultMaterial(this.cache) : this.getDependency('material', primitives[i].material);
 *                  -   1.createDefaultMaterial()
 *                  -   2.loadMaterial()
 *                         -    assignTexture()
 *                              -   loadTexture()
 *                                  -   loadTextureImage(textureIndex, extension.source, loader)
 *                         -    (...extensions) => getMaterialType()
 *                         -    (...extensions) => extendMaterialParams()
 *                         -    new materialType(materialParams);
                            -   assignExtrasToUserData(material, materialDef);
                            -   parser.associations.set(material, { materials: materialIndex });
                            -   if (materialDef.extensions) addUnknownExtensionsToUserData(extensions, material, materialDef);
 *              -   loadGeometries()
                    -   (...primitives) => 
                                            1.createDracoPrimitive(primitive)
                                            2.addPrimitiveAttributes(new BufferGeometry(), primitive, parser);
                                                -   for (const gltfAttributeName in attributes) {
                                                        assignAttributeAccessor(attributes[gltfAttributeName], threeAttributeName)
                                                    }
                                                    geometry.setIndex(accessor);
                                                    assignExtrasToUserData()
                                                    computeBounds()
                                                        -   1.有attributes.POSITION ，读attributes.POSITION 
                                                            2. 有primitiveDef.targets; 从这里设置
                -   new Mesh|Points()
                -   updateMorphTargets()
                -   assignExtrasToUserData()
                -   addUnknownExtensionsToUserData()
                -   assignFinalMaterial()
                                                    
 *      node.camera && loadCamera()
 *      createNodeAttachment()
 *          -   node.extensions.light && _loadLight()
 *      children && addChildren
 *      assignExtrasToUserData()
 *          -   Object.assign(object.userData, gltfDef.extras);
 *      nodeDef.extensions && addUnknownExtensionsToUserData()  for (const name in objectDef.extensions) { object.userData.gltfExtensions[name] = objectDef.extensions[name]; }
 *          -   1. nodeDef.matrix  && matrix.fromArray(nodeDef.matrix) && node.applyMatrix4(matrix);
            -   2. node.position|quaternion|scale.fromArray(nodeDef.translation);            
 * 
 */


_loadNodeShallow(nodeIndex) {

    const json = this.json;
    const extensions = this.extensions;
    const parser = this;

    // This method is called from .loadNode() and .loadSkin().
    // Cache a node to avoid duplication.

    if (this.nodeCache[nodeIndex] !== undefined) {

        return this.nodeCache[nodeIndex];

    }

    const nodeDef = json.nodes[nodeIndex];

    // reserve node's name before its dependencies, so the root has the intended name.
    const nodeName = nodeDef.name ? parser.createUniqueName(nodeDef.name) : '';

    const pending = [];

    const meshPromise = parser._invokeOne(function (ext) {

        return ext.createNodeMesh && ext.createNodeMesh(nodeIndex);

    });

    if (meshPromise) {

        pending.push(meshPromise);

    }

    if (nodeDef.camera !== undefined) {

        pending.push(parser.getDependency('camera', nodeDef.camera).then(function (camera) {

            return parser._getNodeRef(parser.cameraCache, nodeDef.camera, camera);

        }));

    }

    parser._invokeAll(function (ext) {

        return ext.createNodeAttachment && ext.createNodeAttachment(nodeIndex);

    }).forEach(function (promise) {

        pending.push(promise);

    });

    this.nodeCache[nodeIndex] = Promise.all(pending).then(function (objects) {

        let node;

        // .isBone isn't in glTF spec. See ._markDefs
        if (nodeDef.isBone === true) {

            node = new Bone();

        } else if (objects.length > 1) {

            node = new Group();

        } else if (objects.length === 1) {

            node = objects[0];

        } else {

            node = new Object3D();

        }

        if (node !== objects[0]) {

            for (let i = 0, il = objects.length; i < il; i++) {

                node.add(objects[i]);

            }

        }

        if (nodeDef.name) {

            node.userData.name = nodeDef.name;
            node.name = nodeName;

        }

        assignExtrasToUserData(node, nodeDef);

        if (nodeDef.extensions) addUnknownExtensionsToUserData(extensions, node, nodeDef);

        if (nodeDef.matrix !== undefined) {

            const matrix = new Matrix4();
            matrix.fromArray(nodeDef.matrix);
            node.applyMatrix4(matrix);

        } else {

            if (nodeDef.translation !== undefined) {

                node.position.fromArray(nodeDef.translation);

            }

            if (nodeDef.rotation !== undefined) {

                node.quaternion.fromArray(nodeDef.rotation);

            }

            if (nodeDef.scale !== undefined) {

                node.scale.fromArray(nodeDef.scale);

            }

        }

        if (!parser.associations.has(node)) {

            parser.associations.set(node, {});

        }

        parser.associations.get(node).nodes = nodeIndex;

        return node;

    });

    return this.nodeCache[nodeIndex];

}

GLTFParser.createNodeMesh(nodeIndex) {

    const json = this.json;
    const parser = this;
    const nodeDef = json.nodes[nodeIndex];

    if (nodeDef.mesh === undefined) return null;

    return parser.getDependency('mesh', nodeDef.mesh).then(function (mesh) {

        const node = parser._getNodeRef(parser.meshCache, nodeDef.mesh, mesh);

        // if weights are provided on the node, override weights on the mesh.
        if (nodeDef.weights !== undefined) {

            node.traverse(function (o) {

                if (!o.isMesh) return;

                for (let i = 0, il = nodeDef.weights.length; i < il; i++) {

                    o.morphTargetInfluences[i] = nodeDef.weights[i];

                }

            });

        }

        return node;

    });

}

loadMesh(meshIndex) {

    const parser = this;
    const json = this.json;
    const extensions = this.extensions;

    const meshDef = json.meshes[meshIndex];
    const primitives = meshDef.primitives;

    const pending = [];

    for (let i = 0, il = primitives.length; i < il; i++) {

        const material = primitives[i].material === undefined
            ? createDefaultMaterial(this.cache)
            : this.getDependency('material', primitives[i].material);

        pending.push(material);

    }

    pending.push(parser.loadGeometries(primitives));

    return Promise.all(pending).then(function (results) {

        const materials = results.slice(0, results.length - 1);
        const geometries = results[results.length - 1];

        const meshes = [];

        for (let i = 0, il = geometries.length; i < il; i++) {

            const geometry = geometries[i];
            const primitive = primitives[i];

            // 1. create Mesh

            let mesh;

            const material = materials[i];

            if (primitive.mode === WEBGL_CONSTANTS.TRIANGLES ||
                primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP ||
                primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN ||
                primitive.mode === undefined) {

                // .isSkinnedMesh isn't in glTF spec. See ._markDefs()
                mesh = meshDef.isSkinnedMesh === true
                    ? new SkinnedMesh(geometry, material)
                    : new Mesh(geometry, material);

                if (mesh.isSkinnedMesh === true) {

                    // normalize skin weights to fix malformed assets (see #15319)
                    mesh.normalizeSkinWeights();

                }

                if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP) {

                    mesh.geometry = toTrianglesDrawMode(mesh.geometry, TriangleStripDrawMode);

                } else if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN) {

                    mesh.geometry = toTrianglesDrawMode(mesh.geometry, TriangleFanDrawMode);

                }

            } else if (primitive.mode === WEBGL_CONSTANTS.LINES) {

                mesh = new LineSegments(geometry, material);

            } else if (primitive.mode === WEBGL_CONSTANTS.LINE_STRIP) {

                mesh = new Line(geometry, material);

            } else if (primitive.mode === WEBGL_CONSTANTS.LINE_LOOP) {

                mesh = new LineLoop(geometry, material);

            } else if (primitive.mode === WEBGL_CONSTANTS.POINTS) {

                mesh = new Points(geometry, material);

            } else {

                throw new Error('THREE.GLTFLoader: Primitive mode unsupported: ' + primitive.mode);

            }

            if (Object.keys(mesh.geometry.morphAttributes).length > 0) {

                updateMorphTargets(mesh, meshDef);

            }

            mesh.name = parser.createUniqueName(meshDef.name || ('mesh_' + meshIndex));

            assignExtrasToUserData(mesh, meshDef);

            if (primitive.extensions) addUnknownExtensionsToUserData(extensions, mesh, primitive);

            parser.assignFinalMaterial(mesh);

            meshes.push(mesh);

        }

        for (let i = 0, il = meshes.length; i < il; i++) {

            parser.associations.set(meshes[i], {
                meshes: meshIndex,
                primitives: i
            });

        }

        if (meshes.length === 1) {

            if (meshDef.extensions) addUnknownExtensionsToUserData(extensions, meshes[0], meshDef);

            return meshes[0];

        }

        const group = new Group();

        if (meshDef.extensions) addUnknownExtensionsToUserData(extensions, group, meshDef);

        parser.associations.set(group, { meshes: meshIndex });

        for (let i = 0, il = meshes.length; i < il; i++) {

            group.add(meshes[i]);

        }

        return group;

    });

}

function createDefaultMaterial(cache) {

    if (cache['DefaultMaterial'] === undefined) {

        cache['DefaultMaterial'] = new MeshStandardMaterial({
            color: 0xFFFFFF,
            emissive: 0x000000,
            metalness: 1,
            roughness: 1,
            transparent: false,
            depthTest: true,
            side: FrontSide
        });

    }

    return cache['DefaultMaterial'];

}

function loadMaterial(materialIndex) {

    const parser = this;
    const json = this.json;
    const extensions = this.extensions;
    const materialDef = json.materials[materialIndex];

    let materialType;
    const materialParams = {};
    const materialExtensions = materialDef.extensions || {};

    const pending = [];

    if (materialExtensions[EXTENSIONS.KHR_MATERIALS_UNLIT]) {

        const kmuExtension = extensions[EXTENSIONS.KHR_MATERIALS_UNLIT];
        materialType = kmuExtension.getMaterialType();
        pending.push(kmuExtension.extendParams(materialParams, materialDef, parser));

    } else {

        // Specification:
        // https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#metallic-roughness-material

        const metallicRoughness = materialDef.pbrMetallicRoughness || {};

        materialParams.color = new Color(1.0, 1.0, 1.0);
        materialParams.opacity = 1.0;

        if (Array.isArray(metallicRoughness.baseColorFactor)) {

            const array = metallicRoughness.baseColorFactor;

            materialParams.color.setRGB(array[0], array[1], array[2], LinearSRGBColorSpace);
            materialParams.opacity = array[3];

        }

        if (metallicRoughness.baseColorTexture !== undefined) {

            pending.push(parser.assignTexture(materialParams, 'map', metallicRoughness.baseColorTexture, SRGBColorSpace));

        }

        materialParams.metalness = metallicRoughness.metallicFactor !== undefined ? metallicRoughness.metallicFactor : 1.0;
        materialParams.roughness = metallicRoughness.roughnessFactor !== undefined ? metallicRoughness.roughnessFactor : 1.0;

        if (metallicRoughness.metallicRoughnessTexture !== undefined) {

            pending.push(parser.assignTexture(materialParams, 'metalnessMap', metallicRoughness.metallicRoughnessTexture));
            pending.push(parser.assignTexture(materialParams, 'roughnessMap', metallicRoughness.metallicRoughnessTexture));

        }

        materialType = this._invokeOne(function (ext) {

            return ext.getMaterialType && ext.getMaterialType(materialIndex);

        });

        pending.push(Promise.all(this._invokeAll(function (ext) {

            return ext.extendMaterialParams && ext.extendMaterialParams(materialIndex, materialParams);

        })));

    }

    if (materialDef.doubleSided === true) {

        materialParams.side = DoubleSide;

    }

    const alphaMode = materialDef.alphaMode || ALPHA_MODES.OPAQUE;

    if (alphaMode === ALPHA_MODES.BLEND) {

        materialParams.transparent = true;

        // See: https://github.com/mrdoob/three.js/issues/17706
        materialParams.depthWrite = false;

    } else {

        materialParams.transparent = false;

        if (alphaMode === ALPHA_MODES.MASK) {

            materialParams.alphaTest = materialDef.alphaCutoff !== undefined ? materialDef.alphaCutoff : 0.5;

        }

    }

    if (materialDef.normalTexture !== undefined && materialType !== MeshBasicMaterial) {

        pending.push(parser.assignTexture(materialParams, 'normalMap', materialDef.normalTexture));

        materialParams.normalScale = new Vector2(1, 1);

        if (materialDef.normalTexture.scale !== undefined) {

            const scale = materialDef.normalTexture.scale;

            materialParams.normalScale.set(scale, scale);

        }

    }

    if (materialDef.occlusionTexture !== undefined && materialType !== MeshBasicMaterial) {

        pending.push(parser.assignTexture(materialParams, 'aoMap', materialDef.occlusionTexture));

        if (materialDef.occlusionTexture.strength !== undefined) {

            materialParams.aoMapIntensity = materialDef.occlusionTexture.strength;

        }

    }

    if (materialDef.emissiveFactor !== undefined && materialType !== MeshBasicMaterial) {

        const emissiveFactor = materialDef.emissiveFactor;
        materialParams.emissive = new Color().setRGB(emissiveFactor[0], emissiveFactor[1], emissiveFactor[2], LinearSRGBColorSpace);

    }

    if (materialDef.emissiveTexture !== undefined && materialType !== MeshBasicMaterial) {

        pending.push(parser.assignTexture(materialParams, 'emissiveMap', materialDef.emissiveTexture, SRGBColorSpace));

    }

    return Promise.all(pending).then(function () {

        const material = new materialType(materialParams);

        if (materialDef.name) material.name = materialDef.name;

        assignExtrasToUserData(material, materialDef);

        parser.associations.set(material, { materials: materialIndex });

        if (materialDef.extensions) addUnknownExtensionsToUserData(extensions, material, materialDef);

        return material;

    });

}

function assignTexture(materialParams, mapName, mapDef, colorSpace) {

    const parser = this;

    return this.getDependency('texture', mapDef.index).then(function (texture) {

        if (!texture) return null;

        if (mapDef.texCoord !== undefined && mapDef.texCoord > 0) {

            texture = texture.clone();
            texture.channel = mapDef.texCoord;

        }

        if (parser.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM]) {

            const transform = mapDef.extensions !== undefined ? mapDef.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM] : undefined;

            if (transform) {

                const gltfReference = parser.associations.get(texture);
                texture = parser.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM].extendTexture(texture, transform);
                parser.associations.set(texture, gltfReference);

            }

        }

        if (colorSpace !== undefined) {

            texture.colorSpace = colorSpace;

        }

        materialParams[mapName] = texture;

        return texture;

    });

}

function loadGeometries(primitives) {

    const parser = this;
    const extensions = this.extensions;
    const cache = this.primitiveCache;

    function createDracoPrimitive(primitive) {

        return extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION]
            .decodePrimitive(primitive, parser)
            .then(function (geometry) {

                return addPrimitiveAttributes(geometry, primitive, parser);

            });

    }

    const pending = [];

    for (let i = 0, il = primitives.length; i < il; i++) {

        const primitive = primitives[i];
        const cacheKey = createPrimitiveKey(primitive);

        // See if we've already created this geometry
        const cached = cache[cacheKey];

        if (cached) {

            // Use the cached geometry if it exists
            pending.push(cached.promise);

        } else {

            let geometryPromise;

            if (primitive.extensions && primitive.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION]) {

                // Use DRACO geometry if available
                geometryPromise = createDracoPrimitive(primitive);

            } else {

                // Otherwise create a new geometry
                geometryPromise = addPrimitiveAttributes(new BufferGeometry(), primitive, parser);

            }

            // Cache this geometry
            cache[cacheKey] = { primitive: primitive, promise: geometryPromise };

            pending.push(geometryPromise);

        }

    }

    return Promise.all(pending);

}

function addPrimitiveAttributes(geometry, primitiveDef, parser) {

    const attributes = primitiveDef.attributes;

    const pending = [];

    function assignAttributeAccessor(accessorIndex, attributeName) {

        return parser.getDependency('accessor', accessorIndex)
            .then(function (accessor) {

                geometry.setAttribute(attributeName, accessor);

            });

    }

    for (const gltfAttributeName in attributes) {

        const threeAttributeName = ATTRIBUTES[gltfAttributeName] || gltfAttributeName.toLowerCase();

        // Skip attributes already provided by e.g. Draco extension.
        if (threeAttributeName in geometry.attributes) continue;

        pending.push(assignAttributeAccessor(attributes[gltfAttributeName], threeAttributeName));

    }

    if (primitiveDef.indices !== undefined && !geometry.index) {

        const accessor = parser.getDependency('accessor', primitiveDef.indices).then(function (accessor) {

            geometry.setIndex(accessor);

        });

        pending.push(accessor);

    }

    if (ColorManagement.workingColorSpace !== LinearSRGBColorSpace && 'COLOR_0' in attributes) {

        console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${ColorManagement.workingColorSpace}" not supported.`);

    }

    assignExtrasToUserData(geometry, primitiveDef);

    computeBounds(geometry, primitiveDef, parser);

    return Promise.all(pending).then(function () {

        return primitiveDef.targets !== undefined
            ? addMorphTargets(geometry, primitiveDef.targets, parser)
            : geometry;

    });

}