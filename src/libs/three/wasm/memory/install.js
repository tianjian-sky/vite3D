
export const initWasm = (type) => {
    const p = new Promise((resolve, reject) => {
        import('../../../../../static/wasmMemory/memory.wasm')
            .then(res => {
                res.default({ __jsRegisters: {} }).then(WASM => {
                    resolve(WASM)
                })
            })

    })
    return p
}