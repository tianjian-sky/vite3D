import * as THREE from 'three'
import WASM from './three.wasm'

export const initWasm = () => {
    console.warn('initWasm', WASM)

    setTimeout(() => {
        const vec3ApplyMatrix4 = WASM.asm.vec3ApplyMatrix4
        const vec3ApplyMatrix4_2 = WASM.asm.vec3ApplyMatrix4_2
        /**
         * 1.
         * 入参 float
         * 出参 数组指针
         */
        const pointer = vec3ApplyMatrix4(10, 10, 10, ...(new THREE.Matrix4().elements))
        console.warn(pointer)
        /**
         * 2.
         * 入参 数组指针
         * 出参 数组指针
         */
        // const add = WASM.ccall('add_2', // name of C function
        //     'number', // return type
        //     ['array'], // argument types
        //     [arr]); // arguments
        // console.error(add)
        {
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
        {
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
        {
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
    }, 1000)
}