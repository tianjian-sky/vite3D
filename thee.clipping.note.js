import { Matrix3 } from "three";

function WebGLClipping( properties ) {
    this.init = function ( planes, enableLocalClipping ) {
		const enabled =
			planes.length !== 0 ||
			enableLocalClipping ||
			// enable state of previous frame - the clipping code has to
			// run another frame in order to reset the state:
			numGlobalPlanes !== 0 ||
			localClippingEnabled;

		localClippingEnabled = enableLocalClipping;
		numGlobalPlanes = planes.length;
		return enabled;
	};

	this.beginShadows = function () {
		renderingShadows = true;
		projectPlanes( null );
	};

	this.endShadows = function () {
		renderingShadows = false;
	};

	this.setGlobalState = function ( planes, camera ) {
		globalState = projectPlanes( planes, camera, 0 );
	};

	this.setState = function ( material, camera, useCache ) {

		const planes = material.clippingPlanes,
			clipIntersection = material.clipIntersection,
			clipShadows = material.clipShadows;

		const materialProperties = properties.get( material );

		if ( ! localClippingEnabled || planes === null || planes.length === 0 || renderingShadows && ! clipShadows ) {

			// there's no local clipping

			if ( renderingShadows ) {

				// there's no global clipping

				projectPlanes( null );

			} else {

				resetGlobalState();

			}

		} else {

			const nGlobal = renderingShadows ? 0 : numGlobalPlanes,
				lGlobal = nGlobal * 4;

			let dstArray = materialProperties.clippingState || null;

			uniform.value = dstArray; // ensure unique state

			dstArray = projectPlanes( planes, camera, lGlobal, useCache );

			for ( let i = 0; i !== lGlobal; ++ i ) {

				dstArray[ i ] = globalState[ i ];

			}

			materialProperties.clippingState = dstArray;
			this.numIntersection = clipIntersection ? this.numPlanes : 0;
			this.numPlanes += nGlobal;

		}


	};
}
function projectPlanes( planes, camera, dstOffset, skipTransform ) {

    const nPlanes = planes !== null ? planes.length : 0;
    let dstArray = null;

    if ( nPlanes !== 0 ) {

        dstArray = uniform.value;

        if ( skipTransform !== true || dstArray === null ) {

            const flatSize = dstOffset + nPlanes * 4,
                viewMatrix = camera.matrixWorldInverse;

            viewNormalMatrix.getNormalMatrix( viewMatrix );

            if ( dstArray === null || dstArray.length < flatSize ) {

                dstArray = new Float32Array( flatSize );

            }

            for ( let i = 0, i4 = dstOffset; i !== nPlanes; ++ i, i4 += 4 ) {

                plane.copy( planes[ i ] ).applyMatrix4( viewMatrix, viewNormalMatrix );

                plane.normal.toArray( dstArray, i4 );
                dstArray[ i4 + 3 ] = plane.constant;

            }

        }
        uniform.value = dstArray;
        uniform.needsUpdate = true;
    }
    scope.numPlanes = nPlanes;
    scope.numIntersection = 0;
    return dstArray;

}




clipping = new WebGLClipping( properties );
const program = setProgram( camera, scene, geometry, material, object );
    clipping.setState( material, camera, useCache );
        dstArray = projectPlanes( planes, camera, lGlobal, useCache );
        for ( let i = 0; i !== lGlobal; ++ i ) {
            dstArray[ i ] = globalState[ i ];
        }
        materialProperties.clippingState = dstArray;

        if ( needsProgramChange === true ) {
            program = getProgram( material, scene, object );
        }
            if ( ( ! material.isShaderMaterial && ! material.isRawShaderMaterial ) || material.clipping === true ) {
                uniforms.clippingPlanes = clipping.uniform;
            }


bindingStates.setup( object, material, program, geometry, index );
    function setup( object, material, program, geometry, index ) {
        let updateBuffers = false;
        if ( vaoAvailable ) {
            const state = getBindingState( geometry, program, material );
            if ( currentState !== state ) {
                currentState = state;
                bindVertexArrayObject( currentState.object );
            }
            updateBuffers = needsUpdate( object, geometry, program, index );
            if ( updateBuffers ) saveCache( object, geometry, program, index );
        } else {
            const wireframe = ( material.wireframe === true );
            if ( currentState.geometry !== geometry.id ||
                currentState.program !== program.id ||
                currentState.wireframe !== wireframe ) {
                currentState.geometry = geometry.id;
                currentState.program = program.id;
                currentState.wireframe = wireframe;
                updateBuffers = true;
            }
        }
        if ( index !== null ) {
            attributes.update( index, gl.ELEMENT_ARRAY_BUFFER );
        }
        if ( updateBuffers || forceUpdate ) {
            forceUpdate = false;
            setupVertexAttributes( object, material, program, geometry );
            if ( index !== null ) {
                gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, attributes.get( index ).buffer );
            }
        }
    }
        setupVertexAttributes( object, material, program, geometry )

