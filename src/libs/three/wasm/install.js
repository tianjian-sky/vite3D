import * as THREE from 'three'
import WasmInit from './three.wasm'

export const initWasm = () => {
    WasmInit({ __jsRegisters: {} }).then(WASM => {
        const vec3ApplyMatrix4 = WASM.asm.vec3ApplyMatrix4
        const vec3ApplyMatrix4_2 = WASM.asm.vec3ApplyMatrix4_2
        /**
         * js call c
         */
        const case1 = () => {
            const arr_i = [3, 5]
            // const stack = WASM.asm.stackSave()
            // var ret = WASM.asm.stackAlloc(arr_i.length * Int8Array.BYTES_PER_ELEMENT);
            const ret = WASM.asm.malloc(arr_i.length * Float32Array.BYTES_PER_ELEMENT)
            for (let i = 0; i < 2; i++) {
                WASM.setValue(ret + Float32Array.BYTES_PER_ELEMENT * i, arr_i[i], 'float')
            }
            // console.error('HEAP8', ret, WASM.HEAP8)
            // WASM.asm.stackRestore(stack)
            console.error('_add_1', WASM['_add_1'].apply(null, [ret]))
        }
        const case2 = () => {
            const vec = new THREE.Vector3(1, 2, -3)
            const mat4 = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 1, 1), Math.PI / 4)
            console.warn('THREE_vec3ApplyMatrix4: ', vec.clone().applyMatrix4(mat4))
            // const stack = WASM.asm.stackSave()
            // var ret = WASM.asm.stackAlloc(arr.length * Float32Array.BYTES_PER_ELEMENT);
            const pt1 = WASM.asm.malloc(3 * Float32Array.BYTES_PER_ELEMENT)
            const pt2 = WASM.asm.malloc(mat4.elements.length * Float32Array.BYTES_PER_ELEMENT)
            const res = []
            WASM.setValue(pt1, vec.x, 'float')
            WASM.setValue(pt1 + Float32Array.BYTES_PER_ELEMENT, vec.y, 'float')
            WASM.setValue(pt1 + Float32Array.BYTES_PER_ELEMENT * 2, vec.z, 'float')
            for (let i = 0; i < mat4.elements.length; i++) {
                WASM.setValue(pt2 + Float32Array.BYTES_PER_ELEMENT * i, mat4.elements[i], 'float')
            }
            const resultPt = WASM['_vec3ApplyMatrix4'].apply(null, [pt1, pt2])
            for (let i = 0; i < 3; i++) {
                res.push(WASM.getValue(resultPt + Float32Array.BYTES_PER_ELEMENT * i, 'float'))
            }
            console.error('WASM_vec3ApplyMatrix4: ', resultPt, res)
            WASM.asm.free(pt1)
            WASM.asm.free(pt2)
        }
        const case3 = () => {
            const mat1 = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 1, 1), Math.PI / 4)
            const mat2 = new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(3, 4, 5), Math.PI / 3))
            console.warn('THREE_vmat4MultiplyMat4: ', mat1.clone().multiply(mat2).elements)
            const pt1 = WASM.asm.malloc(mat1.elements.length * Float32Array.BYTES_PER_ELEMENT)
            const pt2 = WASM.asm.malloc(mat2.elements.length * Float32Array.BYTES_PER_ELEMENT)
            const res = []
            for (let i = 0; i < mat1.elements.length; i++) {
                WASM.setValue(pt1 + Float32Array.BYTES_PER_ELEMENT * i, mat1.elements[i], 'float')
            }
            for (let i = 0; i < mat2.elements.length; i++) {
                WASM.setValue(pt2 + Float32Array.BYTES_PER_ELEMENT * i, mat2.elements[i], 'float')
            }
            const resultPt = WASM['_mat4MultiplyMat4'].apply(null, [pt1, pt2])
            for (let i = 0; i < 16; i++) {
                res.push(WASM.getValue(resultPt + Float32Array.BYTES_PER_ELEMENT * i, 'float'))
            }
            console.error('WASM_mat4MultiplyMat4: ', resultPt, res)
            WASM.asm.free(pt1)
            WASM.asm.free(pt2)
        }
        /**
         *  c call js
         */
        const case4 = () => { //  using em_bind()
            console.warn('WASM', WASM)
            if (!WASM.__jsRegisters.__registerMat4Multiply) WASM.__jsRegisters.__registerMat4Multiply = new THREE.Matrix4()
            WASM.__jsRegisters.__registerMat4Multiply1 = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 2, 3), Math.PI / 4)
            WASM.__jsRegisters.__registerMat4Multiply2 = new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 2, 5), Math.PI / 3))
            console.warn('THREE_vmat4MultiplyMat4: ', WASM.__jsRegisters.__registerMat4Multiply1.clone().multiply(WASM.__jsRegisters.__registerMat4Multiply2).elements)
            WASM['_mat4MultiplyMat4CallJs'].apply(null, [])
            console.warn('WASM_mat4MultiplyMat4CallJs: ', WASM.__jsRegisters.__registerMat4Multiply.elements)
        }
        const case5 = () => { //  using emscripten_run_script()
            WASM['_runJs1'].apply(null, [])
        }
        const case6 = () => { //  using EM_ASM
            WASM['_runJs2'].apply(null, [])
        }
        case1()
        case2()
        case3()
        case4()
        case5()
        case6()
    })
    // .catch((e) => {
    //     console.error('wasm 初始化失败', e)
    // })
}