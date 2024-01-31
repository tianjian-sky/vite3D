import WasmInit from './staticLink.wasm'

export const initWasm = (type) => {
    const p = new Promise((resolve, reject) => {
        WasmInit({ __jsRegisters: {} }).then(WASM => {
            resolve(WASM)
        })
    })
    return p
}