renderer.setMode( _gl.TRIANGLES );

if ( object.isInstancedMesh ) {
    renderer.renderInstances( drawStart, drawCount, object.count );
} else if ( geometry.isInstancedBufferGeometry ) {
    const maxInstanceCount = geometry._maxInstanceCount !== undefined ? geometry._maxInstanceCount : Infinity;
    const instanceCount = Math.min( geometry.instanceCount, maxInstanceCount );
    renderer.renderInstances( drawStart, drawCount, instanceCount );
} else {
    renderer.render( drawStart, drawCount );
}


// ==
function setProgram( camera, scene, geometry, material, object ) {
    if ( _clippingEnabled === true ) {
        if ( _localClippingEnabled === true || camera !== _currentCamera ) {
            const useCache =
                camera === _currentCamera &&
                material.id === _currentMaterialId;
            // we might want to call this function with some ClippingGroup
            // object instead of the material, once it becomes feasible
            // (#8465, #8379)
            clipping.setState( material, camera, useCache );
        }
    }
}

    dstArray = projectPlanes( planes, camera, lGlobal, useCache );
    materialProperties.clippingState = dstArray;

function getProgram( material, scene, object ) {
    if ( scene.isScene !== true ) scene = _emptyScene; // scene could be a Mesh, Line, Points, ...
    const materialProperties = properties.get( material );
    const lights = currentRenderState.state.lights;
    const shadowsArray = currentRenderState.state.shadowsArray;
    const lightsStateVersion = lights.state.version;
    const parameters = programCache.getParameters( material, lights.state, shadowsArray, scene, object );
    const programCacheKey = programCache.getProgramCacheKey( parameters );
    let programs = materialProperties.programs;
    materialProperties.environment = material.isMeshStandardMaterial ? scene.environment : null;
    materialProperties.fog = scene.fog;
    materialProperties.envMap = ( material.isMeshStandardMaterial ? cubeuvmaps : cubemaps ).get( material.envMap || materialProperties.environment );
    if ( programs === undefined ) {
        // new material
        material.addEventListener( 'dispose', onMaterialDispose );
        programs = new Map();
        materialProperties.programs = programs;
    }

    let program = programs.get( programCacheKey );
    if ( program !== undefined ) {
        // early out if program and light state is identical
        if ( materialProperties.currentProgram === program && materialProperties.lightsStateVersion === lightsStateVersion ) {
            updateCommonMaterialProperties( material, parameters );
            return program;
        }
    } else {
        parameters.uniforms = programCache.getUniforms( material );
        material.onBuild( object, parameters, _this );
        material.onBeforeCompile( parameters, _this );
        program = programCache.acquireProgram( parameters, programCacheKey );
        programs.set( programCacheKey, program );
        materialProperties.uniforms = parameters.uniforms;
    }
    const uniforms = materialProperties.uniforms;
    if ( ( ! material.isShaderMaterial && ! material.isRawShaderMaterial ) || material.clipping === true ) {
        uniforms.clippingPlanes = clipping.uniform;
    }
    updateCommonMaterialProperties( material, parameters );
    // store the light setup it was created for
    materialProperties.needsLights = materialNeedsLights( material );
    materialProperties.lightsStateVersion = lightsStateVersion;
    if ( materialProperties.needsLights ) {
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
    const uniformsList = WebGLUniforms.seqWithValue( progUniforms.seq, uniforms );
    materialProperties.currentProgram = program;
    materialProperties.uniformsList = uniformsList;
    return program;
}
bindingStates.setup( object, material, program, geometry, index );


// Normal Matrix（法向量变换矩阵）= ModelView矩阵逆的转置
//https://www.cnblogs.com/DvsJ/p/16813888.html


/**
 * 
 * 
 * 我们都知道gl的坐标系统。它的工作是将坐标从一个坐标系转到另一个坐标系。其中我们用到了几个转换矩阵。其中最为重要的是模型（Model）、视图（View）、投影（Projection）三个矩阵。因为涉及光线光照部分的计算通常都在eye space中进行计算，所以我们需要把坐标转换到eye space中，否则基于眼睛位置的效果（比如镜面反射）就很难实现。一般通过以下代码将vertex到 eye space:
vertexEyeSpace = gl_ModelViewMatrix * gl_Vertex;

为什么我们不能对法向量（normal vector）进行同样的运算来转换到 eye space 呢？首先，法向量（normal vector）是一个三维向量，而 ModelView 是一个 44 的矩阵。其次，因为法向量代表方向，我们想要做的就是将该方向变换到 eye space 中。那么我们是否可以直接用modelView左上角的 33 矩阵来做这个变换呢？如果可以，我们只需要用下面的代码就可以完成变换：
normalEyeSpace = vec3(gl_ModelViewMatrix * vec4(gl_Normal, 0.0));
很遗憾，上面的变换只适用于某些情况。这也是因此我们引入了 gl_NormalMatrix 的原因。
 * 
 */

/**
 * T = (P2 - P1)
    ModelView * T = ModelView * (P2 - P1) = ModelView * P2 - ModelView * P1 = P2' - P1'
    => ModelView * T = T'

    N' =  NormalMatrix * N
    T' = ModelView * T

    T' * N' = T * N = 0
    => (NormalMatrix * N) · (ModelView * T) = 0 // 相当于两个向量点积
    => transpose(NormalMatrix * N) * (ModelView * T)  
    => transpose(N) * transpose(NormalMatrix) * ModelView * T = 0

    N * T = 0  //因为N与T点积为0，也就是transpose(N)*T为0（点积相当于转置一个向量后乘以另外一个向量），所以上面式子中间部分为单位矩阵，因为向量乘以单位矩阵等于自身，即transpose(NormalMatrix)*ModelView=单位矩阵I
    =>  transpose(NormalMatrix) * ModelView = I
    => NormalMatrix = transpose((ModelView)^(-1))
 * 
 */


Matrix3().getNormalMatrix( matrix4 ) // Sets this matrix as the upper left 3x3 of the normal matrix of the passed matrix4. The normal matrix is the inverse transpose of the matrix m.
Matrix3().extractBasis ( xAxis , yAxis , zAxis  ) // Extracts the basis of this matrix into the three axis vectors provided. If this matrix is:

uniforms.clippingPlanes = clipping.uniform;

if (dot( vClipPosition, plane.xyz ) > plane.w ) discard;

var clipping_planes_vertex = "#if NUM_CLIPPING_PLANES > 0\n\tvClipPosition = - mvPosition.xyz;\n#endif";
var clipping_planes_fragment = `
#if NUM_CLIPPING_PLANES > 0
    vec4 plane;
    #pragma unroll_loop_start
    for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
        plane = clippingPlanes[ i ];
        if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
    }
    #pragma unroll_loop_end
    #if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
        bool clipped = true;
    #pragma unroll_loop_start
        for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
            plane = clippingPlanes[ i ];
            clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
        }
    #pragma unroll_loop_end
    if ( clipped ) discard;
    #endif
#endif
`
// 是否剖切：
clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) 
        = ( dot( - mvPosition.xyz, plane.xyz ) > plane.w ) 



