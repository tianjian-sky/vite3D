import WasmInit from './three.wasm'

export const initWasm = () => {
    const p = new Promise((resolve, reject) => {
        WasmInit({ __jsRegisters: {} }).then(WASM => {
            resolve(WASM)
        })
    })
    return p
}