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
        const arr = [0, 0]
        // const add = WASM.ccall('add_2', // name of C function
        //     'number', // return type
        //     ['array'], // argument types
        //     [arr]); // arguments
        // console.error(add)
        {
            // const stack = WASM.asm.stackSave()
            // var ret = WASM.asm.stackAlloc(arr.length);
            // WASM.HEAP8.set(arr, ret)
            // console.error('HEAP8', ret, WASM.HEAP8)
            // WASM.asm.stackRestore(stack)
            // console.error(WASM['_add_1'].apply(null, [ret]))
            console.warn('add', WASM.ccall('add', 'number', ['number', 'number'], [arr[0], arr[1]]))
            console.warn('add_1', WASM.ccall('add_1', 'number', ['array'], [arr]))
        }
        {
            const stack = WASM.asm.stackSave()
            var ret = WASM.asm.stackAlloc(arr.length * 4);
            WASM.HEAPF32.set(arr, ret)
            console.error('HEAPF32', ret, WASM.HEAPF32)
            WASM.asm.stackRestore(stack)
            console.error(WASM['_add_2'].apply(null, [ret]))
        }
        // const pointer2 = WASM.ccall('vec3ApplyMatrix4_2', // name of C function
        //     'number', // return type
        //     ['number', 'number', 'number', 'array'], // argument types
        //     [10, 10, 10, new THREE.Matrix4().elements]); // arguments
        // console.error(pointer2)
        // const result = WASM.ccall('vec3ApplyMatrix4', // name of C function
        //     'array', // return type
        //     ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number'], // argument types
        //     [10, 10, 10, ...(new THREE.Matrix4().elements)]); // arguments
        // console.error(result)
        // const buf = new ArrayBuffer(arr.length * 8);
        // 4         var i8 = new Uint8Array(buf);
        // 5
        // 6         var i64 = new Float64Array(buf);
        // 7         arr.forEach((i, index) => {
        //     8           i64[index] = i;
        //     9
        // });
        // 10
        // 11         return i8;

    }, 1000)
}