class PlaneHelper extends Line {
	constructor( plane, size = 1, hex = 0xffff00 ) {
		const color = hex;
		const positions = [ 1, - 1, 0, - 1, 1, 0, - 1, - 1, 0, 1, 1, 0, - 1, 1, 0, - 1, - 1, 0, 1, - 1, 0, 1, 1, 0 ];
		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );
		geometry.computeBoundingSphere();
		super( geometry, new LineBasicMaterial( { color: color, toneMapped: false } ) );
		this.type = 'PlaneHelper';
		this.plane = plane;
		this.size = size;
		const positions2 = [ 1, 1, 0, - 1, 1, 0, - 1, - 1, 0, 1, 1, 0, - 1, - 1, 0, 1, - 1, 0 ];
		const geometry2 = new BufferGeometry();
		geometry2.setAttribute( 'position', new Float32BufferAttribute( positions2, 3 ) );
		geometry2.computeBoundingSphere();
		this.add( new Mesh( geometry2, new MeshBasicMaterial( { color: color, opacity: 0.2, transparent: true, depthWrite: false, toneMapped: false } ) ) );
	}

	updateMatrixWorld( force ) {
		this.position.set( 0, 0, 0 );
		this.scale.set( 0.5 * this.size, 0.5 * this.size, 1 );
        /**
         * 相机：eye = 自己position lookAt = lookat 
         * 非相机，eye = lookat lookAt = 自己position 
         */

        /**
            z: eye - target  up     
                    \       /
                     \    /   
                      \ /
                     target ------ y: z x x
                      /
                     /
                     x: up x z

        */
		this.lookAt( this.plane.normal );  // z = eye - target =  this.plane.normal - this.plane.posotion
		this.translateZ( - this.plane.constant ); // object space
		super.updateMatrixWorld( force );
	}
}
translateZ( distance ) {
    return this.translateOnAxis( _zAxis, distance );
}
translateOnAxis( axis, distance ) {
    // translate object by distance along axis in object space
    // axis is assumed to be normalized
    _v1$4.copy( axis ).applyQuaternion( this.quaternion );
    this.position.add( _v1$4.multiplyScalar( distance ) );
    return this;
}

A: 变换前到基
B: 变换后的基
AT = B

P：A中的某点坐标
Q：P点经过变换后在基B中的坐标

1.已知P，求Q

AT = B
A = BT-1
AP = BT-1P
设 Q = T-1P
即，P点在新坐标系中坐标为
Q = T-1P

2.已知Q，求P
AT = B
BQ = ATQ
设P=TQ
即，Q点在新坐标系中坐标为
P=TQ
